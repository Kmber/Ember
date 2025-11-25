const mongoose = require('mongoose');
const { Economy } = require('../models/economy/schema'); // Adjust path if needed

// Connect to MongoDB - change the connection string to your environment
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://sanctyrdls_db_user:GJ3x0kNjmAB76etS@ember.qi9rden.mongodb.net/?appName=Ember'; // change as needed

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    repairProfiles().then(() => {
        console.log('Profile repair completed');
        mongoose.disconnect();
    }).catch(err => {
        console.error('Error repairing profiles:', err);
        mongoose.disconnect();
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

async function repairProfiles() {
    const profiles = await Economy.find({});

    for (const profile of profiles) {
        let modified = false;

        // Defensive checks and fix for wallet
        if (typeof profile.wallet !== 'number' || isNaN(profile.wallet)) {
            console.warn(`profile.wallet invalid for user ${profile.userId}, fixing to 0`);
            profile.wallet = 0;
            modified = true;
        }

        // Defensive checks and fix for dailyStreak
        if (typeof profile.dailyStreak !== 'number' || isNaN(profile.dailyStreak)) {
            console.warn(`profile.dailyStreak invalid for user ${profile.userId}, fixing to 0`);
            profile.dailyStreak = 0;
            modified = true;
        }

        // Defensive checks and fix for experience
        if (typeof profile.experience !== 'number' || isNaN(profile.experience)) {
            console.warn(`profile.experience invalid for user ${profile.userId}, fixing to 0`);
            profile.experience = 0;
            modified = true;
        }

        // Defensive checks and fix for each transaction amount
        if (Array.isArray(profile.transactions)) {
            for (let i = 0; i < profile.transactions.length; i++) {
                const txn = profile.transactions[i];
                if (typeof txn.amount !== 'number' || isNaN(txn.amount)) {
                    console.warn(`profile.transactions[${i}].amount invalid for user ${profile.userId}, fixing to 0`);
                    profile.transactions[i].amount = 0;
                    modified = true;
                }
            }
        }

        if (modified) {
            try {
                await profile.save();
                console.log(`Profile for user ${profile.userId} repaired and saved.`);
            } catch (error) {
                console.error(`Failed saving profile for user ${profile.userId}:`, error);
            }
        }
    }
}
