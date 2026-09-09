/* ============================================================
   THE BONEYARD — blog feed
   Pulls posts from Knight Shadow's Cyberspace RSS feed.
   ============================================================ */

const BLOG_FEED_URL = "https://cyberspace.online/knightshadow/feed.xml";
const BLOG_HOME_URL = "https://cyberspace.online/knightshadow/blog";

const ALLOWED_TAGS = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "EM", "H3", "I", "IMG", "LI", "OL", "P", "STRONG", "UL",
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isSafeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function textContent(xml, tagName) {
  const node = xml.getElementsByTagName(tagName)[0];
  return node ? node.textContent.trim() : "";
}

function parseRss(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Could not parse the RSS feed.");
  }
  return Array.from(doc.getElementsByTagName("item")).map((item) => ({
    title: textContent(item, "title") || "Untitled",
    link: textContent(item, "link") || BLOG_HOME_URL,
    pubDate: textContent(item, "pubDate"),
    description: textContent(item, "description"),
  }));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function loadFromRss2Json() {
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(BLOG_FEED_URL)}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error("RSS proxy returned no posts.");
  }
  return data.items.map((item) => ({
    title: item.title || "Untitled",
    link: item.link || BLOG_HOME_URL,
    pubDate: item.pubDate || "",
    description: item.content || item.description || "",
  }));
}

async function loadPosts() {
  try {
    return parseRss(await fetchText(BLOG_FEED_URL));
  } catch {
    return loadFromRss2Json();
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatInline(text) {
  return String(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, label, url) => `<a href="${escapeHtml(url)}">${label}</a>`
  );
}

function formatBody(raw) {
  let text = String(raw || "");
  text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, "\n\nIMG:$2|$1\n\n");
  text = formatInline(text);
  text = text.replace(/<\/?p>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  const out = [];
  let list = null;

  const flushList = () => {
    if (!list) return;
    out.push(`<${list.type}>${list.items.map((item) => `<li>${item}</li>`).join("")}</${list.type}>`);
    list = null;
  };

  const startList = (type) => {
    if (!list || list.type !== type) {
      flushList();
      list = { type, items: [] };
    }
  };

  text.split("\n").forEach((line) => {
    line = line.trim();
    if (!line) {
      flushList();
      return;
    }

    const image = line.match(/^IMG:(https?:\/\/[^|]+)\|(.*)$/);
    if (image) {
      flushList();
      out.push(`<p><img src="${image[1]}" alt="${escapeHtml(image[2])}"></p>`);
      return;
    }

    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      flushList();
      out.push(`<h3>${heading[1]}</h3>`);
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      startList("ul");
      list.items.push(bullet[1]);
      return;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      startList("ol");
      list.items.push(numbered[1]);
      return;
    }

    flushList();
    out.push(`<p>${line}</p>`);
  });

  flushList();
  return sanitizeHtml(out.join(""));
}

function sanitizeHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  cleanNode(template.content);
  return template.innerHTML;
}

function cleanNode(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const doomed = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!ALLOWED_TAGS.has(el.tagName)) {
      doomed.push(el);
      continue;
    }
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const allowed =
        (el.tagName === "A" && (name === "href" || name === "target" || name === "rel")) ||
        (el.tagName === "IMG" && (name === "src" || name === "alt" || name === "loading"));
      if (!allowed) el.removeAttribute(attr.name);
    });
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (!isSafeUrl(href)) el.removeAttribute("href");
      else {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    }
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src") || "";
      if (!isSafeUrl(src)) doomed.push(el);
      else {
        el.setAttribute("loading", "lazy");
        if (!el.getAttribute("alt")) el.setAttribute("alt", "");
      }
    }
  }
  doomed.forEach((el) => {
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE") el.remove();
    else el.replaceWith(...el.childNodes);
  });
}

function renderPosts(posts) {
  const feed = document.getElementById("blog-feed");
  if (!feed) return;
  if (!posts.length) {
    feed.innerHTML = `<p class="note">No posts in the feed yet. Check back after the next post, or read them on <a href="${BLOG_HOME_URL}" target="_blank" rel="noopener">Cyberspace</a>.</p>`;
    return;
  }
  feed.innerHTML = posts
    .map((post) => {
      const title = escapeHtml(post.title);
      const link = isSafeUrl(post.link) ? escapeHtml(post.link) : BLOG_HOME_URL;
      const date = escapeHtml(formatDate(post.pubDate));
      const body = formatBody(post.description);
      return `<article class="blog-post">
        <h2><a href="${link}" target="_blank" rel="noopener">${title}</a></h2>
        ${date ? `<p class="blog-meta">${date}</p>` : ""}
        <div class="blog-body">${body}</div>
        <p class="blog-more"><a href="${link}" target="_blank" rel="noopener">Read on Cyberspace</a></p>
      </article>`;
    })
    .join("");
}

function renderError() {
  const feed = document.getElementById("blog-feed");
  if (!feed) return;
  feed.innerHTML = `<div class="panel">
    <h2>Could not load the feed</h2>
    <p>The board did not answer. You can still read the posts on Cyberspace.</p>
    <div class="btn-row">
      <a class="btn" href="${BLOG_HOME_URL}" target="_blank" rel="noopener">Open Cyberspace blog</a>
    </div>
  </div>`;
}

loadPosts()
  .then(renderPosts)
  .catch((error) => {
    console.error("Blog feed failed:", error);
    renderError();
  });
