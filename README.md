# PF2e Relevant Item DCs

A small Foundry VTT v14 / PF2e module that prevents old physical-item save DCs from becoming useless.

## Rule

For a PC-owned physical item with a numeric Fortitude, Reflex, or Will inline save DC:

**Effective DC = max(Printed DC, standard DC at (character level - level lag))**

The default level lag is **1**.

Example: a level 10 PC uses a level 2 item with printed DC 18. The level 9 standard DC is 26, so the item rolls at DC 26. If the item's printed DC were 30, it would stay DC 30.

The module does not alter the item document or PF2e compendium data. It adjusts rendered inline save links at runtime.

## Scope in v0.1.0

- Applies only to physical items owned by player characters.
- Applies only to numeric Fortitude, Reflex, and Will inline checks.
- Preserves any higher printed DC.
- Does not modify spells, feats, class features, NPC abilities, hazards, or non-numeric/actor-derived DCs.
- Shows “→ DC X” beside an inline save when the module raises its DC.

## Install using a manifest URL (Foundry VTT and The Forge)

Manifest: https://github.com/StrangeS0ul/pf2e-relevant-item-dcs/releases/latest/download/module.json

- **Foundry VTT:** Setup → Add-on Modules → Install Module → paste the manifest URL.
- **The Forge:** Open the Bazaar, select its install-from-manifest option, and paste the same URL.

The URL becomes active once the first GitHub Release has been published.

## Settings

In the PF2e world, enable **PF2e Relevant Item DCs** under Manage Modules.
Under **Game Settings → Configure Settings → Module Settings**, leave **Item DC level lag** at 1 for the intended rule.

## Quick test

Give a level 10 character a physical item whose description contains a numeric PF2e save link, for example:

    @Check[reflex|dc:18|basic]

When rendered on that owned item, the module should show “→ DC 26”. Clicking the save should roll against DC 26. A printed DC above the floor remains unchanged.

## Publishing future versions

Update the **version** field in module.json (for example, 0.1.1) and push to main. The GitHub Actions workflow runs the calculation tests and publishes a new GitHub Release containing the version's module.json and installable ZIP. Updates are available from the same stable manifest URL.

Do not reuse an existing release version for different code; bump the version for changes.
