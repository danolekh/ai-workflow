import type { Editor, TLShape, TLShapeId } from "tldraw";
import { getNodeRegistry } from "@/registry";
import { ConnectionBinding } from "@/bindings/connection.binding";
import { type ConnectionShape } from "@/shapes/connection.shape";

export namespace Connector {
  export const canConnect = (
    editor: Editor,
    source: TLShape,
    target: TLShape,
  ) => {
    if (source.id === target.id) return false;

    const possibleInputSpots = getPossibleInputSpots(editor, source, target);

    return possibleInputSpots.length > 0;
  };

  export const getConnectionPropertyName = (
    editor: Editor,
    sourceId: TLShapeId,
    targetId: TLShapeId,
  ) => {
    const outputConnection = getOutputConnections(editor, sourceId);

    console.log({ outputConnection });

    const one =
      outputConnection.find((con) => con.meta.targetId === targetId)?.props
        .inputPropertyName ?? null;

    console.log({ one });

    return one;
  };

  export const getPossibleInputSpots = (
    editor: Editor,
    source: TLShape,
    target: TLShape,
  ) => {
    const available = getAvailableInputSpots(editor, target);
    if (!available) return [];

    const outputType = getNodeRegistry(source.type)?.outputValidator;
    if (!outputType) return [];

    const matches = [];

    for (const [key, validator] of Object.entries(available.shape)) {
      if (validator?._def?.type === outputType.def.type) matches.push(key);
    }

    return matches;
  };

  export const getAvailableInputSpots = (editor: Editor, node: TLShape) => {
    const inputConnections = getInputConnections(editor, node.id);
    const nodeRegistry = getNodeRegistry(node.type);

    if (!nodeRegistry) return null;

    return nodeRegistry.inputsValidator.omit(
      inputConnections.reduce(
        (acc, con) =>
          con.props.inputPropertyName
            ? { ...acc, [con.props.inputPropertyName]: true }
            : acc,
        {},
      ),
    );
  };

  export const getInputConnections = (editor: Editor, nodeId: TLShapeId) => {
    return editor
      .getBindingsToShape<ConnectionBinding>(nodeId, "connection")
      .filter((binding) => binding.meta.type === "end")
      .map((binding) =>
        editor.getShape<ConnectionShape>(binding.fromId),
      ) as ConnectionShape[];
  };

  export const getOutputConnections = (editor: Editor, nodeId: TLShapeId) => {
    return editor
      .getBindingsToShape<ConnectionBinding>(nodeId, "connection")
      .filter((binding) => binding.meta.type === "start")
      .map((binding) =>
        editor.getShape<ConnectionShape>(binding.fromId),
      ) as ConnectionShape[];
  };
}
