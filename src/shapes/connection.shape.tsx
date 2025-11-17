import { cn } from "@/lib/utils";
import {
  Edge2d,
  Geometry2d,
  IndexKey,
  JsonObject,
  ShapeUtil,
  SVGContainer,
  TLBaseShape,
  TLHandle,
  TLHandleDragInfo,
  TLShapeId,
  useEditor,
  Vec,
  VecModel,
} from "tldraw";

export type ConnectionShape = TLBaseShape<
  "connection",
  {
    start: VecModel;
    end: VecModel;
  }
>;

export class ConnectionShapeUtil extends ShapeUtil<ConnectionShape> {
  static override type = "connection";

  override canEdit() {
    return false;
  }

  override canResize() {
    return false;
  }

  override hideResizeHandles() {
    return true;
  }

  override hideRotateHandle() {
    return true;
  }

  override hideSelectionBoundsBg() {
    return true;
  }

  override hideSelectionBoundsFg() {
    return true;
  }

  onTranslateStart(shape: ConnectionShape) {
    return shape;
  }

  onTranslate(initial: ConnectionShape, current: ConnectionShape) {
    return initial;
  }

  onHandleDrag(
    shape: ConnectionShape,
    info: TLHandleDragInfo<ConnectionShape>,
  ) {
    this.editor.updateShape<ConnectionShape>({
      id: shape.id,
      type: "connection",
      props: {
        [info.handle.id]: {
          x: info.handle.x,
          y: info.handle.y,
        },
      },
    });
  }

  isAspectRatioLocked(_shape: ConnectionShape): boolean {
    return true;
  }

  getDefaultProps() {
    return {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
    };
  }

  getGeometry(shape: ConnectionShape): Geometry2d {
    const { start, end } = shape.props;

    return new Edge2d({
      start: Vec.From(start),
      end: Vec.From(end),
    });
  }

  getHandles(shape: ConnectionShape): TLHandle[] {
    return [
      {
        id: "end",
        index: "a1" as IndexKey,
        type: "vertex",
        x: shape.props.end.x,
        y: shape.props.end.y,
      },
    ];
  }

  component(shape: ConnectionShape) {
    const { start, end } = shape.props;

    return (
      <SVGContainer>
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </SVGContainer>
    );
  }

  indicator(shape: ConnectionShape) {
    const { start, end } = shape.props;

    return (
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={2} />
    );
  }
}

export function ConnectionPool({
  sourceShapeId,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sourceShapeId: TLShapeId;
}) {
  const editor = useEditor();
  const currentTool = editor.getCurrentTool();

  console.log({ currentTool });

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-full size-4 bg-accent border cursor-grab",
        className,
      )}
      onPointerEnter={() => {
        editor.setCurrentTool("select.base_connection", {
          sourceShapeId,
        });
      }}
      {...props}
    ></div>
  );
}

// // Calculate control points for smooth bezier curves
// function getConnectionControlPoints(start: VecLike, end: VecLike): [Vec, Vec] {
//   const distance = end.x - start.x;

//   const adjustedDistance = Math.max(
//     30,
//     distance > 0 ? distance / 3 : clamp(Math.abs(distance) + 30, 0, 100),
//   );

//   return [
//     new Vec(start.x + adjustedDistance, start.y),
//     new Vec(end.x - adjustedDistance, end.y),
//   ];
// }
