import { defineSageCollections } from "astro-sage/content";
import config from "../sage.config";

// Schema lives in the theme (astro-sage/content). Post frontmatter:
// title, description, pubDatetime, modDatetime?, tags, draft?, series?,
// canonicalURL?, ogImage?, plus toc / math / cite / comments toggles.
export const collections = defineSageCollections({
  author: config.site.author,
});
