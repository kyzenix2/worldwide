const SITE = {
  ca: "GAwhcphCqCv5bKHmCiN4VDdNWfbXJL4npmkc8L3Q9S9H",
  twitter: "https://x.com/worldwide_SOL",
  telegram: "https://t.me/worldwide_sol",
  chainSlug: "solana",
};

const SOL_MINT = "So11111111111111111111111111111111111111112";

function realCa() {
  const ca = (SITE.ca || "").trim();
  if (!ca || ca.toUpperCase() === "TBA") return "";
  return ca;
}

function realUrl(value) {
  const url = (value || "").trim();
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
}

function displayCa() {
  return realCa() || "TBA";
}

function buyUrl(ca) {
  return `https://swap.pump.fun/?input=${SOL_MINT}&output=${encodeURIComponent(ca)}`;
}

function chartUrl(ca) {
  return `https://dexscreener.com/${SITE.chainSlug}/${encodeURIComponent(ca)}`;
}

function setAnchor(el, href) {
  if (!el) return;
  if (href) {
    el.href = href;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.removeAttribute("data-soon");
    return;
  }
  el.href = "#";
  el.removeAttribute("target");
  el.removeAttribute("rel");
  el.setAttribute("data-soon", "");
}

function applyLinks() {
  const ca = realCa();
  const twitter = realUrl(SITE.twitter);
  const telegram = realUrl(SITE.telegram);
  const buy = ca ? buyUrl(ca) : "";
  const chart = ca ? chartUrl(ca) : "";

  document.querySelectorAll("[data-ca]").forEach((el) => {
    el.textContent = displayCa();
  });

  document.querySelectorAll("[data-buy]").forEach((el) => setAnchor(el, buy));
  document.querySelectorAll("[data-twitter]").forEach((el) => setAnchor(el, twitter));
  document.querySelectorAll("[data-telegram]").forEach((el) => setAnchor(el, telegram));
  setAnchor(document.querySelector("[data-chart-link]"), chart);

  const frame = document.querySelector("[data-chart-frame]");
  if (!frame || !chart) return;

  const src = `${chart}?embed=1&theme=light&info=0&trades=0`;
  let iframe = frame.querySelector("iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.className = "chart-iframe";
    iframe.title = "WWW live chart on DexScreener";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  }
  if (iframe.getAttribute("src") !== src) iframe.src = src;
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      area.remove();
    }
  });
}

function flashCopy(button) {
  const label = button.dataset.label || "Copy";
  button.textContent = "Copied!";
  button.classList.add("is-copied");
  window.clearTimeout(button._copyTimer);
  button._copyTimer = window.setTimeout(() => {
    button.textContent = label;
    button.classList.remove("is-copied");
  }, 1500);
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-on");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("is-on");
  }, 1600);
}

function setupCopy() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      copyText(displayCa())
        .then(() => flashCopy(button))
        .catch(() => showToast("Could not copy"));
    });
  });
}

function setupPlaceholders() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-soon]");
    if (!link) return;
    event.preventDefault();
    showToast("Coming soon");
  });
}

function setupMenu() {
  const button = document.querySelector("[data-menu]");
  const panel = document.querySelector("[data-menu-panel]");
  if (!button || !panel) return;

  const close = () => {
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function setupScrollSpy() {
  const links = [...document.querySelectorAll(".nav-links a, .menu-panel a")];
  const sections = [...new Set(links.map((link) => document.querySelector(link.getAttribute("href"))))].filter(Boolean);
  if (!sections.length) return;

  const mark = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) mark(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => observer.observe(section));
}

applyLinks();
setupCopy();
setupPlaceholders();
setupMenu();
setupScrollSpy();
