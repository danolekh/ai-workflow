import {
  ConnectionShape,
  ConnectionShapeUtil,
} from "@/shapes/connection.shape";
import {
  TLShapeId,
  createShapeId,
  StateNode,
  TLPointerEventInfo,
  TLStateNodeConstructor,
} from "tldraw";

export class IntentConnectionTool extends StateNode {
  static override id = "intent_connection";
}

type BaseConnectionToolInfo = {
  sourceShapeId: TLShapeId;
};

export class BaseConnectionTool extends StateNode {
  static override id = "base_connection";

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
    const shapeId = createShapeId();

    // this.editor.createShape<ConnectionShape>({
    //   type: "connection",
    //   id: shapeId,
    //   x: this.editor.inputs.currentPagePoint.x,
    //   y: this.editor.inputs.currentPagePoint.y,
    //   props: {
    //     sourceId: this.info.sourceShapeId,
    //   },
    // });

    console.log({ info });
  }

  static override children() {
    return [IntentConnectionTool];
  }
}
