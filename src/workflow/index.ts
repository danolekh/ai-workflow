import { ConnectionBinding } from "@/bindings/connection.binding";
import { Editor, TLShapeId, useValue } from "tldraw";
import { registry } from "@/shapes/registry";
import { atom } from "@tldraw/state";
import { toast } from "sonner";

type WorkflowSnapshot = {
  startingNode: TLShapeId;
  nodeToChildren: Record<TLShapeId, TLShapeId[]>;
};

export const getWorkflowShapshot = (
  editor: Editor,
  startingNode: TLShapeId,
): WorkflowSnapshot => {
  const getNodeChildren = (
    nodeId: TLShapeId,
  ): Record<TLShapeId, TLShapeId[]> => {
    const visited = new Set<TLShapeId>();
    const result: Record<TLShapeId, TLShapeId[]> = {};

    const getChildren = (nodeId: TLShapeId): TLShapeId[] => {
      const startBindings = editor
        .getBindingsToShape<ConnectionBinding>(nodeId, "connection")
        .filter((binding) => binding.meta.type === "start");

      if (!startBindings) return [];

      const connections = startBindings.map((binding) => binding.fromId);

      const children = connections.flatMap((connectionId) =>
        editor
          .getBindingsFromShape<ConnectionBinding>(connectionId, "connection")
          .filter((binding) => binding.meta.type === "end")
          .map((binding) => binding.toId),
      );

      return children;
    };

    const traverse = (nodeId: TLShapeId): void => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const children = getChildren(nodeId);
      result[nodeId] = children;

      children.forEach((childId) => traverse(childId));
    };

    traverse(nodeId);

    return result;
  };

  return {
    startingNode,
    nodeToChildren: getNodeChildren(startingNode),
  };
};

export const executeWorkflow = async (
  editor: Editor,
  snapshot: WorkflowSnapshot,
) => {
  const runNode = async (shapeId: TLShapeId) => {
    console.log("running", { shapeId });
    const node = editor.getShape(shapeId);

    if (!node) {
      toast.error(`Node with id ${shapeId} not found.`);

      currentWorkflow.update((workflow) => {
        if (!workflow)
          return {
            snapshot,
            error: `Node with id ${shapeId} not found.`,
            nodeOutputs: {},
          };

        return {
          ...workflow,
          error: `Node with id ${shapeId} not found.`,
        };
      });

      return;
    }

    runningNodes.update((value) => new Set([...value, node.id]));

    const output = await registry[node.type].execute(editor, node, {});

    currentWorkflow.update((workflow) => {
      if (!workflow)
        return {
          error: null,
          nodeOutputs: {
            [node.id]: output,
          },
          snapshot,
        };

      return {
        ...workflow,
        nodeOutputs: {
          ...workflow.nodeOutputs,
          [node.id]: output,
        },
      };
    });

    runningNodes.update(
      (value) =>
        new Set(Array.from(value.values()).filter((v) => v !== node.id)),
    );

    const childrenJobs =
      snapshot.nodeToChildren[node.id]?.map((childId) => runNode(childId)) ??
      [];

    if (childrenJobs.length > 0) await Promise.all(childrenJobs);
  };

  runNode(snapshot.startingNode);
};

export const runningNodes = atom<Set<TLShapeId>>("runningNodes", new Set());

export const useIsRunning = (shapeId: TLShapeId) =>
  useValue(
    "isRunning",
    () => {
      return runningNodes.get().has(shapeId);
    },
    [],
  );

type WorkflowState = {
  error: string | null;
  snapshot: WorkflowSnapshot;
  nodeOutputs: Record<TLShapeId, any>;
} | null;

export const currentWorkflow = atom<WorkflowState>("currentWorkflow", null);
