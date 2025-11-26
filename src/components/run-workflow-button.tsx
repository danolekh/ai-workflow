import { getWorkflowShapshot, useIsRunning, WorkflowRunner } from "@/workflow";
import { Button, ButtonProps } from "./ui/button";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { TLShapeId, useEditor } from "tldraw";
import { cn } from "@/lib/utils";

export function RunWorkflowButton({
  className,
  shapeId,
  ...props
}: ButtonProps & { shapeId: TLShapeId }) {
  const editor = useEditor();
  const isRunning = useIsRunning(shapeId);

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={cn("pointer-events-auto", className)}
      disabled={isRunning}
      onPointerDown={() => {
        const snapshot = getWorkflowShapshot(editor, shapeId);

        const runner = new WorkflowRunner(editor, snapshot);

        runner.run();
      }}
      {...props}
    >
      {isRunning ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <PlayIcon />
      )}
    </Button>
  );
}
