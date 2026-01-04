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
  card: document.getElementById('export-target'),
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
  const monthNames = ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'];
  
  const dayName = dayNames[d.getDay()];
  const monthName = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  // Full date for card: "Sabotsy, 4 Janoary 2026"
  els.dispDate.textContent = `${dayName}, ${day} ${monthName} ${year}`;
  
  // Format as DD-MM-YYYY for footer
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  els.metaDate.textContent = `${dd}-${mm}-${yyyy}`;
}

function renderUI() {
  // Theme
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

function loadData() {
  // Reset to empty state (no localStorage)
  selectedMood = "";
  isCustomMood = false;
  els.inpObj.value = "";
  els.inpMsg.value = "";
  els.customMoodInput.value = "";
  els.dispMood.textContent = "Toe-po: —";
  els.dispObj.textContent = "—";
  els.dispMsg.textContent = "—";
}

function resetData() {
  const confirmMsg = currentMode === 'morning' 
    ? "Mamafa ny voasoratra anio ?" 
    : "Mamafa ny voasoratra androany ?";
  
  if(confirm(confirmMsg)) {
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
  
  // Create temporary canvas for decoration effects
  const decorationCanvas = document.createElement('canvas');
  decorationCanvas.style.position = 'absolute';
  decorationCanvas.style.top = '0';
  decorationCanvas.style.left = '0';
  decorationCanvas.style.width = '100%';
  decorationCanvas.style.height = '100%';
  decorationCanvas.style.pointerEvents = 'none';
  decorationCanvas.style.zIndex = '1';
  
  // Insert decoration canvas before capture area
  const captureArea = document.getElementById('capture-area');
  card.insertBefore(decorationCanvas, captureArea);
  
  // Set canvas size to match card
  const rect = card.getBoundingClientRect();
  decorationCanvas.width = rect.width;
  decorationCanvas.height = rect.height;
  
  const ctx = decorationCanvas.getContext('2d');
  
  if (currentMode === 'morning') {
    card.style.background = 'linear-gradient(135deg, #93c5fd 0%, #eff6ff 100%)';
    card.style.color = '#1e3a8a';
    
    // Draw 4 larger clouds
    drawClouds(ctx, decorationCanvas.width, decorationCanvas.height);
    
  } else {
    card.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)';
    card.style.color = 'white';
    
    // Draw subtle stars
    drawStars(ctx, decorationCanvas.width, decorationCanvas.height);
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
    // Remove decoration canvas
    card.removeChild(decorationCanvas);
    
    // Restore original styles
    card.style.background = originalBg;
    card.style.color = originalColor;
  }
}

// Draw 4 larger, fluffy clouds for morning cards
function drawClouds(ctx, width, height) {
  ctx.globalAlpha = 0.12; // More subtle
  
  const clouds = [
    { x: width * 0.20, y: height * 0.15, size: 80 },  // Larger clouds
    { x: width * 0.70, y: height * 0.25, size: 75 },
    { x: width * 0.35, y: height * 0.70, size: 70 },
    { x: width * 0.80, y: height * 0.60, size: 78 }
  ];
  
  clouds.forEach(cloud => {
    drawCloud(ctx, cloud.x, cloud.y, cloud.size);
  });
  
  ctx.globalAlpha = 1.0;
}

// Draw a single fluffy cloud
function drawCloud(ctx, x, y, size) {
  ctx.fillStyle = 'white';
  
  // Main cloud body (3 circles)
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x - size * 0.3, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.3, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x - size * 0.15, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

// Draw subtle starry sky for evening cards
function drawStars(ctx, width, height) {
  // Draw 50 stars - more subtle with lower opacity
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.8 + 0.3; // Smaller: 0.3 to 2.1px
    const opacity = Math.random() * 0.4 + 0.15; // Much more subtle: 0.15 to 0.55
    
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'white';
    
    // Mostly simple circle stars (less complex)
    if (Math.random() > 0.8) {
      // Only 20% are 4-pointed stars
      drawStar4Point(ctx, x, y, size);
    } else {
      // 80% are simple circles
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.globalAlpha = 1.0;
}

// Draw a 4-pointed star
function drawStar4Point(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  
  ctx.beginPath();
  ctx.moveTo(0, -size * 2);
  ctx.lineTo(size * 0.3, -size * 0.3);
  ctx.lineTo(size * 2, 0);
  ctx.lineTo(size * 0.3, size * 0.3);
  ctx.lineTo(0, size * 2);
  ctx.lineTo(-size * 0.3, size * 0.3);
  ctx.lineTo(-size * 2, 0);
  ctx.lineTo(-size * 0.3, -size * 0.3);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

// Start the app
init();
