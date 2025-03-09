import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public", //  정적 파일 위치 지정
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "public/index.html", // 빌드시 `index.html`을 찾을 수 있도록 설정
      external: ["electron", "fs", "path"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ `@/`를 `src/` 폴더로 매핑
    },
  },
  server: {
    port: 3000,
  },
});
