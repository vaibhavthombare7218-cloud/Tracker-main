
"use strict";

(function () {
  const STORAGE_KEY = "RJKA_v1_lending";

  const $ = (id) => document.getElementById(id);

  const today = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 10);
  };

  function readLoans() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.map((loan) => ({
        ...loan,
        id: String(loan.id || makeId()),
        type: loan.type === "taken" ? "taken" : "given",
        person: String(loan.person || loan.name || ""),
        amount: Math.max(0, Number(loan.amount) || 0),
        date: String(loan.date || today()),
        note: String(loan.note || ""),
        repayments: Array.isArray(loan.repayments)
          ? loan.repayments.map((r) => ({
              id: String(r.id || makeId()),
              amount: Math.max(0, Number(r.amount) || 0),
              date: String(r.date || loan.date || today()),
              note: String(r.note || "")
            }))
          : [],
        createdAt: loan.createdAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error("कर्ज डेटा वाचता आला नाही:", error);
      alert("कर्जाचा डेटा वाचताना अडचण आली. डेटा बदलण्यापूर्वी Backup तपासा.");
      return [];
    }
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "loan-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  }

  let loans = readLoans();

  function saveLoans() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
      return true;
    } catch (error) {
      console.error("कर्ज डेटा सेव्ह झाला नाही:", error);
      alert("डेटा सेव्ह झाला नाही. फोनमधील Storage जागा तपासा.");
      return false;
    }
  }

  function money(amount) {
    const settings = (() => {
      try {
        return JSON.parse(localStorage.getItem("RJKA_v1_settings") || "{}");
      } catch (_) {
        return {};
      }
    })();

    const currency = settings.currency || "₹";
    return currency + Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function repaid(loan) {
    return loan.repayments.reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );
  }

  function outstanding(loan) {
    return Math.max(0, Number(loan.amount) - repaid(loan));
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function formatDate(date) {
    if (!date) return "—";
    const parts = String(date).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
  }

  function renderSummary() {
    const given = loans
      .filter((loan) => loan.type === "given")
      .reduce((sum, loan) => sum + outstanding(loan), 0);

    const taken = loans
      .filter((loan) => loan.type === "taken")
      .reduce((sum, loan) => sum + outstanding(loan), 0);

    $("givenOutstanding").textContent = money(given);
    $("takenOutstanding").textContent = money(taken);
    $("totalOutstanding").textContent = money(given + taken);
  }

  function renderRepaymentOptions() {
    const select = $("repaymentLoan");
    const previous = select.value;

    const options = loans
      .filter((loan) => outstanding(loan) > 0)
      .map((loan) => {
        const label =
          `${loan.type === "given" ? "दिलेलं" : "घेतलेलं"} — ` +
          `${loan.person} — बाकी ${money(outstanding(loan))}`;

        return `<option value="${escapeHTML(loan.id)}">${escapeHTML(label)}</option>`;
      })
      .join("");

    select.innerHTML = '<option value="">कर्ज निवडा</option>' + options;

    if (loans.some((loan) => loan.id === previous && outstanding(loan) > 0)) {
      select.value = previous;
    }
  }

  function renderLoans() {
    const container = $("loanList");

    if (loans.length === 0) {
      container.innerHTML =
        '<div class="loan-empty">अजून कोणतीही कर्ज नोंद नाही. “नवीन कर्ज” बटण वापरा.</div>';
      return;
    }

    const sorted = [...loans].sort((a, b) =>
      String(b.date).localeCompare(String(a.date))
    );

    container.innerHTML = sorted.map((loan) => {
      const totalRepaid = repaid(loan);
      const remaining = outstanding(loan);
      const label = loan.type === "given" ? "दिलेलं कर्ज" : "घेतलेलं कर्ज";

      const repaymentsHTML = loan.repayments.length
        ? `
          <details style="margin-top:12px">
            <summary style="cursor:pointer;color:#5b0b18;font-weight:600">
              परतफेडीचा इतिहास (${loan.repayments.length})
            </summary>
            <div style="margin-top:8px">
              ${loan.repayments
                .slice()
                .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                .map((r) => `
                  <div class="loan-money-row">
                    <span>
                      ${escapeHTML(formatDate(r.date))}
                      ${r.note ? `<br><small>${escapeHTML(r.note)}</small>` : ""}
                    </span>
                    <strong>${escapeHTML(money(r.amount))}</strong>
                  </div>
                `).join("")}
            </div>
          </details>
        `
        : "";

      return `
        <article class="loan-card">
          <div class="loan-card-top">
            <div>
              <h3>${escapeHTML(loan.person)}</h3>
              <div class="loan-meta">
                तारीख: ${escapeHTML(formatDate(loan.date))}
                ${loan.note ? `<br>नोंद: ${escapeHTML(loan.note)}` : ""}
              </div>
            </div>
            <span class="loan-badge">${label}</span>
          </div>

          <div class="loan-money-row">
            <span>मूळ रक्कम</span>
            <strong>${escapeHTML(money(loan.amount))}</strong>
          </div>
          <div class="loan-money-row">
            <span>एकूण परतफेड</span>
            <strong>${escapeHTML(money(totalRepaid))}</strong>
          </div>
          <div class="loan-money-row">
            <span>बाकी रक्कम</span>
            <strong>${escapeHTML(money(remaining))}</strong>
          </div>

          ${repaymentsHTML}

          <div class="loan-card-buttons">
            <button class="loan-btn loan-secondary" type="button"
              data-edit="${escapeHTML(loan.id)}">संपादन</button>
            <button class="loan-btn loan-secondary" type="button"
              data-delete="${escapeHTML(loan.id)}">हटवा</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderAll() {
    renderSummary();
    renderRepaymentOptions();
    renderLoans();
  }

  function resetLoanForm() {
    $("loanForm").reset();
    $("loanId").value = "";
    $("loanDate").value = today();
    $("formTitle").textContent = "नवीन कर्ज नोंदवा";
  }

  function openForm() {
    $("loanFormSection").hidden = false;
    $("loanFormSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeForm() {
    $("loanFormSection").hidden = true;
    resetLoanForm();
  }

  $("showFormBtn").addEventListener("click", () => {
    resetLoanForm();
    openForm();
  });

  $("cancelFormBtn").addEventListener("click", closeForm);

  $("homeBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  $("loanForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const id = $("loanId").value;
    const type = $("loanType").value;
    const person = $("loanPerson").value.trim();
    const amount = Number($("loanAmount").value);
    const date = $("loanDate").value;
    const note = $("loanNote").value.trim();

    if (!person || !date || !Number.isFinite(amount) || amount <= 0) {
      alert("कृपया नाव, योग्य तारीख आणि शून्यापेक्षा जास्त रक्कम भरा.");
      return;
    }

    if (id) {
      const index = loans.findIndex((loan) => loan.id === id);
      if (index === -1) {
        alert("ही कर्ज नोंद सापडली नाही.");
        return;
      }

      const loan = loans[index];
      const paid = repaid(loan);

      if (amount < paid) {
        alert(
          "मूळ कर्जाची रक्कम आधी नोंदवलेल्या परतफेडीपेक्षा कमी ठेवता येणार नाही."
        );
        return;
      }

      loans[index] = {
        ...loan,
        type,
        person,
        amount,
        date,
        note,
        updatedAt: new Date().toISOString()
      };
    } else {
      loans.push({
        id: makeId(),
        type,
        person,
        amount,
        date,
        note,
        repayments: [],
        createdAt: new Date().toISOString()
      });
    }

    if (saveLoans()) {
      closeForm();
      renderAll();
      alert("कर्जाची नोंद सेव्ह झाली.");
    } else {
      loans = readLoans();
    }
  });

  $("repaymentForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const loanId = $("repaymentLoan").value;
    const amount = Number($("repaymentAmount").value);
    const date = $("repaymentDate").value;
    const note = $("repaymentNote").value.trim();

    const loan = loans.find((item) => item.id === loanId);

    if (!loan) {
      alert("कृपया कर्जाची नोंद निवडा.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || !date) {
      alert("कृपया योग्य परतफेड रक्कम आणि तारीख भरा.");
      return;
    }

    if (amount > outstanding(loan) + 0.000001) {
      alert("परतफेडीची रक्कम बाकी रकमेपेक्षा जास्त असू शकत नाही.");
      return;
    }

    loan.repayments.push({
      id: makeId(),
      amount,
      date,
      note,
      createdAt: new Date().toISOString()
    });

    if (saveLoans()) {
      $("repaymentForm").reset();
      $("repaymentDate").value = today();
      renderAll();
      alert("परतफेडीची नोंद सेव्ह झाली.");
    } else {
      loans = readLoans();
    }
  });

  $("loanList").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
      const loan = loans.find((item) => item.id === editButton.dataset.edit);
      if (!loan) return;

      $("loanId").value = loan.id;
      $("loanType").value = loan.type;
      $("loanPerson").value = loan.person;
      $("loanAmount").value = loan.amount;
      $("loanDate").value = loan.date;
      $("loanNote").value = loan.note;
      $("formTitle").textContent = "कर्जाची नोंद संपादित करा";
      openForm();
      return;
    }

    if (deleteButton) {
      const loan = loans.find((item) => item.id === deleteButton.dataset.delete);
      if (!loan) return;

      const message =
        `“${loan.person}” यांची कर्ज नोंद आणि तिचा परतफेड इतिहास हटवायचा आहे का?`;

      if (!window.confirm(message)) return;

      const previous = loans;
      loans = loans.filter((item) => item.id !== loan.id);

      if (saveLoans()) {
        renderAll();
        alert("कर्जाची नोंद हटवली.");
      } else {
        loans = previous;
        renderAll();
      }
    }
  });

  $("loanDate").value = today();
  $("repaymentDate").value = today();
  renderAll();
})();
