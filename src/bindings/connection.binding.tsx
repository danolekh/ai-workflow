import {
  BindingOnShapeDeleteOptions,
  BindingOnShapeIsolateOptions,
  BindingUtil,
  TLBaseBinding,
} from "tldraw";

export type ConnectionBinding = TLBaseBinding<"connection", {}> & {
  meta: {
    type: "start" | "end";
  };
};

export class ConnectionBindingUtil extends BindingUtil<ConnectionBinding> {
  static override type = "connection";

  getDefaultProps(): Partial<{}> {
    return {};
  }

  onBeforeIsolateFromShape({
    binding,
  }: BindingOnShapeIsolateOptions<ConnectionBinding>): void {
    this.editor.deleteShapes([binding.fromId]);
  }

  onBeforeDeleteToShape({
    binding,
  }: BindingOnShapeDeleteOptions<ConnectionBinding>): void {
    this.editor.deleteShapes([binding.fromId]);
  }
}
