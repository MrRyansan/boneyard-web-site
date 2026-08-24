/* ============================================================
   THE BONEYARD — site chrome
   Edit the BBS block below if your address or sysop info changes.
   ============================================================ */

const BBS = {
  name: "The Boneyard",
  sysop: "Knight Shadow",
  software: "Mystic BBS",
  location: "San Diego, CA",
  host: "boneyard-bbs.com",
  telnetPort: 8073,
  sshPort: 8074,
};

BBS.telnet = `${BBS.host}:${BBS.telnetPort}`;
BBS.ssh = `${BBS.host}:${BBS.sshPort}`;
BBS.telnetUrl = `telnet://${BBS.host}:${BBS.telnetPort}`;
BBS.sshCmd = `ssh -p ${BBS.sshPort} ${BBS.host}`;

const NAV = [
  { id: "welcome", label: "Welcome!", href: "index.html" },
  {
    id: "about",
    label: "About",
    href: "about-boneyard.html",
    children: [
      { id: "about-bbs", label: "The Boneyard BBS", href: "about-boneyard.html" },
      { id: "about-sysop", label: "Knight Shadow", href: "about-ks.html" },
    ],
  },
  {
    id: "boneyard",
    label: "The Boneyard",
    href: "bbs-connect.html",
    children: [
      { id: "connect", label: "Connect to the Boneyard", href: "bbs-connect.html" },
    ],
  },
  {
    id: "bbs101",
    label: "BBS 101",
    href: "bbs-what.html",
    children: [
      { id: "what", label: "What is a BBS?", href: "bbs-what.html" },
      {
        id: "how",
        label: "How a BBS Works",
        href: "bbs-how.html",
      },
      {
        id: "culture",
        label: "BBS Culture",
        href: "bbs-culture.html",
      },
    ],
  },
  {
    id: "links",
    label: "Links",
    href: "links.html",
  }
];

const ASCII_TITLE = String.raw` _____ _            ____                                       _
|_   _| |__   ___  | __ )  ___  _ __   ___ _   _  __ _ _ __ __| |
  | | | '_ \ / _ \ |  _ \ / _ \| '_ \ / _ \ | | |/ _' | '__/ _' |
  | | | | | |  __/ | |_) | (_) | | | |  __/ |_| | (_| | | | (_| |
  |_| |_| |_|\___| |____/ \___/|_| |_|\___|\__, |\__,_|_|  \__,_|
                                           |___/`;

const root = document.body.dataset.root || "";
const page = document.body.dataset.page || "welcome";

function href(path) {
  return root + path;
}

function renderNav(nodes, depth = 0) {
  const items = nodes
    .map((node) => {
      const current = node.id === page;
      const kids = node.children ? renderNav(node.children, depth + 1) : "";
      const mark = current ? "*" : depth === 0 ? "+" : "-";
      if (!node.href) {
        return `<li class="depth-${depth}">
          <span class="nav-parent"><span class="mark">${mark}</span>${node.label}</span>
          ${kids}
        </li>`;
      }
      return `<li class="depth-${depth}">
        <a href="${href(node.href)}" ${current ? 'aria-current="page"' : ""}>
          <span class="mark">${mark}</span>${node.label}
        </a>
        ${kids}
      </li>`;
    })
    .join("");
  return `<ul>${items}</ul>`;
}

function renderHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  header.className = "mast";
  header.innerHTML = `
    <div class="mast-top">
      <div class="brand">
        <pre class="brand-ascii">${ASCII_TITLE}</pre>
        <p class="brand-word">THE BONEYARD</p>
      </div>
      <div>
        <button class="menu-toggle" type="button" data-menu-toggle>Menu</button>
        <p class="mast-meta">
          SYSOP: <strong>${BBS.sysop}</strong><br>
          SOFTWARE: <strong>${BBS.software}</strong><br>
          <span class="carrier">CARRIER DETECTED</span>
        </p>
      </div>
    </div>
  `;
}

function renderNavBar() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  nav.className = "nav";
  nav.innerHTML = `<p class="nav-label">Main Board</p>${renderNav(NAV)}`;
}

function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;
  footer.className = "status";
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  footer.innerHTML = `
    <span>NODE 1  |  GUEST  |  ${BBS.software.toUpperCase()}  |  ${BBS.location.toUpperCase()}</span>
    <span><b>${time}</b>  THE BONEYARD<span class="cursor"></span></span>
  `;
}

function fillBbsFields() {
  document.querySelectorAll("[data-bbs]").forEach((el) => {
    const key = el.dataset.bbs;
    if (key in BBS) el.textContent = BBS[key];
  });
  document.querySelectorAll("[data-bbs-href]").forEach((el) => {
    const key = el.dataset.bbsHref;
    if (key in BBS) el.setAttribute("href", BBS[key]);
  });
  document.querySelectorAll("[data-copy-bbs]").forEach((el) => {
    const key = el.dataset.copyBbs;
    if (key in BBS) el.dataset.copy = BBS[key];
  });
}

function tickClock() {
  renderFooter();
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-menu-toggle]")) {
    document.body.classList.toggle("nav-open");
  }

  const copyBtn = event.target.closest("[data-copy]");
  if (copyBtn) {
    const value = copyBtn.dataset.copy;
    navigator.clipboard.writeText(value).then(() => {
      const old = copyBtn.textContent;
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = old;
      }, 1200);
    });
  }
});

function syncCrtOverlays() {
  const crt = document.getElementById("app");
  if (!crt) return;
  const height = `${crt.offsetHeight}px`;
  crt.querySelectorAll(".scanlines").forEach((el) => {
    el.style.minHeight = height;
  });
}

function watchCrtOverlays() {
  syncCrtOverlays();
  window.addEventListener("resize", syncCrtOverlays);
  window.addEventListener("load", syncCrtOverlays);
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", syncCrtOverlays, { once: true });
  });
  if ("ResizeObserver" in window) {
    const crt = document.getElementById("app");
    if (crt) new ResizeObserver(syncCrtOverlays).observe(crt);
  }
}

renderHeader();
renderNavBar();
renderFooter();
fillBbsFields();
watchCrtOverlays();
setInterval(tickClock, 1000);
