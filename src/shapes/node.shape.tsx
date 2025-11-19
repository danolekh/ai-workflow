import {
  Edge2d,
  Editor,
  Geometry2d,
  ShapeUtil,
  TLBaseBoxShape,
  TLBaseShape,
  TLGeometryOpts,
  Vec,
} from "tldraw";
import { PromptShapeUtil } from "./prompt.shape";
import { TextShapeUtil } from "./text.shape";

export const nodesMap = {
  [PromptShapeUtil.type]: PromptShapeUtil,
  [TextShapeUtil.type]: TextShapeUtil,
};

type NodeShape = TLBaseShape<
  "node",
  {
    type: string;
  }
>;

export class NodeShapeUtil extends ShapeUtil<NodeShape> {}

export function registerNode<Shape extends TLBaseBoxShape>({
  type,
  execute,
}: {
  type: string;
  execute: () => void;
}) {
  return (editor: Editor) => {};

  // return class extends ShapeUtil<Shape> {
  //   static override type = type;

  //   static override execute = execute;
  // };
}

class MyClass extends registerNode({
  type: "my-class",
  execute: () => {
    console.log("Executing MyClass");
  },
}) {}
