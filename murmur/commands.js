
const INPUT_ID = "murmurInput";
const LIST_ID = "murmurList";
const DEBUG_ID = "debug";

export function saveMurmur() {
  let murmur = document.getElementById(INPUT_ID).value;
  if (!murmur.trim()) {
    return;
  }
  window.electronAPI.saveMurmur(murmur).then(() => {
    document.getElementById(INPUT_ID).value = "";
    loadMurmur();
  });
}

function deleteMurmur(id) {
  window.electronAPI.deleteMurmur(id).then(() => {
    loadMurmur();
    settings.deleteMode = false;
    document.getElementById(DEBUG_ID).textContent = "deleteMode: false";
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

export function loadMurmur() {
  window.electronAPI.getMurmur().then((response) => {
    const list = document.getElementById(LIST_ID);
    list.innerHTML = response.data
      .map(
        ({ id, murmur, created_at }) => `
      <li data-id="${id}" style="position: relative;">
        <div>${murmur}</div>
        <div class="created_at">${formatDate(created_at)}</div>
      </li>
    `
      )
      .join("");
  });
}

export const settings = {
  theme: "dark",
  fontSize: 16,
  deleteMode: false,
};
export function activeDeleteMode() {
  settings.deleteMode = !settings.deleteMode;
  document.getElementById(
    DEBUG_ID
  ).textContent = `deleteMode: ${settings.deleteMode}`;

  document.querySelectorAll(`#${LIST_ID} li`).forEach((li) => {
    let deleteButton = li.querySelector(".delete-button");

    if (settings.deleteMode) {
      if (!deleteButton) {
        li.insertAdjacentHTML(
          "beforeend",
          `<button class="delete-button">x</button>`
        );
        li.querySelector(".delete-button").addEventListener("click", () => {
          deleteMurmur(li.dataset.id);
        });
      }
    } else {
      deleteButton?.remove(); // ✅ 버튼이 있으면 제거
    }
  });
}
