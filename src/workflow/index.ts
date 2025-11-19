import { ConnectionBinding } from "@/bindings/connection.binding";
import { Editor, TLShapeId } from "tldraw";
import { nodesMap } from "@/shapes/node";

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
  const node = editor.getShape(snapshot.startingNode);

  console.log({ node });

  if (!node) return;

  const res = await nodesMap[node.type as keyof typeof nodesMap].execute(
    editor,
    node as any,
    {},
  );

  console.log({ res });

  // node.
  // snapshot.startingNode;
};
