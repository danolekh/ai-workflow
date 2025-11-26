import { Button } from "@/components/ui/button";
import { getWorkflowShapshot, useIsRunning, WorkflowRunner } from "@/workflow";
import { PlayIcon } from "lucide-react";
import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape } from "tldraw";
import { ConnectionPool, ConnectionTargetIndicator } from "../connection.shape";
import { RunWorkflowButton } from "@/components/run-workflow-button";

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
    return (
      <HTMLContainer className="flex items-center justify-center border rounded-md bg-card">
        <ConnectionTargetIndicator shape={shape}>
          <RunWorkflowButton
            className="pointer-events-auto size-[50%]"
            shapeId={shape.id}
          />
          <ConnectionPool
            className="absolute right-0 translate-x-[50%] top-[50%] -translate-y-[50%] z-[-1]"
            sourceShapeId={shape.id}
          />
        </ConnectionTargetIndicator>
      </HTMLContainer>
    );
  }

  indicator(shape: RunAllShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
