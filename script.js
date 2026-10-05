/**
 * ==============================================================================
 * SMART BILL SPLITTER - JAVASCRIPT ENGINE (TECH EDITION)
 * Student Project: Fair & Exact Share Calculator for Friends
 * Pure Vanilla JavaScript - 100% Offline, Zero external dependencies/APIs
 * ==============================================================================
 */

// Global Application State
const state = {
  occasion: "Mario's Italian Bistro",
  currency: "$",
  billAmount: 0,
  peopleCount: 4,
  tipType: "percent", // "percent" or "flat"
  tipValue: 15,
  payerIndex: 0,
  personNames: ["Friend 1", "Friend 2", "Friend 3", "Friend 4"],
  lastCalculated: null,
  activeTab: "table", // "table" or "disc"
  soundEnabled: true,
  theme: "dark" // "dark" or "light"
};

// LocalStorage Keys
const STORAGE_KEY_STATE = "equisplit_app_state";
const STORAGE_KEY_HISTORY = "equisplit_history";
const STORAGE_KEY_THEME = "equisplit_theme";

// Cached DOM references
let dom = {};

/* ==========================================================================
   1. Initialization & Lifecycle
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  cacheDOMElements();
  initTheme();
  loadStateFromStorage();
  bindEventListeners();
  renderPersonNamesInputs();
  renderHistoryList();

  // If a valid previous calculation existed in storage, display it immediately (Requirement 5)
  if (state.lastCalculated && state.billAmount > 0 && state.peopleCount > 0) {
    calculateAndDisplaySplit(false, false);
  }
});

/**
 * Cache all DOM elements
 */
function cacheDOMElements() {
  dom = {
    // Top Bar & Controls
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIcon: document.getElementById("themeIcon"),
    themeLabel: document.getElementById("themeLabel"),
    soundToggleBtn: document.getElementById("soundToggleBtn"),
    soundIcon: document.getElementById("soundIcon"),

    // Form Inputs
    form: document.getElementById("splitForm"),
    occasionInput: document.getElementById("occasionInput"),
    currencySelect: document.getElementById("currencySelect"),
    billInput: document.getElementById("billInput"),
    peopleInput: document.getElementById("peopleInput"),
    decrementPeopleBtn: document.getElementById("decrementPeopleBtn"),
    incrementPeopleBtn: document.getElementById("incrementPeopleBtn"),

    // Tip Controls
    customTipToggle: document.getElementById("customTipToggle"),
    customTipInputBox: document.getElementById("customTipInputBox"),
    customTipInput: document.getElementById("customTipInput"),
    customTipTypeBtn: document.getElementById("customTipTypeBtn"),

    // Friends & Payer Accordion
    optionsToggleBtn: document.getElementById("optionsToggleBtn"),
    optionsContent: document.getElementById("optionsContent"),
    optionsIcon: document.getElementById("optionsIcon"),
    personNamesGrid: document.getElementById("personNamesGrid"),
    payerSelect: document.getElementById("payerSelect"),

    // Actions & Alert
    calculateBtn: document.getElementById("calculateBtn"),
    resetBtn: document.getElementById("resetBtn"),
    errorContainer: document.getElementById("errorContainer"),
    errorTitle: document.getElementById("errorTitle"),
    errorDesc: document.getElementById("errorDesc"),

    // Results Display
    resultsSection: document.getElementById("resultsSection"),
    emptyResultsState: document.getElementById("emptyResultsState"),
    resultsContent: document.getElementById("resultsContent"),
    resOccasion: document.getElementById("resOccasion"),
    resDate: document.getElementById("resDate"),
    resBillAmount: document.getElementById("resBillAmount"),
    resTipAmount: document.getElementById("resTipAmount"),
    resTipSub: document.getElementById("resTipSub"),
    resGrandTotal: document.getElementById("resGrandTotal"),
    resHeroShare: document.getElementById("resHeroShare"),
    resHeroShareSub: document.getElementById("resHeroShareSub"),
    exactMatchBadge: document.getElementById("exactMatchBadge"),
    exactMatchText: document.getElementById("exactMatchText"),
    tabTableView: document.getElementById("tabTableView"),
    tabDiscChart: document.getElementById("tabDiscChart"),
    sharesTableView: document.getElementById("sharesTableView"),
    sharesDiscView: document.getElementById("sharesDiscView"),
    discCanvas: document.getElementById("discCanvas"),
    discCenterTotal: document.getElementById("discCenterTotal"),
    discLegend: document.getElementById("discLegend"),
    ratioBarSummary: document.getElementById("ratioBarSummary"),
    ratioBillBar: document.getElementById("ratioBillBar"),
    ratioTipBar: document.getElementById("ratioTipBar"),
    sharesTableBody: document.getElementById("sharesTableBody"),
    previewReceiptBtn: document.getElementById("previewReceiptBtn"),
    copySummaryBtn: document.getElementById("copySummaryBtn"),
    saveSplitBtn: document.getElementById("saveSplitBtn"),

    // Receipt Modal Elements
    receiptModal: document.getElementById("receiptModal"),
    closeReceiptModalBtn: document.getElementById("closeReceiptModalBtn"),
    receiptShopName: document.getElementById("receiptShopName"),
    receiptDateTime: document.getElementById("receiptDateTime"),
    receiptSlipId: document.getElementById("receiptSlipId"),
    receiptSubtotal: document.getElementById("receiptSubtotal"),
    receiptTipLabel: document.getElementById("receiptTipLabel"),
    receiptTip: document.getElementById("receiptTip"),
    receiptGrandTotal: document.getElementById("receiptGrandTotal"),
    receiptPayer: document.getElementById("receiptPayer"),
    receiptFriendsList: document.getElementById("receiptFriendsList"),
    modalPrintBtn: document.getElementById("modalPrintBtn"),
    modalCopyBtn: document.getElementById("modalCopyBtn"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),

    // Mobile Bar
    mobileFloatingBar: document.getElementById("mobileFloatingBar"),
    mobileFloatingAmount: document.getElementById("mobileFloatingAmount"),
    mobileJumpBtn: document.getElementById("mobileJumpBtn"),

    // History
    historySearchInput: document.getElementById("historySearchInput"),
    historyList: document.getElementById("historyList"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),

    // Toast Notice
    toastNotice: document.getElementById("toastNotice"),
    toastMsg: document.getElementById("toastMsg")
  };
}

