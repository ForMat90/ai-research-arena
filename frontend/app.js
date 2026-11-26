const form = document.querySelector("#question-form");
const questionInput = document.querySelector("#question");
const fileInput = document.querySelector("#pdf-file");
const fileName = document.querySelector("#file-name");
const submitButton = document.querySelector("#submit-button");
const coordinatorIntro = document.querySelector("#coordinator-intro");
const coordinatorWaiting = document.querySelector("#coordinator-waiting");
const coordinatorAnswer = document.querySelector("#coordinator-answer");
const coordinatorError = document.querySelector("#coordinator-error");
const coordinatorActions = document.querySelector("#coordinator-actions");
const coordinatorLabel = document.querySelector("#coordinator-label");
const phaseStatus = document.querySelector("#phase-status");
const roomStatus = document.querySelector("#room-status");
const stage = document.querySelector("#stage");
const tableHologram = document.querySelector("#table-hologram");
const hologramLabel = document.querySelector("#hologram-label");
const hologramTopic = document.querySelector("#hologram-topic");
const speechLayer = document.querySelector("#speech-layer");
const sourcesPanel = document.querySelector("#sources-panel");
const sourceList = document.querySelector("#source-list");
const sourceCount = document.querySelector("#source-count");
const sourceWarning = document.createElement("p");
const transcriptPanel = document.querySelector("#transcript-panel");
const transcriptList = document.querySelector("#transcript-list");
const flashcardsButton = document.querySelector("#flashcards-button");
const flashcardsStatus = document.querySelector("#flashcards-status");
const flashcardsGrid = document.querySelector("#flashcards-grid");
const flashcardsExportJson = document.querySelector("#flashcards-export-json");
const flashcardsExportCsv = document.querySelector("#flashcards-export-csv");
const providerStatus = document.querySelector("#provider-status");
const memoryStatus = document.querySelector("#memory-status");
const clearMemoryButton = document.querySelector("#clear-memory");
const langToggle = document.querySelector("#lang-toggle");
const MEMORY_STORAGE_KEY = "ai-research-arena-memory";
const LANG_STORAGE_KEY = "ai-research-arena-lang";
 
// ── Internazionalisation ──────────────────────────────────────────────────
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "it";
 
