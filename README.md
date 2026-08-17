# The Boneyard — companion site

Static HTML/CSS/JS site for **The Boneyard**, a Mystic BBS run by Knight Shadow.

No build step. Open `index.html` locally, or host the folder on GitHub Pages.

## Preview locally

From this directory:

```bash
npx --yes serve .
```

Or any other static server. Double-clicking `index.html` also works, though some browsers are picky about `clipboard` on `file://`.

## Edit the BBS address

Connection info lives at the top of `js/site.js` in the `BBS` object (`host`, ports, sysop, location). Pages with `data-bbs` attributes pick it up automatically. Rewrite the About / sysop copy in `about/` whenever the real story should replace the starter text.

## GitHub Pages

This is the simplest free host for a site like this.

1. Create a GitHub repository and push this folder to `main`.
2. Repo **Settings → Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`.
5. Save. The site will be at `https://<user>.github.io/<repo>/`.

If the repo is named `<user>.github.io`, Pages will serve it at `https://<user>.github.io/`.

### Project-site URLs

Links in this project are relative (`../css/style.css`, not `/css/style.css`), so a project site under `/the-boneyard/` works without extra config.

### Custom domain

In Pages settings, add something like `www.boneyard-bbs.com` (or a subdomain). Put a `CNAME` file in the repo root containing that hostname, and point DNS at GitHub. Leave the BBS itself on `boneyard-bbs.com` if that host already answers telnet.

## Other hosts that fit

- **Cloudflare Pages** — also free, git-backed, custom domains are easy.
- **Neocities** — the most on-theme option if you want the site itself to feel like 1996 hosting.

Any of the three is fine. GitHub Pages is the default recommendation because you already have git-shaped workflow and zero cost.

## Layout

```
index.html                 Welcome
about/                     The Boneyard BBS, Knight Shadow
connect/                   Telnet / SSH
bbs-101/                   What / Why
bbs-101/how/               Message boards, files, doors, chat
bbs-101/culture/           Art, music, demoscene, underground
css/style.css
js/site.js
assets/favicon.svg
```
