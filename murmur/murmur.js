import { updateDateTime } from "../commons/time.js";
import { applyTheme, toggleTheme } from "../commons/theme.js";
import "./shortcuts.js";
import {
  loadMurmur,
  saveMurmur,
  activeDeleteMode,
} from "./commands.js";

// 1초마다 갱신
setInterval(updateDateTime, 1000);
// 초기 실행
updateDateTime();

document
.getElementById("settingButton")
.addEventListener("click", toggleTheme);

applyTheme();

document
  .getElementById("deleteModeButton")
  .addEventListener("click", activeDeleteMode);

const input = document.getElementsByTagName("textarea")[0];

let debounceTimer;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    saveMurmur(); // ✅ 즉시 저장
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("Auto-saving draft..."); // ✅ 연속 입력 방지 (자동 저장 기능 추가 가능)
  }, 500);
});

loadMurmur();
