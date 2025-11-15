# TODO: Convert Economy System to Dark Fantasy Theme

## Overview
Convert the entire economy system from modern/real-world theme to a dark fantasy theme. The official currency of the kingdom is **Embers**. This involves renaming items, changing descriptions, updating mechanics to fit a fantasy world setting (castles, guilds, monsters, magic, etc.), while preserving core gameplay mechanics.

## Step-by-Step Plan

### Phase 1: Core Constants & Data Structures
- [x] **Update `models/economy/constants/gameData.js`**
- [x] **Update `models/economy/constants/businessData.js`**
- [x] **Update `models/economy/constants/huntingData.js`**

### Phase 2: Database Schema Updates
- [x] **Update `models/economy/schema.js`**

### Phase 3: Core Economy Manager
- [x] **Update `models/economy/economy.js`**

### Phase 4: Command Files Updates
6. **Update Basic Economy Commands (`economy/balance.js`, `economy/daily.js`, etc.)**
   - Change command descriptions and responses to fantasy theme
   - Update embed titles, field names, and messages
   - Replace modern references with fantasy equivalents

7. **Update Property Commands (`economy/buyhouse.js`, `economy/myhome.js`)**
   - Rename to fantasy equivalents (e.g., buyhouse → buystronghold)
   - Update all text to reflect castles, towers, citadels

8. **Update Vehicle Commands (`economy/buycar.js`, `economy/garage.js`, `economy/race.js`)**
   - Rename to mount equivalents
   - Change racing to "arena battles" or "mount races" in fantasy setting

9. **Update Pet Commands (`economy/buypet.js`, `economy/pets.js`, `economy/petcare.js`)**
   - Rename to familiar commands
   - Update care mechanics to fantasy (e.g., feeding mana crystals instead of food)

10. **Update Business Commands (`economy/startbusiness.js`, `economy/business.js`, `economy/upgrade.js`)**
    - Rename to guild commands
    - Update all text to reflect guild management, apprentices instead of employees

11. **Update Heist Commands (`economy/planheist.js`, `economy/joinheist.js`, `economy/executeheist.js`)**
    - Rename to dungeon raid commands
    - Update roles to fantasy classes (e.g., Mastermind → Guild Master, Hacker → Arcane Trickster)

12. **Update Hunting Commands (`economy/hunt.js`, `economy/hunting.js`, `economy/huntshop.js`)**
    - Rename to monster hunting
    - Update all text to reflect fantasy monster slaying

13. **Update Shop & Inventory Commands (`economy/shop.js`, `economy/inventory.js`)**
    - Update item names and descriptions to fantasy theme
    - Change shop to "Arcane Market" or "Mystic Emporium"

14. **Update Utility Commands (`economy/profile.js`, `economy/leaderboard.js`, `economy/transactionhistory.js`)**
    - Update all display text and field names to fantasy theme
    - Change "wallet" to "coin purse", "bank" to "royal treasury", etc.

### Phase 5: Handler & Scheduler Updates
15. **Update `handlers/economyScheduler.js`**
    - Change all logging and notifications to fantasy theme
    - Update automated messages

16. **Update `utils/economyUtils.js`**
    - Rename functions and update comments to fantasy theme

### Phase 6: Main Guide & Documentation
17. **Update `economy/economy.js` (Main Guide Command)**
    - Completely rewrite the 9-page guide to dark fantasy theme
    - Change all examples, strategies, and terminology
    - Update navigation and page content

### Phase 7: Testing & Validation
18. **Test All Commands**
    - Verify each command works with new fantasy names
    - Check for any hardcoded modern references
    - Ensure balance and mechanics remain intact

19. **Update README and Documentation**
    - Change all documentation to reflect dark fantasy theme
    - Update any external references

20. **Final Review & Polish**
    - Proofread all text for consistency
    - Ensure lore coherence across all systems
    - Add any missing fantasy flavor text

## Key Theme Changes
- **Currency:** Embers
- **Properties:** Houses → Strongholds/Citadels
- **Vehicles:** Cars → Mounts/Beasts of Burden
- **Pets:** Animals → Familiars/Magical Creatures
- **Businesses:** Companies → Guilds/Orders
- **Heists:** Robberies → Dungeon Raids/Artifact Thefts
- **Hunting:** Animals → Monsters/Creatures
- **Security:** Alarms → Wards/Runes
- **Gambling:** Casino → Mystic Gambling Den
- **Work:** Jobs → Quests/Adventures

## Estimated Timeline
- Phase 1-2: 2-3 hours (constants and schema)
- Phase 3-4: 4-5 hours (core logic and commands)
- Phase 5-6: 2-3 hours (handlers and guide)
- Phase 7: 1-2 hours (testing and polish)

## Risk Assessment
- High risk of missing hardcoded strings
- Potential balance changes if not careful
- Need to maintain all existing functionality
- Backward compatibility for existing user data
