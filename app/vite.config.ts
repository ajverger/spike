import fs from "node:fs";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const TECLADO_V2_BOARD_PATH = "C:\\Users\\W\\Documents\\pcb\\tecladoV2\\Esp32S3Cybernav.kicad_pcb";
const TECLADO_V2_RESULTS_PATH = "C:\\Users\\W\\Documents\\pcb\\tecladoV2\\spike-runs\\mas5v-dc.spike-results.json";
const TECLADO_V2_SPARSELIZARD_PATH = "C:\\Users\\W\\Documents\\pcb\\tecladoV2\\spike-runs\\sparselizard-plus5.spike-results.json";

function tecladoV2LiveFiles(): Plugin {
  const routes: Record<string, string> = {
    "/__teclado-v2/board": TECLADO_V2_BOARD_PATH,
    "/__teclado-v2/results": TECLADO_V2_RESULTS_PATH,
    "/__teclado-v2/sparselizard": TECLADO_V2_SPARSELIZARD_PATH,
  };
  return {
    name: "teclado-v2-live-files",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = routes[(req.url ?? "").split("?")[0]];
        if (!file) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        const stream = fs.createReadStream(file);
        stream.on("error", () => {
          res.statusCode = 404;
          res.end("missing");
        });
        stream.pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [tecladoV2LiveFiles(), react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Cargo locks build-script executables under src-tauri/target while
      // compiling. Watching them makes Vite exit with EBUSY on Windows.
      ignored: ["**/src-tauri/**"]
    }
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
