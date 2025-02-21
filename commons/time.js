export function updateDateTime() {
  document.getElementById("date").textContent = new Date().toLocaleDateString(
    "ko-KR"
  );
  document.getElementById("time").textContent = new Date().toLocaleTimeString(
    "ko-KR"
  );
}
