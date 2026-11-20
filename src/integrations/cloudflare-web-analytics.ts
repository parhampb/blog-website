import type { AstroIntegration } from "astro";

/**
 * Adds the Cloudflare Web Analytics beacon to every page, in production
 * builds only, and only when a token is set. `astro dev` never loads it.
 */
export default function cloudflareWebAnalytics(
  token: string | undefined
): AstroIntegration {
  return {
    name: "cloudflare-web-analytics",
    hooks: {
      "astro:config:setup": ({ command, injectScript, logger }) => {
        if (command !== "build") return;
        if (!token) {
          logger.info("PUBLIC_CF_WEB_ANALYTICS_TOKEN not set; beacon off.");
          return;
        }
        const beacon = JSON.stringify({ token });
        injectScript(
          "head-inline",
          `(function(){var s=document.createElement("script");s.defer=true;` +
            `s.src="https://static.cloudflareinsights.com/beacon.min.js";` +
            `s.setAttribute("data-cf-beacon",${JSON.stringify(beacon)});` +
            `document.head.appendChild(s);})();`
        );
      },
    },
  };
}
