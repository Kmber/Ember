const { Economy, Raid } = require('./schema');
const { BUSINESS_TYPES, RAID_DUNGEONS } = require('./constants/businessData');

class EconomyManager {
    // ✅ FIXED: Atomic profile creation/retrieval
    static async getProfile(userId, guildId) {
        try {
            const profile = await Economy.findOneAndUpdate(
                { userId, guildId },
                {
                    $setOnInsert: {
                        userId,
                        guildId,
                        // Basic Economy defaults
                        wallet: 1000,
                        bank: 0,
                        bankLimit: 10000,
                        // Family System defaults
                        familyVault: 0,
                        familyMembers: [],
                        familyBond: 0,
                        // Vehicle System defaults
                        cars: [],
                        activeCar: null,
                        // Pet System defaults
                        pets: [],
                        maxPets: 1,
                        // Property System defaults
                        properties: [],
                        primaryResidence: null,
                        // Business System defaults
                        businesses: [],
                        maxBusinesses: 1,
                        businessSkill: 0,
                        // Dungeon Raid System defaults
                        activeRaids: [],
                        completedRaids: 0,
                        failedRaids: 0,
                        raidSkill: 0,
                        threatLevel: 0,
                        recoveryTime: null,
                        // Role System defaults
                        purchasedRoles: [],
                        // Active Effects defaults
                        activeEffects: [],
                        // Stats defaults
                        level: 1,
                        experience: 0,
                        reputation: 0,
                        // Racing Stats defaults
                        racingStats: {
                            totalRaces: 0,
                            wins: 0,
                            losses: 0,
                            earnings: 0,
                            winStreak: 0
                        },
                        // Security defaults
                        lastRobbed: null,
                        robberyAttempts: 0,
                        successfulRobberies: 0,
                        // Cooldowns defaults
                        cooldowns: {
                            daily: null,
                            weekly: null,
                            work: null,
                            race: null,
                            trip: null,
                            petCare: null,
                            robbery: null,
                            beg: null,
                            gambling: null,
                            shop: null,
                            business: null,
                            raid: null
                        },
                        dailyStreak: 0,
                        transactions: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
            
            return profile;
            
        } catch (error) {
            // Handle rare duplicate key scenarios
            if (error.code === 11000) {
                console.log(`Duplicate key handled for user ${userId} in guild ${guildId}, fetching existing profile`);
                return await Economy.findOne({ userId, guildId });
            }
            
            console.error('Error in getProfile:', error);
            throw error;
        }
    }

    // Update wallet
    static async updateWallet(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.wallet = Math.max(0, profile.wallet + amount);
        await profile.save();
        return profile;
    }

    // Update bank
    static async updateBank(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.bank = Math.max(0, profile.bank + amount);
        await profile.save();
        return profile;
    }

    // Family vault operations
    static async updateFamilyVault(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.familyVault = Math.max(0, profile.familyVault + amount);
        await profile.save();
        return profile;
    }

    // Check cooldown
    static checkCooldown(profile, commandName) {
        const cooldownTimes = {
            daily: 24 * 60 * 60 * 1000, // 24 hours
            weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
            work: 60 * 60 * 1000, // 1 hour
            race: 5 * 60 * 1000, // 5 minutes
            trip: 24 * 60 * 60 * 1000, // 24 hours
            petCare: 30 * 60 * 1000, // 30 minutes
            robbery: 30 * 60 * 1000, // 30 minutes
            beg: 10 * 60 * 1000, // 10 minutes
            gambling: 30 * 1000, // 30 seconds
            shop: 10 * 1000, // 10 seconds
            business: 24 * 60 * 60 * 1000, // 24 hours  
            raid: 60 * 60 * 1000, // 1 hour
        };

        const lastUsed = profile.cooldowns[commandName];
        const cooldownTime = cooldownTimes[commandName];

        if (!lastUsed || !cooldownTime) return { onCooldown: false };

        const timeLeft = cooldownTime - (Date.now() - lastUsed.getTime());

        if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);

            return {
                onCooldown: true,
                timeLeft: { hours, minutes, seconds },
                totalMs: timeLeft
            };
        }

        return { onCooldown: false };
    }

    // Calculate total security level
    static calculateSecurityLevel(profile) {
        let totalSecurity = 0;

        // Property security
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        if (primaryProperty) {
            totalSecurity += primaryProperty.securityLevel * 10;
        }

        // Pet security
        profile.pets.forEach(pet => {
            const petEfficiency = (pet.happiness + pet.health + pet.cleanliness) / 300;
            totalSecurity += pet.securityLevel * petEfficiency;
        });

        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                totalSecurity += role.benefits.robberyProtection;
            }
        });

        // Active effect bonuses
        profile.activeEffects.forEach(effect => {
            if (effect.type === 'robbery_protection') {
                totalSecurity += effect.multiplier * effect.stacks;
            }
        });

        return Math.min(100, totalSecurity);
    }

