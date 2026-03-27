# LocalStorage Persistence

This application implements LocalStorage persistence for projects and tasks stores using Pinia.

## Features

- **Automatic Persistence**: State changes are automatically saved to LocalStorage
- **Hydration**: Data is restored from LocalStorage when the application loads
- **Error Handling**: JSON parsing errors are handled gracefully
- **Priority**: LocalStorage data takes priority over API data

## Implementation Details

### Storage Keys
- `projects`: Stores all projects
- `tasks`: Stores all tasks

### How It Works

1. **Store Initialization**: When a store is created, it automatically tries to load data from LocalStorage
2. **State Changes**: Any modification to the store state triggers an automatic save to LocalStorage
3. **API Integration**: If LocalStorage data exists, it's used instead of making API calls on initial load

### Files Modified

- `src/utils/localStorage.ts`: Utility functions for LocalStorage operations
- `src/store/projects.ts`: Updated with persistence logic
- `src/store/tasks.ts`: Updated with persistence logic

### Error Handling

- JSON parsing errors are caught and logged
- Corrupted data is automatically removed from LocalStorage
- The application continues to function even if LocalStorage fails

## Usage

The persistence is automatic and requires no manual intervention. Users can:

1. Create, update, or delete projects/tasks
2. Refresh the page or restart the application
3. See their data automatically restored

## Testing

To test the persistence functionality:

1. Open the application in your browser
2. Create some projects and tasks
3. Refresh the page or close and reopen the browser
4. Verify that your data is still present

You can also check the browser's developer tools:

1. Open DevTools (F12)
2. Go to Application tab
3. Under Storage, find LocalStorage
4. Look for `projects` and `tasks` keys

## Data Format

Both stores use JSON serialization:

```javascript
// Projects format
[
  {
    id: number,
    name: string,
    description: string,
    createdDate: string
  }
]

// Tasks format
[
  {
    id: number,
    projectId: number,
    title: string,
    description: string,
    status: 'todo' | 'in-progress' | 'done',
    priority: string,
    assignee: string,
    dueDate: string,
    createdDate: string,
    order: number
  }
]
```

## Limitations

- LocalStorage has a size limit (typically 5-10MB)
- Data is only stored locally and not synchronized across devices
- Clearing browser data will remove all stored information
