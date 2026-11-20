// Type-only import: this file is also imported by content.config.ts, and a
// runtime import of the theme would pull its build tooling into the bundle.
import type { SageConfig } from "astro-sage";

// Astro doesn't load .env into process.env for config files. Values set in the
// shell or in Cloudflare Workers Builds (build variables) come through as-is.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: fine, everything below is optional.
}

const env = (name: string) => process.env[name]?.trim() || undefined;

/**
 * giscus comments (GitHub Discussions). Off until all four values are set.
 * Get them from https://giscus.app after setting up the repo (see README).
 */
function giscus(): SageConfig["comments"] {
  const repo = env("PUBLIC_GISCUS_REPO");
  const repoId = env("PUBLIC_GISCUS_REPO_ID");
  const category = env("PUBLIC_GISCUS_CATEGORY");
  const categoryId = env("PUBLIC_GISCUS_CATEGORY_ID");
  if (!repo || !repoId || !category || !categoryId) return { provider: false };
  return {
    provider: "giscus",
    repo,
    repoId,
    category,
    categoryId,
    mapping: "pathname",
  };
}

const config: SageConfig = {
  site: {
    url: "https://parhambakhtiari.me/",
    title: "Parham Bakhtiari",
    // TODO: a one-line description of the site (meta tags, RSS, llms.txt).
    description:
      "TODO: one-line site description, e.g. what you write about and build.",
    author: "Parham Bakhtiari",
    // Author URL in JSON-LD. The about page is a safe default.
    profile: "https://parhambakhtiari.me/about/",
    lang: "en",
    // TODO: your IANA timezone, e.g. "America/Toronto". Affects displayed dates.
    timezone: "UTC",
  },
  home: {
    // TODO: a short intro paragraph for the home page (inline HTML allowed).
    intro: "TODO: a short intro paragraph about you and what you write here.",
  },
  comments: giscus(),
  posts: { perPage: 8, perIndex: 6 },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: false,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/parhampb" },
    // TODO: uncomment and fill in.
    // { name: "linkedin", url: "https://www.linkedin.com/in/TODO" },
    // { name: "x", url: "https://x.com/TODO" },
    // { name: "mail", url: "mailto:TODO" },
  ],
  // shareLinks: theme default (X, LinkedIn, Bluesky, Reddit, Hacker News, email).
};

export default config;
