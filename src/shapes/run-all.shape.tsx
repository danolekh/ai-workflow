import { Button } from "@/components/ui/button";
import { getWorkflowShapshot, useIsRunning, WorkflowRunner } from "@/workflow";
import { PlayIcon } from "lucide-react";
import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape } from "tldraw";
import { ConnectionPool } from "./connection.shape";

export type RunAllShape = TLBaseShape<
  "run-all",
  {
    h: number;
    w: number;
  }
>;

export class RunAllShapeUtil extends BaseBoxShapeUtil<RunAllShape> {
  static override type = "run-all";
  static icon = (<PlayIcon strokeWidth={1.8} className="size-5" />);

  getDefaultProps(): { h: number; w: number } {
    return {
      h: 100,
      w: 100,
    };
  }

  component(shape: RunAllShape) {
    const isRunning = useIsRunning(shape.id);

    return (
      <HTMLContainer className="flex items-center justify-center border rounded-md bg-card">
        <Button
          type="button"
          className="pointer-events-auto size-[50%]"
          variant={"outline"}
          size="icon"
          disabled={isRunning}
          onPointerDown={() => {
            const snapshot = getWorkflowShapshot(this.editor, shape.id);
            const runner = new WorkflowRunner(this.editor, snapshot);

            runner.run();
          }}
        >
          <PlayIcon />
        </Button>
        <ConnectionPool
          className="absolute right-0 translate-x-[50%] top-[50%] -translate-y-[50%] z-[-1]"
          sourceShapeId={shape.id}
        />
      </HTMLContainer>
    );
  }

  indicator(shape: RunAllShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
