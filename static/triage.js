// Keyboard triage. Every card is already in the page; keys only toggle `hidden`,
// and labels are posted without waiting for the reply.
const cards = [...document.querySelectorAll(".card")];
const byId = Object.fromEntries(cards.map(c => [c.dataset.id, c]));
const companyCards = cards.filter(c => c.dataset.kind === "company")
  .sort((a, b) => (b.dataset.tier - a.dataset.tier) || (b.dataset.score - a.dataset.score));
const roleCards = cards.filter(c => c.dataset.kind === "role");
const personCards = cards.filter(c => c.dataset.kind === "person")
  .sort((a, b) => b.dataset.found.localeCompare(a.dataset.found));

const MODES = ["company", "role", "person"];
const FILTERS = ["todo", "all", "Y", "y", "m", "w", "n", "content", "issue"];
const NAMES = { todo: "to do", all: "all", Y: "dream fit", y: "yes", m: "maybe", w: "follow", n: "no", content: "content ideas", issue: "screenshot issues" };
// Roles at followed companies stay visible but come after unlabelled ones: cool places, rarely a fit to apply.
const COMPANY_RANK = { Y: 0, y: 1, m: 2, "": 3, w: 4, n: 5 };

let labels = {};
let notes = {};
let flags = {};
let lastLabelled = null;
let mode = "company", filter = 0;
let current = null;
const lastSeen = {};
const undoStack = [];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const labelOf = id => labels[id] || "";
const hasFlag = (id, flag) => (flags[id] || []).includes(flag);

function isTodo(c) {
  if (labelOf(c.dataset.id) || c.dataset.screen === "FAIL") return false;
  if (c.dataset.kind === "role") {
    const company = byId[c.dataset.company];
    if (labelOf(c.dataset.company) === "n" || company?.dataset.screen === "FAIL") return false;
  }
  return true;
}

function ordered(m) {
  if (m === "company") return companyCards;
  if (m === "person") return personCards;
  return [...roleCards].sort((a, b) =>
    (COMPANY_RANK[labelOf(a.dataset.company)] - COMPANY_RANK[labelOf(b.dataset.company)])
    || b.dataset.found.localeCompare(a.dataset.found)
    || (b.dataset.score - a.dataset.score));
}

function visible(m = mode) {
  const f = FILTERS[filter];
  return ordered(m).filter(c =>
    f === "todo" ? isTodo(c) : f === "all" ? true : f === "content" || f === "issue" ? hasFlag(c.dataset.id, f) : labelOf(c.dataset.id) === f);
}

function show(card) {
  if (current) current.hidden = true;
  current = card;
  document.getElementById("empty").hidden = !!card;
  if (card) {
    lastSeen[mode] = card.dataset.id;
    card.hidden = false;
    renderMarks(card);
    if (card.dataset.kind === "role") {
      const l = labelOf(card.dataset.company);
      const chip = card.querySelector(".company-label");
      chip.textContent = l ? `company ${NAMES[l]}` : "company not labelled yet";
      chip.dataset.label = l;
    }
    renderNotes(card);
    history.replaceState(null, "", "#" + card.dataset.id);
    window.scrollTo(0, 0);
  }
  status();
}

function status() {
  document.body.dataset.mode = mode;
  const todoCompanies = companyCards.filter(isTodo).length;
  const todoRoles = roleCards.filter(isTodo);
  const at = l => todoRoles.filter(c => labelOf(c.dataset.company) === l).length;
  const todoPeople = personCards.filter(isTodo).length;
  document.getElementById("mode").textContent = mode === "company"
    ? `Companies: ${todoCompanies} to do`
    : mode === "role"
    ? `Roles: ${todoRoles.length} to do, ${at("Y")} at dream-fit companies, ${at("y")} at yes companies`
    : `People, projects, and places: ${todoPeople} to do`;
  const list = visible();
  const i = current ? list.indexOf(current) : -1;
  document.getElementById("pos").textContent = `${i + 1} / ${list.length}`;
  document.getElementById("view").textContent =
    `filter: ${NAMES[FILTERS[filter]]} · to do: ${todoCompanies} companies, ${todoRoles.length} roles, ${todoPeople} people`;
}

