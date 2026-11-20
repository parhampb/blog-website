import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { feedFilter } from "@sage/utils/postFilter";
import { getPostUrl } from "@sage/utils/getPostPaths";
import sageConfig from "@sage/config";

/** /llms.txt (https://llmstxt.org): the site and its posts, one line each. */
export const GET: APIRoute = async ({ site }) => {
  // The theme's RSS rule: no drafts, no posts scheduled for later.
  const posts = (await getCollection("posts"))
    .filter(feedFilter)
    .sort((a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime());

  const url = (path: string) => new URL(path, site).href;
  const { title, description } = sageConfig.site;

  const lines = [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    "## Posts",
    "",
    ...(posts.length
      ? posts.map(
          ({ id, filePath, data }) =>
            `- [${data.title}](${url(getPostUrl(id, filePath))}): ${data.description}`
        )
      : ["- No posts yet."]),
    "",
    "## Pages",
    "",
    `- [About](${url("/about/")})`,
    `- [Projects](${url("/projects/")})`,
    "",
    "## Optional",
    "",
    `- [RSS feed with full post content](${url("/rss.xml")})`,
    `- [Sitemap](${url("/sitemap-index.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
