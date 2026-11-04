document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("nav-open", !open);
      toggle.textContent = open ? "☰" : "×";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("nav-open"); toggle.setAttribute("aria-expanded", "false"); toggle.textContent = "☰";
    }));
  }

  // Lightweight reveal animation that respects reduced-motion preferences.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".project-card, .skill-card, .project-row, .journal-card, .lab-demo, .timeline > div");
    targets.forEach(el => el.classList.add("reveal"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    targets.forEach(el => observer.observe(el));
  }

  // Expense demo: intentionally local to this browser; no account/server.
  const form = document.getElementById("expense-form");
  if (form) {
    const key = "brianNexusLabTransactions";
    const list = document.getElementById("transaction-list");
    const message = document.getElementById("expense-message");
    let entries = [];
    try { entries = JSON.parse(localStorage.getItem(key) || "[]"); if (!Array.isArray(entries)) entries = []; } catch (_) { entries = []; }
    const money = value => "KES " + Number(value).toLocaleString("en-KE", { maximumFractionDigits: 0 });
    const save = () => { try { localStorage.setItem(key, JSON.stringify(entries)); } catch (_) {} };
    const render = () => {
      const income = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
      const expense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
      document.getElementById("total-income").textContent = money(income);
      document.getElementById("total-expenses").textContent = money(expense);
      const balance = document.getElementById("total-balance"); balance.textContent = money(income - expense);
      balance.classList.toggle("negative", income - expense < 0);
      list.replaceChildren();
      if (!entries.length) { const p = document.createElement("p"); p.className = "empty-state"; p.textContent = "No entries yet. Add your first one above."; list.append(p); return; }
      [...entries].reverse().forEach(entry => {
        const row = document.createElement("div"); row.className = "transaction-row";
        const info = document.createElement("div"); const title = document.createElement("b"); title.textContent = entry.description;
        const date = document.createElement("small"); date.textContent = new Date(entry.createdAt).toLocaleDateString();
        info.append(title, date);
        const amount = document.createElement("strong"); amount.className = entry.type === "income" ? "positive" : "negative";
        amount.textContent = (entry.type === "income" ? "+" : "−") + money(entry.amount);
        row.append(info, amount); list.append(row);
      });
    };
    form.addEventListener("submit", event => {
      event.preventDefault();
      const description = document.getElementById("expense-description").value.trim();
      const type = document.getElementById("expense-type").value;
      const amount = Number(document.getElementById("expense-amount").value);
      if (!description || !Number.isFinite(amount) || amount <= 0) { message.textContent = "Enter a description and an amount greater than zero."; return; }
      entries.push({ id: Date.now(), description, type, amount, createdAt: new Date().toISOString() });
      save(); render(); form.reset(); message.textContent = "Entry added to this browser.";
    });
    document.getElementById("clear-expenses").addEventListener("click", () => {
      if (!entries.length) { message.textContent = "There is no demo data to clear."; return; }
      entries = []; save(); render(); message.textContent = "Demo entries cleared.";
    });
    render();
  }

  // Contact form prepares a draft in the visitor's email app; it does not send server-side.
  const contactForm = document.getElementById("contact-form");
  if (contactForm) contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const topic = document.getElementById("contact-topic").value;
    const body = document.getElementById("contact-message").value.trim();
    const subject = encodeURIComponent("Brian Nexus website — " + topic);
    const content = encodeURIComponent("Name: " + name + "\nReply email: " + email + "\nTopic: " + topic + "\n\n" + body);
    document.getElementById("contact-message-status").textContent = "Opening your email app with a prepared draft…";
    window.location.href = "mailto:silenceinfluence@gmail.com?subject=" + subject + "&body=" + content;
  });
});