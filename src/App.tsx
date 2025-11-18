import {
  DrawToolbarItem,
  HandToolbarItem,
  NoteToolbarItem,
  SelectToolbarItem,
  Tldraw,
  TldrawUiMenuGroup,
  ToolbarItem,
  DefaultToolbar,
  createShapeId,
  useQuickReactor,
  useEditor,
} from "tldraw";
import { AIWorkflowNodes, AIWorkflowShapes } from "./shapes";
import { AIWorkflowBindings } from "./bindings";
import { BaseConnectionTool } from "./tools/connection.tool";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        // tools={AIWorkflowTools}
        shapeUtils={AIWorkflowShapes}
        bindingUtils={AIWorkflowBindings}
        persistenceKey="main"
        overrides={{
          tools: (editor, tools) => {
            for (const shape of AIWorkflowNodes) {
              tools[`node-${shape.type}`] = {
                icon: shape.icon,
                id: shape.type,
                label: shape.type,
                onSelect: () => {
                  const center = editor.getViewportPageBounds().center;
                  const shapeId = createShapeId();

                  editor.run(() => {
                    editor.createShape({
                      id: shapeId,
                      type: shape.type,
                    });

                    const createdShape = editor.getShape(shapeId)!;
                    const shapeBounds = editor.getShapePageBounds(shapeId)!;

                    const x = center.x - shapeBounds.width / 2;
                    const y = center.y - shapeBounds.height / 2;
                    editor.updateShape({ ...createdShape, x, y });

                    editor.select(shapeId);
                  });
                },
              };
            }

            return tools;
          },
        }}
        components={{
          Toolbar: () => (
            <DefaultToolbar orientation="horizontal">
              <TldrawUiMenuGroup id="selection">
                <SelectToolbarItem />
                <HandToolbarItem />
                <DrawToolbarItem />
                <NoteToolbarItem />
              </TldrawUiMenuGroup>
              <TldrawUiMenuGroup id="ai-nodes">
                {AIWorkflowShapes.map((shape) => (
                  <ToolbarItem tool={`node-${shape.type}`} key={shape.type} />
                ))}
              </TldrawUiMenuGroup>
            </DefaultToolbar>
          ),
        }}
        onMount={(editor) => {
          editor.user.updateUserPreferences({
            locale: "en",
            colorScheme: "dark",
            isSnapMode: true,
          });

          try {
            editor.getStateDescendant("select")!.addChild(BaseConnectionTool);
          } catch {}
        }}
      >
        <Watcher />
      </Tldraw>
    </div>
  );
}

function Watcher() {
  const editor = useEditor();

  useQuickReactor(
    "watch-dark-mode",
    () => {
      const isDarkMode = editor.user.getIsDarkMode();

      document.documentElement.className = isDarkMode ? "dark" : "light";
    },
    [editor],
  );

  return null;
}

export default App;
