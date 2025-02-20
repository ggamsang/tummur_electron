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
  document.getElementById("debug").textContent = settings.deleteMode
    ? "deleteMode: true"
    : "deleteMode: false";
  const list = document.getElementById("taskList").querySelectorAll("li");

  list.forEach((li) => {
    let deleteButton = li.querySelector(".delete-button");

    if (settings.deleteMode) {
      if (!deleteButton) {
        // ✅ 기존 버튼이 없을 때만 추가
        deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "x";
        deleteButton.addEventListener("click", () => {
          deleteTask(li.dataset.id);
        });
        li.appendChild(deleteButton);
      }
    } else {
      if (deleteButton) {
        // ✅ 버튼이 있을 때만 삭제
        li.removeChild(deleteButton);
      }
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

const toggleTheme = () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  document.getElementById("settingButton").innerHTML = isDarkMode
    ? "🌙"
    : "🌞";
};

const applyTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
  document.getElementById("settingButton").innerHTML = savedTheme === "dark"
    ? "🌙"
    : "🌞";
};
document.getElementById("settingButton").addEventListener("click", toggleTheme);
applyTheme();

document.addEventListener("keydown", (event) => {
  // ✅ 'x' 키가 눌렸는지 확인
  if (event.key.toLowerCase() === "x") {
    const activeElement = document.activeElement;

    // ✅ 사용자가 입력 필드(`input`, `textarea`)에서 입력 중이면 단축키 무시
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA"
    ) {
      return;
    }

    // ✅ 입력창이 아닐 때만 삭제 모드 토글
    activedeleteMode();
  }
});
