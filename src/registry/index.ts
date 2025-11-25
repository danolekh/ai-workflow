import { Editor, TLBaseShape, T } from "tldraw";
import type { PromptShape } from "../shapes/prompt.shape";
import type { TextShape } from "../shapes/text.shape";
import type { RunAllShape } from "../shapes/run-all.shape";
import { sleep } from "@/lib/utils";
import type { ZodObject, ZodTypeAny, ZodOptional } from "zod/v4";
import z from "zod/v4";

const schema = z.object({
  text: z.string(),
});

type A = z.infer<typeof schema>;

export type Node = PromptShape | TextShape | RunAllShape;

export type NodeRegistration<
  Shape extends TLBaseShape<any, any>,
  InputsSchema extends ZodObject,
  OutputSchema extends ZodTypeAny,
  Output = z.infer<OutputSchema>,
  Inputs = z.infer<InputsSchema>,
> = {
  inputsValidator: InputsSchema;
  outputValidator: OutputSchema;
  execute: (
    editor: Editor,
    shape: Shape,
    inputs: Inputs,
  ) => Promise<Output> | Output;
};

export const register = <Shape extends TLBaseShape<any, any>>() => {
  return <InputsSchema extends ZodObject, OutputSchema extends ZodTypeAny>(
    data: NodeRegistration<Shape, InputsSchema, OutputSchema>,
  ) => data;
};

export const registry = {
  prompt: register<PromptShape>()({
    inputsValidator: z.object({
      text: z.string().optional(),
    }),

    outputValidator: z.string(),
    execute: async (editor, shape, inputs) => {
      await sleep(400);

      return `hello from ${shape.id} ${Date.now()}`;
    },
  }),
  text: register<TextShape>()({
    inputsValidator: z.object({
      text: z.string(),
    }),
    outputValidator: z.string(),
    execute: async (editor, shape, inputs) => {
      await sleep(400);

      editor.updateShape<TextShape>({
        id: shape.id,
        type: "text",
        props: {
          ...shape.props,
          text: inputs.text,
        },
      });

      return inputs.text || shape.props.text;
    },
  }),
  "run-all": register<RunAllShape>()({
    inputsValidator: z.object(),
    outputValidator: z.undefined(),
    execute: async (editor, shape, inputs) => {
      return undefined;
    },
  }),
} as const satisfies Record<
  Node["type"],
  NodeRegistration<TLBaseShape<any, any>, any, any>
>;

export const getNodeRegistry = (type: string) => {
  return type in registry ? registry[type as keyof Registry] : undefined;
};

export type Registry = typeof registry;

export type RegistryInputsVariations = z.infer<
  Registry[keyof Registry]["inputsValidator"]
>;

export type RegistryOutputsVariations = z.infer<
  Registry[keyof Registry]["outputValidator"]
>;
