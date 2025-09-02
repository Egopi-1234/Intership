const expiryRules = {
  apple: 60,
  milk: 7,
  biscuit: 180,
  chocolate: 365,
  bread: 5,
  tomato: 10,
  rice: 365,
  cheese: 14,
  yogurt: 10,
  carrot: 14,
  banana: 7,
  onion: 30,
  potato: 90,
};

const form = document.getElementById("expiryForm");
const productInput = document.getElementById("product");
const mfgInput = document.getElementById("mfg");
const resultDiv = document.getElementById("result");
const historyTableBody = document.querySelector("#historyTable tbody");
const resetBtn = document.getElementById("resetBtn");

mfgInput.max = new Date().toISOString().split("T")[0];

let historyData = JSON.parse(localStorage.getItem("expiryHistory")) || [];
renderHistory();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  startLoading();
  // Simulate processing delay
  setTimeout(() => {
    predictExpiry();
    stopLoading();
  }, 1200);
});

resetBtn.addEventListener("click", resetForm);

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", !expanded);
    const answer = document.getElementById(btn.getAttribute("aria-controls"));
    if (answer) {
      if (!expanded) {
        answer.hidden = false;
      } else {
        setTimeout(() => {
          answer.hidden = true;
        }, 450); // matches CSS transition duration
      }
    }
  });
});

function startLoading() {
  document.getElementById("predictBtn").classList.add("loading");
  document.getElementById("predictBtn").disabled = true;
  resetBtn.disabled = true;
  resultDiv.innerHTML = "";
  resultDiv.style.opacity = 0;
}

function stopLoading() {
  document.getElementById("predictBtn").classList.remove("loading");
  document.getElementById("predictBtn").disabled = false;
  resetBtn.disabled = false;
  // fade in handled by showResult()
}

function predictExpiry() {
  const product = productInput.value.trim().toLowerCase();
  const mfgDateStr = mfgInput.value;

  if (!product || !mfgDateStr) {
    showResult("❗ Please enter both product name and manufacture date.", false);
    return;
  }

  const expiryDays = expiryRules[product];
  if (!expiryDays) {
    showResult("❌ Product not found. Try another product.", false);
    return;
  }

  const mfgDate = new Date(mfgDateStr);
  if (mfgDate > new Date()) {
    showResult("❗ Manufacture date cannot be in the future.", false);
    return;
  }

  const expiryDate = new Date(mfgDate);
  expiryDate.setDate(mfgDate.getDate() + expiryDays);

  const today = new Date();
  const isExpired = expiryDate < today;

  const expiryDateStr = expiryDate.toDateString();

  showResult(
    `📅 Expiry Date: <b>${expiryDateStr}</b> — <span class="${
      isExpired ? "status-expired" : "status-safe"
    }">${isExpired ? "Expired" : "Safe"}</span>`,
    true
  );

  addHistory(product, mfgDate, expiryDate, isExpired);
}

function showResult(message, success = true) {
  resultDiv.innerHTML = message;
  resultDiv.className = success ? "" : "error";
  resultDiv.style.opacity = 1;
}

function addHistory(product, mfgDate, expiryDate, isExpired) {
  const newEntry = {
    id: Date.now(),
    product,
    mfgDate: mfgDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    isExpired,
  };
  historyData.unshift(newEntry);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  historyTableBody.innerHTML = "";
  if (historyData.length === 0) {
    const row = historyTableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "No prediction history yet.";
    cell.style.fontStyle = "italic";
    cell.style.color = "#666";
    return;
  }
  historyData.forEach(({ id, product, mfgDate, expiryDate, isExpired }) => {
    const row = historyTableBody.insertRow();
    row.setAttribute("data-id", id);

    const prodCell = row.insertCell();
    prodCell.textContent = capitalize(product);

    const mfgCell = row.insertCell();
    mfgCell.textContent = new Date(mfgDate).toDateString();

    const expCell = row.insertCell();
    expCell.textContent = new Date(expiryDate).toDateString();

    const statusCell = row.insertCell();
    statusCell.textContent = isExpired ? "Expired" : "Safe";
    statusCell.className = isExpired ? "status-expired" : "status-safe";

    const actionCell = row.insertCell();
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "action-btn";
    delBtn.setAttribute("aria-label", `Delete history entry for ${product}`);
    delBtn.addEventListener("click", () => deleteHistoryEntry(id));
    actionCell.appendChild(delBtn);
  });
}

function deleteHistoryEntry(id) {
  historyData = historyData.filter((entry) => entry.id !== id);
  saveHistory();
  renderHistory();
}

function saveHistory() {
  localStorage.setItem("expiryHistory", JSON.stringify(historyData));
}

function resetForm() {
  form.reset();
  resultDiv.innerHTML = "";
  resultDiv.style.opacity = 0;
}

function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}
