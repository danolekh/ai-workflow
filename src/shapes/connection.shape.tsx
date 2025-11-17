import { cn } from "@/lib/utils";
import { BaseConnectionTool } from "@/tools/connection.tool";
import { MoveDownIcon } from "lucide-react";
import {
  ArrowShapeUtil,
  BaseBoxShapeUtil,
  HTMLContainer,
  TLBaseShape,
  TLShapeId,
  useEditor,
} from "tldraw";

export type ConnectionShape = TLBaseShape<
  "connection",
  {
    h: number;
    w: number;
    sourceId: TLShapeId | null;
    targetId: TLShapeId | null;
  }
>;

export class ConnectionShapeUtil extends BaseBoxShapeUtil<ConnectionShape> {
  static override type = "connection";

  isAspectRatioLocked(_shape: ConnectionShape): boolean {
    return true;
  }

  getDefaultProps() {
    return {
      h: 100,
      w: 100,
      sourceId: null,
      targetId: null,
    };
  }

  component(shape: ConnectionShape) {
    return (
      <HTMLContainer>
        <MoveDownIcon className="size-full" />
      </HTMLContainer>
    );
  }

  indicator(shape: ConnectionShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

// export class ConnectionShapeUtil extends ArrowShapeUtil {
//   static override type = "connection";
// }

export function ConnectionPool({
  sourceShapeId,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sourceShapeId: TLShapeId;
}) {
  const editor = useEditor();

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-full size-16 bg-accent border",
        className,
      )}
      onPointerEnter={() => {
        console.log("pointer entered");
        editor.setCurrentTool(BaseConnectionTool.id, {
          sourceShapeId,
        });
      }}
      {...props}
    ></div>
  );
}
