## Follower System Conversion Plan

This document outlines the steps to convert the existing "Family System" to a "Followers System" with a dark fantasy theme.

### Task 1: Schema and Core Model Update

1.  **Read `models/economy/schema.js`**: Identify the `EconomySchema` definition.
2.  **Update `models/economy/schema.js`**:
    *   Rename the `familyMembers` field to `followers`.
    *   Rename the `familyBond` field to `followerAllegiance`.
    *   Rename the `familyVault` field to `followerTithe`.
3.  **Update `models/economy/economy.js`**:
    *   In the `getProfile` method, update the default fields in `$setOnInsert` to match the new schema (`followers`, `followerAllegiance`, `followerTithe`).
    *   Rename the `updateFamilyVault` method to `updateFollowerTithe`.
    *   Update the `calculateWorkMultiplier` method to use `profile.followers` and `profile.followerAllegiance`.
    *   In the `checkCooldown` method, rename the `trip` cooldown to `ritual`.

### Task 2: Command File Renaming

1.  **Rename `excesscommands/economy/family.js`**: Change the filename to `excesscommands/economy/followers.js`.
2.  **Rename `excesscommands/economy/addfamily.js`**: Change the filename to `excesscommands/economy/addfollower.js`.
3.  **Delete `models/economy/addfamily.js`**: This file is a duplicate of the command file and should be removed to avoid redundancy.

### Task 3: Command Logic and Text Updates

1.  **Update `excesscommands/economy/followers.js`**:
    *   Change the command `name` from `family` to `followers`.
    *   Update all user-facing text to the new dark fantasy theme.
        *   "Family" -> "Followers"
        *   "Family Member" -> "Follower"
        *   "Bond" -> "Allegiance"
        *   "Trip" -> "Ritual"
        *   "Household" -> "Congregation"

2.  **Update `excesscommands/economy/addfollower.js`**:
    *   Change the command `name` from `addfamily` to `addfollower`.
    *   Update user-facing text to the new theme (e.g., "Add Family Member" becomes "Recruit Follower").
    *   Replace `FAMILY_TEMPLATES` with `FOLLOWER_TEMPLATES` featuring dark fantasy roles (e.g., Cultist, Acolyte, Zealot, Neophyte).
    *   Update the logic to use `profile.followers` instead of `profile.familyMembers`.

### Task 4: Documentation Update

1.  **Update `command.md`**:
    *   Change the "Family System" heading and description to "Followers System".
    *   Update the command list from `family`, `addfamily` to `followers`, `addfollower`.
