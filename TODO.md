# TODO: Replace Family System with Followers System

## Files to Update
- [x] models/economy/economy.js - Update family_strongbox, familyMembers, familyBond to followers equivalents
- [x] utils/economyUtils.js - Change familyVault/familyMembers to followers_strongbox/followers
- [x] handlers/economyScheduler.js - Update familyVault/familyMembers references
- [x] excesscommands/economy/withdraw.js - Change family_strongbox to followers_strongbox
- [x] excesscommands/economy/myroles.js - Change familyBonus to followersBonus
- [x] excesscommands/economy/economy.js - Update help text from family to followers
- [x] models/economy/constants/gameData.js - Change family_vacation to followers_vacation
- [x] models/economy/recruitfollower.js - Update command name/description to use followers
- [x] excesscommands/economy/deposit.js - Change family_strongbox to followers_strongbox
- [x] excesscommands/economy/balance.js - Change family_strongbox to followers_strongbox and familyBond to followersBond

## Progress
- [x] Created TODO.md
- [x] Updated remaining family system references in handlers/economyScheduler.js, excesscommands/economy/deposit.js, and excesscommands/economy/balance.js
- [x] Verified no remaining family system references exist in the codebase
