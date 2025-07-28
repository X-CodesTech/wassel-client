# Promise-Based Confirm Dialog Service

This service provides a promise-based confirmation dialog similar to the native `alert()` function, but with a modern UI and better user experience.

## Usage

### Basic Usage

```typescript
import { confirm } from "@/components/ConfirmDialog/dialogService";

const handleDelete = async (id: string) => {
  // Show confirmation dialog
  const confirmed = await confirm({
    title: "Delete Item",
    description:
      "Are you sure you want to delete this item? This cannot be undone.",
  });

  if (confirmed) {
    // User clicked "Delete"
    await deleteItem(id);
  }
  // User clicked "Cancel" - do nothing
};
```

### With Error Handling

```typescript
const handleDelete = async (id: string) => {
  try {
    const confirmed = await confirm({
      title: "Delete Item",
      description: "Are you sure you want to delete this item?",
    });

    if (confirmed) {
      await deleteItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    }
  } catch (error) {
    console.error("Dialog error:", error);
    toast({
      title: "Error",
      description: "An error occurred",
      variant: "destructive",
    });
  }
};
```

### In Event Handlers

```typescript
// For onClick handlers, use a curried function
const handleDeleteClick = (id: string) => async () => {
  const confirmed = await confirm({
    title: "Delete Item",
    description: "Are you sure?",
  });

  if (confirmed) {
    await deleteItem(id);
  }
};

// Usage in JSX
<Button onClick={handleDeleteClick(item.id)}>Delete</Button>;
```

## API

### `confirm(options)`

Returns a `Promise<boolean>` that resolves to:

- `true` when the user clicks "Delete"
- `false` when the user clicks "Cancel" or closes the dialog

#### Options

```typescript
interface ConfirmOptions {
  title: string; // Dialog title
  description: string; // Dialog description/message
}
```

## Features

- **Promise-based**: Returns a promise that resolves to a boolean
- **Modern UI**: Uses shadcn/ui components for consistent styling
- **Accessible**: Proper ARIA attributes and keyboard navigation
- **Auto-cleanup**: Automatically removes the dialog from the DOM when closed
- **React 18 compatible**: Uses `createRoot` instead of deprecated `ReactDOM.render`

## Implementation Details

The dialog service:

1. Creates a temporary container in the DOM
2. Renders the dialog component using React 18's `createRoot`
3. Returns a promise that resolves when the user makes a choice
4. Automatically cleans up the DOM when the dialog is closed

This approach allows for a clean, promise-based API similar to native browser dialogs while providing a much better user experience.
