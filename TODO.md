# TODO: Heist to Dungeon Raid Conversion

### Phase 1: Content and Logic Updates

- [ ] **`models/economy/constants/businessData.js`**:
    - [ ] Rename `HEIST_TARGETS` to `RAID_DUNGEONS`.
    - [ ] Rename `HEIST_EQUIPMENT` to `RAID_GEAR`.
    - [ ] Update the content of these constants to a dark fantasy theme (e.g., "Dragon's Lair," "Enchanted Lockpicks").

- [ ] **`models/economy/schema.js`**:
    - [ ] Rename `heistSchema` to `raidSchema`.
    - [ ] Update fields within `raidSchema` (e.g., `heistId` to `raidId`, `targetType` to `dungeonType`).
    - [ ] Rename the exported `Heist` model to `Raid`.
    - [ ] Update the main `economySchema` to replace `activeHeists`, `completedHeists`, etc., with `activeRaids`, `completedRaids`.

- [ ] **`models/economy/economy.js`**:
    - [ ] Update all references to the `Heist` model to use the new `Raid` model.
    - [ ] Replace all "heist" related schema fields with their "raid" counterparts.
    - [ ] Rename heist-related functions (e.g., `calculateHeistSuccess` to `calculateRaidSuccess`).
    - [ ] Update logic to use `RAID_DUNGEONS` and `RAID_GEAR` constants.

- [ ] **Command Files**:
    - [ ] **`excesscommands/economy/heist.js`**:
        - [ ] Update command `name` to `raid` and `aliases` to `raids`.
        - [ ] Change all user-facing text from "heist" to "raid" and "criminal" to "adventurer."
    - [ ] **`excesscommands/economy/planheist.js`**:
        - [ ] Update command `name` to `planraid`.
        - [ ] Change all user-facing text accordingly.
    - [ ] **`excesscommands/economy/joinheist.js`**:
        - [ ] Update command `name` to `joinraid`.
        - [ ] Change all user-facing text accordingly.
    - [ ] **`excesscommands/economy/executeheist.js`**:
        - [ ] Update command `name` to `executeraid`.
        - [ ] Change all user-facing text accordingly.

### Phase 2: File Renaming

- [ ] Rename `excesscommands/economy/heist.js` to `excesscommands/economy/raid.js`.
- [ ] Rename `excesscommands/economy/planheist.js` to `excesscommands/economy/planraid.js`.
- [ ] Rename `excesscommands/economy/joinheist.js` to `excesscommands/economy/joinraid.js`.
- [ ] Rename `excesscommands/economy/executeheist.js` to `excesscommands/economy/executeraid.js`.
