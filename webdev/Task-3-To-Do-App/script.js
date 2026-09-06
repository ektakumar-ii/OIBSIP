const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");
const todayDate = document.getElementById("todayDate");

let tasks = [];

todayDate.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function loadTasks() {
  const saved = localStorage.getItem("myDayTasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

function saveTasks() {
  localStorage.setItem("myDayTasks", JSON.stringify(tasks));
}

function getRandomId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateStr} · ${timeStr}`;
}

function render() {
  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);

  pendingCount.textContent = `${pending.length} pending`;
  completedCount.textContent = `${completed.length} completed`;

  pendingEmpty.classList.toggle("visible", pending.length === 0);
  completedEmpty.classList.toggle("visible", completed.length === 0);

  pendingList.innerHTML = pending.map(buildTaskCard).join("");
  completedList.innerHTML = completed.map(buildTaskCard).join("");
}

function buildTaskCard(task) {
  if (task.isEditing) {
    return `
      <li class="task-card${task.completed ? " completed" : ""}">
        <div class="edit-row">
          <input
            type="text"
            class="edit-input"
            id="editInput-${task.id}"
            value="${escapeHtml(task.text)}"
            maxlength="120"
          >
          <button class="edit-save" onclick="saveEdit('${task.id}')">Save</button>
          <button class="edit-cancel" onclick="cancelEdit('${task.id}')">Cancel</button>
        </div>
      </li>
    `;
  }

  const timeLabel = task.completed
    ? "Completed " + formatTime(task.completedAt)
    : "Added " + formatTime(task.createdAt);

  return `
    <li class="task-card${task.completed ? " completed" : ""}">
      <button
        class="check-toggle"
        aria-pressed="${task.completed}"
        aria-label="${task.completed ? "Mark as not done" : "Mark as done"}"
        onclick="toggleTask('${task.id}')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 9 18 20 6"></polyline>
        </svg>
      </button>

      <div class="task-content">
        <span class="task-text">${escapeHtml(task.text)}</span>
        <span class="task-time">${timeLabel}</span>
      </div>

      <div class="task-actions">
        <button class="icon-btn edit-btn" aria-label="Edit task" onclick="startEdit('${task.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
        </button>
        <button class="icon-btn delete-btn" aria-label="Delete task" onclick="deleteTask('${task.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
          </svg>
        </button>
      </div>
    </li>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: getRandomId(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    isEditing: false,
  });

  taskInput.value = "";
  saveTasks();
  render();
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  saveTasks();
  render();
}

function deleteTask(id) {
  if (!confirm("Delete this task? This can't be undone.")) return;

  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.isEditing = true;
  render();

  const input = document.getElementById(`editInput-${id}`);
  if (input) {
    input.focus();
    input.select();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit(id);
      if (e.key === "Escape") cancelEdit(id);
    });
  }
}

function saveEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const input = document.getElementById(`editInput-${id}`);
  const newText = input.value.trim();

  if (!newText) {
    input.focus();
    return;
  }

  task.text = newText;
  task.isEditing = false;
  saveTasks();
  render();
}

function cancelEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.isEditing = false;
  render();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

loadTasks();
render();