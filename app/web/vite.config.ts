import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const normalizeSiteUrl = (value?: string) => {
  if (!value) return undefined;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  return withProtocol.replace(/\/+$/, "");
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const siteUrl =
    normalizeSiteUrl(env.VITE_SITE_URL) ||
    normalizeSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeSiteUrl(env.VERCEL_URL) ||
    "http://localhost:5173";

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "inject-site-url-meta",
        transformIndexHtml(html) {
          return html.replaceAll("%SITE_URL%", siteUrl);
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
