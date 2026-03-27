// Simple test script to verify LocalStorage persistence
// This can be run in the browser console to test the functionality

// Test 1: Check if LocalStorage is working
console.log('=== Testing LocalStorage Persistence ===');

// Test projects store
console.log('1. Testing projects store...');
const projectsStore = window.Pinia?.useProjectsStore?.();
if (projectsStore) {
  console.log('Projects store found:', projectsStore.projects.length);
  
  // Add a test project
  const testProject = {
    id: Date.now(),
    name: 'Test Project',
    description: 'Test description'
  };
  
  projectsStore.addProject(testProject);
  console.log('Added test project. Total projects:', projectsStore.projects.length);
  
  // Check LocalStorage
  const storedProjects = localStorage.getItem('projects');
  console.log('LocalStorage projects:', storedProjects ? JSON.parse(storedProjects).length : 'None');
} else {
  console.log('Projects store not found');
}

// Test tasks store
console.log('2. Testing tasks store...');
const taskStore = window.Pinia?.useTaskStore?.();
if (taskStore) {
  console.log('Tasks store found:', taskStore.tasks.length);
  
  // Add a test task
  const testTask = {
    id: Date.now(),
    projectId: 1,
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 'medium',
    assignee: 'Test User',
    dueDate: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    order: 0
  };
  
  taskStore.addTask(testTask);
  console.log('Added test task. Total tasks:', taskStore.tasks.length);
  
  // Check LocalStorage
  const storedTasks = localStorage.getItem('tasks');
  console.log('LocalStorage tasks:', storedTasks ? JSON.parse(storedTasks).length : 'None');
} else {
  console.log('Tasks store not found');
}

console.log('=== Test Complete ===');