function move(step) {
  const list = visible();
  if (!list.length) return show(null);
  let i = list.indexOf(current);
  i = i < 0 ? 0 : Math.max(0, Math.min(list.length - 1, i + step));
  show(list[i]);
}

function setMode(m) {
  mode = m;
  save("mode", mode);
  const list = visible();
  const back = byId[lastSeen[mode]];
  show(back && list.includes(back) ? back : list[0] || null);
}

function renderMarks(card) {
  const id = card.dataset.id;
  const marks = card.querySelector(".marks");
  const l = labelOf(id);
  const parts = [];
  if (l) { const s = document.createElement("span"); s.dataset.label = l; s.textContent = NAMES[l]; parts.push(s); }
  if (hasFlag(id, "content")) { const s = document.createElement("span"); s.className = "content"; s.textContent = "content idea"; parts.push(s); }
  if (hasFlag(id, "issue")) { const s = document.createElement("span"); s.className = "issue"; s.textContent = "screenshot issue"; parts.push(s); }
  marks.replaceChildren(...parts);
}

function setFlag(card, flag, on, record = true) {
  const id = card.dataset.id;
  if (record) undoStack.push({ type: "flag", id, flag, prev: hasFlag(id, flag) });
  flags[id] = (flags[id] || []).filter(f => f !== flag).concat(on ? [flag] : []);
  renderMarks(card);
  status();
  fetch("/api/flag", { method: "POST", keepalive: true, body: JSON.stringify({ id, flag, on }) })
    .then(r => { if (!r.ok) throw r; })
    .catch(() => alert("Flag not saved. Restart ./jobs triage (it may be running older code)."));
}

function setLabel(card, label, record = true) {
  const id = card.dataset.id;
  if (record) undoStack.push({ type: "label", id, prev: labelOf(id) });
  if (label) labels[id] = label; else delete labels[id];
  renderMarks(card);
  fetch("/api/label", { method: "POST", keepalive: true, body: JSON.stringify({ id, label }) })
    .then(r => { if (!r.ok) throw r; })
    .catch(() => alert("Label not saved. Restart ./jobs triage (it may be running older code)."));
}

function label(l) {
  if (!current) return;
  const labelled = current;
  const i = visible().indexOf(current);
  setLabel(current, l);
  const after = visible();
  if (after.includes(current)) show(after[Math.min(i + 1, after.length - 1)]);
  else show(after[Math.min(i, after.length - 1)] || null);
  lastLabelled = labelled === current ? null : labelled.dataset.id;
}

// The screenshot doesn't show the site: flag it for ./jobs shoot --issues and move on.
// The card keeps its place in the queue, so it comes back once a new screenshot lands.
function flagIssue() {
  if (!current) return;
  const on = !hasFlag(current.dataset.id, "issue");
  setFlag(current, "issue", on);
  if (on) move(1);
}

function renderNotes(card) {
  const list = card.querySelector(".notes");
  const own = (notes[card.dataset.id] || []).map(n => ["", ...n]);
  const parent = card.dataset.kind === "role"
    ? (notes[card.dataset.company] || []).map(n => ["company: ", ...n]) : [];
  list.replaceChildren(...[...parent, ...own].map(([prefix, date, text]) => {
    const li = document.createElement("li");
    li.textContent = `${prefix}${text} (${date})`;
    return li;
  }));
}

const noteForm = document.getElementById("note");
const noteText = document.getElementById("note-text");
let noteTarget = null;

