import { Textarea } from "@/components/ui/textarea";
import { HTMLContainer, TLBaseShape, BaseBoxShapeUtil } from "tldraw";
import { FileInputIcon } from "lucide-react";
import { ConnectionPool } from "./connection.shape";

type PromptShape = TLBaseShape<
  "prompt",
  {
    h: number;
    w: number;
    text: string;
  }
>;

export class PromptShapeUtil extends BaseBoxShapeUtil<PromptShape> {
  static override type = "prompt" as const;

  static icon = (<FileInputIcon strokeWidth={1.8} className="size-5" />);

  getDefaultProps() {
    return {
      h: 150,
      w: 200,
      text: "",
    };
  }

  component(shape: PromptShape) {
    return (
      <HTMLContainer className="flex flex-col gap-2 bg-card p-4 border rounded-md">
        <span className="text-lg">Prompt</span>
        <Textarea
          className="w-full flex-1 pointer-events-auto min-h-0"
          value={shape.props.text}
          onChange={(e) => {
            const t = e.target.value;

            this.editor.updateShape<PromptShape>({
              id: shape.id,
              type: "prompt",
              props: {
                text: t,
              },
            });
          }}
        ></Textarea>
        <ConnectionPool
          className="absolute bottom-0 translate-y-[50%] z-[-1] left-[50%] -translate-x-[50%]"
          sourceShapeId={shape.id}
        />
      </HTMLContainer>
    );
  }

  indicator(shape: PromptShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