const i18n = {
  it: {
    langButton: "🌐 EN",
    sceneKicker: "LUNA RACCOGLIE LA DOMANDA. IL TAVOLO RISPONDE.",
    h1Line1: "Una domanda.",
    h1Line2: "Quattro menti. Una sintesi.",
    roomWaiting: "IN ATTESA DELLA DOMANDA",
    wallLeft: "AI RESEARCH\nARENA OPEN",
    wallRight: "IL TAVOLO È APERTO\nLA LUCE È ACCESA",
    balloonH2: "Mettiamo la domanda al tavolo.",
    balloonP: "Luna porta la tua domanda a Nova, Atlas e Sigma. Si confrontano e poi torna da te con una sintesi.",
    placeholder: "Chiedi qualsiasi cosa: idee, lavoro, scienza, vita quotidiana…",
    fileLabel: "Allega documento (PDF)",
    submitLabel: "Discutiamone",
    submitWaiting: "La domanda è al tavolo…",
    privacyNote: "Lo storico delle tue ultime domande è salvato <strong>solo in questo browser</strong>. Quando invii una domanda, il suo contenuto (incluso lo storico e il PDF) viene trasmesso al provider AI scelto.",
    memoryEmpty: "MEMORIA LOCALE: VUOTA",
    memoryCount: (n) => `MEMORIA LOCALE: ${n} ${n === 1 ? "DOMANDA" : "DOMANDE"} RECENTI`,
    clearMemory: "Dimentica",
    flashcardsBtn: "✧ Crea flashcard",
    newQuestion: "Nuova domanda ↗",
    flashcardsLabel: (n) => `${n} flashcard create`,
    flashcardsWorking: "Il Coordinatore sta preparando le carte…",
    transcriptTitle: "Rileggi gli interventi completi",
    sourcesTitle: "FONTI PORTATE AL TAVOLO",
    sourceCaveat: "Le fonti sono risultati arXiv e/o il PDF caricato. Un link verificabile non garantisce da solo che ogni frase AI sia corretta; gli e-print possono non essere peer-reviewed.",
    phaseArXiv: "Luna controlla se ci sono fonti pertinenti…",
    phaseBringing: "Luna porta la domanda al tavolo…",
    phaseReturning: "LUNA TORNA CON LA SINTESI",
    hologramWaiting: "PROIEZIONE IN ATTESA",
    hologramIdle: "Una domanda accende il tavolo",
    agentRoles: {
      nova: { name: "NOVA", role: "ANALISTA TEORICA" },
      atlas: { name: "ATLAS", role: "ANALISTA PRATICA" },
      sigma: { name: "SIGMA", role: "REVISIONE CRITICA" },
      coordinator: { name: "LUNA", role: "COORDINATRICE" },
    },
    debatePromptLang: "Scrivi in italiano formale e preciso.",
  },
  en: {
    langButton: "🌐 IT",
    sceneKicker: "LUNA BRINGS YOUR QUESTION. THE TABLE RESPONDS.",
    h1Line1: "One question.",
    h1Line2: "Four minds. One synthesis.",
    roomWaiting: "AWAITING A QUESTION",
    wallLeft: "AI RESEARCH\nARENA OPEN",
    wallRight: "TABLE IS OPEN\nLIGHT IS ON",
    balloonH2: "Let's put your question to the table.",
    balloonP: "Luna takes your question to Nova, Atlas and Sigma. They debate, then she comes back with a synthesis.",
    placeholder: "Ask anything: ideas, work, science, daily life…",
    fileLabel: "Attach document (PDF)",
    submitLabel: "Let's discuss it",
    submitWaiting: "Question is at the table…",
    privacyNote: "Your recent question history is stored <strong>only in this browser</strong>. When you submit a question, its content (including history and PDF) is sent to the chosen AI provider.",
    memoryEmpty: "LOCAL MEMORY: EMPTY",
    memoryCount: (n) => `LOCAL MEMORY: ${n} RECENT ${n === 1 ? "QUESTION" : "QUESTIONS"}`,
    clearMemory: "Forget",
    flashcardsBtn: "✧ Create flashcards",
    newQuestion: "New question ↗",
    flashcardsLabel: (n) => `${n} flashcards created`,
    flashcardsWorking: "The Coordinator is preparing your cards…",
    transcriptTitle: "Read full interventions",
    sourcesTitle: "SOURCES AT THE TABLE",
    sourceCaveat: "Sources are arXiv results and/or the uploaded PDF. A verifiable link alone does not guarantee every AI statement is correct; e-prints may not be peer-reviewed.",
    phaseArXiv: "Luna is checking for relevant sources…",
    phaseBringing: "Luna is bringing the question to the table…",
    phaseReturning: "LUNA RETURNS WITH THE SYNTHESIS",
    hologramWaiting: "PROJECTION STANDBY",
    hologramIdle: "A question lights up the table",
    agentRoles: {
      nova: { name: "NOVA", role: "THEORETICAL ANALYST" },
      atlas: { name: "ATLAS", role: "PRACTICAL ANALYST" },
      sigma: { name: "SIGMA", role: "CRITICAL REVIEW" },
      coordinator: { name: "LUNA", role: "COORDINATOR" },
    },
    debatePromptLang: "Write in formal, precise English.",
  },
};
 
function t() { return i18n[currentLang]; }
 
