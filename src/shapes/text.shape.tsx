import { Textarea } from "@/components/ui/textarea";
import { HTMLContainer, TLBaseShape, BaseBoxShapeUtil, Editor } from "tldraw";
import { Loader2Icon, PlayIcon, TextIcon } from "lucide-react";
import { ConnectionPool, ConnectionTargetIndicator } from "./connection.shape";
import { sleep } from "@/lib/utils";
import { executeWorkflow, getWorkflowShapshot, useIsRunning } from "@/workflow";
import { Button } from "@/components/ui/button";

export type TextShape = TLBaseShape<
  "text",
  {
    h: number;
    w: number;
    text: string;
  }
>;

export class TextShapeUtil extends BaseBoxShapeUtil<TextShape> {
  static override type = "text" as const;

  static icon = (<TextIcon strokeWidth={1.8} className="size-5" />);

  static async execute(editor: Editor, shape: TextShape, inputs: any) {
    await sleep(400);

    return {
      text: shape.props.text,
    };
  }

  getDefaultProps() {
    return {
      h: 150,
      w: 200,
      text: "",
    };
  }

  component(shape: TextShape) {
    const isRunning = useIsRunning(shape.id);

    return (
      <ConnectionTargetIndicator shape={shape}>
        <HTMLContainer className="flex flex-col gap-2 bg-card p-4 border rounded-md">
          <div className="flex justify-between">
            <span className="text-lg">Text</span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="pointer-events-auto"
              disabled={isRunning}
              onPointerDown={() => {
                const snapshot = getWorkflowShapshot(this.editor, shape.id);

                executeWorkflow(this.editor, snapshot);

                console.log({
                  snapshot,
                });
              }}
            >
              {isRunning ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <PlayIcon />
              )}
            </Button>
          </div>
          <Textarea
            className="w-full flex-1 pointer-events-auto min-h-0"
            value={shape.props.text}
            onChange={(e) => {
              const t = e.target.value;

              this.editor.updateShape<TextShape>({
                id: shape.id,
                type: "text",
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
        </HTMLContainer>
      </ConnectionTargetIndicator>
    );
  }

  indicator(shape: TextShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
