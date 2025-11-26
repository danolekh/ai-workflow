import { ConnectionBinding } from "@/bindings/connection.binding";
import { Editor, TLShapeId, useValue } from "tldraw";
import {
  registry,
  RegistryInputsVariations,
  RegistryOutputsVariations,
  type Registry,
} from "@/registry";
import { localStorageAtom } from "@tldraw/state";
import { toast } from "sonner";
import { Connector } from "@/connector";

type NodeToChildrenMeta = Record<
  TLShapeId,
  {
    bindingPropertyName: string | null;
    childId: TLShapeId;
  }[]
>;

type WorkflowSnapshot = {
  startingNode: TLShapeId;
  nodeInputConnections: Record<TLShapeId, number>;
  nodeToChildren: NodeToChildrenMeta;
};

export const getWorkflowShapshot = (
  editor: Editor,
  startingNode: TLShapeId,
): WorkflowSnapshot => {
  const getNodeChildren = (nodeId: TLShapeId): NodeToChildrenMeta => {
    const visited = new Set<TLShapeId>();
    const result: NodeToChildrenMeta = {};

    const getChildren = (
      nodeId: TLShapeId,
    ): {
      childId: TLShapeId;
      bindingPropertyName: string | null;
    }[] => {
      const startBindings = editor
        .getBindingsToShape<ConnectionBinding>(nodeId, "connection")
        .filter((binding) => binding.meta.type === "start");

      if (!startBindings) return [];

      const connections = startBindings.map((binding) => binding.fromId);

      const children = connections
        .flatMap((connectionId) =>
          editor
            .getBindingsFromShape<ConnectionBinding>(connectionId, "connection")
            .filter((binding) => binding.meta.type === "end")
            .map((binding) => binding.toId),
        )
        .map((childId) => ({
          childId,
          bindingPropertyName: Connector.getConnectionPropertyName(
            editor,
            nodeId,
            childId,
          ),
        }));

      return children;
    };

    const traverse = (nodeId: TLShapeId): void => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const children = getChildren(nodeId);
      result[nodeId] = children;

      children.forEach((child) => {
        traverse(child.childId);
      });
    };

    traverse(nodeId);

    return result;
  };

  const nodeToChildren = getNodeChildren(startingNode);

  return {
    startingNode,
    nodeToChildren,
    nodeInputConnections: Object.keys(nodeToChildren).reduce(
      (acc, nodeId) => ({
        ...acc,
        [nodeId]: editor
          .getBindingsToShape<ConnectionBinding>(
            nodeId as TLShapeId,
            "connection",
          )
          .filter((binding) => binding.meta.type === "end").length,
      }),
      {},
    ),
  };
};

type WorkflowStatus = "running" | "completed" | "failed";

type WorkflowItem = {
  id: string;
  status: WorkflowStatus;
  runningNodes: TLShapeId[];
  completedNodes: TLShapeId[];
  fail: {
    failedNode: TLShapeId;
    reason: string;
  } | null;
};

type WorkflowState = {
  runningNodes: TLShapeId[];
  history: WorkflowItem[];
};

export const [workflowState, cleanupWorkflowState] =
  localStorageAtom<WorkflowState>("workflow-state", {
    runningNodes: [],
    history: [],
  });

export class WorkflowRunner {
  editor: Editor;
  snapshot: WorkflowSnapshot;

  // when connection fires a target, it's written here
  connectionTriggers: Record<
    TLShapeId,
    Array<{
      bindingPropertyName: string | null;
      value: RegistryOutputsVariations;
    }>
  >;

  constructor(editor: Editor, snapshot: WorkflowSnapshot) {
    this.editor = editor;
    this.snapshot = snapshot;
    this.connectionTriggers = {};
  }

  async runNode(
    shapeId: TLShapeId,
    inputs: RegistryInputsVariations,
  ): Promise<RegistryOutputsVariations> {
    const shape = this.editor.getShape(shapeId);

    if (!shape) throw new Error(`Shape with id ${shapeId} not found`);

    const nodeType = shape.type;
    const registration =
      nodeType in registry ? registry[nodeType as keyof Registry] : undefined;

    if (!registration)
      throw new Error(
        `Node with type ${nodeType} cannot be executed [not registered]`,
      );

    const validatedInputs = registration.inputsValidator.decode(inputs);

    workflowState.update((prev) => ({
      ...prev,
      runningNodes: [...prev.runningNodes, shapeId],
    }));

    const output = await registration.execute(
      this.editor,
      shape,
      validatedInputs,
    );

    workflowState.update((prev) => ({
      ...prev,
      runningNodes: [...prev.runningNodes].filter((id) => id !== shapeId),
    }));

    const validatedOutput = registration.outputValidator
      ? registration.outputValidator.decode(output)
      : output;

    return validatedOutput;
  }

  triggerNodeConnection(
    childId: TLShapeId,
    bindingPropertyName: string | null,
    value: RegistryOutputsVariations,
  ) {
    this.connectionTriggers[childId] = this.connectionTriggers[childId] || [];
    this.connectionTriggers[childId].push({ bindingPropertyName, value });
  }

  constructInput(targetId: TLShapeId) {
    const input = this.connectionTriggers[targetId].reduce(
      (acc, { bindingPropertyName, value }) => {
        if (bindingPropertyName)
          acc[bindingPropertyName as keyof RegistryInputsVariations] = value;

        return acc;
      },
      {} as RegistryInputsVariations,
    );

    return input;
  }

  async runNodesThatAreReady() {
    const jobs = [];
    for (const [targetId, inputs] of Object.entries(this.connectionTriggers)) {
      if (
        inputs.length ===
        this.snapshot.nodeInputConnections[targetId as TLShapeId]
      ) {
        const input = this.constructInput(targetId as TLShapeId);
        jobs.push(this.runWithChildren(targetId as TLShapeId, input));
        this.connectionTriggers[targetId as TLShapeId] = [];
      }
    }

    return await Promise.all(jobs);
  }

  async runWithChildren(node: TLShapeId, inputs: RegistryInputsVariations) {
    const outputs = await this.runNode(node, inputs);
    const children = this.snapshot.nodeToChildren[node];

    if (children.length > 0) {
      children.forEach((child) =>
        this.triggerNodeConnection(
          child.childId,
          child.bindingPropertyName,
          outputs,
        ),
      );

      await this.runNodesThatAreReady();
    }

    return outputs;
  }

  canStart() {
    const runningNodes = workflowState.get().runningNodes;

    for (const runningNode of runningNodes) {
      if (runningNode in this.snapshot.nodeToChildren) return false;
    }

    return true;
  }

  async run() {
    if (!this.canStart()) {
      toast.error(
        "Cannot start a workflow because one of the nodes is already running",
      );
      return;
    }

    toast.promise(this.runWithChildren(this.snapshot.startingNode, {}), {
      loading: "Running workflow...",
      success: "Workflow completed",
      error: "Workflow failed",
    });
  }
}

export const useIsRunning = (shapeId: TLShapeId) =>
  useValue(
    "isRunning",
    () => {
      return workflowState.get().runningNodes.includes(shapeId);
    },
    [],
  );
