import { getEffectiveItemDc, getItemDcFloor } from "./dc.mjs";

const MODULE_ID = "pf2e-relevant-item-dcs";
const SAVE_TYPES = new Set(["fortitude", "reflex", "will"]);
const ORIGINAL_DC_DATASET_KEY = "pf2ItemDcOriginal";
const INDICATOR_CLASS = "pf2e-relevant-item-dc-indicator";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "levelLag", {
    name: "Item DC level lag",
    hint: "The minimum item DC uses the standard DC for the wielder's level minus this many levels. Default: 1 (a level 10 PC uses the level 9 DC). Higher printed DCs are never reduced.",
    scope: "world",
    config: true,
    type: Number,
    default: 1,
    range: {
      min: 0,
      max: 5,
      step: 1
    },
    requiresReload: false,
    onChange: () => refreshAllInlineChecks()
  });
});

Hooks.once("ready", () => {
  if (game.system.id !== "pf2e") return;

  // Capture phase ensures the DC is corrected before PF2e's document-level
  // inline-check click listener reads data-pf2-dc.
  document.addEventListener("click", onDocumentClick, { capture: true });

  // Keep newly rendered item sheets/chat cards in sync and show when a DC was raised.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) refreshInlineChecks(node);
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    refreshAllInlineChecks();
  }

  const module = game.modules.get(MODULE_ID);
  if (module) {
    module.api = {
      getItemDcFloor,
      getEffectiveItemDc,
      refresh: refreshAllInlineChecks
    };
  }

  console.log(`${MODULE_ID} | Ready. Physical-item save DC floor is character level minus ${getLevelLag()} level(s).`);
});

function getLevelLag() {
  const value = Number(game.settings.get(MODULE_ID, "levelLag"));
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 1;
}

function onDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("[data-pf2-check][data-item-uuid]");
  if (link instanceof HTMLElement) applyScalingToLink(link, { decorate: false });
}

function refreshAllInlineChecks() {
  if (!document.body) return;
  refreshInlineChecks(document.body);
}

function refreshInlineChecks(root) {
  const links = [];

  if (root instanceof HTMLElement && root.matches("[data-pf2-check][data-item-uuid]")) {
    links.push(root);
  }

  for (const link of root.querySelectorAll?.("[data-pf2-check][data-item-uuid]") ?? []) {
    if (link instanceof HTMLElement) links.push(link);
  }

  for (const link of links) applyScalingToLink(link, { decorate: true });
}

function applyScalingToLink(link, { decorate }) {
  if (!SAVE_TYPES.has(link.dataset.pf2Check ?? "")) return clearIndicator(link);
  if (!link.dataset.itemUuid) return clearIndicator(link);

  const item = resolveOwnedPhysicalItem(link.dataset.itemUuid);
  if (!item) return clearIndicator(link);

  const actor = item.actor;
  if (!actor?.isOfType?.("character")) return clearIndicator(link);

  const currentBaseDc = Number(link.dataset.pf2Dc);
  if (!Number.isInteger(currentBaseDc)) return clearIndicator(link);

  if (!(ORIGINAL_DC_DATASET_KEY in link.dataset)) {
    link.dataset[ORIGINAL_DC_DATASET_KEY] = String(currentBaseDc);
  }

  const originalBaseDc = Number(link.dataset[ORIGINAL_DC_DATASET_KEY]);
  if (!Number.isInteger(originalBaseDc)) return clearIndicator(link);

  const adjustment = Number(link.dataset.pf2Adjustment) || 0;
  const printedDc = originalBaseDc + adjustment;
  const floor = getItemDcFloor(actor.level, getLevelLag());
  const effectiveDc = getEffectiveItemDc(actor.level, printedDc, getLevelLag());
  if (!Number.isInteger(effectiveDc)) return clearIndicator(link);

  // PF2e adds data-pf2-adjustment after data-pf2-dc when rolling. Store a base
  // value that yields the intended final effective DC after that adjustment.
  link.dataset.pf2Dc = String(effectiveDc - adjustment);
  link.dataset.pf2ItemDcFloor = String(floor);
  link.dataset.pf2ItemDcEffective = String(effectiveDc);

  if (decorate) updateIndicator(link, { printedDc, effectiveDc, floor });
}

function resolveOwnedPhysicalItem(uuid) {
  let document;
  try {
    document = foundry.utils.fromUuidSync(uuid);
  } catch {
    return null;
  }

  if (!document || document.documentName !== "Item") return null;
  if (typeof document.isOfType !== "function" || !document.isOfType("physical")) return null;
  if (!document.actor) return null;

  return document;
}

function updateIndicator(link, { printedDc, effectiveDc, floor }) {
  let indicator = link.querySelector(`.${INDICATOR_CLASS}`);

  if (effectiveDc <= printedDc) {
    indicator?.remove();
    link.classList.remove("pf2e-relevant-item-dc-scaled");
    link.removeAttribute("data-tooltip-direction");
    return;
  }

  link.classList.add("pf2e-relevant-item-dc-scaled");

  if (!(indicator instanceof HTMLElement)) {
    indicator = document.createElement("span");
    indicator.classList.add(INDICATOR_CLASS);
    link.appendChild(indicator);
  }

  const visibility = link.dataset.pf2ShowDc;
  if (visibility) indicator.dataset.visibility = visibility;
  else delete indicator.dataset.visibility;

  indicator.textContent = ` → DC ${effectiveDc}`;
  indicator.title = `Printed DC ${printedDc}; minimum DC ${floor}; effective DC ${effectiveDc}.`;
}

function clearIndicator(link) {
  link.querySelector(`.${INDICATOR_CLASS}`)?.remove();
  link.classList.remove("pf2e-relevant-item-dc-scaled");
}