/* ==========================================================================
   2. Theme Switcher (Cyber Dark & Pearl Light)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "dark";
  applyTheme(savedTheme);
}

function applyTheme(themeName) {
  state.theme = themeName === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem(STORAGE_KEY_THEME, state.theme);

  if (dom.themeIcon && dom.themeLabel) {
    if (state.theme === "light") {
      dom.themeIcon.textContent = "☀️";
      dom.themeLabel.textContent = "Light";
    } else {
      dom.themeIcon.textContent = "🌙";
      dom.themeLabel.textContent = "Dark";
    }
  }
}

function toggleTheme() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  if (state.lastCalculated && typeof renderDiscChart === "function") {
    renderDiscChart(state.lastCalculated);
  }
  showToast(`Switched to ${nextTheme === "light" ? "Pearl Lavender" : "Cyber Purple"} theme ✨`);
  playClickSound();
}

/* ==========================================================================
   3. Event Listeners Binding
   ========================================================================== */
function bindEventListeners() {
  // Theme Toggle
  dom.themeToggleBtn.addEventListener("click", toggleTheme);

  // Sound Toggle
  dom.soundToggleBtn.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    dom.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
    showToast(state.soundEnabled ? "Audio feedback enabled" : "Audio muted");
    saveStateToStorage();
  });

  // Form submission
  dom.form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateAndDisplaySplit(true, true);
  });

  // Calculate Button
  dom.calculateBtn.addEventListener("click", () => {
    calculateAndDisplaySplit(true, true);
  });

  // Reset Button
  dom.resetBtn.addEventListener("click", handleReset);

  // Steppers for people count
  dom.decrementPeopleBtn.addEventListener("click", () => {
    const current = parseInt(dom.peopleInput.value, 10) || 1;
    if (current > 1) {
      updatePeopleCount(current - 1);
      playClickSound();
    }
  });

  dom.incrementPeopleBtn.addEventListener("click", () => {
    const current = parseInt(dom.peopleInput.value, 10) || 1;
    updatePeopleCount(current + 1);
    playClickSound();
  });

  // People input change
  dom.peopleInput.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      updatePeopleCount(val);
    }
  });

  // Prevent exponential / negative signs in number inputs
  [dom.billInput, dom.peopleInput, dom.customTipInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
        e.preventDefault();
      }
    });
  });

  // Currency select
  dom.currencySelect.addEventListener("change", (e) => {
    state.currency = e.target.value;
    saveStateToStorage();
    if (dom.resultsContent.classList.contains("visible")) {
      calculateAndDisplaySplit(false, false);
    }
  });

  // Occasion quick chips
  document.querySelectorAll(".occasion-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const occasionName = chip.getAttribute("data-occasion");
      dom.occasionInput.value = occasionName;
      state.occasion = occasionName;
      playClickSound();
      saveStateToStorage();
    });
  });

  // People count quick chips
  document.querySelectorAll(".people-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const count = parseInt(chip.getAttribute("data-count"), 10);
      updatePeopleCount(count);
      playClickSound();
    });
  });

  // Tip preset buttons
  document.querySelectorAll(".tip-btn").forEach((btn) => {
    if (btn.id === "customTipToggle") return;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tip-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tipPercent = parseFloat(btn.getAttribute("data-tip"));
      state.tipType = "percent";
      state.tipValue = tipPercent;

      dom.customTipInputBox.classList.remove("visible");
      dom.customTipInput.value = "";
      playClickSound();
      saveStateToStorage();

      if (dom.resultsContent.classList.contains("visible") && parseFloat(dom.billInput.value) > 0) {
        calculateAndDisplaySplit(false, false);
      }
    });
  });

  // Custom tip toggle
  dom.customTipToggle.addEventListener("click", () => {
    const isVisible = dom.customTipInputBox.classList.toggle("visible");
    if (isVisible) {
      document.querySelectorAll(".tip-btn").forEach((b) => b.classList.remove("active"));
      dom.customTipInput.focus();
    }
    playClickSound();
  });

  // Custom tip input
  dom.customTipInput.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value) || 0;
    state.tipValue = Math.max(0, val);
    saveStateToStorage();
    if (dom.resultsContent.classList.contains("visible") && parseFloat(dom.billInput.value) > 0) {
      calculateAndDisplaySplit(false, false);
    }
  });

  // Custom tip type toggle (% vs flat)
  dom.customTipTypeBtn.addEventListener("click", () => {
    if (state.tipType === "percent") {
      state.tipType = "flat";
      dom.customTipTypeBtn.textContent = "Flat (" + state.currency + ")";
    } else {
      state.tipType = "percent";
      dom.customTipTypeBtn.textContent = "Percent (%)";
    }
    playClickSound();
    saveStateToStorage();
    if (dom.resultsContent.classList.contains("visible") && parseFloat(dom.billInput.value) > 0) {
      calculateAndDisplaySplit(false, false);
    }
  });

  // Custom names accordion toggle
  dom.optionsToggleBtn.addEventListener("click", () => {
    const isVisible = dom.optionsContent.classList.toggle("visible");
    dom.optionsIcon.classList.toggle("rotated", isVisible);
    dom.optionsToggleBtn.setAttribute("aria-expanded", isVisible ? "true" : "false");
    playClickSound();
  });

  // Payer selector change
  dom.payerSelect.addEventListener("change", (e) => {
    state.payerIndex = parseInt(e.target.value, 10) || 0;
    saveStateToStorage();
    if (dom.resultsContent.classList.contains("visible")) {
      calculateAndDisplaySplit(false, false);
    }
  });

  // Mobile Jump Button
  dom.mobileJumpBtn.addEventListener("click", () => {
    dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Receipt Preview & Print Modal Triggers
  dom.previewReceiptBtn.addEventListener("click", openReceiptPreviewModal);
  dom.closeReceiptModalBtn.addEventListener("click", closeReceiptPreviewModal);
  dom.modalCloseBtn.addEventListener("click", closeReceiptPreviewModal);
  dom.modalPrintBtn.addEventListener("click", handlePrintReceipt);
  dom.modalCopyBtn.addEventListener("click", handleCopyReceiptText);

  // Close modal when clicking outside box
  dom.receiptModal.addEventListener("click", (e) => {
    if (e.target === dom.receiptModal) {
      closeReceiptPreviewModal();
    }
  });

  // Copy Summary button
  dom.copySummaryBtn.addEventListener("click", handleCopySummary);

  // Save Split button
  dom.saveSplitBtn.addEventListener("click", handleSaveToHistory);

  // Clear History button
  dom.clearHistoryBtn.addEventListener("click", handleClearHistory);

  // History search filter
  dom.historySearchInput.addEventListener("input", (e) => {
    renderHistoryList(e.target.value.trim().toLowerCase());
  });

  // Result View Switcher Tabs (Table vs Graphical Disc Chart)
  if (dom.tabTableView) {
    dom.tabTableView.addEventListener("click", () => switchResultView("table"));
  }
  if (dom.tabDiscChart) {
    dom.tabDiscChart.addEventListener("click", () => switchResultView("disc"));
  }
}

/* ==========================================================================
   4. Exact Mathematical Split Engine (Requirements 1, 2, 3, 4)
   ========================================================================== */

/**
 * Validates user input and computes fair penny-exact split
 * @param {boolean} triggerSound Play chime sound
 * @param {boolean} shouldScrollOnMobile Scroll down to result on mobile
 */
function calculateAndDisplaySplit(triggerSound = true, shouldScrollOnMobile = false) {
  const occasion = (dom.occasionInput.value || "Casual Gathering").trim();
  const billRaw = parseFloat(dom.billInput.value);
  const peopleRaw = parseInt(dom.peopleInput.value, 10);
  const currency = dom.currencySelect.value || "$";

  state.occasion = occasion;
  state.currency = currency;

  /* ----------------------------------------------------------------------
     Requirement 4: Shows a message and no result, if the bills or
     number of people is empty, zero or negative.
     ---------------------------------------------------------------------- */
  const errors = [];

  if (isNaN(billRaw) || billRaw <= 0) {
    errors.push("Bill amount must be a positive number greater than 0.");
  } else if (billRaw > 10000000) {
    errors.push("Bill amount exceeds maximum limit ($10,000,000).");
  }

  if (isNaN(peopleRaw) || peopleRaw < 1) {
    errors.push("Number of people must be at least 1 person.");
  } else if (peopleRaw > 200) {
    errors.push("Group size cannot exceed 200 people.");
  }

  if (errors.length > 0) {
    displayError("Calculation Notice", errors.join(" "));

    // Suppress results completely
    dom.resultsContent.classList.remove("visible");
    dom.emptyResultsState.style.display = "block";
    dom.mobileFloatingBar.classList.remove("active");
    state.lastCalculated = null;
    saveStateToStorage();
    playErrorSound();
    return;
  }

  // Clear errors when inputs are valid
  hideError();

  const bill = Math.round(billRaw * 100) / 100;
  const n = peopleRaw;
  state.billAmount = bill;
  state.peopleCount = n;

  // Calculate tip
  let tipAmount = 0;
  if (state.tipType === "percent") {
    tipAmount = (bill * Math.max(0, state.tipValue)) / 100;
  } else {
    tipAmount = Math.max(0, state.tipValue);
  }
  tipAmount = Math.round(tipAmount * 100) / 100;

  const grandTotal = bill + tipAmount;

  /* ----------------------------------------------------------------------
     Requirement 3: Exact Penny Allocation Algorithm
     Converts grand total into integer cents to eradicate IEEE 754 float
     discrepancies and ensures individual shares add up EXACTLY to total.
     ---------------------------------------------------------------------- */
  const totalCents = Math.round(grandTotal * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents % n;

  ensurePersonNamesArray(n);

  const individualShares = [];
  let calculatedSumCents = 0;

  for (let i = 0; i < n; i++) {
    // First remainderCents get 1 extra cent so sum matches grandTotal precisely
    const personCents = i < remainderCents ? baseCents + 1 : baseCents;
    calculatedSumCents += personCents;

    individualShares.push({
      index: i,
      name: state.personNames[i] || `Friend ${i + 1}`,
      share: personCents / 100,
      shareCents: personCents,
      isPayer: i === state.payerIndex
    });
  }

  const exactSum = calculatedSumCents / 100;
  const isExactMatch = Math.abs(exactSum - grandTotal) < 0.001;

  // Update State Calculation Object
  state.lastCalculated = {
    occasion,
    bill,
    tipAmount,
    tipPercent: state.tipType === "percent" ? state.tipValue : ((tipAmount / (bill || 1)) * 100).toFixed(1),
    grandTotal: exactSum,
    peopleCount: n,
    shares: individualShares,
    isExactMatch,
    slipId: `EQS-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  };

  // Render to DOM
  renderResultsView(state.lastCalculated, remainderCents);

  // Save to localStorage (Requirement 5)
  saveStateToStorage();

  if (triggerSound) {
    playSuccessSound();
  }

  // Smooth scroll to results on mobile
  if (shouldScrollOnMobile && window.innerWidth <= 960) {
    setTimeout(() => {
      dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }
}

/**
 * Update Results Section in DOM
 */
function renderResultsView(calc, remainderCents) {
  const sym = state.currency;

  dom.resOccasion.textContent = calc.occasion;
  dom.resDate.textContent = `${calc.date} · ${calc.timestamp}`;

  dom.resBillAmount.textContent = formatCurrency(calc.bill, sym);
  dom.resTipAmount.textContent = formatCurrency(calc.tipAmount, sym);
  dom.resTipSub.textContent = `(${state.tipType === "percent" ? state.tipValue + "%" : "flat"} tip)`;
  dom.resGrandTotal.textContent = formatCurrency(calc.grandTotal, sym);

  // Hero Card Range / Average
  const sharesOnly = calc.shares.map(s => s.share);
  const minShare = Math.min(...sharesOnly);
  const maxShare = Math.max(...sharesOnly);

  if (minShare === maxShare) {
    dom.resHeroShare.textContent = formatCurrency(minShare, sym);
    dom.resHeroShareSub.textContent = `Evenly split across all ${calc.peopleCount} friends`;
    dom.mobileFloatingAmount.textContent = formatCurrency(minShare, sym);
  } else {
    dom.resHeroShare.textContent = formatCurrency(maxShare, sym);
    dom.resHeroShareSub.textContent = `${remainderCents} friends pay ${formatCurrency(maxShare, sym)} & ${calc.peopleCount - remainderCents} pay ${formatCurrency(minShare, sym)}`;
    dom.mobileFloatingAmount.textContent = `~${formatCurrency(maxShare, sym)}`;
  }

  // Exact Match Guarantee Banner (Requirement 3)
  if (calc.isExactMatch) {
    dom.exactMatchBadge.style.display = "flex";
    dom.exactMatchText.innerHTML = `<strong>Exact Balance Guaranteed:</strong> The sum of individual shares (${formatCurrency(calc.grandTotal, sym)}) adds up precisely to the total bill. Zero cents lost.`;
  } else {
    dom.exactMatchBadge.style.display = "none";
  }

  // Render Table Rows
  dom.sharesTableBody.innerHTML = "";
  const payerName = calc.shares[state.payerIndex]?.name || "Friend 1";

  calc.shares.forEach((person, idx) => {
    const tr = document.createElement("tr");

    let settlementText = "";
    if (person.isPayer) {
      const netToCollect = calc.grandTotal - person.share;
      settlementText = `<span class="person-status-note payer">Paid bill upfront · Collects ${formatCurrency(netToCollect, sym)} total</span>`;
    } else {
      settlementText = `<span class="settlement-note">Owes ${escapeHTML(payerName)} ${formatCurrency(person.share, sym)}</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="person-cell">
          <div class="person-avatar">${getInitials(person.name, idx + 1)}</div>
          <div class="person-info">
            <span class="person-title">${escapeHTML(person.name)} ${person.isPayer ? "👑" : ""}</span>
            ${settlementText}
          </div>
        </div>
      </td>
      <td class="share-amount-cell">
        ${formatCurrency(person.share, sym)}
      </td>
    `;
    dom.sharesTableBody.appendChild(tr);
  });

  // Reveal results and show mobile floating bar
  dom.emptyResultsState.style.display = "none";
  dom.resultsContent.classList.add("visible");
  dom.mobileFloatingBar.classList.add("active");

  // Render Graphical Disc Chart & Ratio Bar
  renderDiscChart(calc);
  updateRatioBar(calc);

  // Preserve the selected view tab (Table or Disc)
  switchResultView(state.activeTab || "table", false);
}

/* ==========================================================================
   4b. Graphical Disc Chart & Visual Ratio Engine (100% Offline Canvas)
   ========================================================================== */
const SLICE_COLORS = [
  "#a855f7", // cyber purple
  "#06b6d4", // electric cyan
  "#ec4899", // neon pink
  "#10b981", // emerald green
  "#f59e0b", // bright amber
  "#3b82f6", // royal blue
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f43f5e", // neon rose
  "#6366f1"  // indigo
];

let currentHoveredSlice = -1;

function switchResultView(viewName, playSound = true) {
  state.activeTab = viewName === "disc" ? "disc" : "table";
  const isDisc = state.activeTab === "disc";

  if (dom.tabTableView && dom.tabDiscChart) {
    dom.tabTableView.classList.toggle("active", !isDisc);
    dom.tabTableView.setAttribute("aria-selected", !isDisc ? "true" : "false");
    dom.tabDiscChart.classList.toggle("active", isDisc);
    dom.tabDiscChart.setAttribute("aria-selected", isDisc ? "true" : "false");
  }

  if (dom.sharesTableView && dom.sharesDiscView) {
    dom.sharesTableView.style.display = isDisc ? "none" : "block";
    dom.sharesDiscView.style.display = isDisc ? "block" : "none";
  }

  if (isDisc && state.lastCalculated) {
    renderDiscChart(state.lastCalculated);
    updateRatioBar(state.lastCalculated);
  }

  saveStateToStorage();
  if (playSound) playClickSound();
}

function renderDiscChart(calc) {
  if (!dom.discCanvas) return;
  const canvas = dom.discCanvas;
  const dpr = window.devicePixelRatio || 1;
  const size = 260;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d");
  if (ctx.resetTransform) {
    ctx.resetTransform();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.scale(dpr, dpr);

  const centerX = size / 2;
  const centerY = size / 2;
  const outerR = 110;
  const innerR = 66;

  const total = calc.grandTotal;
  const sym = state.currency;

  if (total <= 0 || !calc.shares || calc.shares.length === 0) {
    ctx.clearRect(0, 0, size, size);
    return;
  }

  // Pre-calculate slice angles starting from 12 o'clock (-PI / 2)
  const sliceAngles = [];
  let currentAngle = -Math.PI / 2;

  calc.shares.forEach((person, idx) => {
    const fraction = total > 0 ? person.share / total : 1 / calc.shares.length;
    const angle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    sliceAngles.push({ startAngle, endAngle, person, idx, fraction });
    currentAngle = endAngle;
  });

  function draw(hoverIndex = -1) {
    ctx.clearRect(0, 0, size, size);

    sliceAngles.forEach((slice, idx) => {
      const isHovered = hoverIndex === idx;
      const color = SLICE_COLORS[idx % SLICE_COLORS.length];
      const rOuter = isHovered ? outerR + 6 : outerR;
      const rInner = isHovered ? innerR - 2 : innerR;

      ctx.beginPath();
      ctx.arc(centerX, centerY, rOuter, slice.startAngle, slice.endAngle);
      ctx.arc(centerX, centerY, rInner, slice.endAngle, slice.startAngle, true);
      ctx.closePath();

      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = color;
      ctx.fill();

      // Sharp separation seam
      ctx.strokeStyle = state.theme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(10, 14, 28, 0.95)";
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
  }

  draw(currentHoveredSlice);

  // Mouse interactivity
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let hoveredIdx = -1;
    if (dist >= innerR - 6 && dist <= outerR + 10) {
      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) {
        angle += 2 * Math.PI;
      }
      hoveredIdx = sliceAngles.findIndex((s) => angle >= s.startAngle && angle < s.endAngle);
    }

    if (hoveredIdx !== currentHoveredSlice) {
      currentHoveredSlice = hoveredIdx;
      draw(currentHoveredSlice);

      if (hoveredIdx !== -1) {
        const p = sliceAngles[hoveredIdx].person;
        dom.discCenterTotal.textContent = formatCurrency(p.share, sym);
        if (dom.discCenterTotal.nextElementSibling) {
          dom.discCenterTotal.nextElementSibling.textContent = p.name.toUpperCase();
        }
      } else {
        dom.discCenterTotal.textContent = formatCurrency(total, sym);
        if (dom.discCenterTotal.nextElementSibling) {
          dom.discCenterTotal.nextElementSibling.textContent = "TOTAL BILL";
        }
      }
    }
  };

  canvas.onmouseleave = () => {
    currentHoveredSlice = -1;
    draw(-1);
    dom.discCenterTotal.textContent = formatCurrency(total, sym);
    if (dom.discCenterTotal.nextElementSibling) {
      dom.discCenterTotal.nextElementSibling.textContent = "TOTAL BILL";
    }
  };

  // Center Badge
  dom.discCenterTotal.textContent = formatCurrency(total, sym);
  if (dom.discCenterTotal.nextElementSibling) {
    dom.discCenterTotal.nextElementSibling.textContent = "TOTAL BILL";
  }

  // Populate Interactive Legend Items
  if (dom.discLegend) {
    dom.discLegend.innerHTML = "";
    calc.shares.forEach((person, idx) => {
      const color = SLICE_COLORS[idx % SLICE_COLORS.length];
      const pct = total > 0 ? ((person.share / total) * 100).toFixed(1) : "0.0";
      const item = document.createElement("div");
      item.className = "disc-legend-item";
      item.innerHTML = `
        <div class="disc-legend-left">
          <span class="disc-legend-color" style="background-color: ${color}; box-shadow: 0 0 8px ${color};"></span>
          <span class="disc-legend-name">${escapeHTML(person.name)} ${person.isPayer ? "👑" : ""}</span>
        </div>
        <div class="disc-legend-right">
          <span class="disc-legend-share">${formatCurrency(person.share, sym)}</span>
          <span class="disc-legend-pct">${pct}%</span>
        </div>
      `;

      item.addEventListener("mouseenter", () => {
        currentHoveredSlice = idx;
        draw(idx);
        dom.discCenterTotal.textContent = formatCurrency(person.share, sym);
        if (dom.discCenterTotal.nextElementSibling) {
          dom.discCenterTotal.nextElementSibling.textContent = person.name.toUpperCase();
        }
      });

      item.addEventListener("mouseleave", () => {
        currentHoveredSlice = -1;
        draw(-1);
        dom.discCenterTotal.textContent = formatCurrency(total, sym);
        if (dom.discCenterTotal.nextElementSibling) {
          dom.discCenterTotal.nextElementSibling.textContent = "TOTAL BILL";
        }
      });

      dom.discLegend.appendChild(item);
    });
  }
}

function updateRatioBar(calc) {
  if (!dom.ratioBarSummary || !dom.ratioBillBar || !dom.ratioTipBar) return;
  if (!calc || calc.grandTotal <= 0) return;

  const billPct = Math.min(100, Math.max(0, Math.round((calc.bill / calc.grandTotal) * 100)));
  const tipPct = 100 - billPct;
  dom.ratioBarSummary.textContent = `${billPct}% Subtotal · ${tipPct}% Tip (${formatCurrency(calc.tipAmount, state.currency)})`;
  dom.ratioBillBar.style.width = `${billPct}%`;
  dom.ratioTipBar.style.width = `${tipPct}%`;
}

/* ==========================================================================
   5. Interactive Receipt Preview Modal (Proof of Split)
   ========================================================================== */
function openReceiptPreviewModal() {
  if (!state.lastCalculated) {
    calculateAndDisplaySplit(true, false);
    if (!state.lastCalculated) return;
  }

  const calc = state.lastCalculated;
  const sym = state.currency;
  const payerName = calc.shares[state.payerIndex]?.name || "Friend 1";

  // Shop / Venue Name
  dom.receiptShopName.textContent = (calc.occasion || "OFFICIAL VENUE").toUpperCase();

  // Date and Time of split proof
  dom.receiptDateTime.textContent = `Date: ${calc.date} · ${calc.timestamp}`;
  dom.receiptSlipId.textContent = `REF: #${calc.slipId}`;

  // Amounts
  dom.receiptSubtotal.textContent = formatCurrency(calc.bill, sym);
  dom.receiptTipLabel.textContent = `Tip Added (${state.tipType === "percent" ? state.tipValue + "%" : "Flat"})`;
  dom.receiptTip.textContent = formatCurrency(calc.tipAmount, sym);
  dom.receiptGrandTotal.textContent = formatCurrency(calc.grandTotal, sym);
  dom.receiptPayer.textContent = `${payerName} (Settled upfront)`;

  // Itemized shares list
  dom.receiptFriendsList.innerHTML = "";
  calc.shares.forEach((person) => {
    const row = document.createElement("div");
    row.className = "receipt-friend-row";
    row.innerHTML = `
      <span>${escapeHTML(person.name)} ${person.isPayer ? "👑 (Payer)" : ""}</span>
      <strong>${formatCurrency(person.share, sym)}</strong>
    `;
    dom.receiptFriendsList.appendChild(row);
  });

  dom.receiptModal.classList.add("open");
  playClickSound();
}

function closeReceiptPreviewModal() {
  dom.receiptModal.classList.remove("open");
  playClickSound();
}

/**
 * Robust print handler with try-catch fallback for sandboxed iframes
 */
function handlePrintReceipt() {
  playClickSound();

  try {
    // Attempt standard browser print
    window.print();
  } catch (err) {
    console.warn("window.print() restricted in iframe sandbox:", err);
    // Graceful fallback: copy formatted slip text so user never faces a dead click
    handleCopyReceiptText();
    showToast("Print preview: Receipt text copied to clipboard! 📋");
  }
}

/**
 * Copies the formatted physical receipt slip text to clipboard
 */
function handleCopyReceiptText() {
  if (!state.lastCalculated) return;
  const calc = state.lastCalculated;
  const sym = state.currency;
  const payerName = calc.shares[state.payerIndex]?.name || "Friend 1";

  let receiptText = `====================================\n`;
  receiptText += `      ${(calc.occasion || "VENUE").toUpperCase()}\n`;
  receiptText += `   OFFICIAL BILL SPLIT RECEIPT PROOF\n`;
  receiptText += `Date: ${calc.date} · Time: ${calc.timestamp}\n`;
  receiptText += `Reference: #${calc.slipId}\n`;
  receiptText += `------------------------------------\n`;
  receiptText += `Subtotal:      ${formatCurrency(calc.bill, sym)}\n`;
  receiptText += `Tip Added:     ${formatCurrency(calc.tipAmount, sym)} (${state.tipType === "percent" ? state.tipValue + "%" : "flat"})\n`;
  receiptText += `------------------------------------\n`;
  receiptText += `GRAND TOTAL:   ${formatCurrency(calc.grandTotal, sym)}\n`;
  receiptText += `Paid By:       ${payerName}\n`;
  receiptText += `------------------------------------\n`;
  receiptText += `ITEMIZED SHARES:\n`;

  calc.shares.forEach((person) => {
    const mark = person.isPayer ? " [Paid upfront]" : "";
    receiptText += ` • ${person.name}: ${formatCurrency(person.share, sym)}${mark}\n`;
  });

  receiptText += `------------------------------------\n`;
  receiptText += `✓ MATHEMATICAL BALANCE GUARANTEED\n`;
  receiptText += `Calculated with EquiSplit.io\n`;
  receiptText += `====================================\n`;

  fallbackCopy(receiptText);
  showToast("Receipt copied to clipboard! 📋");
  playClickSound();
}

/* ==========================================================================
   6. People & Custom Names Management
   ========================================================================== */
function ensurePersonNamesArray(count) {
  while (state.personNames.length < count) {
    state.personNames.push(`Friend ${state.personNames.length + 1}`);
  }
  if (state.personNames.length > count) {
    state.personNames = state.personNames.slice(0, count);
  }
  if (state.payerIndex >= count) {
    state.payerIndex = 0;
  }
}

function updatePeopleCount(newCount) {
  const count = Math.max(1, Math.min(200, newCount));
  dom.peopleInput.value = count;
  state.peopleCount = count;

  document.querySelectorAll(".people-chip").forEach((chip) => {
    const chipVal = parseInt(chip.getAttribute("data-count"), 10);
    chip.classList.toggle("active", chipVal === count);
  });

  ensurePersonNamesArray(count);
  renderPersonNamesInputs();
  saveStateToStorage();

  if (dom.resultsContent.classList.contains("visible") && parseFloat(dom.billInput.value) > 0) {
    calculateAndDisplaySplit(false, false);
  }
}

function renderPersonNamesInputs() {
  dom.personNamesGrid.innerHTML = "";
  dom.payerSelect.innerHTML = "";

  ensurePersonNamesArray(state.peopleCount);

  state.personNames.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "person-name-item";

    const badge = document.createElement("span");
    badge.className = "person-badge";
    badge.textContent = `#${index + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "person-name-input";
    input.value = name;
    input.placeholder = `Friend ${index + 1}`;
    input.maxLength = 30;

    input.addEventListener("input", (e) => {
      state.personNames[index] = e.target.value.trim() || `Friend ${index + 1}`;
      updatePayerDropdown();
      saveStateToStorage();
      if (dom.resultsContent.classList.contains("visible")) {
        calculateAndDisplaySplit(false, false);
      }
    });

    item.appendChild(badge);
    item.appendChild(input);
    dom.personNamesGrid.appendChild(item);

    const option = document.createElement("option");
    option.value = index;
    option.textContent = name || `Friend ${index + 1}`;
    if (index === state.payerIndex) {
      option.selected = true;
    }
    dom.payerSelect.appendChild(option);
  });
}

function updatePayerDropdown() {
  const currentVal = parseInt(dom.payerSelect.value, 10);
  dom.payerSelect.innerHTML = "";
  state.personNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name;
    if (index === currentVal) {
      option.selected = true;
    }
    dom.payerSelect.appendChild(option);
  });
}

/* ==========================================================================
   7. Validation & Error Alerts (Requirement 4)
   ========================================================================== */
function displayError(title, message) {
  dom.errorTitle.textContent = title;
  dom.errorDesc.textContent = message;
  dom.errorContainer.classList.add("visible");
}

function hideError() {
  dom.errorContainer.classList.remove("visible");
}

/* ==========================================================================
   8. Storage Persistence Across Reloads (Requirement 5)
   ========================================================================== */
function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (err) {
    console.warn("Storage save failed:", err);
  }
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (!raw) return;

    const saved = JSON.parse(raw);
    if (saved) {
      state.occasion = saved.occasion || state.occasion;
      state.currency = saved.currency || state.currency;
      state.billAmount = saved.billAmount || 0;
      state.peopleCount = saved.peopleCount || 4;
      state.tipType = saved.tipType || "percent";
      state.tipValue = saved.tipValue !== undefined ? saved.tipValue : 15;
      state.payerIndex = saved.payerIndex || 0;
      state.personNames = Array.isArray(saved.personNames) ? saved.personNames : state.personNames;
      state.lastCalculated = saved.lastCalculated || null;
      state.soundEnabled = saved.soundEnabled !== undefined ? saved.soundEnabled : true;
      state.activeTab = saved.activeTab || "table";

      // Restore form controls
      if (dom.occasionInput) dom.occasionInput.value = state.occasion;
      if (dom.currencySelect) dom.currencySelect.value = state.currency;
      if (dom.billInput && state.billAmount > 0) dom.billInput.value = state.billAmount;
      if (dom.peopleInput) dom.peopleInput.value = state.peopleCount;
      if (dom.soundIcon) dom.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";

      // Restore tip buttons
      if (state.tipType === "percent") {
        document.querySelectorAll(".tip-btn").forEach((btn) => {
          const btnVal = parseFloat(btn.getAttribute("data-tip"));
          btn.classList.toggle("active", btnVal === state.tipValue);
        });
      } else {
        dom.customTipInputBox.classList.add("visible");
        dom.customTipInput.value = state.tipValue;
        dom.customTipTypeBtn.textContent = "Flat (" + state.currency + ")";
      }
    }
  } catch (err) {
    console.warn("Storage load failed:", err);
  }
}

/* ==========================================================================
   9. History of Saved Calculations with Search Filter
   ========================================================================== */
function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(arr) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(arr));
  } catch (err) {
    console.warn("History save error:", err);
  }
}

function handleSaveToHistory() {
  if (!state.lastCalculated) return;

  const history = getHistory();
  const entry = {
    id: "split_" + Date.now(),
    occasion: state.lastCalculated.occasion,
    currency: state.currency,
    bill: state.lastCalculated.bill,
    grandTotal: state.lastCalculated.grandTotal,
    peopleCount: state.lastCalculated.peopleCount,
    perPerson: (state.lastCalculated.grandTotal / state.lastCalculated.peopleCount).toFixed(2),
    timestamp: `${state.lastCalculated.date} ${state.lastCalculated.timestamp}`,
    data: JSON.parse(JSON.stringify(state))
  };

  history.unshift(entry);
  if (history.length > 25) history.pop();

  saveHistory(history);
  renderHistoryList();
  showToast("Split saved to history! 💾");
  playClickSound();
}

function renderHistoryList(filterQuery = "") {
  let history = getHistory();
  dom.historyList.innerHTML = "";

  if (filterQuery) {
    history = history.filter(item => 
      item.occasion.toLowerCase().includes(filterQuery) ||
      item.timestamp.toLowerCase().includes(filterQuery) ||
      String(item.grandTotal).includes(filterQuery)
    );
  }

  if (history.length === 0) {
    dom.historyList.innerHTML = `<div class="empty-history-text">${filterQuery ? "No matching saved splits found." : "No saved splits yet. Click 'Save to History' after calculating to keep a record."}</div>`;
    dom.clearHistoryBtn.style.display = "none";
    return;
  }

  dom.clearHistoryBtn.style.display = "inline-flex";

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <div class="history-item-top">
          <span class="history-item-occasion">${escapeHTML(item.occasion)}</span>
          <span class="history-item-time">${escapeHTML(item.timestamp)}</span>
        </div>
        <div class="history-item-details">
          <span>Total: <strong class="history-item-total">${item.currency}${Number(item.grandTotal).toFixed(2)}</strong></span>
          <span>👥 ${item.peopleCount} friends</span>
          <span>~${item.currency}${item.perPerson} / person</span>
        </div>
      </div>
      <div class="history-item-actions">
        <button type="button" class="btn-ghost load-history-btn edge-lit" data-id="${item.id}">📂 Load</button>
        <button type="button" class="btn-ghost delete-history-btn" data-id="${item.id}" style="color: #f87171;">✕</button>
      </div>
    `;

    div.querySelector(".load-history-btn").addEventListener("click", () => {
      loadHistoryEntry(item);
    });

    div.querySelector(".delete-history-btn").addEventListener("click", () => {
      deleteHistoryEntry(item.id);
    });

    dom.historyList.appendChild(div);
  });
}

function loadHistoryEntry(entry) {
  if (!entry || !entry.data) return;

  const data = entry.data;
  state.occasion = data.occasion;
  state.currency = data.currency;
  state.billAmount = data.billAmount;
  state.peopleCount = data.peopleCount;
  state.tipType = data.tipType;
  state.tipValue = data.tipValue;
  state.personNames = data.personNames;
  state.payerIndex = data.payerIndex;

  dom.occasionInput.value = state.occasion;
  dom.currencySelect.value = state.currency;
  dom.billInput.value = state.billAmount;
  dom.peopleInput.value = state.peopleCount;

  renderPersonNamesInputs();
  calculateAndDisplaySplit(true, true);
  showToast(`Loaded split: ${entry.occasion}`);
}

function deleteHistoryEntry(id) {
  let history = getHistory();
  history = history.filter(item => item.id !== id);
  saveHistory(history);
  renderHistoryList(dom.historySearchInput.value.trim().toLowerCase());
  showToast("Split removed from history");
}

function handleClearHistory() {
  if (confirm("Are you sure you want to clear all saved splits?")) {
    saveHistory([]);
    renderHistoryList();
    showToast("History cleared");
  }
}

/* ==========================================================================
   10. Group Chat Summary Formatter & Clipboard
   ========================================================================== */
function handleCopySummary() {
  if (!state.lastCalculated) return;

  const calc = state.lastCalculated;
  const sym = state.currency;
  const payerName = calc.shares[state.payerIndex]?.name || "Friend 1";

  let text = `🧾 *${calc.occasion}* - Bill Split Summary\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 Bill Amount: ${formatCurrency(calc.bill, sym)}\n`;
  text += `✨ Tip Added: ${formatCurrency(calc.tipAmount, sym)} (${state.tipType === "percent" ? state.tipValue + "%" : "flat"})\n`;
  text += `💳 Total Bill: ${formatCurrency(calc.grandTotal, sym)}\n`;
  text += `👑 Paid upfront by: ${payerName}\n\n`;
  text += `👥 Individual Shares Breakdown:\n`;

  calc.shares.forEach((person) => {
    const mark = person.isPayer ? " (Paid bill)" : "";
    text += ` • ${person.name}: ${formatCurrency(person.share, sym)}${mark}\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Exact Check: Sum of shares = ${formatCurrency(calc.grandTotal, sym)} (Balanced!)\n`;
  text += `Calculated with EquiSplit.io`;

  fallbackCopy(text);
  showToast("Summary copied to clipboard! 📋 Ready for group chat");
  playClickSound();
}

function fallbackCopy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      execCommandCopy(text);
    });
  } else {
    execCommandCopy(text);
  }
}

function execCommandCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
  } catch (e) {
    // Graceful fallback
  }
  document.body.removeChild(area);
}

/* ==========================================================================
   11. Form Reset
   ========================================================================== */
function handleReset() {
  dom.form.reset();
  dom.occasionInput.value = "Mario's Italian Bistro";
  dom.billInput.value = "";
  dom.currencySelect.value = "$";
  updatePeopleCount(4);

  state.tipType = "percent";
  state.tipValue = 15;
  document.querySelectorAll(".tip-btn").forEach((btn) => {
    const val = parseFloat(btn.getAttribute("data-tip"));
    btn.classList.toggle("active", val === 15);
  });
  dom.customTipInputBox.classList.remove("visible");
  dom.customTipInput.value = "";

  state.payerIndex = 0;
  state.personNames = ["Friend 1", "Friend 2", "Friend 3", "Friend 4"];
  state.lastCalculated = null;
  state.activeTab = "table";
  switchResultView("table", false);

  renderPersonNamesInputs();
  hideError();
  dom.resultsContent.classList.remove("visible");
  dom.emptyResultsState.style.display = "block";
  dom.mobileFloatingBar.classList.remove("active");

  saveStateToStorage();
  showToast("Reset all inputs to defaults 🔄");
  playClickSound();
}

/* ==========================================================================
   12. Web Audio API Synthetic Feedback (100% Offline, Zero external assets)
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!state.soundEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch {
    // Graceful silence
  }
}

function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);

      gain.gain.setValueAtTime(0.1, now + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.22);
    });
  } catch {
    // Graceful silence
  }
}

function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Graceful silence
  }
}

/* ==========================================================================
   13. Utilities & Toast
   ========================================================================== */
function formatCurrency(amount, symbol = "$") {
  return symbol + Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getInitials(name, fallbackNum) {
  if (!name || name.trim() === "") return `F${fallbackNum}`;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let toastTimer = null;
function showToast(message) {
  if (!dom.toastNotice || !dom.toastMsg) return;

  dom.toastMsg.textContent = message;
  dom.toastNotice.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toastNotice.classList.remove("show");
  }, 3000);
}
