import { PromptShapeUtil } from "./prompt.shape";
import { TextShapeUtil } from "./text.shape";
import { ConnectionShapeUtil } from "./connection.shape";
import { RunAllShapeUtil } from "./run-all.shape";

export const AIWorkflowNodes = [PromptShapeUtil, TextShapeUtil];
export const HelperNodes = [RunAllShapeUtil];

export const ToolbarMenuNodes = [...AIWorkflowNodes, ...HelperNodes];

export const AIWorkflowShapes = [
  ...AIWorkflowNodes,
  ...HelperNodes,
  ConnectionShapeUtil,
];
