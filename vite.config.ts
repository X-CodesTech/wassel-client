import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "./attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "./dist"),
    emptyOutDir: true,
  },
  // In development, we'll run the Vite dev server directly
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    // You can configure proxy here if needed to forward API requests
    // proxy: {
    //   '/api': {
    //     target: 'http://your-backend-server.com',
    //     changeOrigin: true,
    //   }
    // }
  },
});
