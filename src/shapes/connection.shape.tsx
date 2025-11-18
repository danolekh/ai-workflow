import { ConnectionBinding } from "@/bindings/connection.binding";
import { cn } from "@/lib/utils";
import {
  connectionState,
  usePotentialTargetId,
} from "@/state/connection.state";
import {
  Edge2d,
  Editor,
  Geometry2d,
  IndexKey,
  JsonObject,
  ShapeUtil,
  SVGContainer,
  TLBaseShape,
  TLHandle,
  TLHandleDragInfo,
  TLShape,
  TLShapeId,
  useEditor,
  useValue,
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

  isAspectRatioLocked(_shape: ConnectionShape): boolean {
    return true;
  }

  onHandleDrag(
    shape: ConnectionShape,
    info: TLHandleDragInfo<ConnectionShape>,
  ) {
    console.log("onhandleDrag");

    // Find the new position of the handle in page space
    const shapeTransform = this.editor.getShapePageTransform(shape);
    const handlePagePosition = shapeTransform.applyToPoint(info.handle);

    const potentialTarget = this.editor.getShapeAtPoint(handlePagePosition);

    const hasTarget = potentialTarget && potentialTarget.type !== "connection";

    connectionState.update(this.editor, () => ({
      potentialTargetId: hasTarget ? potentialTarget.id : null,
    }));

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

  onHandleDragEnd(
    current: ConnectionShape,
    info: TLHandleDragInfo<ConnectionShape>,
  ) {
    const previousBinding = this.editor
      .getBindingsFromShape<ConnectionBinding>(current.id, "connection")
      .find((binding) => binding.meta.type === "end");

    const cleanupPreviousBinding = () =>
      previousBinding
        ? this.editor.deleteBinding(previousBinding.id)
        : void null;

    const shapeTransform = this.editor.getShapePageTransform(current);
    const handlePagePosition = shapeTransform.applyToPoint({
      ...info.handle,
      ...current.props.end,
    });

    const potentialTarget = this.editor.getShapeAtPoint(handlePagePosition);

    const hasTarget = potentialTarget && potentialTarget.type !== "connection";

    if (!hasTarget) {
      cleanupPreviousBinding();
      return;
    }

    const targetShape = this.editor.getShape(potentialTarget.id);

    if (!targetShape) {
      cleanupPreviousBinding();
      return;
    }

    const targetShapeGeometry = this.editor.getShapeGeometry(
      potentialTarget.id,
    );

    this.editor.updateShape<ConnectionShape>({
      id: current.id,
      type: "connection",
      props: {
        ["end"]: {
          x: targetShape.x + targetShapeGeometry.center.x,
          y: targetShape.y + targetShapeGeometry.center.y,
        },
      },
    });

    connectionState.update(this.editor, () => ({
      potentialTargetId: null,
    }));

    if (
      previousBinding?.fromId !== current.id ||
      previousBinding?.toId !== potentialTarget.id
    ) {
      cleanupPreviousBinding();

      this.editor.createBinding<ConnectionBinding>({
        type: "connection",
        fromId: current.id,
        toId: potentialTarget.id,
        meta: {
          type: "end",
        },
      });
    }
  }

  getGeometry(shape: ConnectionShape): Geometry2d {
    const { start, end } = getHandlePositions(this.editor, shape);

    return new Edge2d({
      start: Vec.From(start),
      end: Vec.From(end),
    });
  }

  getHandles(shape: ConnectionShape): TLHandle[] {
    const { end } = getHandlePositions(this.editor, shape);

    return [
      {
        id: "end",
        index: "a1" as IndexKey,
        type: "vertex",
        x: end.x,
        y: end.y,
      },
    ];
  }

  component(shape: ConnectionShape) {
    const editor = useEditor();
    const { start, end } = getHandlePositions(this.editor, shape);

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
    const { start, end } = getHandlePositions(this.editor, shape);

    return (
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={2} />
    );
  }
}

const getHandlePositions = (editor: Editor, shape: ConnectionShape) => {
  const { start, end } = shape.props;
  const bindings = editor.getBindingsFromShape<ConnectionBinding>(
    shape.id,
    "connection",
  );

  const startBinding = bindings.find((b) => b.meta.type === "start");
  const endBinding = bindings.find((b) => b.meta.type === "end");

  const sourceShape = startBinding ? editor.getShape(startBinding.toId) : null;

  const endShape = endBinding ? editor.getShape(endBinding.toId) : null;

  const _start = (() => {
    if (sourceShape) {
      const sourceShapeGeometry = editor.getShapeGeometry(sourceShape.id);

      return {
        x: sourceShape.x + sourceShapeGeometry.center.x,
        y: sourceShape.y + sourceShapeGeometry.center.y,
      };
    }

    return start;
  })();

  const _end = (() => {
    if (endShape) {
      const endShapeGeometry = editor.getShapeGeometry(endShape.id);

      return {
        x: endShape.x + endShapeGeometry.center.x,
        y: endShape.y + endShapeGeometry.center.y,
      };
    }

    return end;
  })();

  return {
    start: _start,
    end: _end,
  };
};

export function ConnectionPool({
  sourceShapeId,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sourceShapeId: TLShapeId;
}) {
  const editor = useEditor();
  const currentTool = editor.getCurrentTool();

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-full size-4 bg-accent border cursor-grab",
        className,
      )}
      onPointerDown={() => {
        editor.setCurrentTool("select.base_connection", {
          sourceShapeId,
        });
      }}
      {...props}
    ></div>
  );
}

export function ConnectionTargetIndicator({
  children,
  shape,
}: React.PropsWithChildren<{ shape: TLShape }>) {
  const editor = useEditor();

  const potentialTargetId = usePotentialTargetId(editor);

  if (!potentialTargetId || potentialTargetId !== shape.id) return children;

  const shapeBounds = editor.getShapeGeometry(shape).bounds;

  return (
    <>
      <SVGContainer>
        <defs>
          <style>{`
            @keyframes dash-move {
              to {
                stroke-dashoffset: -20;
              }
            }
          `}</style>
        </defs>
        <rect
          x={0}
          y={0}
          width={shapeBounds.width}
          height={shapeBounds.height}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          style={{
            animation: "dash-move 0.5s linear infinite",
          }}
        />
      </SVGContainer>
      {children}
    </>
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
