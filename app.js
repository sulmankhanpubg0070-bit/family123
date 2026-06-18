// Family tree data (edit this)
// Tip: har person ka unique id rakhein. Partner optional hai. Children ids array me.
const ROOT_ID = "p1";

const PEOPLE = {
  p1: {
    id: "p1",
    name: "Muhammad Ali",
    gender: "M",
    birth: "1960",
    note: "Family head (example)",
    partnerId: "p2",
    children: ["p3", "p4"],
  },
  p2: {
    id: "p2",
    name: "Ayesha Ali",
    gender: "F",
    birth: "1964",
    note: "",
    partnerId: "p1",
    children: ["p3", "p4"],
  },
  p3: {
    id: "p3",
    name: "Hassan Ali",
    gender: "M",
    birth: "1986",
    note: "",
    partnerId: "p5",
    children: ["p6"],
  },
  p5: {
    id: "p5",
    name: "Sana Hassan",
    gender: "F",
    birth: "1990",
    note: "",
    partnerId: "p3",
    children: ["p6"],
  },
  p6: {
    id: "p6",
    name: "Zain Hassan",
    gender: "M",
    birth: "2014",
    note: "",
    children: [],
  },
  p4: {
    id: "p4",
    name: "Hina Ali",
    gender: "F",
    birth: "1992",
    note: "",
    partnerId: "p7",
    children: ["p8", "p9"],
  },
  p7: {
    id: "p7",
    name: "Usman Hina",
    gender: "M",
    birth: "1991",
    note: "",
    partnerId: "p4",
    children: ["p8", "p9"],
  },
  p8: {
    id: "p8",
    name: "Ibrahim",
    gender: "M",
    birth: "2018",
    note: "",
    children: [],
  },
  p9: {
    id: "p9",
    name: "Maryam",
    gender: "F",
    birth: "2021",
    note: "",
    children: [],
  },
};

// ------------------ App ------------------
const treeRootEl = document.getElementById("treeRoot");
const detailsEl = document.getElementById("details");
const searchInput = document.getElementById("searchInput");
const expandAllBtn = document.getElementById("expandAllBtn");
const collapseAllBtn = document.getElementById("collapseAllBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const zoomRange = document.getElementById("zoomRange");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const detailsModalEl = document.getElementById("detailsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalTitleEl = document.getElementById("modalTitle");
const searchToggleBtn = document.getElementById("searchToggleBtn");
const searchWrapEl = document.getElementById("searchWrap");
const searchClearBtn = document.getElementById("searchClearBtn");

let selectedId = null;
let collapsed = new Set(); // person ids whose children are collapsed
let lastSearch = "";
let zoom = 1;

function loadPrefs() {
  const savedZoom = localStorage.getItem("ft_zoom");
  if (savedZoom && !Number.isNaN(Number(savedZoom))) zoom = clamp(Number(savedZoom), 0.6, 1.4);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function setZoom(next) {
  zoom = clamp(next, 0.6, 1.4);
  treeRootEl.style.setProperty("--zoom", String(zoom));
  zoomRange.value = String(Math.round(zoom * 100));
  localStorage.setItem("ft_zoom", String(zoom));
}

function getPerson(id) {
  const p = PEOPLE[id];
  if (!p) throw new Error(`Missing person for id: ${id}`);
  return p;
}

function safeText(v) {
  return String(v ?? "");
}

function coupleIds(primaryId) {
  const p = getPerson(primaryId);
  const partnerId = p.partnerId;
  // ensure stable order: primary first, then partner (if exists)
  return partnerId ? [primaryId, partnerId] : [primaryId];
}

function childrenOf(primaryId) {
  const p = getPerson(primaryId);
  return Array.isArray(p.children) ? p.children : [];
}

function genderPill(g) {
  if (g === "M") return { label: "M", cls: "m" };
  if (g === "F") return { label: "F", cls: "f" };
  return { label: "?", cls: "" };
}

function renderCard(id) {
  const p = getPerson(id);
  const pill = genderPill(p.gender);

  const card = document.createElement("div");
  card.className = "card";
  card.dataset.personId = id;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = safeText(p.name);

  const meta = document.createElement("div");
  meta.className = "meta";

  const g = document.createElement("span");
  g.className = `pill ${pill.cls}`.trim();
  g.textContent = pill.label;

  const b = document.createElement("span");
  b.className = "pill";
  b.textContent = p.birth ? `Born: ${safeText(p.birth)}` : "Born: —";

  meta.appendChild(g);
  meta.appendChild(b);

  const note = document.createElement("div");
  note.className = "note";
  note.textContent = p.note ? safeText(p.note) : "";

  card.appendChild(name);
  card.appendChild(meta);
  if (p.note) card.appendChild(note);

  card.addEventListener("click", (e) => {
    e.stopPropagation();
    selectPerson(id);
  });

  return card;
}

function renderNode(primaryId) {
  const node = document.createElement("div");
  node.className = "node";

  const couple = document.createElement("div");
  couple.className = "couple";

  const ids = coupleIds(primaryId);
  const cards = ids.map((id) => renderCard(id));
  cards.forEach((c) => couple.appendChild(c));

  const kids = childrenOf(primaryId);
  const hasKids = kids.length > 0;

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "tiny-btn";
  toggleBtn.type = "button";
  toggleBtn.textContent = hasKids
    ? collapsed.has(primaryId)
      ? `Show children (${kids.length})`
      : `Hide children (${kids.length})`
    : "No children";
  toggleBtn.disabled = !hasKids;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!hasKids) return;
    if (collapsed.has(primaryId)) collapsed.delete(primaryId);
    else collapsed.add(primaryId);
    draw();
  });

  node.appendChild(couple);
  node.appendChild(toggleBtn);

  if (hasKids) node.classList.add("has-children");

  const childrenEl = document.createElement("div");
  childrenEl.className = "children";
  if (collapsed.has(primaryId)) childrenEl.classList.add("hidden");

  for (const cid of kids) {
    const childWrap = document.createElement("div");
    childWrap.className = "child";
    childWrap.appendChild(renderNode(cid));
    childrenEl.appendChild(childWrap);
  }

  node.appendChild(childrenEl);
  return node;
}

