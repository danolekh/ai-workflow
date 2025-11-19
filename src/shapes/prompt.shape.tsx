import { Textarea } from "@/components/ui/textarea";
import {
  HTMLContainer,
  TLBaseShape,
  BaseBoxShapeUtil,
  ShapeUtil,
  Editor,
} from "tldraw";
import { FileInputIcon, PlayIcon } from "lucide-react";
import { ConnectionPool, ConnectionTargetIndicator } from "./connection.shape";
import { Button } from "@/components/ui/button";
import { executeWorkflow, getWorkflowShapshot } from "@/workflow";
import { sleep } from "@/lib/utils";

type PromptShape = TLBaseShape<
  "prompt",
  {
    h: number;
    w: number;
    text: string;
  }
>;

export class PromptShapeUtil extends BaseBoxShapeUtil<PromptShape> {
  static override type = "prompt" as const;

  static async execute(editor: Editor, shape: PromptShape, inputs: any) {
    await sleep(400);

    return {
      text: `Hello from ${shape.id}`,
    };
  }

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
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="pointer-events-auto"
              onPointerDown={() => {
                console.log("here");
                const snapshot = getWorkflowShapshot(this.editor, shape.id);

                executeWorkflow(this.editor, snapshot);

                console.log({
                  snapshot,
                });
              }}
            >
              <PlayIcon />
            </Button>
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
