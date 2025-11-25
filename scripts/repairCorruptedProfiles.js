const mongoose = require('mongoose');
const { Economy } = require('../models/economy/schema');
const { SLAYING_WEAPONS, SLAYING_MOUNTS } = require('../models/economy/constants/slayingData');

async function repairProfiles() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sanctyrdls_db_user:GJ3x0kNjmAB76etS@ember.qi9rden.mongodb.net/?appName=Ember', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB. Starting profile repair...');

        const profiles = await Economy.find({});
        console.log(`Found ${profiles.length} profiles.`);

        let repairedCount = 0;

        for (const profile of profiles) {
            let changed = false;

            // Fix weapons purchasePrice
            if (Array.isArray(profile.slayingWeapons)) {
                profile.slayingWeapons.forEach(weapon => {
                    if (!weapon.purchasePrice || typeof weapon.purchasePrice !== 'number' || isNaN(weapon.purchasePrice)) {
                        // Find default weapon data from SLAYING_WEAPONS by type or name
                        const defaultWeapon = Object.values(SLAYING_WEAPONS).find(w => w.name === weapon.name || w.type === weapon.type);
                        const defaultPrice = defaultWeapon ? defaultWeapon.price || defaultWeapon.purchasePrice : 1000; // fallback default
                        console.log(`Fixing weapon purchasePrice for user ${profile.userId}, weapon ${weapon.name}: set to ${defaultPrice}`);
                        weapon.purchasePrice = defaultPrice;
                        changed = true;
                    }
                });
            }

            // Fix mounts purchasePrice
            if (Array.isArray(profile.slayingMounts)) {
                profile.slayingMounts.forEach(mount => {
                    if (!mount.purchasePrice || typeof mount.purchasePrice !== 'number' || isNaN(mount.purchasePrice)) {
                        // Find default mount data from SLAYING_MOUNTS by type or name
                        const defaultMount = Object.values(SLAYING_MOUNTS).find(m => m.name === mount.name || m.type === mount.type);
                        const defaultPrice = defaultMount ? defaultMount.price || defaultMount.purchasePrice : 1000; // fallback default
                        console.log(`Fixing mount purchasePrice for user ${profile.userId}, mount ${mount.name}: set to ${defaultPrice}`);
                        mount.purchasePrice = defaultPrice;
                        changed = true;
                    }
                });
            }

            // Fix minion corrupted data (energy, constitution, loyalty, powerLevel)
            if (Array.isArray(profile.minions)) {
                profile.minions.forEach(minion => {
                    let minionChanged = false;
                    if (typeof minion.energy !== 'number' || isNaN(minion.energy) || minion.energy < 0 || minion.energy > 100) {
                        console.log(`Fixing minion energy for user ${profile.userId}, minion ${minion.name}: reset to 50`);
                        minion.energy = 50;
                        minionChanged = true;
                    }
                    if (typeof minion.constitution !== 'number' || isNaN(minion.constitution) || minion.constitution < 0 || minion.constitution > 100) {
                        console.log(`Fixing minion constitution for user ${profile.userId}, minion ${minion.name}: reset to 100`);
                        minion.constitution = 100;
                        minionChanged = true;
                    }
                    if (typeof minion.loyalty !== 'number' || isNaN(minion.loyalty) || minion.loyalty < 0 || minion.loyalty > 100) {
                        console.log(`Fixing minion loyalty for user ${profile.userId}, minion ${minion.name}: reset to 50`);
                        minion.loyalty = 50;
                        minionChanged = true;
                    }
                    if (typeof minion.powerLevel !== 'number' || isNaN(minion.powerLevel) || minion.powerLevel < 1 || minion.powerLevel > 100) {
                        console.log(`Fixing minion powerLevel for user ${profile.userId}, minion ${minion.name}: reset to 1`);
                        minion.powerLevel = 1;
                        minionChanged = true;
                    }
                    if (minionChanged) {
                        changed = true;
                    }
                });
            }

            if (changed) {
                await profile.save();
                repairedCount++;
                console.log(`Repaired profile for user ${profile.userId}`);
            }
        }

        console.log(`Repair complete. Total profiles repaired: ${repairedCount}`);
        mongoose.disconnect();
    } catch (error) {
        console.error('Error repairing profiles:', error);
        mongoose.disconnect();
    }
}

repairProfiles();
