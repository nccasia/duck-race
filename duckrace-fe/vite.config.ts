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
    host: "0.0.0.0", // Cho phép truy cập từ bên ngoài
    cors: {
      origin: "https://duckrace.vncsoft.com", // Chỉ cho phép domain này truy cập
    },
  },
});
