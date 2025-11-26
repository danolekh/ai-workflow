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
    if (getNodeRegistry(source.type)?.outputValidator === null) return true;
    if (getNodeRegistry(target.type)?.inputsValidator.def.type === "record")
      return true;
    if (source.id === target.id) return false;

    const matchingInputSpots = getMatchingInputSpots(editor, source, target);

    return matchingInputSpots.length > 0;
  };

  export const getPropertyNameForNewConnection = (
    editor: Editor,
    source: TLShape,
    target: TLShape,
  ) => {
    const matchingInputSpots = getMatchingInputSpots(editor, source, target);

    return matchingInputSpots[0] ?? null;
  };

  export const getConnectionPropertyName = (
    editor: Editor,
    sourceId: TLShapeId,
    targetId: TLShapeId,
  ) => {
    const outputConnection = getOutputConnections(editor, sourceId);

    const one =
      outputConnection.find((con) => con.meta.targetId === targetId)?.props
        .inputPropertyName ?? null;

    return one;
  };

  export const getMatchingInputSpots = (
    editor: Editor,
    source: TLShape,
    target: TLShape,
  ) => {
    const available = getAvailableInputSpots(editor, target);
    if (!available) return [];

    const outputType = getNodeRegistry(source.type)?.outputValidator;
    if (!outputType) return [];

    const matches = [];
    const targetInputsValidator = getNodeRegistry(target.type)?.inputsValidator;

    if (!targetInputsValidator) return [];

    for (const key of available) {
      const validator =
        "shape" in targetInputsValidator
          ? targetInputsValidator.shape[
              key as keyof typeof targetInputsValidator.shape
            ]
          : null;

      if (!validator || validator.def.type === outputType.def.type)
        matches.push(key);
    }

    return matches;
  };

  export const getAvailableInputSpots = (editor: Editor, node: TLShape) => {
    const inputConnections = getInputConnections(editor, node.id);
    const nodeRegistry = getNodeRegistry(node.type);

    if (!nodeRegistry) return [];

    if (nodeRegistry.inputsValidator.def.type === "record") {
      const [_, lastIndex] = inputConnections
        .at(-2)
        ?.props.inputPropertyName?.split("-") ?? ["", "0"];

      return [`input-${Number(lastIndex) + 1}`];
    }

    return Object.keys(nodeRegistry.inputsValidator.def.shape).filter(
      (key) =>
        !inputConnections.some((con) => con.props.inputPropertyName === key),
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
