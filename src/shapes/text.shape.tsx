import { Textarea } from "@/components/ui/textarea";
import { HTMLContainer, TLBaseShape, BaseBoxShapeUtil } from "tldraw";
import { TextIcon } from "lucide-react";

type TextShape = TLBaseShape<
  "text",
  {
    h: number;
    w: number;
    text: string;
  }
>;

export class TextShapeUtil extends BaseBoxShapeUtil<TextShape> {
  static override type = "text" as const;

  static icon = (<TextIcon strokeWidth={1.8} className="size-5" />);

  getDefaultProps() {
    return {
      h: 150,
      w: 200,
      text: "",
    };
  }

  component(shape: TextShape) {
    return (
      <HTMLContainer className="flex flex-col gap-2 bg-card p-4 border rounded-md">
        <span className="text-lg">Text</span>
        <Textarea
          className="w-full flex-1 pointer-events-auto min-h-0"
          value={shape.props.text}
          onChange={(e) => {
            const t = e.target.value;

            this.editor.updateShape<TextShape>({
              id: shape.id,
              type: "text",
              props: {
                text: t,
              },
            });
          }}
        ></Textarea>
      </HTMLContainer>
    );
  }

  indicator(shape: TextShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
