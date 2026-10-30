// Deterministic 12 by 8 palette shared by every device.

export const HUE_CLUE_COLS = 12;
export const HUE_CLUE_ROWS = 8;

const HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const HUE_NAMES = ["Red", "Orange", "Yellow", "Lime", "Green", "Mint", "Cyan", "Sky", "Blue", "Violet", "Magenta", "Pink"];
const ROW_NAMES = ["Pale", "Light", "Soft", "Clear", "Bright", "Deep", "Dark", "Dusky"];
const ROW_LIGHTNESS = [90, 81, 72, 63, 53, 43, 33, 24];
const ROW_SATURATION = [60, 65, 68, 72, 75, 70, 60, 45];

export type PaletteCell = { col: number; row: number; hex: string; coord: string; label: string };

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function isValidCell(col: unknown, row: unknown): col is number {
  return (
    Number.isInteger(col) &&
    Number.isInteger(row) &&
    (col as number) >= 0 &&
    (col as number) < HUE_CLUE_COLS &&
    (row as number) >= 0 &&
    (row as number) < HUE_CLUE_ROWS
  );
}

export function cellCoord(col: number, row: number): string {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

export function cellLabel(col: number, row: number): string {
  return `${ROW_NAMES[row]} ${HUE_NAMES[col].toLowerCase()}`;
}

export function cellHex(col: number, row: number): string {
  return hslToHex(HUES[col], ROW_SATURATION[row], ROW_LIGHTNESS[row]);
}

export function cell(col: number, row: number): PaletteCell {
  return { col, row, hex: cellHex(col, row), coord: cellCoord(col, row), label: cellLabel(col, row) };
}

export const PALETTE: PaletteCell[][] = Array.from({ length: HUE_CLUE_ROWS }, (_, row) =>
  Array.from({ length: HUE_CLUE_COLS }, (_, col) => cell(col, row)),
);

export function manhattan(a: { col: number; row: number }, b: { col: number; row: number }): number {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

// Rows 0 to 3 are light enough for ink text, the rest take ivory text.
export function textOn(row: number): string {
  return row <= 3 ? "#1f1b2e" : "#fbf7f0";
}