function applyLanguage() {
  const lang = t();
  // toggle button text
  if (langToggle) langToggle.textContent = lang.langButton;
  // scene kicker
  const kicker = document.querySelector(".scene-kicker");
  if (kicker) kicker.childNodes[kicker.childNodes.length - 1].textContent = " " + lang.sceneKicker;
  // h1
  const h1 = document.querySelector("h1");
  if (h1) {
    const span = h1.querySelector("span");
    h1.childNodes[0].textContent = lang.h1Line1;
    if (span) span.textContent = lang.h1Line2;
  }
  // wall labels
  const wLeft = document.querySelector("#wall-left");
  if (wLeft) wLeft.innerHTML = lang.wallLeft.replace("\n", "<br>");
  const wRight = document.querySelector(".wall-label-right");
  if (wRight) wRight.innerHTML = lang.wallRight.replace("\n", "<br>");
  // balloon intro
  const ballH2 = coordinatorIntro?.querySelector("h2");
  const ballP = coordinatorIntro?.querySelector("p:first-of-type");
  if (ballH2) ballH2.textContent = lang.balloonH2;
  if (ballP) ballP.textContent = lang.balloonP;
  // form
  if (questionInput) questionInput.placeholder = lang.placeholder;
  const fileSpan = document.querySelector("#file-name");
  if (fileSpan) fileSpan.textContent = lang.fileLabel;
  const submitSpan = submitButton?.querySelector("span:first-child");
  if (submitSpan && !submitButton.disabled) submitSpan.textContent = lang.submitLabel;
  // privacy note
  const privacyEl = document.querySelector("#privacy-note");
  if (privacyEl) privacyEl.innerHTML = lang.privacyNote;
  // memory
  const clearBtn = document.querySelector("#clear-memory");
  if (clearBtn) clearBtn.textContent = lang.clearMemory;
  updateMemoryStatus();
  // action buttons
  const fbBtn = document.querySelector("#flashcards-button");
  if (fbBtn) fbBtn.textContent = lang.flashcardsBtn;
  const nqBtn = document.querySelector("#new-question");
  if (nqBtn) nqBtn.textContent = lang.newQuestion;
  const vtBtn = document.querySelector("#view-transcript-btn");
  if (vtBtn) vtBtn.textContent = currentLang === "en" ? "📜 Read full transcript" : "📜 Rileggi interventi completi";
  // transcript summary
  const tsum = transcriptPanel?.querySelector("summary");
  if (tsum) tsum.textContent = lang.transcriptTitle;
  // sources panel heading
  const srcHead = sourcesPanel?.querySelector(".desk-heading > div");
  if (srcHead) srcHead.lastChild.textContent = " " + lang.sourcesTitle;
  // source caveat
  const srcCaveat = sourcesPanel?.querySelector(".source-caveat");
  if (srcCaveat) srcCaveat.textContent = lang.sourceCaveat;
  // room status (only if idle)
  if (roomStatus?.textContent === i18n[currentLang === "en" ? "it" : "en"].roomWaiting) {
    roomStatus.textContent = lang.roomWaiting;
  }
  // hologram idle
  if (hologramLabel?.textContent === i18n[currentLang === "en" ? "it" : "en"].hologramWaiting) {
    hologramLabel.textContent = lang.hologramWaiting;
  }
  if (hologramTopic?.textContent === i18n[currentLang === "en" ? "it" : "en"].hologramIdle) {
    hologramTopic.textContent = lang.hologramIdle;
  }
  // html lang attribute
  document.documentElement.lang = currentLang;
}
 
if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "it" ? "en" : "it";
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    applyLanguage();
  });
}
 
const agentLabels = {
  nova: { name: "NOVA", role: "ANALISTA TEORICA" },
  atlas: { name: "ATLAS", role: "ANALISTA PRATICA" },
  sigma: { name: "SIGMA", role: "REVISIONE CRITICA" },
  coordinator: { name: "LUNA", role: "COORDINATRICE" },
};
 
let finalAnswer = "";
let activeMessage = null;
let requestController = null;
let returnTimer = null;
let sessionMemory = readSessionMemory();
let flashcardsData = [];
 
const toolsDock = document.querySelector("#tools-dock");
const coordinatorFront = document.querySelector(".coordinator-front");
const coordinatorBalloon = document.querySelector("#coordinator-balloon");
const viewTranscriptBtn = document.querySelector("#view-transcript-btn");
 
let bubbleZIndex = 100;
 
// Click sul balloon di Luna: torna sopra gli altri balloon
coordinatorBalloon.addEventListener("pointerdown", () => {
  bubbleZIndex++;
  coordinatorFront.style.zIndex = bubbleZIndex;
  speechLayer
    .querySelectorAll(".speech-bubble-wrapper")
    .forEach((b) => b.classList.remove("active-focus"));
});
 
function bringBubbleToFront(wrapper) {
  bubbleZIndex++;
  wrapper.style.zIndex = bubbleZIndex;
 
  speechLayer
    .querySelectorAll(".speech-bubble-wrapper")
    .forEach(b => b.classList.remove("active-focus"));
 
  wrapper.classList.add("active-focus");
}
 
loadProviderStatus();
updateMemoryStatus();
applyLanguage();
 
async function loadProviderStatus() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("Stato provider non disponibile.");
    const health = await response.json();
    if (health.provider === "llm7") {
      providerStatus.textContent =
        "AI gratuita attiva · LLM7 senza chiave, con Pollinations e OVH come riserva.";
    } else if (health.provider === "pollinations") {
      providerStatus.textContent =
        "AI gratuita attiva · Pollinations senza chiave · circa 30 s tra richieste per IP: una discussione può richiedere alcuni minuti.";
    } else if (health.provider === "ollama") {
      providerStatus.textContent = `Ollama locale · ${health.model} · avvia Ollama e scarica il modello indicato se non è già installato.`;
    } else if (health.provider_configured) {
      providerStatus.textContent = `${health.provider} configurato · modello ${health.model}.`;
    } else {
      providerStatus.textContent =
        "OpenRouter non configurato: aggiungi la tua chiave in .env, oppure usa Ollama locale senza API key.";
    }
  } catch (error) {
    providerStatus.textContent = error.message;
  }
}
 
