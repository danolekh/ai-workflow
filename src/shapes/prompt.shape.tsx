import { Textarea } from "@/components/ui/textarea";
import {
  HTMLContainer,
  TLBaseShape,
  BaseBoxShapeUtil,
  ShapeUtil,
  Editor,
  useValue,
} from "tldraw";
import {
  FileInputIcon,
  Loader2Icon,
  PlayIcon,
  WorkflowIcon,
} from "lucide-react";
import { ConnectionPool, ConnectionTargetIndicator } from "./connection.shape";
import { Button } from "@/components/ui/button";
import { WorkflowRunner, getWorkflowShapshot, useIsRunning } from "@/workflow";
import { RunWorkflowButton } from "@/components/run-workflow-button";

export type PromptShape = TLBaseShape<
  "prompt",
  {
    h: number;
    w: number;
    text: string;
  }
>;

export class PromptShapeUtil extends BaseBoxShapeUtil<PromptShape> {
  static override type = "prompt" as const;

  canEdit(_shape: PromptShape): boolean {
    return false;
  }

  canEditInReadonly(_shape: PromptShape): boolean {
    return false;
  }

  static icon = (<FileInputIcon strokeWidth={1.8} className="size-5" />);

  getDefaultProps() {
    return {
      h: 150,
      w: 200,
      text: "",
    };
  }

  component(shape: PromptShape) {
    return (
      <HTMLContainer className="flex flex-col gap-2 bg-card p-4 border rounded-md cursor-grab">
        <ConnectionTargetIndicator shape={shape}>
          <div className="flex justify-between">
            <span className="text-lg">Prompt</span>
            <RunWorkflowButton shapeId={shape.id} />
          </div>
          <Textarea
            className="w-full flex-1 pointer-events-auto min-h-0"
            value={shape.props.text}
            onChange={(e) => {
              const t = e.target.value;

              this.editor.updateShape<PromptShape>({
                id: shape.id,
                type: "prompt",
                props: {
                  text: t,
                },
              });
            }}
          ></Textarea>
          <ConnectionPool
            className="absolute right-0 translate-x-[50%] top-[50%] -translate-y-[50%] z-[-1]"
            sourceShapeId={shape.id}
          />
        </ConnectionTargetIndicator>
      </HTMLContainer>
    );
  }

  indicator(shape: PromptShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