// Add this corrected method to replace the buggy one:
static async calculateBusinessIncome(business, profile = null) {
    const businessType = BUSINESS_TYPES[business.type];
    const baseIncome = businessType.dailyIncome;

    const levelMultiplier = business.level * 0.5 + 0.5;
    const employeeBonus = business.employees * (200 + (business.level * 50));
    const efficiencyMultiplier = business.efficiency || 1.0;
    const reputationBonus = (business.reputation / 100) * (500 + business.level * 100);
    
    // ✅ FIXED - Safely use profile businessSkill if available
    const skillBonus = profile ? ((profile.businessSkill || 0) * 10) : 0;

    const minIncome = Math.floor((baseIncome[0] * levelMultiplier + employeeBonus + reputationBonus + skillBonus) * efficiencyMultiplier);
    const maxIncome = Math.floor((baseIncome[1] * levelMultiplier + employeeBonus + reputationBonus + skillBonus) * efficiencyMultiplier);

    const randomIncome = Math.floor(Math.random() * (maxIncome - minIncome + 1)) + minIncome;
    const employeeCosts = business.employees * Math.floor(businessType.employeeCost * 0.6);

    return {
        revenue: randomIncome,
        expenses: employeeCosts,
        profit: Math.max(0, randomIncome - employeeCosts)
    };
}

// ENHANCED: Better experience and skill rewards
static async giveBusinessExperience(profile, action, amount = 0) {
    let expGain = 0;
    let skillGain = 0;
    
    switch(action) {
        case 'collect':
            expGain = Math.min(50, Math.floor(amount / 1000)); // 1 XP per $1000 collected
            skillGain = Math.min(5, Math.floor(amount / 5000)); // 1 skill per $5000 collected
            break;
        case 'upgrade':
            expGain = 25;
            skillGain = 3;
            break;
        case 'hire':
            expGain = 10 * amount; // 10 XP per employee hired
            skillGain = 1;
            break;
        case 'fire':
            expGain = 5;
            skillGain = 0;
            break;
        case 'delete':
            expGain = 15;
            skillGain = 2;
            break;
    }
    
    profile.experience = (profile.experience || 0) + expGain;
    profile.businessSkill = Math.min(100, (profile.businessSkill || 0) + skillGain);
    
    return { expGain, skillGain };
}

