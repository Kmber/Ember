const mongoose = require('mongoose');
const { Economy } = require('../models/economy/schema');
const config = require('../config.json');

async function runMigration() {
    try {
        // Connect to MongoDB
        const mongoUri = config.mongoUri || 'mongodb://localhost:27017/your_db_name'; // Adjust as necessary
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB for migration.');

        const profiles = await Economy.find({});
        console.log(`Found ${profiles.length} economy profiles.`);

        let profilesUpdated = 0;
        let minionsUpdated = 0;

        for (const profile of profiles) {
            let updated = false;

            for (const minion of profile.minions) {
                // Check if corruption is missing or not a valid number
                if (minion.corruption === undefined || minion.corruption === null || typeof minion.corruption !== 'number' || isNaN(minion.corruption)) {
                    minion.corruption = 50;
                    updated = true;
                    minionsUpdated++;
                }
            }

            if (updated) {
                await profile.save();
                profilesUpdated++;
                console.log(`Updated profile for userId=${profile.userId} guildId=${profile.guildId}`);
            }
        }

        console.log(`Migration complete. Profiles updated: ${profilesUpdated}. Minions updated: ${minionsUpdated}.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
