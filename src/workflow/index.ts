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

type WorkflowSnapshot = {
  startingNode: TLShapeId;
  nodeToChildren: Record<
    TLShapeId,
    {
      inputPropertyName: string;
      childId: TLShapeId;
    }[]
  >;
};

export const getWorkflowShapshot = (
  editor: Editor,
  startingNode: TLShapeId,
): WorkflowSnapshot => {
  const getNodeChildren = (
    nodeId: TLShapeId,
  ): Record<
    TLShapeId,
    {
      childId: TLShapeId;
      inputPropertyName: string;
    }[]
  > => {
    const visited = new Set<TLShapeId>();
    const result: Record<
      TLShapeId,
      {
        childId: TLShapeId;
        inputPropertyName: string;
      }[]
    > = {};

    const getChildren = (
      nodeId: TLShapeId,
    ): {
      childId: TLShapeId;
      inputPropertyName: string;
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
          inputPropertyName: Connector.getConnectionPropertyName(
            editor,
            nodeId,
            childId,
          ),
        }))
        .filter(
          (c): c is { childId: TLShapeId; inputPropertyName: string } =>
            c.inputPropertyName !== null,
        );

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

  return {
    startingNode,
    nodeToChildren: getNodeChildren(startingNode),
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

  constructor(editor: Editor, snapshot: WorkflowSnapshot) {
    this.editor = editor;
    this.snapshot = snapshot;
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

    const validatedOutput = registration.outputValidator.decode(output);

    return validatedOutput;
  }

  async runWithChildren(node: TLShapeId, inputs: RegistryInputsVariations) {
    const outputs = await this.runNode(node, inputs);
    const children = this.snapshot.nodeToChildren[node];

    const childrenJobs = children.map((childId) =>
      this.runWithChildren(childId, outputs ?? {}),
    );

    if (childrenJobs.length > 0) {
      await Promise.all(childrenJobs);
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

    await this.runWithChildren(this.snapshot.startingNode, {});
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
