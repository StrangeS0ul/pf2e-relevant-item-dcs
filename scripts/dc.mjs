/** Standard PF2e level-based DCs from GM Core, levels 0-25. */
export const DC_BY_LEVEL = Object.freeze([
  14, // 0
  15, // 1
  16, // 2
  18, // 3
  19, // 4
  20, // 5
  22, // 6
  23, // 7
  24, // 8
  26, // 9
  27, // 10
  28, // 11
  30, // 12
  31, // 13
  32, // 14
  34, // 15
  35, // 16
  36, // 17
  38, // 18
  39, // 19
  40, // 20
  42, // 21
  44, // 22
  46, // 23
  48, // 24
  50  // 25
]);

export function clampLevel(level) {
  const numericLevel = Number(level);
  if (!Number.isFinite(numericLevel)) return 0;
  return Math.min(25, Math.max(0, Math.trunc(numericLevel)));
}

/**
 * Return the standard level-based DC at characterLevel - levelLag.
 * Example: level 10 with lag 1 uses the level 9 DC (26).
 */
export function getItemDcFloor(characterLevel, levelLag = 1) {
  const lag = Math.max(0, Math.trunc(Number(levelLag) || 0));
  const effectiveLevel = clampLevel(Number(characterLevel) - lag);
  return DC_BY_LEVEL[effectiveLevel];
}

/**
 * Return the final item DC, preserving a higher printed DC.
 */
export function getEffectiveItemDc(characterLevel, printedDc, levelLag = 1) {
  const numericPrintedDc = Number(printedDc);
  if (!Number.isFinite(numericPrintedDc)) return null;

  const floor = getItemDcFloor(characterLevel, levelLag);
  return Math.max(Math.trunc(numericPrintedDc), floor);
}
