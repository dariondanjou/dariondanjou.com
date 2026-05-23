(function () {
  "use strict";

  const STORAGE_KEY = "noted.shotlist.v1";
  const TOTAL_SHOTS = 86;

  const shots = [];
  for (let i = 1; i <= TOTAL_SHOTS; i++) {
    const padded = String(i).padStart(3, "0");
    shots.push({
      id: padded,
      number: i,
      src: `./images/${padded}.png`,
      label: `Shot ${padded}`,
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
  }

  const state = loadState();
  let hideDone = false;

  const grid = document.getElementById("grid");
  const tpl = document.getElementById("card-template");
  const progressCount = document.getElementById("progress-count");
  const progressBar = document.getElementById("progress-bar");
  const filterToggle = document.getElementById("filter-toggle");
  const resetBtn = document.getElementById("reset");

  function renderProgress() {
    const done = shots.reduce((acc, s) => acc + (state[s.id] ? 1 : 0), 0);
    progressCount.textContent = `${done} / ${shots.length}`;
    progressBar.style.width = `${(done / shots.length) * 100}%`;
  }

  function applyDoneClass(card, isDone) {
    card.classList.toggle("done", isDone);
    if (hideDone) {
      card.classList.toggle("hidden-when-done", isDone);
    } else {
      card.classList.remove("hidden-when-done");
    }
  }

  function buildCard(shot) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.shot = shot.id;
    const img = node.querySelector(".thumb");
    img.src = shot.src;
    img.alt = shot.label;
    const label = node.querySelector(".shot-label");
    label.textContent = shot.label;
    const cb = node.querySelector(".check");
    cb.checked = !!state[shot.id];
    cb.setAttribute("aria-label", `Mark ${shot.label} complete`);
    applyDoneClass(node, cb.checked);

    cb.addEventListener("change", () => {
      if (cb.checked) {
        state[shot.id] = Date.now();
      } else {
        delete state[shot.id];
      }
      saveState(state);
      applyDoneClass(node, cb.checked);
      renderProgress();
    });

    return node;
  }

  function render() {
    const frag = document.createDocumentFragment();
    for (const shot of shots) frag.appendChild(buildCard(shot));
    grid.appendChild(frag);
    renderProgress();
  }

  filterToggle.addEventListener("click", () => {
    hideDone = !hideDone;
    filterToggle.setAttribute("aria-pressed", String(hideDone));
    filterToggle.textContent = hideDone ? "Show all" : "Hide done";
    for (const card of grid.children) {
      const id = card.dataset.shot;
      const isDone = !!state[id];
      if (hideDone && isDone) card.classList.add("hidden-when-done");
      else card.classList.remove("hidden-when-done");
    }
  });

  resetBtn.addEventListener("click", () => {
    const done = Object.keys(state).length;
    if (done === 0) return;
    if (!confirm(`Uncheck all ${done} shots?`)) return;
    for (const k of Object.keys(state)) delete state[k];
    saveState(state);
    for (const card of grid.children) {
      const cb = card.querySelector(".check");
      cb.checked = false;
      applyDoneClass(card, false);
    }
    renderProgress();
  });

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = loadState();
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, next);
    for (const card of grid.children) {
      const id = card.dataset.shot;
      const cb = card.querySelector(".check");
      const isDone = !!state[id];
      cb.checked = isDone;
      applyDoneClass(card, isDone);
    }
    renderProgress();
  });

  render();
})();