function selectPerson(id) {
  selectedId = id;
  updateDetails();
  highlightSelectedCard();
  openDetailsModal();
}

function highlightSelectedCard() {
  document.querySelectorAll(".card.selected").forEach((el) => el.classList.remove("selected"));
  if (!selectedId) return;
  document.querySelectorAll(`.card[data-person-id="${CSS.escape(selectedId)}"]`).forEach((el) => {
    el.classList.add("selected");
  });
}

function updateDetails() {
  if (!selectedId) {
    detailsEl.className = "details empty";
    detailsEl.textContent = "Kisi person card par click karein.";
    modalTitleEl.textContent = "Person details";
    return;
  }

  const p = getPerson(selectedId);
  const partner = p.partnerId ? PEOPLE[p.partnerId] : null;
  const kids = childrenOf(selectedId).map((id) => PEOPLE[id]?.name ?? id);

  modalTitleEl.textContent = p.name ? String(p.name) : "Person details";
  detailsEl.className = "details";
  detailsEl.innerHTML = `
    <div class="k">Name</div><div class="v">${escapeHtml(p.name)}</div>
    <div class="k">Gender</div><div class="v">${escapeHtml(p.gender ?? "—")}</div>
    <div class="k">Birth</div><div class="v">${escapeHtml(p.birth ?? "—")}</div>
    <div class="k">Partner</div><div class="v">${escapeHtml(partner?.name ?? "—")}</div>
    <div class="k">Children</div><div class="v">${escapeHtml(kids.length ? kids.join(", ") : "—")}</div>
    <div class="k">Note</div><div class="v">${escapeHtml(p.note ?? "—")}</div>
  `;
}

function openDetailsModal() {
  detailsModalEl.classList.remove("hidden");
}

function closeDetailsModal() {
  detailsModalEl.classList.add("hidden");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applySearchHighlight() {
  const q = (lastSearch || "").trim().toLowerCase();
  document.querySelectorAll(".card").forEach((card) => card.classList.remove("hl"));
  if (!q) return;

  for (const [id, p] of Object.entries(PEOPLE)) {
    if ((p.name || "").toLowerCase().includes(q)) {
      document.querySelectorAll(`.card[data-person-id="${CSS.escape(id)}"]`).forEach((el) => el.classList.add("hl"));
    }
  }
}

function expandAll() {
  collapsed = new Set();
}
function collapseAll() {
  // collapse everyone who has children
  collapsed = new Set(
    Object.values(PEOPLE)
      .filter((p) => Array.isArray(p.children) && p.children.length)
      .map((p) => p.id)
  );
}

function draw() {
  treeRootEl.style.setProperty("--zoom", String(zoom));
  treeRootEl.innerHTML = "";
  try {
    treeRootEl.appendChild(renderNode(ROOT_ID));
  } catch (err) {
    treeRootEl.innerHTML = `<div style="color:#ef4444">Error: ${escapeHtml(err.message)}</div>`;
  }
  highlightSelectedCard();
  applySearchHighlight();
}

searchInput.addEventListener("input", () => {
  lastSearch = searchInput.value;
  if (lastSearch.trim()) expandAll();
  draw();
});

searchToggleBtn.addEventListener("click", () => {
  const willShow = searchWrapEl.classList.contains("hidden");
  searchWrapEl.classList.toggle("hidden");
  if (willShow) {
    searchInput.focus();
    searchInput.select();
  }
});

searchClearBtn.addEventListener("click", () => {
  searchInput.value = "";
  lastSearch = "";
  draw();
});

expandAllBtn.addEventListener("click", () => {
  expandAll();
  draw();
});

collapseAllBtn.addEventListener("click", () => {
  collapseAll();
  draw();
});

zoomRange.addEventListener("input", () => {
  setZoom(Number(zoomRange.value) / 100);
});

zoomOutBtn.addEventListener("click", () => setZoom(zoom - 0.1));
zoomInBtn.addEventListener("click", () => setZoom(zoom + 0.1));
zoomResetBtn.addEventListener("click", () => setZoom(1));

closeModalBtn.addEventListener("click", () => closeDetailsModal());
detailsModalEl.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.dataset && t.dataset.close) closeDetailsModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetailsModal();
});

// initial
loadPrefs();
setZoom(zoom);
expandAll();
draw();
