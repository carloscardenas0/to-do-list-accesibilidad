// DOM Elements
const taskInput = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date");
const addBtn = document.querySelector(".btn-add");
const taskTable = document.getElementById("task-table");
const tableBody = taskTable.querySelector("tbody");
const empty = document.querySelector(".empty");
const notificacion = document.getElementById("notificacion");

// Set today as the minimum date for the due date input
const today = new Date().toISOString().split('T')[0];
dueDateInput.setAttribute('min', today);

// Function to update ARIA live region for notifications
function mostrarNotificacion(mensaje) {
    notificacion.textContent = mensaje;
    // Clear the notification after 3 seconds to avoid clutter
    setTimeout(() => {
        notificacion.textContent = "";
    }, 3000);
}

// Form submission handler
document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText !== "") {
        addTask(taskText, dueDate);
        saveTasksToLocalStorage();

        // Reset form
        taskInput.value = "";
        dueDateInput.value = "";

        // Hide empty message and show table
        empty.style.display = "none";
        taskTable.style.display = "table";

        // Show notification for screen readers
        mostrarNotificacion(`Se ha agregado la tarea "${taskText}" a la lista.`);

        // Focus back to task input for better UX
        taskInput.focus();
    }
});

// Add a new task to the table
function addTask(taskText, dueDate) {
    // Create table row
    const tr = document.createElement("tr");

    // Task cell
    const tdTask = document.createElement("td");
    tdTask.textContent = taskText;

    // Due date cell
    const tdDate = document.createElement("td");
    if (dueDate) {
        const formattedDate = new Date(dueDate).toLocaleDateString();
        tdDate.textContent = formattedDate;

        // Check if task is due soon (within 2 days)
        const dueDateObj = new Date(dueDate);
        const today = new Date();
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);

        if (dueDateObj <= today) {
            tdDate.classList.add("overdue");
            tr.setAttribute("aria-label", "Tarea vencida");
        } else if (dueDateObj <= twoDaysFromNow) {
            tdDate.classList.add("due-soon");
            tr.setAttribute("aria-label", "Tarea próxima a vencer");
        }
    } else {
        tdDate.textContent = "Sin fecha";
    }

    // Actions cell
    const tdActions = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i><span class="sr-only">Eliminar</span>';
    deleteBtn.setAttribute("aria-label", "Eliminar tarea");

    // Add event listener to delete button
    deleteBtn.addEventListener("click", () => {
        const taskName = tr.querySelector("td").textContent;
        tr.remove();

        if (tableBody.children.length === 0) {
            empty.style.display = "block";
            taskTable.style.display = "none";
        }

        // Show notification for screen readers when task is deleted
        mostrarNotificacion(`Se ha eliminado la tarea "${taskName}" de la lista.`);

        saveTasksToLocalStorage();
    });

    tdActions.appendChild(deleteBtn);

    // Append cells to row
    tr.appendChild(tdTask);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);

    // Append row to table body
    tableBody.appendChild(tr);
}

// Save tasks to localStorage
function saveTasksToLocalStorage() {
    const savedTasks = [];
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
            savedTasks.push({
                task: cells[0].textContent,
                dueDate: cells[1].textContent
            });
        }
    });

    // Store as JSON instead of HTML to avoid issues with event listeners
    localStorage.setItem("taskTableData", JSON.stringify(savedTasks));
}

// Load tasks from localStorage
function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem("taskTableData");

    if (savedTasks) {
        try {
            // Try to parse as JSON first (new format)
            const tasks = JSON.parse(savedTasks);

            if (Array.isArray(tasks)) {
                tasks.forEach(task => {
                    // Convert formatted date back to ISO format if needed
                    let dueDate = task.dueDate;
                    if (dueDate && dueDate !== "Sin fecha") {
                        // Try to parse the formatted date back to ISO
                        const dateParts = dueDate.split('/');
                        if (dateParts.length === 3) {
                            // Assuming MM/DD/YYYY format
                            dueDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
                        }
                    }
                    addTask(task.task, dueDate === "Sin fecha" ? "" : dueDate);
                });

                if (tasks.length > 0) {
                    empty.style.display = "none";
                    taskTable.style.display = "table";
                } else {
                    empty.style.display = "block";
                    taskTable.style.display = "none";
                }
            }
        } catch (e) {
            // Fallback to old HTML format
            tableBody.innerHTML = savedTasks;

            if (tableBody.children.length > 0) {
                empty.style.display = "none";
                taskTable.style.display = "table";

                // Re-attach event listeners to delete buttons
                const deleteBtns = tableBody.querySelectorAll(".btn-delete");
                deleteBtns.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const row = btn.closest("tr");
                        const taskName = row.querySelector("td").textContent;
                        row.remove();

                        if (tableBody.children.length === 0) {
                            empty.style.display = "block";
                            taskTable.style.display = "none";
                        }

                        // Show notification for screen readers when task is deleted
                        mostrarNotificacion(`Se ha eliminado la tarea "${taskName}" de la lista.`);

                        saveTasksToLocalStorage();
                    });
                });
            } else {
                empty.style.display = "block";
                taskTable.style.display = "none";
            }
        }
    } else {
        empty.style.display = "block";
        taskTable.style.display = "none";
    }
}

// Initial load
window.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);