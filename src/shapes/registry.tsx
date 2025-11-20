import { Editor, TLBaseShape, T } from "tldraw";
import type { PromptShape } from "./prompt.shape";
import type { TextShape } from "./text.shape";
import { sleep } from "@/lib/utils";

type NodeRegistration<
  Shape extends TLBaseShape<any, any>,
  Inputs extends {} | undefined,
  Outputs extends {} | undefined,
> = {
  inputsValidator: T.Validator<Inputs>;
  outputsValidator: T.Validator<Outputs>;
  execute: (
    editor: Editor,
    shape: Shape,
    inputs: Inputs,
  ) => Promise<Outputs> | Outputs;
};

export const register = <Shape extends TLBaseShape<any, any>>(
  type: Shape["type"],
) => {
  return <Inputs extends {} | undefined, Outputs extends {} | undefined>(
    data: NodeRegistration<Shape, Inputs, Outputs>,
  ) => ({ [type]: data });
};

export const registry = {
  ...register<PromptShape>("prompt")({
    inputsValidator: T.object({
      text: T.string,
    }).optional(),
    outputsValidator: T.object({
      text: T.string,
    }),
    execute: async (editor, shape, inputs) => {
      await sleep(400);

      return { text: `hello from ${shape.id}` };
    },
  }),

  ...register<TextShape>("text")({
    inputsValidator: T.object({
      text: T.string,
    }),
    outputsValidator: T.object({
      text: T.string,
    }),
    execute: (editor, shape, inputs) => {
      editor.updateShape<TextShape>({
        id: shape.id,
        type: "text",
        props: {
          ...shape.props,
          text: inputs.text,
        },
      });

      return { text: shape.props.text };
    },
  }),
};

const a = T.object({
  text: T.string,
}).optional();

type A = typeof a;
