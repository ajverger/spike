// SPDX-License-Identifier: Apache-2.0
// Dev-only shortcut for the open tecladoV2 session. Vite serves the two files;
// the click uses the same board import and result-package loaders as the File menu.

export const TECLADO_V2_BOARD_PATH = "C:\\Users\\W\\Documents\\pcb\\tecladoV2\\Esp32S3Cybernav.kicad_pcb";
export const TECLADO_V2_RESULTS_PATH = "C:\\Users\\W\\Documents\\pcb\\tecladoV2\\spike-runs\\mas5v-dc.spike-results.json";
export const TECLADO_V2_LIVE_LABEL = "tecladoV2 +5V";

export type TecladoV2LiveLoaders = {
  importBoard: (fileName: string, source: string, sourcePath?: string | null) => Promise<void>;
  loadResults: (text: string, name: string, options?: { boardAlreadyImported?: boolean }) => Promise<void>;
};

export async function loadTecladoV2Drop(loaders: Pick<TecladoV2LiveLoaders, "loadResults">): Promise<void> {
  const results = await fetch("/__teclado-v2/results");
  if (!results.ok) throw new Error(`Could not read ${TECLADO_V2_RESULTS_PATH}`);
  await loaders.loadResults(await results.text(), "mas5v-dc.spike-results.json", { boardAlreadyImported: true });
}

export async function openTecladoV2LiveSession(loaders: TecladoV2LiveLoaders): Promise<void> {
  const board = await fetch("/__teclado-v2/board");
  if (!board.ok) throw new Error(`Could not read ${TECLADO_V2_BOARD_PATH}`);
  // No source path: a path selects the native project worker, which rejects
  // files that were not picked in a dialog. The fetched text stays in memory.
  await loaders.importBoard("Esp32S3Cybernav.kicad_pcb", await board.text());
  const results = await fetch("/__teclado-v2/results");
  if (!results.ok) throw new Error(`Could not read ${TECLADO_V2_RESULTS_PATH}`);
  await loaders.loadResults(await results.text(), "mas5v-dc.spike-results.json", { boardAlreadyImported: true });
}
