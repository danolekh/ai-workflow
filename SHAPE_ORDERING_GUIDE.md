# Shape Ordering (Z-Index) in tldraw

## How It Works

In tldraw, shapes don't use CSS `z-index`. Instead, they use an **`index` property** (a fractional index string) to determine their stacking order.

- **Lower index** = Behind (bottom of stack)
- **Higher index** = In front (top of stack)

## Built-in Methods

### Manual Reordering

```typescript
// Send shapes to the back
editor.sendToBack([shapeId]);
editor.sendToBack(shape);

// Bring shapes to the front
editor.bringToFront([shapeId]);
editor.bringToFront(shape);

// Send backward one layer
editor.sendBackward([shapeId]);

// Bring forward one layer
editor.bringForward([shapeId]);
```

### Example Usage

```typescript
// In your component or tool
const connectionShape = editor.getShape(connectionId);
if (connectionShape) {
  // Send to back
  editor.sendToBack([connectionShape.id]);
  
  // Or bring to front
  editor.bringToFront([connectionShape.id]);
}
```

## Automatic Ordering with Side Effects ✅ (Recommended)

For shapes that should **always** stay in a certain order (like connections always behind nodes), use side effects:

### Your Implementation

The `keepConnectionsAtBottom` utility has been added to your `App.tsx`:

```typescript
import { keepConnectionsAtBottom } from "./utils/keepConnectionsAtBottom";

onMount={(editor) => {
  // This ensures all connection shapes always stay behind other shapes
  keepConnectionsAtBottom(editor);
}}
```

### How It Works

The utility uses tldraw's side effect system:

1. **Monitors shape creation/changes** - Tracks when shapes are created or their index/parent changes
2. **Runs after each operation** - When an operation completes, it checks if reordering is needed
3. **Automatically reorders** - Moves non-connection shapes above all connections

This happens automatically, so even if you manually try to bring a connection to front, it will be pushed back down!

## Manual Index Control

You can also manually set a shape's index:

```typescript
import { getIndexBetween } from 'tldraw';

// Get the shape
const shape = editor.getShape(shapeId);

// Update its index
editor.updateShape({
  id: shape.id,
  type: shape.type,
  index: 'a0', // Lower index = further back
});
```

### Creating Shapes with Specific Index

```typescript
import { getNextConnectionIndex } from './utils/keepConnectionsAtBottom';

// Create a connection with the right index from the start
const connectionId = createShapeId();
editor.createShape({
  id: connectionId,
  type: 'connection',
  x: 100,
  y: 100,
  props: {
    start: { x: 0, y: 0 },
    end: { x: 100, y: 100 }
  },
  // This will place it above other connections but below everything else
  index: getNextConnectionIndex(editor),
});
```

## Understanding Fractional Indexing

tldraw uses fractional indexing for efficient reordering:

```
'a0'  -> Behind
'a1'  -> Middle
'a2'  -> Front

'a0V' -> Between 'a0' and 'a1'
```

You rarely need to work with these directly - use the helper functions:

```typescript
import { getIndexBetween, getIndexAbove, getIndexBelow } from 'tldraw';

// Get index between two shapes
const newIndex = getIndexBetween(shape1.index, shape2.index);

// Get index above a shape
const aboveIndex = getIndexAbove(shape.index);

// Get index below a shape
const belowIndex = getIndexBelow(shape.index);
```

## Query Shape Order

```typescript
// Get shapes sorted by index
const sortedChildren = editor.getSortedChildIdsForParent(parentId);

// The first shape in the array is at the back
// The last shape is at the front
```

## Common Patterns

### Pattern 1: Keep One Shape Type Always Behind Others ✅

```typescript
// Already implemented in your project!
keepConnectionsAtBottom(editor);
```

### Pattern 2: Keep Specific Shapes Behind on Creation

```typescript
editor.sideEffects.registerAfterCreateHandler('shape', (shape) => {
  if (shape.type === 'connection') {
    editor.sendToBack([shape.id]);
  }
});
```

### Pattern 3: Layer Groups

```typescript
// Background layer (lowest indexes)
const backgroundShapes = ['background', 'grid'];

// Middle layer
const contentShapes = ['prompt', 'text', 'node'];

// Foreground layer (highest indexes)
const overlayShapes = ['annotation', 'label'];

editor.sideEffects.registerAfterCreateHandler('shape', (shape) => {
  if (backgroundShapes.includes(shape.type)) {
    editor.sendToBack([shape.id]);
  } else if (overlayShapes.includes(shape.type)) {
    editor.bringToFront([shape.id]);
  }
});
```

### Pattern 4: Conditional Ordering in Shape Component

```typescript
// In your shape's component
component(shape: MyShape) {
  const editor = useEditor();
  
  useEffect(() => {
    // Send to back when certain condition is met
    if (shape.props.isBackground) {
      editor.sendToBack([shape.id]);
    }
  }, [shape.props.isBackground]);
  
  return <HTMLContainer>...</HTMLContainer>;
}
```

## Best Practices

1. **Use side effects for automatic ordering** - Don't manually reorder on every change
2. **Set index on creation when possible** - Use `getNextConnectionIndex()` or similar
3. **Don't fight the system** - If you need a shape always behind, use side effects
4. **Batch updates** - Update multiple shapes' indexes in one call for performance

## Debugging

```typescript
// Check a shape's current index
const shape = editor.getShape(shapeId);
console.log('Shape index:', shape.index);

// See all shapes in order
const sortedIds = editor.getSortedChildIdsForParent(editor.getCurrentPageId());
sortedIds.forEach(id => {
  const shape = editor.getShape(id);
  console.log(`${shape.type} (${shape.id}): ${shape.index}`);
});
```

## Summary

Your project now has automatic connection ordering! The `keepConnectionsAtBottom` utility ensures:

- ✅ All connection shapes stay behind other shapes
- ✅ Works automatically on create, move, or reorder
- ✅ Can't be accidentally broken by manual operations
- ✅ Efficient - only updates when needed

No need to manually manage z-index for connections anymore!
