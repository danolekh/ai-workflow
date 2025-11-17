import { PromptShapeUtil } from "./prompt.shape";
import { TextShapeUtil } from "./text.shape";
import { ConnectionShapeUtil } from "./connection.shape";

export const AIWorkflowNodes = [PromptShapeUtil, TextShapeUtil];

export const AIWorkflowShapes = [...AIWorkflowNodes, ConnectionShapeUtil];
