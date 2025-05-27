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

// Form submission handler
document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText !== "") {
        addTask(taskText, dueDate);
        saveTasksToMemory();

        // Actualiza el contenido de la región aria-live
        notificacion.textContent = `Se ha agregado la tarea "${taskText}" a la lista.`;

        // Reset form
        taskInput.value = "";
        dueDateInput.value = "";

        // Hide empty message and show table
        empty.style.display = "none";
        taskTable.style.display = "table";

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
        const taskName = tdTask.textContent;
        tr.remove();

        // Actualiza el contenido de la región aria-live para eliminación
        notificacion.textContent = `Se ha eliminado la tarea "${taskName}" de la lista.`;

        if (tableBody.children.length === 0) {
            empty.style.display = "block";
            taskTable.style.display = "none";

            // Notifica cuando la lista queda vacía
            setTimeout(() => {
                notificacion.textContent = "La lista de tareas está ahora vacía.";
            }, 500);
        }

        saveTasksToMemory();
    });

    tdActions.appendChild(deleteBtn);

    // Append cells to row
    tr.appendChild(tdTask);
    tr.appendChild(tdDate);
    tr.appendChild(tdActions);

    // Append row to table body
    tableBody.appendChild(tr);
}

// Store tasks data in memory (since localStorage is not available)
let tasksData = [];

// Save tasks to memory
function saveTasksToMemory() {
    tasksData = Array.from(tableBody.children).map(row => {
        const cells = row.children;
        return {
            task: cells[0].textContent,
            date: cells[1].textContent,
            classes: cells[1].className,
            ariaLabel: row.getAttribute("aria-label") || ""
        };
    });
}

// Load tasks from memory
function loadTasksFromMemory() {
    if (tasksData.length > 0) {
        tasksData.forEach(taskData => {
            const tr = document.createElement("tr");
            if (taskData.ariaLabel) {
                tr.setAttribute("aria-label", taskData.ariaLabel);
            }

            // Task cell
            const tdTask = document.createElement("td");
            tdTask.textContent = taskData.task;

            // Due date cell
            const tdDate = document.createElement("td");
            tdDate.textContent = taskData.date;
            if (taskData.classes) {
                tdDate.className = taskData.classes;
            }

            // Actions cell
            const tdActions = document.createElement("td");
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn-delete";
            deleteBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i><span class="sr-only">Eliminar</span>';
            deleteBtn.setAttribute("aria-label", "Eliminar tarea");

            deleteBtn.addEventListener("click", () => {
                const taskName = tdTask.textContent;
                tr.remove();

                // Actualiza el contenido de la región aria-live para eliminación
                notificacion.textContent = `Se ha eliminado la tarea "${taskName}" de la lista.`;

                if (tableBody.children.length === 0) {
                    empty.style.display = "block";
                    taskTable.style.display = "none";

                    // Notifica cuando la lista queda vacía
                    setTimeout(() => {
                        notificacion.textContent = "La lista de tareas está ahora vacía.";
                    }, 500);
                }

                saveTasksToMemory();
            });

            tdActions.appendChild(deleteBtn);

            tr.appendChild(tdTask);
            tr.appendChild(tdDate);
            tr.appendChild(tdActions);

            tableBody.appendChild(tr);
        });

        empty.style.display = "none";
        taskTable.style.display = "table";
    } else {
        empty.style.display = "block";
        taskTable.style.display = "none";
    }
}

// Initial load
window.addEventListener("DOMContentLoaded", loadTasksFromMemory);

