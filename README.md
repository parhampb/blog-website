# parhambakhtiari.me

Personal site: portfolio plus a technical blog. Built with [Astro](https://astro.build) and the [AstroSage](https://github.com/chintak/astro-sage) theme (`astro-sage` on npm), and deployed as a fully static site to Cloudflare Workers static assets.

## Requirements

- Node 26 (current LTS). Run `nvm use` to pick it up from `.nvmrc`.
- pnpm 10. The version is pinned in `package.json` (`packageManager`), and pnpm switches to it automatically.

```bash
pnpm install
pnpm dev          # http://localhost:4321, drafts included
```

## Writing a post

Create `src/content/posts/<slug>.md`, or a folder `src/content/posts/<slug>/index.mdx` when the post has images or MDX components. The URL is `/posts/<slug>/`.

```yaml
---
title: "Building Sluice, part 1: ..."
description: "One line. Used in lists, RSS, link previews and llms.txt."
pubDatetime: 2026-12-01T09:00:00Z
modDatetime: 2026-12-03T09:00:00Z   # optional, shows "Updated"
tags: ["sluice", "architecture"]
series: "Building Sluice"           # optional, adds "Part N of M" navigation
draft: true                         # optional, never built
canonicalURL: "https://..."         # optional, only if the post started elsewhere
ogImage: "./cover.png"              # optional, otherwise one is generated
math: false                         # skip KaTeX CSS when there's no math
---
```

The theme defines the schema (`astro-sage/content`), which is why the field names differ from the original checklist: `pubDatetime`, `modDatetime` and `canonicalURL`. Every field and writing feature (callouts, footnotes, wiki-links, wide figures) is listed in [the theme's FEATURES.md](https://github.com/chintak/astro-sage/blob/main/FEATURES.md).

- **Drafts**: `draft: true` shows the post under `pnpm dev` with a "Draft" badge. Builds leave it out completely: no page, no RSS entry, no sitemap entry, no llms.txt line.
- **Scheduled posts**: a future `pubDatetime` publishes on the first build after that time.
- **Files starting with `_`** are ignored. Use them for notes and templates.
- **Code**: fenced blocks use Expressive Code (Shiki, Gruvbox light and dark). Meta options include `title="file.ts"`, `{2-4}`, `ins={3}`, `del={5}` and `collapse={1-10}`.
- **Diagrams**: a ` ```mermaid ` block renders to inline SVG at build time, so readers download no Mermaid JS.

### Diagrams and `.sage-cache/`

Mermaid is rendered in headless Chrome (Playwright, using your installed Chrome or `pnpm exec playwright install chromium`), and the SVG is cached in `.sage-cache/diagrams/`. **Commit that folder.** Cloudflare's build machines have no browser, so they read the cache. With `SAGE_DIAGRAMS_STRICT=1` set there, a missing cache entry fails the build rather than shipping the raw source.

Before you push a post with a new or changed diagram, open it in `pnpm dev` (or run `pnpm build` if it's not a draft), then commit the new files in `.sage-cache/diagrams/`.

## Previewing

```bash
pnpm dev          # live reload, drafts visible
pnpm run preview  # production build served by wrangler, like Cloudflare does (http://localhost:8787)
pnpm run check    # type-check content and code (also part of `pnpm build`)
```

## Deploying

`pnpm run deploy` builds and runs `wrangler deploy`. Use `pnpm run deploy`, not `pnpm deploy`: `pnpm deploy` is a built-in pnpm command and won't run the script. The first time, run `pnpm exec wrangler login`.

### Cloudflare Workers Builds (push to deploy, PR previews)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository** and pick this GitHub repo. Authorize the Cloudflare GitHub app for the `parhampb` account.
2. Build settings:
   - Build command: `pnpm run build`
   - Deploy command: `npx wrangler deploy`
   - Non-production branch deploy command: `npx wrangler versions upload`. This gives every PR a preview URL, posted on the PR.
   - Root directory: `/`
3. Build variables (**Settings → Build → Variables and secrets**):
   - `NODE_VERSION` = `26`. `.nvmrc` should be picked up too; this is a fallback.
   - `SAGE_DIAGRAMS_STRICT` = `1`
   - Optional: `PUBLIC_CF_WEB_ANALYTICS_TOKEN` and the four `PUBLIC_GISCUS_*` values (see `.env.example`).
4. The Worker name in the dashboard must match `name` in `wrangler.jsonc` (`parhambakhtiari-me`).

### Custom domain

DNS is already on Cloudflare, so:

1. Remove any existing `A`, `AAAA` or `CNAME` records for `parhambakhtiari.me` and `www` in the zone. Cloudflare refuses to attach a custom domain over them.
2. Uncomment `routes` in `wrangler.jsonc` and deploy. Cloudflare creates the DNS records and the certificate. (Or use **Worker → Settings → Domains & Routes → Add → Custom domain**.)
3. Optional: redirect `www` to the apex with a Redirect Rule (**Rules → Redirect Rules**, `www.parhambakhtiari.me/*` → `https://parhambakhtiari.me/${1}`, 301). Then drop the `www` route.
4. Once it's live, you can set `workers_dev` to `false`. Leave `preview_urls` on for PR previews.

## Configuration

- `sage.config.ts`: site title, description, author, socials, home intro, comments.
- `src/content/pages/about.md`: the About page.
- `src/pages/projects.astro`: the Projects page. Edit the `projects` array.
- `.env` (copy `.env.example`): analytics token and giscus IDs. All optional.

### Comments (giscus)

Comments stay off until all four `PUBLIC_GISCUS_*` values are set. Posts map to discussions by pathname, and the widget loads only when a reader scrolls near it. One-time GitHub setup:

1. The repo that holds the discussions must be **public**. It can be this repo or a separate `blog-comments` repo.
2. **Settings → General → Features → Discussions**: enable it, and create a category (e.g. "Comments", type *Announcement*, so only giscus creates threads).
3. Install the giscus app on that repo: https://github.com/apps/giscus
4. Go to https://giscus.app, enter the repo, choose "Discussion title contains page pathname" and your category, and copy `data-repo`, `data-repo-id`, `data-category` and `data-category-id` into the four env vars.

### Analytics

Set `PUBLIC_CF_WEB_ANALYTICS_TOKEN` to the site token from **Cloudflare → Analytics & Logs → Web Analytics → Add a site** (choose manual setup to see the token). The beacon is added only to production builds, never under `pnpm dev`.

## What's customized vs. the theme

- `patches/astro-sage@0.2.1.patch` (applied by pnpm): adds a Projects nav link and `Person` JSON-LD on `/` and `/about/`. After `pnpm update astro-sage`, re-create it with `pnpm patch astro-sage` (or drop it if the theme gains those options).
- `src/pages/llms.txt.ts`: `/llms.txt`, listing published posts with their descriptions.
- `src/integrations/cloudflare-web-analytics.ts`: the analytics beacon.

Everything else comes from the theme: SEO and Open Graph meta, `BlogPosting` JSON-LD, the sitemap, full-content RSS at `/rss.xml` (dev.to and Hashnode can import from it), `robots.txt`, OG images per post, search, tags, series and archives.

## Cross-posting

Publish here first. On dev.to, Hashnode or Medium, set the canonical URL to `https://parhambakhtiari.me/posts/<slug>/`. dev.to and Hashnode can import from `/rss.xml` and set it for you.

## License

Content is licensed under [CC BY 4.0](LICENSE).
