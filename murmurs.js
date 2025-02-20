export function saveTask() {
  let task = document.getElementById("taskInput").value;
  if (!task.trim()) {
    return;
  }
  window.electronAPI.saveTask(task).then(() => {
    document.getElementById("taskInput").value = "";
    loadTasks();
  });
}

export function deleteTask(id) {
  window.electronAPI.deleteTask(id).then(() => {
    loadTasks();
    settings.deleteMode = false;
    document.getElementById("debug").textContent = "deleteMode: false";
  });
}

function formatDate(dateString) {
  let date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export function loadTasks() {
  window.electronAPI.getTasks().then((response) => {
    const list = document.getElementById("taskList");
    list.innerHTML = response.data
      .map(
        (task) => `
      <li data-id="${task.id}" style="position: relative;">
        <div>${task.task}</div>
        <div class="created_at">${formatDate(task.created_at)}</div>
      </li>
    `
      )
      .join("");
  });
}

const settings = {
  theme: "dark",
  fontSize: 16,
  deleteMode: false,
};
export function activedeleteMode() {
  settings.deleteMode = !settings.deleteMode;
  document.getElementById(
    "debug"
  ).textContent = `deleteMode: ${settings.deleteMode}`;

  document.querySelectorAll("#taskList li").forEach((li) => {
    let deleteButton = li.querySelector(".delete-button");

    if (settings.deleteMode) {
      if (!deleteButton) {
        li.insertAdjacentHTML(
          "beforeend",
          `<button class="delete-button" onclick="deleteTask('${li.dataset.id}')">x</button>`
        );
      }
    } else {
      deleteButton?.remove(); // ✅ 버튼이 있으면 제거
    }
  });
}
