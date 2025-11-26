import { PromptShapeUtil } from "./prompt.shape";
import { TextShapeUtil } from "./text.shape";
import { ConnectionShapeUtil } from "./connection.shape";
import { RunAllShapeUtil } from "./helpers/run-all.shape";
import { AggregatorShapeUtil } from "./helpers/aggregator.shape";

export const AIWorkflowNodes = [PromptShapeUtil, TextShapeUtil];
export const HelperNodes = [RunAllShapeUtil, AggregatorShapeUtil];

export const ToolbarMenuNodes = [...AIWorkflowNodes, ...HelperNodes];

export const AIWorkflowShapes = [
  ...AIWorkflowNodes,
  ...HelperNodes,
  ConnectionShapeUtil,
];
