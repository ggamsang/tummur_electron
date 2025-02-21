const updateThemeButton = () => {
  document.getElementById("settingButton").innerHTML =
    document.body.classList.contains("dark-mode") ? "🌙" : "🌞";
};

export function toggleTheme() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  updateThemeButton();
};

export function applyTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
  updateThemeButton();
};
