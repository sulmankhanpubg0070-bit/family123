// Theme helper (shared across pages)
(() => {
  const KEY = "ft_theme";
  const html = document.documentElement;

  function getTheme() {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "dark";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggleBtn");
    if (btn) btn.textContent = theme === "dark" ? "Theme: Dark" : "Theme: Light";
  }

  function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  // init
  applyTheme(getTheme());

  // optional button binding
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.addEventListener("click", toggleTheme);
})();

