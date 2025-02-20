
function saveTask() {
  let task = document.getElementById("taskInput").value;
  if (!task.trim()) {
    return;
  }
  window.electronAPI.saveTask(task).then(() => {
    document.getElementById("taskInput").value = "";
    loadTasks();
  });
}

function deleteTask(id) {
  window.electronAPI.deleteTask(id).then(() => {
    loadTasks();
  });
}

function formatDate(dateString) {
  let date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function loadTasks() {
  window.electronAPI.getTasks().then((response) => {
    let list = document.getElementById("taskList");
    list.innerHTML = "";
    response.data.forEach((task) => {
      let li = document.createElement("li");
      let content = document.createElement("div");
      let date = document.createElement("div");
      li.style.position = "relative";
      content.textContent = task.task;
      date.textContent = formatDate(task.created_at);
      date.classList.add("created_at");
      li.dataset.id = task.id;
      li.appendChild(content);
      li.appendChild(date);
      list.appendChild(li);
    });
  });
}

function activedeleteMode() {
  settings.deleteMode = !settings.deleteMode;
  if (settings.deleteMode) {
    const list = document.getElementById("taskList").querySelectorAll("li");
    list.forEach((li) => {
      let deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.textContent = "x";
      deleteButton.addEventListener("click", () => {
        deleteTask(li.dataset.id);
      });
      li.appendChild(deleteButton);
    });
  } else {
    const list = document.getElementById("taskList").querySelectorAll("li");
    list.forEach((li) => {
      let deleteButton = li.querySelector(".delete-button");
      if (deleteButton) {
        li.removeChild(deleteButton);
      }
    });
  }
}

const settings = {
  theme: "light",
  fontSize: 16,
  deleteMode: false,
};

const settingButton = document.getElementById("settingButton");
const input = document.getElementsByTagName("textarea")[0];
let debounceTimer;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      saveTask();
    }, 300);
  }
});

loadTasks();
