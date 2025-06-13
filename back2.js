// Student Academic Companion - Complete JavaScript Implementation
// All data stored in memory (no localStorage due to Claude.ai restrictions)

// Global variables for data storage
let notesData = [];
let tasksData = [];
let studyTips = [
    "Take breaks every 25 minutes using the Pomodoro Technique",
    "Create a dedicated study space free from distractions",
    "Use active recall - test yourself instead of just re-reading",
    "Break complex topics into smaller, manageable chunks",
    "Get enough sleep - your brain consolidates memories during rest",
    "Use the Feynman Technique - explain concepts in simple terms",
    "Practice spaced repetition for better long-term retention",
    "Stay hydrated and eat brain-healthy foods like nuts and berries",
    "Set specific, achievable goals for each study session",
    "Use visual aids like mind maps and diagrams",
    "Teach others - explaining concepts helps reinforce your understanding",
    "Find your peak hours and schedule difficult tasks then",
    "Use different study methods to keep learning engaging",
    "Take regular exercise breaks to improve focus and memory",
    "Create acronyms and mnemonics for complex information"
];
let currentTipIndex = 0;
let autoRotateInterval = null;
let isAutoRotateOn = true;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    initializeStudyTips();
    setupKeyboardShortcuts();
    showNotification('Welcome to Student Academic Companion!', 'success');
});

// Dashboard Functions
function updateDashboard() {
    document.getElementById('notesCount').textContent = notesData.length;
    document.getElementById('tasksCount').textContent = tasksData.length;
}

// Notes Management Functions
function uploadNotes() {
    const tagInput = document.getElementById('tagInput');
    const fileInput = document.getElementById('noteFiles');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!tagInput.value.trim()) {
        showStatus('uploadStatus', 'Please enter a tag for your notes', 'error');
        return;
    }
    
    if (!fileInput.files.length) {
        showStatus('uploadStatus', 'Please select files to upload', 'error');
        return;
    }
    
    showLoadingSpinner(true);
    
    // Simulate file processing
    setTimeout(() => {
        const tag = tagInput.value.trim();
        const files = Array.from(fileInput.files);
        
        files.forEach(file => {
            const noteEntry = {
                id: Date.now() + Math.random(),
                tag: tag,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                uploadDate: new Date().toLocaleDateString(),
                fileType: file.type || 'unknown'
            };
            notesData.push(noteEntry);
        });
        
        tagInput.value = '';
        fileInput.value = '';
        updateDashboard();
        showStatus('uploadStatus', `Successfully uploaded ${files.length} file(s) with tag: ${tag}`, 'success');
        showNotification(`${files.length} files uploaded successfully!`, 'success');
        showLoadingSpinner(false);
    }, 1500);
}

