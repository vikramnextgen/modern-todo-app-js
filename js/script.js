// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const tasksLeft = document.getElementById('tasksLeft');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filters = document.querySelectorAll('.filter');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    renderTasks();
    updateTasksLeft();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Filter event listeners
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            // Update current filter
            currentFilter = filter.getAttribute('data-filter');
            // Render tasks with new filter
            renderTasks();
        });
    });
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateTasksLeft();
        
        // Clear input
        taskInput.value = '';
        taskInput.focus();
    }
}

// Toggle task completion status
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateTasksLeft();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateTasksLeft();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTasksLeft();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update tasks left count
function updateTasksLeft() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksLeft.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// Render tasks based on current filter
function renderTasks() {
    // Clear the task list
    taskList.innerHTML = '';
    
    // Filter tasks based on currentFilter
    let filteredTasks = [...tasks];
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Sort tasks by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;
        
        // Add event listeners
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
        
        const deleteBtn = taskItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(taskItem);
    });
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);