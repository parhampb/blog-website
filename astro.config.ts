import { defineConfig } from "astro/config";
import astroSage from "astro-sage";
import sageConfig from "./sage.config";
import cloudflareWebAnalytics from "./src/integrations/cloudflare-web-analytics";

// Fully static: `astro build` writes plain files to dist/, which wrangler.jsonc
// serves as Workers static assets. No SSR adapter.
export default defineConfig({
  site: sageConfig.site.url,
  integrations: [
    astroSage(sageConfig),
    // sage.config.ts has already loaded .env into process.env.
    cloudflareWebAnalytics(process.env.PUBLIC_CF_WEB_ANALYTICS_TOKEN?.trim()),
  ],
});
