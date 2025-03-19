import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // plugins: [react(), mkcert()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  server: {
    host: true,
    cors: true,
  },
});
