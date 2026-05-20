// ===========================
// To-Do List App - Main Script
// ===========================

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// State
let tasks = [];
let currentFilter = 'all';

// Local Storage Keys
const STORAGE_KEY = 'todoAppTasks';

// ===========================
// Initialization
// ===========================

/**
 * Initialize the app on page load
 */
function init() {
    loadTasks();
    render();
    setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            render();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// ===========================
// Local Storage Management
// ===========================

/**
 * Load tasks from local storage
 */
function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
}

/**
 * Save tasks to local storage
 */
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ===========================
// Task Operations
// ===========================

/**
 * Add a new task
 */
function addTask() {
    const text = taskInput.value.trim();
    
    // Validation
    if (!text) {
        taskInput.focus();
        return;
    }
    
    if (text.length > 200) {
        alert('Task is too long (max 200 characters)');
        return;
    }
    
    // Create task object
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.unshift(task);
    
    // Save and render
    saveTasks();
    render();
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
}

/**
 * Toggle task completion status
 */
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

/**
 * Edit a task
 */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const listItem = document.querySelector(`[data-id="${id}"]`);
    const textSpan = listItem.querySelector('.task-text');
    const editInput = listItem.querySelector('.task-edit-input');
    const taskActions = listItem.querySelector('.task-actions');
    const saveBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    
    // Show edit mode
    textSpan.classList.add('editing');
    editInput.classList.remove('hidden');
    editInput.value = task.text;
    editInput.focus();
    editInput.select();
    
    // Clear existing actions and add save/cancel buttons
    taskActions.innerHTML = '';
    
    saveBtn.classList.add('task-btn', 'save-btn');
    saveBtn.textContent = '✓ Save';
    saveBtn.addEventListener('click', () => saveEdit(id, editInput.value));
    
    cancelBtn.classList.add('task-btn', 'cancel-btn');
    cancelBtn.textContent = '✕ Cancel';
    cancelBtn.addEventListener('click', () => cancelEdit(id));
    
    taskActions.appendChild(saveBtn);
    taskActions.appendChild(cancelBtn);
    
    // Save on Enter, cancel on Escape
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit(id, editInput.value);
        if (e.key === 'Escape') cancelEdit(id);
    });
}

/**
 * Save edited task
 */
function saveEdit(id, newText) {
    const trimmedText = newText.trim();
    
    if (!trimmedText) {
        alert('Task cannot be empty');
        return;
    }
    
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = trimmedText;
        saveTasks();
        render();
    }
}

/**
 * Cancel editing a task
 */
function cancelEdit(id) {
    render();
}

/**
 * Delete a task
 */
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
    }
}

/**
 * Clear all completed tasks
 */
function clearCompleted() {
    if (tasks.some(t => t.completed)) {
        if (confirm('Delete all completed tasks?')) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            render();
        }
    } else {
        alert('No completed tasks to clear');
    }
}

/**
 * Clear all tasks
 */
function clearAll() {
    if (tasks.length > 0) {
        if (confirm('Delete all tasks? This cannot be undone!')) {
            tasks = [];
            saveTasks();
            render();
        }
    } else {
        alert('No tasks to clear');
    }
}

// ===========================
// Filtering & Display
// ===========================

/**
 * Get filtered tasks based on current filter
 */
function getFilteredTasks() {
    switch (currentFilter) {
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'active':
            return tasks.filter(t => !t.completed);
        default:
            return tasks;
    }
}

/**
 * Update statistics
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    remainingTasksEl.textContent = remaining;
}

/**
 * Render tasks to the DOM
 */
function render() {
    // Clear task list
    taskList.innerHTML = '';
    
    // Get filtered tasks
    const filteredTasks = getFilteredTasks();
    
    // Show/hide empty state
    emptyState.style.display = filteredTasks.length === 0 ? 'block' : 'none';
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = task.id;
        
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        taskItem.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text" ondblclick="editTask(${task.id})">
                ${sanitizeHTML(task.text)}
            </span>
            <input 
                type="text" 
                class="task-edit-input hidden" 
                value="${sanitizeHTML(task.text)}"
            >
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" title="Edit task">
                    ✏️
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                    🗑️
                </button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    // Update statistics
    updateStats();
}

// ===========================
// Security & Utilities
// ===========================

/**
 * Sanitize HTML to prevent XSS attacks
 */
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// Start the app
// ===========================

document.addEventListener('DOMContentLoaded', init);
