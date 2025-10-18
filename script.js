// Global variables
let todoCounter = 1;
let rememberCounter = 1;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add todo on Enter key press
    document.getElementById('new-todo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Auto-save notes
    document.getElementById('notes-text').addEventListener('input', function() {
        saveData();
    });

    // Auto-save focus items
    document.querySelectorAll('.focus-input').forEach(input => {
        input.addEventListener('input', function() {
            saveData();
        });
    });

    // Auto-save remember items
    document.querySelectorAll('.remember-input').forEach(input => {
        input.addEventListener('input', function() {
            saveData();
        });
    });
}

// Todo List Functions
function addTodo() {
    const input = document.getElementById('new-todo');
    const text = input.value.trim();
    
    if (text === '') return;
    
    const todoList = document.querySelector('.todo-list');
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item new';
    todoItem.innerHTML = `
        <input type="checkbox" id="todo-${todoCounter}" class="todo-checkbox" onchange="toggleTodo(${todoCounter})">
        <label for="todo-${todoCounter}" class="todo-text">${text}</label>
        <button class="edit-btn" onclick="editTodo(${todoCounter})">✏️</button>
        <button class="delete-btn" onclick="deleteTodo(${todoCounter})">🗑️</button>
    `;
    
    todoList.appendChild(todoItem);
    input.value = '';
    todoCounter++;
    
    // Remove animation class after animation completes
    setTimeout(() => {
        todoItem.classList.remove('new');
    }, 500);
    
    saveData();
}

function toggleTodo(id) {
    const checkbox = document.getElementById(`todo-${id}`);
    const label = checkbox.nextElementSibling;
    
    if (checkbox.checked) {
        label.classList.add('completed');
    } else {
        label.classList.remove('completed');
    }
    
    saveData();
}

function editTodo(id) {
    const label = document.querySelector(`#todo-${id} + label`);
    const currentText = label.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'todo-input';
    input.style.marginRight = '10px';
    
    label.parentNode.replaceChild(input, label);
    input.focus();
    input.select();
    
    input.addEventListener('blur', function() {
        const newText = input.value.trim();
        if (newText === '') {
            deleteTodo(id);
        } else {
            label.textContent = newText;
            input.parentNode.replaceChild(label, input);
            saveData();
        }
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}

function deleteTodo(id) {
    const todoItem = document.querySelector(`#todo-${id}`).closest('.todo-item');
    todoItem.style.animation = 'slideOut 0.3s ease-out forwards';
    
    setTimeout(() => {
        todoItem.remove();
        saveData();
    }, 300);
}

// Notes Section Functions
function saveNotes() {
    const notesText = document.getElementById('notes-text').value;
    localStorage.setItem('todoApp_notes', notesText);
}

function loadNotes() {
    const savedNotes = localStorage.getItem('todoApp_notes');
    if (savedNotes) {
        document.getElementById('notes-text').value = savedNotes;
    }
}

// Focus Section Functions
function saveFocusItems() {
    const focusItems = [];
    document.querySelectorAll('.focus-input').forEach(input => {
        focusItems.push(input.value);
    });
    localStorage.setItem('todoApp_focus', JSON.stringify(focusItems));
}

function loadFocusItems() {
    const savedFocus = localStorage.getItem('todoApp_focus');
    if (savedFocus) {
        const focusItems = JSON.parse(savedFocus);
        document.querySelectorAll('.focus-input').forEach((input, index) => {
            if (focusItems[index]) {
                input.value = focusItems[index];
            }
        });
    }
}

// Remember Section Functions
function addRememberItem() {
    const rememberItems = document.querySelector('.remember-items');
    const rememberItem = document.createElement('div');
    rememberItem.className = 'remember-item';
    rememberItem.innerHTML = `
        <input type="text" id="remember-${rememberCounter}" placeholder="Remember this..." class="remember-input">
        <button class="add-remember-btn" onclick="deleteRememberItem(${rememberCounter})">🗑️</button>
    `;
    
    rememberItems.appendChild(rememberItem);
    
    // Add event listener for auto-save
    const input = rememberItem.querySelector('.remember-input');
    input.addEventListener('input', function() {
        saveData();
    });
    
    rememberCounter++;
    saveData();
}

function deleteRememberItem(id) {
    const rememberItem = document.querySelector(`#remember-${id}`).closest('.remember-item');
    rememberItem.remove();
    saveData();
}

function saveRememberItems() {
    const rememberItems = [];
    document.querySelectorAll('.remember-input').forEach(input => {
        if (input.value.trim() !== '') {
            rememberItems.push(input.value);
        }
    });
    localStorage.setItem('todoApp_remember', JSON.stringify(rememberItems));
}

function loadRememberItems() {
    const savedRemember = localStorage.getItem('todoApp_remember');
    if (savedRemember) {
        const rememberItems = JSON.parse(savedRemember);
        const rememberContainer = document.querySelector('.remember-items');
        
        // Clear existing items except the first one
        const existingItems = rememberContainer.querySelectorAll('.remember-item');
        for (let i = 1; i < existingItems.length; i++) {
            existingItems[i].remove();
        }
        
        // Add saved items
        rememberItems.forEach((item, index) => {
            if (index === 0) {
                // Update the first input
                document.getElementById('remember-1').value = item;
            } else {
                // Create new items
                addRememberItem();
                const newInput = document.querySelector(`#remember-${rememberCounter - 1}`);
                if (newInput) {
                    newInput.value = item;
                }
            }
        });
    }
}

// Save all data
function saveData() {
    saveNotes();
    saveFocusItems();
    saveRememberItems();
    saveTodoItems();
}

// Load all data
function loadData() {
    loadNotes();
    loadFocusItems();
    loadRememberItems();
    loadTodoItems();
}

// Todo Items Persistence
function saveTodoItems() {
    const todoItems = [];
    document.querySelectorAll('.todo-item').forEach(item => {
        const checkbox = item.querySelector('.todo-checkbox');
        const text = item.querySelector('.todo-text').textContent;
        const isCompleted = checkbox.checked;
        
        todoItems.push({
            text: text,
            completed: isCompleted
        });
    });
    localStorage.setItem('todoApp_todos', JSON.stringify(todoItems));
}

function loadTodoItems() {
    const savedTodos = localStorage.getItem('todoApp_todos');
    if (savedTodos) {
        const todoItems = JSON.parse(savedTodos);
        const todoList = document.querySelector('.todo-list');
        
        // Clear existing todos
        todoList.innerHTML = '';
        
        // Add saved todos
        todoItems.forEach((todo, index) => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.innerHTML = `
                <input type="checkbox" id="todo-${todoCounter}" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todoCounter})">
                <label for="todo-${todoCounter}" class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</label>
                <button class="edit-btn" onclick="editTodo(${todoCounter})">✏️</button>
                <button class="delete-btn" onclick="deleteTodo(${todoCounter})">🗑️</button>
            `;
            
            todoList.appendChild(todoItem);
            todoCounter++;
        });
    }
}

// Add CSS animation for slide out effect
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);