function viewNotes() {
    const previewDiv = document.getElementById('notesPreview');
    
    if (notesData.length === 0) {
        previewDiv.innerHTML = `
            <div class="text-center text-muted p-4">
                <div style="font-size: 48px; margin-bottom: 10px;">📚</div>
                <div>No notes uploaded yet. Upload your first note above!</div>
            </div>
        `;
        return;
    }
    
    let html = '<h5>📚 All Notes</h5><div class="row">';
    
    notesData.forEach(note => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${getFileIcon(note.fileType)} ${note.fileName}</h6>
                        <p class="card-text">
                            <small class="text-muted">
                                Tag: <span class="badge bg-primary">${note.tag}</span><br>
                                Size: ${note.fileSize}<br>
                                Uploaded: ${note.uploadDate}
                            </small>
                        </p>
                        <button onclick="deleteNote(${note.id})" class="btn btn-sm btn-outline-danger">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    previewDiv.innerHTML = html;
}

function searchNotes() {
    const searchTerm = document.getElementById('searchTag').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const filteredNotes = notesData.filter(note => 
        note.tag.toLowerCase().includes(searchTerm) || 
        note.fileName.toLowerCase().includes(searchTerm)
    );
    
    if (filteredNotes.length === 0) {
        resultsDiv.innerHTML = '<div class="search-item">No notes found</div>';
    } else {
        let html = '';
        filteredNotes.forEach(note => {
            html += `
                <div class="search-item" onclick="highlightNote(${note.id})">
                    ${getFileIcon(note.fileType)} ${note.fileName} 
                    <span class="badge bg-secondary">${note.tag}</span>
                </div>
            `;
        });
        resultsDiv.innerHTML = html;
    }
    
    resultsDiv.style.display = 'block';
}

function deleteNote(noteId) {
    showConfirmModal(
        'Delete Note',
        'Are you sure you want to delete this note?',
        () => {
            notesData = notesData.filter(note => note.id !== noteId);
            updateDashboard();
            viewNotes();
            showNotification('Note deleted successfully', 'success');
        }
    );
}

function highlightNote(noteId) {
    // Close search results
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchTag').value = '';
    
    // Show all notes and highlight the selected one
    viewNotes();
    
    // Add highlight effect
    setTimeout(() => {
        const noteElements = document.querySelectorAll('.card');
        noteElements.forEach(el => {
            if (el.innerHTML.includes(`deleteNote(${noteId})`)) {
                el.style.border = '2px solid #007bff';
                el.style.boxShadow = '0 0 10px rgba(0,123,255,0.3)';
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }, 100);
}

// Task Management Functions
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDue = document.getElementById('taskDue');
    const taskPriority = document.getElementById('taskPriority');
    
    if (!taskInput.value.trim()) {
        showStatus('taskStatus', 'Please enter a task description', 'error');
        return;
    }
    
    const task = {
        id: Date.now() + Math.random(),
        description: taskInput.value.trim(),
        dueDate: taskDue.value || null,
        priority: taskPriority.value,
        completed: false,
        createdDate: new Date().toLocaleDateString()
    };
    
    tasksData.push(task);
    
    taskInput.value = '';
    taskDue.value = '';
    taskPriority.value = 'low';
    
    updateDashboard();
    displayTasks();
    showStatus('taskStatus', 'Task added successfully!', 'success');
    showNotification('New task added!', 'success');
}

function displayTasks() {
    const taskListDiv = document.getElementById('taskList');
    
    if (tasksData.length === 0) {
        taskListDiv.innerHTML = `
            <div class="text-center text-muted p-4">
                <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
                <div>No tasks yet. Add your first task above!</div>
            </div>
        `;
        return;
    }
    
    // Sort tasks by priority and due date
    const sortedTasks = tasksData.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (a.completed !== b.completed) return a.completed - b.completed;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        return 0;
    });
    
    let html = '';
    sortedTasks.forEach(task => {
        const priorityColor = getPriorityColor(task.priority);
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        html += `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center flex-grow-1">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="toggleTask(${task.id})" class="me-3">
                        <div class="flex-grow-1">
                            <div class="task-description ${task.completed ? 'text-decoration-line-through text-muted' : ''}">
                                ${task.description}
                            </div>
                            <small class="text-muted">
                                Priority: <span class="badge ${priorityColor}">${task.priority.toUpperCase()}</span>
                                ${task.dueDate ? `| Due: ${task.dueDate}` : ''}
                                ${isOverdue ? '<span class="text-danger"> (OVERDUE)</span>' : ''}
                            </small>
                        </div>
                    </div>
                    <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-outline-danger">🗑️</button>
                </div>
            </div>
        `;
    });
    
    taskListDiv.innerHTML = html;
}

function toggleTask(taskId) {
    const task = tasksData.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        displayTasks();
        showNotification(task.completed ? 'Task completed!' : 'Task reopened!', 'success');
    }
}

function deleteTask(taskId) {
    showConfirmModal(
        'Delete Task',
        'Are you sure you want to delete this task?',
        () => {
            tasksData = tasksData.filter(task => task.id !== taskId);
            updateDashboard();
            displayTasks();
            showNotification('Task deleted successfully', 'success');
        }
    );
}

function clearCompletedTasks() {
    const completedCount = tasksData.filter(task => task.completed).length;
    if (completedCount === 0) {
        showNotification('No completed tasks to clear', 'info');
        return;
    }
    
    showConfirmModal(
        'Clear Completed Tasks',
        `Delete ${completedCount} completed task(s)?`,
        () => {
            tasksData = tasksData.filter(task => !task.completed);
            updateDashboard();
            displayTasks();
            showNotification(`${completedCount} completed tasks cleared`, 'success');
        }
    );
}

function clearAllTasks() {
    if (tasksData.length === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }
    
    showConfirmModal(
        'Clear All Tasks',
        'Delete ALL tasks? This cannot be undone!',
        () => {
            const count = tasksData.length;
            tasksData = [];
            updateDashboard();
            displayTasks();
            showNotification(`All ${count} tasks cleared`, 'success');
        }
    );
}

