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

function loadTasks() {
  window.electronAPI.getTasks().then((response) => {
    const list = document.getElementById("taskList");
    list.innerHTML = response.data.map(task => `
      <li data-id="${task.id}" style="position: relative;">
        <div>${task.task}</div>
        <div class="created_at">${formatDate(task.created_at)}</div>
      </li>
    `).join('');
  });
}

function activedeleteMode() {
  settings.deleteMode = !settings.deleteMode;
  document.getElementById("debug").textContent = `deleteMode: ${settings.deleteMode}`;

  document.querySelectorAll("#taskList li").forEach(li => {
    let deleteButton = li.querySelector(".delete-button");

    if (settings.deleteMode) {
      if (!deleteButton) {
        li.insertAdjacentHTML("beforeend", 
          `<button class="delete-button" onclick="deleteTask('${li.dataset.id}')">x</button>`
        );
      }
    } else {
      deleteButton?.remove(); // ✅ 버튼이 있으면 제거
    }
  });
}


const deleteModeButton = document.getElementById("deleteModeButton");
deleteModeButton.addEventListener("click", () => {
  activedeleteMode();
});

const input = document.getElementsByTagName("textarea")[0];
let debounceTimer;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    saveTask(); // ✅ 즉시 저장
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("Auto-saving draft..."); // ✅ 연속 입력 방지 (자동 저장 기능 추가 가능)
  }, 500);
});

loadTasks();

// 현재 날짜와 시간을 가져오는 함수
function getCurrentDate() {
  return new Date().toLocaleDateString("ko-KR");
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("ko-KR");
}

function updateDateTime() {
  document.getElementById("date").textContent = new Date().toLocaleDateString(
    "ko-KR"
  );
  document.getElementById("time").textContent = new Date().toLocaleTimeString(
    "ko-KR"
  );
}
// 1초마다 갱신
setInterval(updateDateTime, 1000);
// 초기 실행
updateDateTime();

const settings = {
  theme: "light",
  fontSize: 16,
  deleteMode: false,
};

const updateThemeButton = () => {
  document.getElementById("settingButton").innerHTML =
    document.body.classList.contains("dark-mode") ? "🌙" : "🌞";
};

const toggleTheme = () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  updateThemeButton();
};

const applyTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
  updateThemeButton();
};

applyTheme();

document.getElementById("settingButton").addEventListener("click", toggleTheme);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); // ✅ 변수화

  if (key === "x") {
    const activeElement = document.activeElement;
    if (["INPUT", "TEXTAREA"].includes(activeElement.tagName)) return;
    activedeleteMode();
  }
});