import { getWorkflowShapshot, useIsRunning, WorkflowRunner } from "@/workflow";
import { Button } from "./ui/button";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { TLShapeId, useEditor } from "tldraw";

export function RunWorkflowButton({ shapeId }: { shapeId: TLShapeId }) {
  const editor = useEditor();
  const isRunning = useIsRunning(shapeId);

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="pointer-events-auto"
      disabled={isRunning}
      onPointerDown={() => {
        const snapshot = getWorkflowShapshot(editor, shapeId);
        console.log({
          snapshot,
        });
        const runner = new WorkflowRunner(editor, snapshot);

        runner.run();
      }}
    >
      {isRunning ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <PlayIcon />
      )}
    </Button>
  );
}