function openNote() {
  noteTarget = byId[lastLabelled] || current;
  if (!noteTarget) return;
  const l = labelOf(noteTarget.dataset.id);
  document.getElementById("note-target").textContent =
    noteTarget.dataset.name + (l ? ` (${NAMES[l]})` : "");
  noteForm.hidden = false;
  noteText.value = "";
  noteText.focus();
}

function closeNote() {
  noteForm.hidden = true;
  noteText.blur();
}

noteForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = noteText.value.trim();
  const card = noteTarget;
  closeNote();
  if (!text || !card) return;
  const id = card.dataset.id;
  (notes[id] ||= []).push([new Date().toISOString().slice(0, 10), text]);
  if (current) renderNotes(current);
  fetch("/api/note", { method: "POST", keepalive: true, body: JSON.stringify({ id, note: text }) })
    .then(r => { if (!r.ok) throw r; })
    .catch(() => alert("Note not saved. Restart ./jobs triage (it may be running older code)."));
});

function undo() {
  const last = undoStack.pop();
  if (!last) return;
  const card = byId[last.id];
  if (last.type === "flag") setFlag(card, last.flag, last.prev, false);
  else setLabel(card, last.prev, false);
  mode = card.dataset.kind;
  if (!visible().includes(card)) { filter = 1; save("filter", FILTERS[filter]); }
  show(card);
}

function openLink() {
  if (!current) return;
  const url = current.dataset.url
    || "https://www.google.com/search?q=" + encodeURIComponent(current.dataset.name);
  window.open(url, "_blank");
}

function post(path, body) {
  return fetch(path, { method: "POST", body: JSON.stringify(body || {}) }).then(r => r.json());
}

const keys = {
  Y: () => label("Y"), y: () => label("y"), m: () => label("m"), w: () => label("w"), n: () => label("n"), x: () => label(""),
  c: () => current && setFlag(current, "content", !hasFlag(current.dataset.id, "content")),
  i: flagIssue,
  u: undo,
  Enter: openNote,
  j: () => move(1), ArrowRight: () => move(1), k: () => move(-1), ArrowLeft: () => move(-1),
  g: () => show(visible()[0] || null), G: () => show(visible().at(-1) || null),
  f: () => { filter = (filter + 1) % FILTERS.length; save("filter", FILTERS[filter]); move(0); },
  Tab: () => setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]),
  o: openLink,
  e: () => current && post("/api/edit", { id: current.dataset.id }),
  r: () => post("/api/rebuild").then(r => r.ok ? location.reload() : alert("Build failed; see the terminal.")),
  "?": () => { const d = document.getElementById("help"); d.open ? d.close() : d.showModal(); },
};

const NAVIGATION = new Set(["j", "k", "ArrowRight", "ArrowLeft", "g", "G", "f", "Tab"]);

document.addEventListener("keydown", e => {
  if (!noteForm.hidden) {
    if (e.key === "Escape") { e.preventDefault(); closeNote(); }
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const fn = keys[e.key];
  if (!fn) return;
  e.preventDefault();
  if (NAVIGATION.has(e.key)) lastLabelled = null;
  fn();
});

filter = Math.max(0, FILTERS.indexOf(load("filter", "todo")));
mode = load("mode", "company");
if (!MODES.includes(mode)) mode = "company";
Promise.all([fetch("/api/labels"), fetch("/api/notes"), fetch("/api/flags")]).then(rs => Promise.all(rs.map(r => r.json()))).then(([l, n, fl]) => {
  labels = l;
  notes = n;
  flags = fl;
  const fromHash = byId[decodeURIComponent(location.hash.slice(1))];
  if (fromHash) mode = fromHash.dataset.kind;
  if (fromHash && !visible().includes(fromHash)) filter = FILTERS.indexOf("all");
  const list = visible();
  show(fromHash && list.includes(fromHash) ? fromHash : list[0] || null);
}).catch(() => {
  document.getElementById("empty").hidden = false;
  document.getElementById("empty").textContent = "Labels need the local server. Run ./jobs triage.";
});
