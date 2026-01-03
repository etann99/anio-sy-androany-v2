// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// Configuration
const CONFIG = {
  morning: {
    malagasyTitle: "Ny Anio",
    modeTitle: "FANAOKELIN'NY MARAINA",
    moodPrompt: "Inona ilay toe-po hoentinao miatrika ny anio ?",
    objLabel: "Ny tanjona anio",
    msgLabel: "Hafatra ho an'ny Tena",
    inpObj: "Inona no tanjonao manokana anio ?",
    inpMsg: "Manorata hafatra ho anao (teny fankasitrahana, firariana, fankaherezana,...)",
    moods: ["Sahisahy", "Milamindamina", "Velom-panantenana", "Be herimpo", "Feno fankasitrahana"]
  },
  evening: {
    malagasyTitle: "Ny Androany",
    modeTitle: "FISAINTSAINAN'NY ALINA",
    moodPrompt: "Inona ilay toe-po hoentinao maka aina anio alina?",
    objLabel: "Jeritodika",
    msgLabel: "Hafatra mamarana ny andro",
    inpObj: "Inona ny zavatra vita ?",
    inpMsg: "Manorata hafatra ho anao alohan'ny hatoriana",
    moods: ["Afa-po", "Tony", "Misaintsaina", "Faly amin'ny tena", "Manaiky ny zava-misy"]
  }
};

// State
let currentMode = new Date().getHours() < 16 ? 'morning' : 'evening';
let selectedMood = "";
let isCustomMood = false;

// DOM Elements
const els = {
  body: document.body,
  malagasyTitle: document.getElementById('malagasy-title'),
  dispMode: document.getElementById('disp-mode'),
  dispDate: document.getElementById('disp-date'),
  dispMood: document.getElementById('disp-mood'),
  dispObj: document.getElementById('disp-obj'),
  dispMsg: document.getElementById('disp-msg'),
  lblObj: document.getElementById('lbl-obj'),
  lblMsg: document.getElementById('lbl-msg'),
  lblMoodSelect: document.getElementById('lbl-mood-select'),
  lblInpObj: document.getElementById('lbl-inp-obj'),
  lblInpMsg: document.getElementById('lbl-inp-msg'),
  inpObj: document.getElementById('inp-obj'),
  inpMsg: document.getElementById('inp-msg'),
  customMoodInput: document.getElementById('custom-mood-input'),
  moodOptions: document.getElementById('mood-options'),
  metaDate: document.getElementById('meta-date'),
  starsContainer: document.querySelector('.stars')
};

// Initialization
function init() {
  // Generate random stars for evening
  for(let i=0; i<40; i++) {
    let s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.width = Math.random() * 3 + 'px';
    s.style.height = s.style.width;
    els.starsContainer.appendChild(s);
  }

  updateDate();
  loadData();
  renderUI();
  
  // Live preview
  els.inpObj.addEventListener('input', (e) => els.dispObj.textContent = e.target.value || "—");
  els.inpMsg.addEventListener('input', (e) => els.dispMsg.textContent = e.target.value || "—");
  
  // Custom mood input handler
  els.customMoodInput.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      selectedMood = e.target.value.trim();
      isCustomMood = true;
      els.dispMood.textContent = "Toe-po: " + selectedMood;
      document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    } else if (!selectedMood) {
      els.dispMood.textContent = "Toe-po: —";
    }
  });
}

function updateDate() {
  const d = new Date();
  const dayNames = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mey', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const dayName = dayNames[d.getDay()];
  const monthName = monthNames[d.getMonth()];
  const day = d.getDate();
  
  els.dispDate.textContent = `${dayName}, ${monthName} ${day}`;
  els.metaDate.textContent = d.toISOString().split('T')[0];
}

function renderUI() {
  els.body.className = currentMode === 'morning' ? 'theme-morning' : 'theme-evening';
  
  const txt = CONFIG[currentMode];
  els.malagasyTitle.textContent = txt.malagasyTitle;
  els.dispMode.textContent = txt.modeTitle;
  els.lblMoodSelect.textContent = txt.moodPrompt;
  els.lblObj.textContent = txt.objLabel;
  els.lblMsg.textContent = txt.msgLabel;
  els.lblInpObj.textContent = txt.inpObj;
  els.lblInpMsg.textContent = txt.inpMsg;

  els.moodOptions.innerHTML = '';
  txt.moods.forEach(m => {
    const btn = document.createElement('div');
    btn.className = `mood-btn ${(!isCustomMood && selectedMood === m) ? 'active' : ''}`;
    btn.textContent = m;
    btn.onclick = () => {
      selectedMood = m;
      isCustomMood = false;
      els.dispMood.textContent = "Toe-po: " + m;
      els.customMoodInput.value = '';
      renderUI(); 
    };
    els.moodOptions.appendChild(btn);
  });
}

function saveData() {
  const data = {
    mood: selectedMood,
    isCustomMood: isCustomMood,
    obj: els.inpObj.value,
    msg: els.inpMsg.value,
    date: els.metaDate.textContent
  };
  localStorage.setItem(`androany_${currentMode}`, JSON.stringify(data));
  alert("Voatahiry! Efa azo sintomina.");
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem(`androany_${currentMode}`));
  if (saved && saved.date === els.metaDate.textContent) {
    selectedMood = saved.mood;
    isCustomMood = saved.isCustomMood || false;
    els.inpObj.value = saved.obj;
    els.inpMsg.value = saved.msg;
    
    if (isCustomMood) {
      els.customMoodInput.value = selectedMood;
    } else {
      els.customMoodInput.value = '';
    }
    
    els.dispMood.textContent = "Toe-po: " + (selectedMood || "—");
    els.dispObj.textContent = saved.obj || "—";
    els.dispMsg.textContent = saved.msg || "—";
  } else {
    selectedMood = "";
    isCustomMood = false;
    els.inpObj.value = "";
    els.inpMsg.value = "";
    els.customMoodInput.value = "";
    els.dispMood.textContent = "Toe-po: —";
    els.dispObj.textContent = "—";
    els.dispMsg.textContent = "—";
  }
}

function resetData() {
  const confirmMsg = currentMode === 'morning' 
    ? "Mamafa ny voasoratra anio ?" 
    : "Mamafa ny voasoratra androany ?";
  
  if(confirm(confirmMsg)) {
    localStorage.removeItem(`androany_${currentMode}`);
    loadData();
    renderUI();
  }
}

function toggleMode() {
  currentMode = currentMode === 'morning' ? 'evening' : 'morning';
  loadData();
  renderUI();
}

async function downloadImage() {
  const card = document.getElementById('export-target');
  
  const originalBg = card.style.background;
  const originalColor = card.style.color;
  
  if (currentMode === 'morning') {
    card.style.background = 'linear-gradient(135deg, #93c5fd 0%, #eff6ff 100%)';
    card.style.color = '#1e3a8a';
  } else {
    card.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)';
    card.style.color = 'white';
  }

  try {
    const canvas = await html2canvas(card, {
      scale: 3, 
      useCORS: true, 
      backgroundColor: null,
      logging: false
    });
    
    const link = document.createElement('a');
    link.download = `anio-sy-androany-${currentMode}-${els.metaDate.textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    alert("Tsy afaka namoaka ny sary");
  } finally {
    card.style.background = originalBg;
    card.style.color = originalColor;
  }
}

// Start the app
init();
