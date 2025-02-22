import { activeDeleteMode } from "./commands.js";
import { toggleTheme } from "../commons/theme.js";

document.scroller = {
  scrollDown: () => {
    window.scrollBy({ top: 100, behavior: "smooth" });
  },
  scrollUp: () => {
    window.scrollBy({ top: -100, behavior: "smooth" });
  },
};

const keyActions = {
  x: activeDeleteMode,
  l: toggleTheme,
  arrowDown: () => document.scroller.scrollDown(),
  arrowUp: () => document.scroller.scrollUp(),
  v: () => document.scroller.scrollDown(),
  t: () => document.scroller.scrollUp(),
  f: () => {
    const input = document.getElementById("murmurInput");
    if (input) {
      input.focus();
    } else {
      console.log("No input found");
    }
  },
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const activeElement = document.activeElement;

  if (["INPUT", "TEXTAREA"].includes(activeElement.tagName)) return;

  if(keyActions[key]){
    event.preventDefault();
    keyActions[key]();
  }
});
