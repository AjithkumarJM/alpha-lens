import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["55wqjj-5173.csb.app"],
    port: 5173,
    // Proxy configuration for local development to bypass CORS
    // Uncomment the API you want to proxy
    proxy: {
      // Example: Proxy Alpha Vantage requests
      "/api/alphavantage": {
        target: "https://www.alphavantage.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/alphavantage/, "/query"),
      },
      // Example: Proxy NSE endpoints (may still require headers)
      "/api/nse": {
        target: "https://www.nseindia.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nse/, "/api"),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader("User-Agent", "Mozilla/5.0");
            proxyReq.setHeader("Accept", "application/json");
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
  },
});