// Quick Actions Functions
function addQuickTask() {
    const task = prompt('Enter quick task:');
    if (task && task.trim()) {
        const quickTask = {
            id: Date.now() + Math.random(),
            description: task.trim(),
            dueDate: null,
            priority: 'medium',
            completed: false,
            createdDate: new Date().toLocaleDateString()
        };
        
        tasksData.push(quickTask);
        updateDashboard();
        displayTasks();
        showNotification('Quick task added!', 'success');
    }
}

function downloadTaskList() {
    if (tasksData.length === 0) {
        showNotification('No tasks to download', 'info');
        return;
    }
    
    let content = 'Student Academic Companion - Task List\n';
    content += '==========================================\n\n';
    
    const completedTasks = tasksData.filter(t => t.completed);
    const pendingTasks = tasksData.filter(t => !t.completed);
    
    content += `PENDING TASKS (${pendingTasks.length}):\n`;
    content += '------------------------\n';
    pendingTasks.forEach((task, index) => {
        content += `${index + 1}. ${task.description}\n`;
        content += `   Priority: ${task.priority.toUpperCase()}\n`;
        if (task.dueDate) content += `   Due: ${task.dueDate}\n`;
        content += '\n';
    });
    
    content += `\nCOMPLETED TASKS (${completedTasks.length}):\n`;
    content += '-------------------------\n';
    completedTasks.forEach((task, index) => {
        content += `${index + 1}. ✓ ${task.description}\n`;
    });
    
    content += `\nGenerated on: ${new Date().toLocaleString()}\n`;
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Task list downloaded!', 'success');
}

