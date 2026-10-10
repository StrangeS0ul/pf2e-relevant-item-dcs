import assert from "node:assert/strict";
import { getEffectiveItemDc, getItemDcFloor } from "../scripts/dc.mjs";

assert.equal(getItemDcFloor(10, 1), 26, "Level 10 with a one-level lag should use level 9 DC 26");
assert.equal(getItemDcFloor(1, 1), 14, "Level 1 with a one-level lag should use level 0 DC 14");
assert.equal(getItemDcFloor(12, 1), 28, "Level 12 with a one-level lag should use level 11 DC 28");
assert.equal(getItemDcFloor(20, 1), 39, "Level 20 with a one-level lag should use level 19 DC 39");

assert.equal(getEffectiveItemDc(10, 18, 1), 26, "Old item DC should be raised to the level-9 floor");
assert.equal(getEffectiveItemDc(10, 26, 1), 26, "Equal printed DC should remain unchanged");
assert.equal(getEffectiveItemDc(10, 30, 1), 30, "Higher printed DC should be preserved");
assert.equal(getEffectiveItemDc(15, 20, 1), 32, "Level 15 should floor at level 14 DC 32");

console.log("All DC math tests passed.");
