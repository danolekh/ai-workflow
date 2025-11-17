import { ConnectionBinding } from "@/bindins/connection.binding";
import {
  ConnectionShape,
  ConnectionShapeUtil,
} from "@/shapes/connection.shape";
import {
  TLShapeId,
  createShapeId,
  StateNode,
  TLPointerEventInfo,
} from "tldraw";

export class IntentConnectionTool extends StateNode {
  static override id = "intent_connection";
}

type BaseConnectionToolInfo = {
  sourceShapeId: TLShapeId;
};

export class BaseConnectionTool extends StateNode {
  static override id = "base_connection";

  // static parent = SelectTool;

  info?: BaseConnectionToolInfo;

  override onEnter(info: BaseConnectionToolInfo): void {
    this.info = info;
  }

  override onPointerMove(info: TLPointerEventInfo): void {
    if (!this.editor.inputs.isDragging) return;
    if (!this.info) return;

    console.log({ info: this.info, isDragging: this.editor.inputs.isDragging });
    console.log(" in pointer move ", { info });

    const creatingMarkId = this.editor.markHistoryStoppingPoint();
    const connectionShapeId = createShapeId();

    const sourceShape = this.editor.getShape(this.info.sourceShapeId);
    const sourceShapeGeometry = this.editor.getShapeGeometry(
      this.info.sourceShapeId,
    );

    if (!sourceShape || !sourceShapeGeometry) return;

    this.editor.createShape<ConnectionShape>({
      type: "connection",
      id: connectionShapeId,
      props: {
        start: {
          x: sourceShape.x + sourceShapeGeometry.center.x,
          y: sourceShape.y + sourceShapeGeometry.center.y,
        },
        end: {
          x: this.editor.inputs.currentPagePoint.x,
          y: this.editor.inputs.currentPagePoint.y,
        },
      },
    });

    this.editor.sendToBack([connectionShapeId]);

    this.editor.createBinding<ConnectionBinding>({
      type: "connection",
      fromId: connectionShapeId,
      toId: this.info.sourceShapeId,
    });

    const handle = this.editor
      .getShapeHandles(connectionShapeId)
      ?.find((h) => h.id === "end");

    console.log({ handle });

    this.parent.transition("dragging_handle", {
      target: "handle",
      shape: this.editor.getShape<ConnectionShape>(connectionShapeId),
      handle: handle!,
      creatingMarkId,
      isCreating: true,
    });

    console.log({ info });
  }

  static override children() {
    return [IntentConnectionTool];
  }
}
