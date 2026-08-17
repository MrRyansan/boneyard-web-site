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
    href: "about/index.html",
    children: [
      { id: "about-bbs", label: "The Boneyard BBS", href: "about/index.html" },
      { id: "about-sysop", label: "Knight Shadow", href: "about/knight-shadow.html" },
    ],
  },
  {
    id: "boneyard",
    label: "The Boneyard",
    href: "connect/index.html",
    children: [
      { id: "connect", label: "Telnet directly to the BBS", href: "connect/index.html" },
    ],
  },
  {
    id: "bbs101",
    label: "BBS 101",
    href: "bbs-101/index.html",
    children: [
      { id: "what", label: "What is a BBS?", href: "bbs-101/index.html" },
      { id: "why", label: "Why go to one?", href: "bbs-101/why.html" },
      {
        id: "how",
        label: "How a BBS Works",
        href: "bbs-101/how/index.html",
        children: [
          { id: "how-messages", label: "Message Boards", href: "bbs-101/how/message-boards.html" },
          { id: "how-files", label: "Files", href: "bbs-101/how/files.html" },
          { id: "how-doors", label: "Doors", href: "bbs-101/how/doors.html" },
          { id: "how-chat", label: "Chat", href: "bbs-101/how/chat.html" },
        ],
      },
      {
        id: "culture",
        label: "BBS Culture",
        href: "bbs-101/culture/index.html",
        children: [
          { id: "culture-art", label: "Art", href: "bbs-101/culture/art.html" },
          { id: "culture-music", label: "Music", href: "bbs-101/culture/music.html" },
          { id: "culture-demo", label: "Demoscene", href: "bbs-101/culture/demoscene.html" },
          { id: "culture-under", label: "The Underground", href: "bbs-101/culture/underground.html" },
        ],
      },
    ],
  },
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

function bootScreen() {
  const boot = document.getElementById("boot");
  if (!boot) return;
  if (sessionStorage.getItem("boneyard-booted")) {
    boot.classList.add("hidden");
    return;
  }

  const lines = [
    `${BBS.software.toUpperCase()}   NODE 1`,
    "COPYRIGHT (C) THE BONEYARD",
    "",
    "INITIALIZING OSSUARY...",
    "  MEMORY CHECK ........... OK",
    "  MESSAGE BASES .......... OK",
    "  FILE AREAS ............. OK",
    "  DOORS .................. OK",
    "",
    `ATDT ${BBS.telnet}`,
    "CONNECT 14400/ARQ",
    "",
    "THE DEAD STILL LEAVE MESSAGES.",
  ];

  const pre = boot.querySelector("pre");
  let i = 0;
  pre.textContent = "";

  const timer = setInterval(() => {
    pre.textContent += lines[i] + "\n";
    i += 1;
    if (i >= lines.length) {
      clearInterval(timer);
      boot.querySelector(".hint").hidden = false;
    }
  }, 90);

  const dismiss = () => {
    clearInterval(timer);
    sessionStorage.setItem("boneyard-booted", "1");
    boot.classList.add("hidden");
    window.removeEventListener("keydown", dismiss);
  };

  boot.addEventListener("click", dismiss);
  window.addEventListener("keydown", dismiss);
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

renderHeader();
renderNavBar();
renderFooter();
fillBbsFields();
bootScreen();
setInterval(tickClock, 1000);
