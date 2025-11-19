const { Economy } = require('../models/economy/economy');

class EconomyUtils {
    static async decayMinionStats() {
        const profiles = await Economy.find({});
        
        for (const profile of profiles) {
            let needsUpdate = false;
            
            profile.minions.forEach(minion => {
                const now = new Date();
                const hoursSinceLastFed = minion.lastFed ? 
                    (now - minion.lastFed) / (1000 * 60 * 60) : 24;
                const hoursSinceLastTrained = minion.lastTrained ? 
                    (now - minion.lastTrained) / (1000 * 60 * 60) : 24;

                // Decay for not being fed (replaces hunger and health decay)
                if (hoursSinceLastFed > 12) {
                    minion.energy = Math.max(0, minion.energy - 5);
                    minion.constitution = Math.max(0, minion.constitution - 2);
                    needsUpdate = true;
                }
                
                // Decay for neglect (replaces cleanliness decay, uses training timer)
                if (hoursSinceLastTrained > 24) {
                    minion.loyalty = Math.max(0, minion.loyalty - 3);
                    needsUpdate = true;
                }
                
                // Decay for lack of activity (replaces happiness decay, uses training timer)
                if (hoursSinceLastTrained > 18) {
                    minion.loyalty = Math.max(0, minion.loyalty - 4);
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                await profile.save();
            }
        }
    }
    
    static async handleMonthlyBills() {
        const profiles = await Economy.find({});
        
        for (const profile of profiles) {
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            if (!primaryProperty) continue;
            
            const totalBills = primaryProperty.monthlyRent + primaryProperty.utilities;
            
         
            if (profile.wallet >= totalBills) {
                profile.wallet -= totalBills;
            } else if (profile.wallet + profile.followerTithe >= totalBills) {
                const remaining = totalBills - profile.wallet;
                profile.wallet = 0;
                profile.followerTithe -= remaining;
            } else {
              
                const unpaid = totalBills - profile.wallet - profile.followerTithe;
                profile.wallet = 0;
                profile.followerTithe = 0;
                
            }
            
            await profile.save();
        }
    }
}

module.exports = EconomyUtils;