// NEW: Delete/Sell business functionality
static async sellBusiness(profile, businessIndex) {
    const business = profile.businesses[businessIndex];
    const businessType = BUSINESS_TYPES[business.type];
    
    // Calculate sell value (60-80% of purchase price based on level and reputation)
    const baseValue = business.purchasePrice * 0.6;
    const levelBonus = business.purchasePrice * 0.02 * business.level; // 2% per level
    const reputationBonus = business.purchasePrice * 0.002 * business.reputation; // 0.2% per reputation point
    
    const sellValue = Math.floor(baseValue + levelBonus + reputationBonus);
    
    // Remove business and add money
    profile.businesses.splice(businessIndex, 1);
    profile.wallet += sellValue;
    
    // Add transaction record
    profile.transactions.push({
        type: 'income',
        amount: sellValue,
        description: `Sold business: ${business.name}`,
        category: 'business'
    });
    
    return sellValue;
}
static async collectBusinessIncome(userId, guildId) {
    const profile = await this.getProfile(userId, guildId);
    let totalProfit = 0;
    let businessReport = [];

    for (let business of profile.businesses) {
        const hoursSinceCollection = business.lastCollection ?
            (Date.now() - business.lastCollection.getTime()) / (1000 * 60 * 60) : 24;

        if (hoursSinceCollection >= 24) {
            // ✅ FIXED - Pass profile to get skill bonus
            const income = await this.calculateBusinessIncome(business, profile);
            business.revenue += income.revenue;
            business.expenses += income.expenses;
            business.profit += income.profit;
            business.lastCollection = new Date();

            totalProfit += income.profit;
            businessReport.push({
                name: business.name,
                profit: income.profit,
                revenue: income.revenue,
                expenses: income.expenses
            });
        }
    }

    if (totalProfit > 0) {
        profile.wallet += totalProfit;
        profile.transactions.push({
            type: 'income',
            amount: totalProfit,
            description: 'Business profits collected',
            category: 'business'
        });
    }

    await profile.save();
    return { totalProfit, businessReport };
}


    // DUNGEON RAID SYSTEM METHODS
    static async calculateRaidSuccess(raid, members) {
        const dungeon = RAID_DUNGEONS[raid.dungeonType];
        let successChance = dungeon.successChance;

        // Member skill bonuses
        for (let member of members) {
            const profile = await this.getProfile(member.userId, raid.guildId);
            const skillBonus = profile.raidSkill * 0.5; // Up to 50% bonus
            successChance += skillBonus / members.length;
        }

        // Gear bonuses
        const requiredGear = dungeon.gear;
        const hasAllGear = requiredGear.every(item =>
            raid.members.some(member => member.gear.includes(item))
        );
        if (hasAllGear) successChance += 20;

        // Threat level penalties
        const threatPenalty = raid.threat_level * 0.3;
        successChance -= threatPenalty;

        // Preparation time bonus
        if (raid.preparation_time >= dungeon.planningTime) {
            successChance += 15;
        }

        return Math.max(5, Math.min(95, successChance)); // 5% to 95% range
    }

    static async executeRaid(raidId) {
        const raid = await Raid.findOne({ raidId });
        const dungeon = RAID_DUNGEONS[raid.dungeonType];

        // Get all member profiles
        const memberProfiles = await Promise.all(
            raid.members.map(member => this.getProfile(member.userId, raid.guildId))
        );

        const successChance = await this.calculateRaidSuccess(raid, memberProfiles);
        const success = Math.random() * 100 < successChance;

        if (success) {
            // Calculate payout
            const baseReward = Math.floor(Math.random() * (dungeon.payout[1] - dungeon.payout[0] + 1)) + dungeon.payout[0];
            const memberShare = Math.floor(baseReward / raid.members.length);

            // Distribute rewards
            for (let i = 0; i < raid.members.length; i++) {
                const profile = memberProfiles[i];
                const member = raid.members[i];

                // Class bonuses
                let classBonus = 1.0;
                if (member.class === 'master_thief') classBonus = 1.5;
                else if (member.class === 'archmage') classBonus = 1.3;
                else if (member.class === 'dragon_slayer') classBonus = 1.2;

                const finalReward = Math.floor(memberShare * classBonus);

                profile.wallet += finalReward;
                profile.completedRaids += 1;
                profile.raidSkill = Math.min(100, profile.raidSkill + 10);
                profile.experience += 100;
                profile.threatLevel = Math.min(100, profile.threatLevel + dungeon.difficulty * 10);

                profile.transactions.push({
                    type: 'income',
                    amount: finalReward,
                    description: `Raid: ${dungeon.name}`,
                    category: 'raid'
                });

                await profile.save();
            }

            raid.status = 'completed';
            raid.actual_reward = baseReward;
            raid.executionDate = new Date();

        } else {
            // Failure consequences
            for (let i = 0; i < raid.members.length; i++) {
                const profile = memberProfiles[i];

                // Recovery time based on dungeon difficulty
                const recoveryHours = dungeon.difficulty * 6; // 6-30 hours
                profile.recoveryTime = new Date(Date.now() + recoveryHours * 60 * 60 * 1000);

                // Fine and threat
                const fine = Math.floor(profile.wallet * 0.2); // 20% fine
                profile.wallet = Math.max(0, profile.wallet - fine);
                profile.failedRaids += 1;
                profile.threatLevel = Math.min(100, profile.threatLevel + dungeon.difficulty * 15);

                profile.transactions.push({
                    type: 'expense',
                    amount: fine,
                    description: `Raid failure penalty: ${dungeon.name}`,
                    category: 'raid'
                });

                await profile.save();
            }

            raid.status = 'failed';
            raid.executionDate = new Date();
        }

        await raid.save();
        return { success, raid, memberProfiles };
    }

    // Calculate work multiplier (FIXED: Requires house for family bonus)
    static calculateWorkMultiplier(profile) {
        let multiplier = 1.0;

        // Family bond bonus ONLY if they have a property
        const hasProperty = profile.properties.length > 0;
        if (hasProperty && profile.familyMembers.length > 0) {
            const familyBonus = (profile.familyBond / 100) * 0.5;
            multiplier += familyBonus;
        }

        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                multiplier += role.benefits.workMultiplier - 1;
            }
        });

        // Active work boost effects
        profile.activeEffects.forEach(effect => {
            if (effect.type === 'work_boost') {
                multiplier += (effect.multiplier - 1) * effect.stacks;
            }
        });

        return multiplier;
    }

    // Get gambling luck multiplier
    static getGamblingLuck(profile) {
        let luckMultiplier = 1.0;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'gambling_luck') {
                luckMultiplier += (effect.multiplier - 1) * effect.stacks;
            }
        });

        return Math.min(2.5, luckMultiplier); // Cap at 2.5x
    }

    // Get vault capacity with bonuses
    static getVaultCapacity(profile) {
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        let baseCapacity = primaryProperty ? primaryProperty.vaultCapacity : 0;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'vault_boost') {
                baseCapacity *= effect.multiplier;
            }
        });

        return Math.floor(baseCapacity);
    }

    // Get bank limit with bonuses
    static getBankLimit(profile) {
        let baseLimit = profile.bankLimit;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'bank_boost') {
                baseLimit *= effect.multiplier;
            }
        });

        return Math.floor(baseLimit);
    }

    // Add active effect
    static async addActiveEffect(userId, guildId, effectType, multiplier, duration, stacks = 1) {
        const profile = await this.getProfile(userId, guildId);

        // Find existing effect of same type
        const existingEffect = profile.activeEffects.find(e => e.type === effectType);

        if (existingEffect && effectType === 'gambling_luck') {
            // Stack gambling luck up to 5
            existingEffect.stacks = Math.min(5, existingEffect.stacks + stacks);
            existingEffect.expiryTime = new Date(Date.now() + duration);
        } else {
            // Add new effect or replace existing
            if (existingEffect) {
                const index = profile.activeEffects.indexOf(existingEffect);
                profile.activeEffects.splice(index, 1);
            }

            profile.activeEffects.push({
                effectId: `${effectType}_${Date.now()}`,
                name: effectType.replace('_', ' ').toUpperCase(),
                type: effectType,
                multiplier,
                stacks,
                expiryTime: new Date(Date.now() + duration)
            });
        }

        await profile.save();
        return profile;
    }
}

module.exports = { Economy, Raid, EconomyManager };