function readSessionMemory() {
  try {
    const saved = JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((entry) => typeof entry.question === "string" && typeof entry.answer === "string")
      .slice(-3);
  } catch {
    return [];
  }
}
 
function updateMemoryStatus() {
  const count = sessionMemory.length;
  memoryStatus.textContent = count
    ? t().memoryCount(count)
    : t().memoryEmpty;
}
 
function saveSessionMemory() {
  const question = document.querySelector("#asked-question").textContent.trim();
  if (!question || !finalAnswer) return;
  sessionMemory = [
    ...sessionMemory,
    { question: question.slice(0, 1_600), answer: finalAnswer.slice(0, 1_400) },
  ].slice(-3);
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(sessionMemory));
  } catch {
    // Keep this session's memory in memory even when browser storage is unavailable.
  }
  updateMemoryStatus();
}
 
clearMemoryButton.addEventListener("click", () => {
  sessionMemory = [];
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch {
    // The in-memory copy is still cleared.
  }
  updateMemoryStatus();
});
 
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileName.textContent = file ? file.name : "Porta un paper al tavolo";
});
 
document.querySelector("#new-question").addEventListener("click", resetScene);
 
const topbarTranscriptBtn = document.querySelector("#topbar-transcript-btn");
const topbarSourcesBtn = document.querySelector("#topbar-sources-btn");
 
