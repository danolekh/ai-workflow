import { Editor, EditorAtom, TLShapeId, useValue } from "tldraw";

type ConnectionState = {
  potentialTargetId: TLShapeId | null;
  sourceId: TLShapeId | null;
};

export const connectionState = new EditorAtom<ConnectionState>(
  "connection_state",
  () => ({
    potentialTargetId: null,
    sourceId: null,
  }),
);

export const usePotentialTargetId = (editor: Editor) => {
  return useValue(
    "potentialTargetId",
    () => {
      return connectionState.get(editor).potentialTargetId;
    },
    [editor],
  );
};
