import { Connector } from "@/connector";
import { CableIcon, PlayIcon } from "lucide-react";
import { BaseBoxShapeUtil, HTMLContainer, TLBaseShape } from "tldraw";
import { Textarea } from "@/components/ui/textarea";
import { ConnectionPool, ConnectionTargetIndicator } from "../connection.shape";
import { Badge } from "@/components/ui/badge";

export type AggregatorShape = TLBaseShape<
  "aggregator",
  {
    h: number;
    w: number;
    template: string;
  }
>;

export class AggregatorShapeUtil extends BaseBoxShapeUtil<AggregatorShape> {
  static override type = "aggregator";
  static icon = (<CableIcon strokeWidth={1.8} className="size-5" />);

  canEdit(_shape: AggregatorShape): boolean {
    return false;
  }

  getDefaultProps(): { h: number; w: number; template: string } {
    return {
      h: 160,
      w: 200,
      template: "",
    };
  }

  component(shape: AggregatorShape) {
    const connections = Connector.getInputConnections(this.editor, shape.id);

    return (
      <HTMLContainer className="flex flex-col gap-2 bg-card p-4 border rounded-md cursor-grab">
        <ConnectionTargetIndicator shape={shape}>
          <div className="flex items-center gap-1">
            {connections.map((connection) => (
              <Badge
                key={connection.id}
                variant="secondary"
                className="pointer-events-auto cursor-pointer hover:bg-accent/70"
                onPointerDown={() => {
                  this.editor.updateShape<AggregatorShape>({
                    id: shape.id,
                    type: "aggregator",
                    props: {
                      template: `${shape.props.template}{{${connection.props.inputPropertyName}}}`,
                    },
                  });
                }}
              >
                {connection.props.inputPropertyName}
              </Badge>
            ))}
          </div>
          <Textarea
            className="w-full flex-1 pointer-events-auto min-h-0"
            value={shape.props.template}
            onChange={(e) => {
              const t = e.target.value;

              this.editor.updateShape<AggregatorShape>({
                id: shape.id,
                type: "aggregator",
                props: {
                  template: t,
                },
              });
            }}
          />
          <ConnectionPool
            className="absolute right-0 translate-x-[50%] top-[50%] -translate-y-[50%] z-[-1]"
            sourceShapeId={shape.id}
          />
        </ConnectionTargetIndicator>
      </HTMLContainer>
    );
  }

  indicator(shape: AggregatorShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