function openTranscript() {
  if (transcriptPanel) {
    transcriptPanel.hidden = false;
    transcriptPanel.open = true;
    transcriptPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
 
if (viewTranscriptBtn) viewTranscriptBtn.addEventListener("click", openTranscript);
if (topbarTranscriptBtn) topbarTranscriptBtn.addEventListener("click", openTranscript);
 
if (topbarSourcesBtn) {
  topbarSourcesBtn.addEventListener("click", () => {
    if (sourcesPanel) {
      sourcesPanel.hidden = false;
      sourcesPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
 
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) {
    questionInput.focus();
    return;
  }
 
  beginDiscussion(question);
  const data = new FormData();
  data.append("question", question);
  data.append("memory", JSON.stringify(sessionMemory));
  data.append("lang", currentLang);
  const pdf = fileInput.files?.[0];
  if (pdf) data.append("document", pdf);
 
  requestController = new AbortController();
  try {
    const response = await fetch("/api/debate", {
      method: "POST",
      body: data,
      signal: requestController.signal,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Richiesta non riuscita (HTTP ${response.status}).`);
    }
    if (!response.body) throw new Error("Il browser non supporta la risposta in streaming.");
    const terminalEvent = await consumeEvents(response.body);
    if (terminalEvent !== "complete" && terminalEvent !== "error") {
      showError("La connessione si è interrotta prima della conclusione della discussione.");
    }
  } catch (error) {
    if (error.name !== "AbortError") showError(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span:first-child").textContent = "Discutiamone";
    requestController = null;
  }
});
 
function beginDiscussion(question) {
  clearTimeout(returnTimer);
  finalAnswer = "";
  activeMessage = null;
  for (const k of Object.keys(agentTurnHistory)) delete agentTurnHistory[k];
  stage.classList.remove("luna-home", "luna-at-table", "luna-returning");
  stage.classList.add("luna-departing");
  setHologram(question, "LUNA PORTA LA DOMANDA");
  coordinatorIntro.hidden = true;
  coordinatorWaiting.hidden = false;
  coordinatorAnswer.hidden = true;
  coordinatorAnswer.replaceChildren();
  coordinatorError.hidden = true;
  coordinatorActions.hidden = true;
  coordinatorFront.style.zIndex = "";
  toolsDock.hidden = false;
  viewTranscriptBtn.disabled = true;
  flashcardsButton.disabled = true;
  flashcardsExportJson.hidden = true;
  flashcardsExportCsv.hidden = true;
  document.querySelector("#asked-question").textContent = question;
  coordinatorLabel.textContent = "LUNA · DOMANDA RICEVUTA";
  phaseStatus.textContent = t().phaseBringing;
  roomStatus.textContent = "LUNA SI AVVICINA AL TAVOLO";
  speechLayer.replaceChildren();
  sourceList.replaceChildren();
  sourcesPanel.hidden = true;
  sourceWarning.remove();
  transcriptList.replaceChildren();
  transcriptPanel.hidden = true;
  flashcardsGrid.replaceChildren();
  flashcardsStatus.textContent = "";
  document.querySelectorAll(".researcher").forEach((item) => item.classList.remove("active"));
  submitButton.disabled = true;
  submitButton.querySelector("span:first-child").textContent = t().submitWaiting;
}
 
function resetScene() {
  requestController?.abort();
  clearTimeout(returnTimer);
  finalAnswer = "";
  activeMessage = null;
  // Clear turn history on new question
  for (const k of Object.keys(agentTurnHistory)) delete agentTurnHistory[k];
  stage.classList.remove("luna-departing", "luna-at-table", "luna-returning");
  stage.classList.add("luna-home");
  setHologram("", t().hologramWaiting);
  coordinatorIntro.hidden = false;
  coordinatorWaiting.hidden = true;
  coordinatorAnswer.hidden = true;
  coordinatorError.hidden = true;
  coordinatorActions.hidden = true;
  coordinatorLabel.textContent = "LUNA · COORDINATRICE";
  questionInput.value = "";
  fileInput.value = "";
  fileName.textContent = t().fileLabel;
  speechLayer.replaceChildren();
  sourceList.replaceChildren();
  sourcesPanel.hidden = true;
  sourceWarning.remove();
  transcriptPanel.hidden = true;
  transcriptList.replaceChildren();
  flashcardsGrid.replaceChildren();
  flashcardsStatus.textContent = "";
  coordinatorFront.style.zIndex = "";
  toolsDock.hidden = true;
  viewTranscriptBtn.disabled = true;
  flashcardsButton.disabled = true;
  flashcardsExportJson.hidden = true;
  flashcardsExportCsv.hidden = true;
  roomStatus.textContent = t().roomWaiting;
  document.querySelectorAll(".researcher").forEach((item) => item.classList.remove("active"));
  questionInput.focus();
}
 
async function consumeEvents(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let terminalEvent = null;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    buffer = buffer.replace(/\r\n/g, "\n");
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      terminalEvent = dispatchBlock(block) || terminalEvent;
    }
    if (done) break;
  }
  if (buffer.trim()) terminalEvent = dispatchBlock(buffer) || terminalEvent;
  return terminalEvent;
}
 
function dispatchBlock(block) {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());
  if (!data.length) return null;
  const event = JSON.parse(data.join("\n"));
  handleEvent(event);
  return event.type === "complete" || event.type === "error" ? event.type : null;
}
 
function handleEvent(event) {
  if (event.type === "phase") {
    phaseStatus.textContent = t().phaseArXiv;
    hologramLabel.textContent = "CONTROLLO DELLE FONTI";
    roomStatus.textContent = "LUNA PREPARA LA DOMANDA";
    return;
  }
  if (event.type === "source_warning") {
    sourceWarning.className = "source-warning";
    sourceWarning.textContent = event.message;
    sourcesPanel.before(sourceWarning);
    return;
  }
  if (event.type === "sources") {
    renderSources(event.items);
    return;
  }
  if (event.type === "agent_start") {
    setSpeakingAgent(event);
    return;
  }
  if (event.type === "agent_retry") {
    if (activeMessage?.agent === event.agent) {
      activeMessage.text.replaceChildren();
      phaseStatus.textContent = "Connessione instabile: l'agente sta riprovando la risposta…";
    }
    return;
  }
  if (event.type === "token" && activeMessage?.agent === event.agent) {
    activeMessage.text.textContent += event.text;
    if (event.agent === "coordinator") {
      if (activeMessage.bubbleText) activeMessage.bubbleText.textContent += event.text;
      coordinatorAnswer.scrollTop = coordinatorAnswer.scrollHeight;
    } else {
      activeMessage.card.scrollTop = activeMessage.card.scrollHeight;
    }
    return;
  }
  if (event.type === "agent_end") {
    finishMessage(event.agent);
    return;
  }
  if (event.type === "round_decision") {
    const nextRound = event.round + 1;
    phaseStatus.textContent = event.continue
      ? `Sigma segnala un punto aperto: il tavolo passa al round ${nextRound}/${event.max_rounds}. ${event.reason}`
      : `Round ${event.round} concluso. ${event.reason}`;
    roomStatus.textContent = event.continue
      ? `ROUND ${event.round}/${event.max_rounds} · SI CONTINUA`
      : `ROUND ${event.round}/${event.max_rounds} · VERIFICA COMPLETATA`;
    return;
  }
  if (event.type === "complete") {
    saveSessionMemory();
    markBubblesStale();
    flashcardsButton.disabled = false;
    stage.classList.remove("luna-departing", "luna-at-table");
    stage.classList.add("luna-returning");
    roomStatus.textContent = t().phaseReturning;
    hologramLabel.textContent = "SINTESI IN ARRIVO";
    returnTimer = setTimeout(() => {
      stage.classList.remove("luna-returning");
      stage.classList.add("luna-home");
      roomStatus.textContent = "SINTESI CONSEGNATA";
      coordinatorLabel.textContent = "LUNA · LA SINTESI";
      coordinatorActions.hidden = false;
    }, 950);
    return;
  }
  if (event.type === "error") showError(event.message);
}
 
function setSpeakingAgent(event) {
  document.querySelectorAll(".researcher").forEach((item) => {
    item.classList.toggle("active", item.dataset.agent === event.agent);
  });
  roomStatus.textContent = event.follow_up
    ? `${event.name.toUpperCase()} AGGIUNGE UNA NOTA`
    : event.round
      ? `ROUND ${event.round} · ${event.name.toUpperCase()}`
      : `${event.name.toUpperCase()} HA LA PAROLA`;
 
  if (event.agent === "coordinator") {
    hologramLabel.textContent = "SINTESI AL TAVOLO";
    hologramTopic.textContent = "Luna mette insieme i punti di vista";
    markBubblesStale();
    coordinatorWaiting.hidden = true;
    coordinatorAnswer.hidden = false;
    coordinatorAnswer.replaceChildren();
    coordinatorLabel.textContent = "LUNA · PREPARA LA SINTESI";
    const label = agentLabels.coordinator;
    const bubble = createSpeechBubble(event.agent, label, event.round, event.follow_up, event.title);
    activeMessage = {
      agent: event.agent,
      text: coordinatorAnswer,
      bubbleText: bubble.querySelector(".speech-bubble-text"),
      live: bubble.querySelector(".speech-spinner"),
      card: coordinatorAnswer,
      label,
    };
    return;
  }
 
  stage.classList.remove("luna-departing");
  stage.classList.add("luna-at-table");
  hologramLabel.textContent = event.follow_up ? "ULTIMA NOTA AL TAVOLO" : "DIBATTITO IN CORSO";
  hologramTopic.textContent = event.follow_up
    ? `${event.name} aggiunge un dettaglio`
    : event.round
      ? `${event.name} · ${event.title}`
      : `${event.name} prende la parola`;
  markBubblesStale();
  const label = agentLabels[event.agent] || { name: event.name.toUpperCase(), role: event.title };
  const localLabel = t().agentRoles[event.agent] || label;
  const bubble = createSpeechBubble(event.agent, localLabel, event.round, event.follow_up, event.title);
  activeMessage = { agent: event.agent, text: bubble.querySelector(".speech-bubble-text"), live: bubble.querySelector(".speech-spinner"), card: bubble, label: localLabel };
}
 
function markBubblesStale() {
  speechLayer.querySelectorAll(".speech-bubble-wrapper").forEach((wrapper) => {
    wrapper.classList.add("stale");
    wrapper.classList.remove("active-focus");
    wrapper.style.zIndex = "";
    wrapper.querySelector(".speech-spinner")?.remove();
  });
}
 
// Stores all turn texts per agent so the user can switch tabs between rounds!
const agentTurnHistory = {};
 
function createSpeechBubble(agent, label, round, followUp, title) {
  // Check if a wrapper already exists for this agent
  let wrapper = speechLayer.querySelector(`.speech-bubble-wrapper[data-agent="${agent}"]`);
 
  if (!agentTurnHistory[agent]) agentTurnHistory[agent] = [];
  const turnIndex = agentTurnHistory[agent].length;
  const tabLabel = followUp ? "NOTA" : round ? `R${round}` : `T${turnIndex + 1}`;
 
  let bubble;
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "speech-bubble-wrapper active-focus";
    wrapper.dataset.agent = agent;
 
    // Tab bar esterna fissa sopra
    const tabBar = document.createElement("div");
    tabBar.className = "speech-bubble-tabs-outer";
    wrapper.append(tabBar);
 
    bubble = document.createElement("article");
    bubble.className = "speech-bubble";
    bubble.dataset.agent = agent;
 
    const meta = document.createElement("div");
    meta.className = "speech-bubble-meta";
    const name = document.createElement("span");
    name.textContent = label.name;
    const role = document.createElement("span");
    role.className = "speech-bubble-role";
    role.textContent = followUp
      ? title.toUpperCase()
      : round
        ? `ROUND ${round} · ${title.toUpperCase()}`
        : label.role;
    meta.append(name, role);
    bubble.append(meta);
 
    const text = document.createElement("div");
    text.className = "speech-bubble-text";
    const spinner = document.createElement("span");
    spinner.className = "speech-spinner";
    spinner.setAttribute("aria-label", "Sta parlando");
    bubble.append(text, spinner);
 
    wrapper.append(bubble);
 
    // Clicking a bubble brings it forward
    wrapper.addEventListener("click", () => {
      bringBubbleToFront(wrapper);
    });
 
    speechLayer.append(wrapper);
  } else {
    bubble = wrapper.querySelector(".speech-bubble");
    wrapper.classList.remove("stale");
    bringBubbleToFront(wrapper);
 
    // Update role
    const roleSpan = bubble.querySelector(".speech-bubble-role");
    if (roleSpan) {
      roleSpan.textContent = followUp
        ? title.toUpperCase()
        : round
          ? `ROUND ${round} · ${title.toUpperCase()}`
          : label.role;
    }
 
    // Reset live text area
    const textEl = bubble.querySelector(".speech-bubble-text");
    textEl.textContent = "";
    if (!bubble.querySelector(".speech-spinner")) {
      const spinner = document.createElement("span");
      spinner.className = "speech-spinner";
      spinner.setAttribute("aria-label", "Sta parlando");
      bubble.append(spinner);
    }
  }
 
  // Record this turn placeholder
  const currentRecord = { label: tabLabel, text: "", fullTitle: title };
  agentTurnHistory[agent].push(currentRecord);
 
  // Update tab buttons
  renderBubbleTabs(wrapper, agent);
 
  return bubble;
}
 
function renderBubbleTabs(wrapper, agent) {
  const tabBar = wrapper.querySelector(".speech-bubble-tabs-outer");
  if (!tabBar) return;
  tabBar.replaceChildren();
  const history = agentTurnHistory[agent] || [];
  history.forEach((rec, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `bubble-tab-btn ${idx === history.length - 1 ? "active" : ""}`;
    btn.textContent = rec.label;
    btn.title = `Intervento ${rec.label}`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      tabBar.querySelectorAll(".bubble-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const textEl = wrapper.querySelector(".speech-bubble-text");
      if (textEl) textEl.textContent = rec.text;
      bringBubbleToFront(wrapper);
    });
    tabBar.append(btn);
  });
}
 
function finishMessage(agent) {
  if (!activeMessage || activeMessage.agent !== agent) return;
  activeMessage.live?.remove();
  const text = activeMessage.text.textContent.trim();
 
  // Save content into agentTurnHistory so clicking earlier tabs displays this text
  if (agentTurnHistory[agent] && agentTurnHistory[agent].length) {
    agentTurnHistory[agent][agentTurnHistory[agent].length - 1].text = text;
  }
 
  if (agent === "coordinator") {
    finalAnswer = text;
    formatHeadings(activeMessage.text);
  }
  if (text) {
    appendTranscript(activeMessage.label, text, agent === "coordinator", agent);
    viewTranscriptBtn.disabled = false;
  }
  activeMessage = null;
}
 
function appendTranscript(label, content, isCoordinator = false, agent = "") {
  const entry = document.createElement("div");
  entry.className = "transcript-entry";
  entry.dataset.agent = agent;
  if (isCoordinator) entry.classList.add("transcript-summary");
  const title = document.createElement("strong");
  const nameEl = document.createElement("span");
  nameEl.className = "entry-name";
  nameEl.textContent = label.name;
  const roleEl = document.createElement("span");
  roleEl.className = "entry-role";
  roleEl.textContent = isCoordinator
    ? (currentLang === "en" ? "FINAL SYNTHESIS" : "SINTESI FINALE")
    : label.role;
  title.append(nameEl, roleEl);
  const text = document.createElement("p");
  text.textContent = content;
  entry.append(title, text);
  transcriptList.append(entry);
  transcriptPanel.hidden = false;
}
 
function formatHeadings(container) {
  const lines = container.textContent.split("\n");
  container.replaceChildren();
  lines.forEach((line, index) => {
    const match = line.match(/^###\s+(.+)$/);
    if (match) {
      const heading = document.createElement("h3");
      heading.textContent = match[1];
      container.append(heading);
    } else {
      container.append(document.createTextNode(line));
      if (index < lines.length - 1) container.append(document.createElement("br"));
    }
  });
}
 
function renderSources(items) {
  sourceList.replaceChildren();
  items.forEach((source) => {
    const card = document.createElement("article");
    card.className = "source-card";
    const title = source.url ? document.createElement("a") : document.createElement("span");
    title.textContent = `[${source.id}] ${source.title}`;
    if (source.url) {
      title.href = source.url;
      title.target = "_blank";
      title.rel = "noreferrer";
    }
    const meta = document.createElement("div");
    meta.className = "source-meta";
    meta.textContent = [source.authors, source.year, source.journal_ref].filter(Boolean).join(" · ");
    const type = document.createElement("span");
    type.className = `source-type${source.source_type.includes("Preprint") ? " preprint" : ""}`;
    type.textContent = source.source_type.toUpperCase();
    card.append(title, meta, type);
    sourceList.append(card);
  });
  sourceCount.textContent = `${items.length} ${items.length === 1 ? "fonte" : "fonti"}`;
  sourcesPanel.hidden = false;
}
 
function showError(message) {
  clearTimeout(returnTimer);
  stage.classList.remove("luna-departing", "luna-at-table", "luna-returning");
  stage.classList.add("luna-home");
  roomStatus.textContent = "DISCUSSIONE INTERROTTA";
  coordinatorLabel.textContent = "LUNA · IMPOSSIBILE COMPLETARE";
  coordinatorWaiting.hidden = true;
  coordinatorAnswer.hidden = true;
  coordinatorError.hidden = false;
  coordinatorError.textContent = message;
  coordinatorActions.hidden = false;
  flashcardsButton.disabled = true;
  document.querySelectorAll(".researcher").forEach((item) => item.classList.remove("active"));
}
 
function setHologram(question, status) {
  const normalized = question.toLocaleLowerCase("it");
  const topics = [
    { match: /entanglement|entangl|intrecc/, id: "entanglement", label: "Entanglement" },
    { match: /buco nero|black hole/, id: "black-hole", label: "Buco nero" },
    { match: /qubit|qbit/, id: "qubit", label: "Qubit" },
    { match: /atomo|atom/, id: "atom", label: "Atomo" },
  ];
  const topic = topics.find((item) => item.match.test(normalized));
  tableHologram.dataset.topic = topic?.id || "quantum";
  hologramTopic.textContent = topic?.label || "Tema al centro";
  hologramLabel.textContent = status;
}
 
flashcardsButton.addEventListener("click", async () => {
  if (!finalAnswer) return;
  flashcardsButton.disabled = true;
  flashcardsStatus.textContent = t().flashcardsWorking;
  flashcardsGrid.replaceChildren();
  flashcardsData = [];
  flashcardsExportJson.hidden = true;
  flashcardsExportCsv.hidden = true;
  try {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: finalAnswer }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || `Richiesta non riuscita (HTTP ${response.status}).`);
    body.cards.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "flashcard";
      const label = document.createElement("div");
      label.className = "flashcard-label";
      label.textContent = `CARD ${String(index + 1).padStart(2, "0")} · DOMANDA`;
      const question = document.createElement("div");
      question.className = "flashcard-answer";
      question.textContent = item.question;
      const answerLabel = document.createElement("div");
      answerLabel.className = "flashcard-label";
      answerLabel.textContent = "RISPOSTA";
      answerLabel.style.marginTop = "11px";
      const answer = document.createElement("div");
      answer.className = "flashcard-answer";
      answer.textContent = item.answer;
      card.append(label, question, answerLabel, answer);
      flashcardsGrid.append(card);
    });
    flashcardsData = body.cards;
    flashcardsStatus.textContent = t().flashcardsLabel(body.cards.length);
    flashcardsExportJson.hidden = false;
    flashcardsExportCsv.hidden = false;
  } catch (error) {
    flashcardsStatus.textContent = error.message;
  } finally {
    flashcardsButton.disabled = false;
  }
});
 
flashcardsExportJson.addEventListener("click", () => {
  if (!flashcardsData.length) return;
  const question = document.querySelector("#asked-question")?.textContent.trim() || "flashcard";
  const payload = {
    generated_at: new Date().toISOString(),
    question,
    cards: flashcardsData,
  };
  downloadFile(`${slug(question)}-flashcard.json`, JSON.stringify(payload, null, 2), "application/json");
});
 
flashcardsExportCsv.addEventListener("click", () => {
  if (!flashcardsData.length) return;
  const question = document.querySelector("#asked-question")?.textContent.trim() || "flashcard";
  const header = ["id", "question", "answer"];
  const rows = flashcardsData.map((card, index) => [
    index + 1,
    csvEscape(card.question),
    csvEscape(card.answer),
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\r\n");
  downloadFile(`${slug(question)}-flashcard.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8");
});
 
function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
 
function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "ai-research-arena";
}
 
function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
 