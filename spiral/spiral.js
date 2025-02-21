import { addTodo, getTodos, deleteTodo, completeTodo } from "./commands.js";

// spiral.js
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

let todos = [];
let completedCount = 0;

async function init() {
  todos = await getTodos();
  renderTodoList();
  completedCount = todos.filter((todo) => todo.completed).length;
  drawRectangle();
}
init();

addTodoBtn.addEventListener("click", () => {
  const task = todoInput.value.trim();
  if (task) {
    addTodo(task);
    getTodos();
    todoInput.value = "";
  }
});
function renderTodoList() {
  todoList.innerHTML = "";
  todos.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.todo;
    li.classList.add("todo-item");
    li.addEventListener("click", () => completeTask(task.id, task));
    todoList.appendChild(li);
  });
}

const svg = document.getElementById("spiralSvg");
let size = 100;

async function completeTask(id, todo) {
  completeTodo(id, todo);
  todos = await getTodos();
  completedCount = todos.filter((todo) => todo.done).length;
  drawRectangle();
}

function drawRectangle() {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  if (completedCount > 0) {
    rect.setAttribute("x", 300 - size / 2);
    rect.setAttribute("y", 300 - size / 2);
    rect.setAttribute("width", size);
    rect.setAttribute("height", size);
    rect.setAttribute("fill", "rgba(50, 255, 50, 0.5)");
    rect.setAttribute("stroke", "rgba(50, 255, 50, 0.8)");
    rect.setAttribute("stroke-width", "2");
    rect.style.transition = "filter 1s ease-in-out";
    rect.style.filter = "drop-shadow(0px 0px 5px green)";

    svg.appendChild(rect);

    setTimeout(() => {
      rect.style.filter = "drop-shadow(0px 0px 15px green)";
    }, 100);
    size *= 0.5; // 점점 작아지게
  }
}

function drawText() {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", 300);
  text.setAttribute("y", 300);
  text.setAttribute("font-size", "20");
  text.setAttribute("fill", "black");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.textContent = `${completedCount} / ${todos.length}`;
  svg.appendChild(text);
}
drawText();