function printSummary() {
    const printWindow = window.open('', '_blank');
    const completedTasks = tasksData.filter(t => t.completed);
    const pendingTasks = tasksData.filter(t => !t.completed);
    const overdueTasks = tasksData.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Task Summary</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-card { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                .task-list { margin: 20px 0; }
                .task-item { margin: 5px 0; padding: 5px; border-left: 3px solid #007bff; }
                .high-priority { border-left-color: #dc3545; }
                .medium-priority { border-left-color: #ffc107; }
                .low-priority { border-left-color: #28a745; }
                .overdue { background-color: #ffe6e6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Student Academic Companion</h1>
                <h2>Task Summary Report</h2>
                <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>${tasksData.length}</h3>
                    <p>Total Tasks</p>
                </div>
                <div class="stat-card">
                    <h3>${pendingTasks.length}</h3>
                    <p>Pending</p>
                </div>
                <div class="stat-card">
                    <h3>${completedTasks.length}</h3>
                    <p>Completed</p>
                </div>
                <div class="stat-card">
                    <h3>${overdueTasks.length}</h3>
                    <p>Overdue</p>
                </div>
            </div>
            
            ${overdueTasks.length > 0 ? `
                <div class="task-list">
                    <h3>🚨 OVERDUE TASKS</h3>
                    ${overdueTasks.map(task => `
                        <div class="task-item overdue ${task.priority}-priority">
                            <strong>${task.description}</strong><br>
                            Due: ${task.dueDate} | Priority: ${task.priority.toUpperCase()}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="task-list">
                <h3>📋 PENDING TASKS</h3>
                ${pendingTasks.map(task => `
                    <div class="task-item ${task.priority}-priority">
                        <strong>${task.description}</strong><br>
                        ${task.dueDate ? `Due: ${task.dueDate} | ` : ''}Priority: ${task.priority.toUpperCase()}
                    </div>
                `).join('')}
            </div>
            
            <div class="task-list">
                <h3>✅ COMPLETED TASKS</h3>
                ${completedTasks.map(task => `
                    <div class="task-item">
                        <strong>✓ ${task.description}</strong>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

// Study Tips Functions
function initializeStudyTips() {
    displayCurrentTip();
    startAutoRotation();
}

function displayCurrentTip() {
    const tipDiv = document.getElementById('studyTip');
    tipDiv.innerHTML = `<strong>💡 Tip ${currentTipIndex + 1}:</strong> ${studyTips[currentTipIndex]}`;
}

function getNewTip() {
    currentTipIndex = (currentTipIndex + 1) % studyTips.length;
    displayCurrentTip();
    
    // Add animation effect
    const tipDiv = document.getElementById('studyTip');
    tipDiv.style.transform = 'scale(0.95)';
    setTimeout(() => {
        tipDiv.style.transform = 'scale(1)';
    }, 150);
}

function toggleTipAutoRotation() {
    const btn = document.getElementById('autoRotateBtn');
    
    if (isAutoRotateOn) {
        clearInterval(autoRotateInterval);
        isAutoRotateOn = false;
        btn.textContent = '⏰ Auto-rotate: OFF';
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-outline-danger');
    } else {
        startAutoRotation();
        isAutoRotateOn = true;
        btn.textContent = '⏰ Auto-rotate: ON';
        btn.classList.remove('btn-outline-danger');
        btn.classList.add('btn-outline-secondary');
    }
}

function startAutoRotation() {
    autoRotateInterval = setInterval(() => {
        getNewTip();
    }, 30000); // Change tip every 30 seconds
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        if (event.altKey) {
            switch(event.key.toLowerCase()) {
                case 'p':
                    event.preventDefault();
                    window.location.href = 'pomo.html';
                    break;
                case 't':
                    event.preventDefault();
                    document.getElementById('taskInput').focus();
                    break;
                case 's':
                    event.preventDefault();
                    document.getElementById('searchTag').focus();
                    break;
                case 'u':
                    event.preventDefault();
                    document.getElementById('noteFiles').click();
                    break;
                case 'c':
                    event.preventDefault();
                    window.location.href = 'calendar.html';
                    break;
                case 'a':
                    event.preventDefault();
                    window.location.href = 'ai_assistant.html';
                    break;
                case 'z':
                    event.preventDefault();
                    toggleZenMode();
                    break;
                case 'h':
                    event.preventDefault();
                    toggleHelp();
                    break;
            }
        }
        
        // Enter key shortcuts
        if (event.key === 'Enter') {
            if (event.target.id === 'taskInput') {
                addTask();
            } else if (event.target.id === 'tagInput') {
                document.getElementById('noteFiles').click();
            }
        }
    });
}

// Zen Mode Function
function toggleZenMode() {
    const body = document.body;
    body.classList.toggle('zen-mode');
    
    if (body.classList.contains('zen-mode')) {
        showNotification('Zen Mode: ON - Distractions minimized', 'info');
        // Hide non-essential elements
        document.querySelectorAll('.fade-in:not(.card)').forEach(el => {
            el.style.opacity = '0.3';
        });
    } else {
        showNotification('Zen Mode: OFF', 'info');
        // Restore all elements
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.opacity = '1';
        });
    }
}

// Help Function
function toggleHelp() {
    const helpContent = `
        <div class="help-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 3000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <h3>📚 Student Academic Companion Help</h3>
                <div style="column-count: 2; column-gap: 20px;">
                    <h5>📤 Notes</h5>
                    <ul>
                        <li>Upload files with tags</li>
                        <li>Search by tag or filename</li>
                        <li>Supports: PDF, images, text, docs</li>
                    </ul>
                    
                    <h5>✅ Tasks</h5>
                    <ul>
                        <li>Add with due dates & priorities</li>
                        <li>Mark as complete</li>
                        <li>Download or print summaries</li>
                    </ul>
                    
                    <h5>⌨️ Shortcuts</h5>
                    <ul>
                        <li><kbd>Alt + P</kbd> Pomodoro</li>
                        <li><kbd>Alt + T</kbd> Add Task</li>
                        <li><kbd>Alt + S</kbd> Search</li>
                        <li><kbd>Alt + U</kbd> Upload</li>
                        <li><kbd>Alt + Z</kbd> Zen Mode</li>
                        <li><kbd>Alt + H</kbd> This Help</li>
                    </ul>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary mt-3">Got it!</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpContent);
}

// Utility Functions
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} fade show">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 5000);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    // Remove existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    newConfirmBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        onConfirm();
    });
    
    newCancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('word') || fileType.includes('document')) return '📋';
    return '📁';
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Initialize tasks display on load
document.addEventListener('DOMContentLoaded', function() {
    displayTasks();
});

// Close search results when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchContainer.contains(event.target)) {
        searchResults.style.display = 'none';
    }
});

// Add smooth animations
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

console.log('Student Academic Companion loaded successfully! 🎓');