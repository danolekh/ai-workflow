import { Editor, TLBaseShape, TLShape } from "tldraw";
import type { PromptShape } from "./prompt.shape";
import type { TextShape } from "./text.shape";
import { sleep } from "@/lib/utils";

type NodeRegistration<Shape extends TLBaseShape<any, any>> = {
  execute: (editor: Editor, shape: Shape, inputs: any) => Promise<any> | any;
};

export const registry = {
  ...registerNode<PromptShape>({
    type: "prompt",
    execute: async (editor, shape, inputs) => {
      await sleep(400);

      return {
        text: `hello from ${shape.id}`,
      };
    },
  }),
  ...registerNode<TextShape>({
    type: "text",
    execute: async (editor, shape, inputs) => {
      await sleep(400);

      return {
        text: shape.props.text,
      };
    },
  }),
};

export function registerNode<Shape extends TLShape>({
  type,
  execute,
}: {
  type: Shape["type"];
  execute: NodeRegistration<Shape>["execute"];
}) {
  return {
    [type]: {
      execute,
    },
  };
}
