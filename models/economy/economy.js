const { Economy, Raid } = require('./schema');
const { GUILD_TYPES, RAID_DUNGEONS } = require('./constants/guildData');

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
                        // Followers System defaults
                        followerTithe: 0,
                        followers: [],
                        followerAllegiance: 0,
                        // Beast System defaults
                        beasts: [],
                        activeBeast: null,
                        // Minion System defaults
                        minions: [],
                        maxMinions: 1,
                        // Citadel System defaults
                        citadels: [],
                        primaryCitadel: null,
                        // Guild System defaults
                        guilds: [],
                        maxGuilds: 1,
                        guildInfluence: 0,
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
                            beastrace: null,
                            ritual: null,
                            minionCare: null,
                            robbery: null,
                            beg: null,
                            gambling: null,
                            shop: null,
                            guild: null,
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

    // Follower tithe operations
    static async updateFollowerTithe(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.followerTithe = Math.max(0, profile.followerTithe + amount);
        await profile.save();
        return profile;
    }

    // Check cooldown
    static checkCooldown(profile, commandName) {
        const cooldownTimes = {
            daily: 24 * 60 * 60 * 1000, // 24 hours
            weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
            work: 60 * 60 * 1000, // 1 hour
            beastrace: 5 * 60 * 1000, // 5 minutes
            ritual: 24 * 60 * 60 * 1000, // 24 hours
            minionCare: 30 * 60 * 1000, // 30 minutes
            robbery: 30 * 60 * 1000, // 30 minutes
            beg: 10 * 60 * 1000, // 10 minutes
            gambling: 30 * 1000, // 30 seconds
            shop: 10 * 1000, // 10 seconds
            guild: 24 * 60 * 60 * 1000, // 24 hours  
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

    // Calculate total power level
    static calculatePowerLevel(profile) {
        let totalPower = 0;

        // Citadel power
        const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
        if (primaryCitadel) {
            totalPower += (primaryCitadel.securityLevel || 0) * 10;
        }

        // Minion power
        profile.minions.forEach(minion => {
            const loyalty = minion.loyalty || 0;
            const constitution = minion.constitution || 0;
            const corruption = minion.corruption || 0;
            const minionEfficiency = (loyalty + constitution + corruption) / 300;
            const powerLevel = minion.powerLevel || 0;
            totalPower += powerLevel * minionEfficiency;
        });

        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                totalPower += (role.benefits?.robberyProtection || 0);
            }
        });

        // Active effect bonuses
        profile.activeEffects.forEach(effect => {
            if (effect.type === 'robbery_protection') {
                totalPower += (effect.multiplier || 0) * (effect.stacks || 0);
            }
        });

        return Math.min(100, Math.max(0, Math.floor(totalPower)));
    }

    // Add this corrected method to replace the buggy one:
    static async calculateGuildIncome(guild, profile = null) {
    const guildType = GUILD_TYPES[guild.type];
    const baseIncome = guildType.dailyIncome;

    const levelMultiplier = guild.level * 0.5 + 0.5;
    const acolyteBonus = guild.acolytes * (200 + (guild.level * 50));
    const efficiencyMultiplier = guild.efficiency || 1.0;
    const reputationBonus = (guild.reputation / 100) * (500 + guild.level * 100);
    
    // ✅ FIXED - Safely use profile guildInfluence if available
    const skillBonus = profile ? ((profile.guildInfluence || 0) * 10) : 0;

    const minIncome = Math.floor((baseIncome[0] * levelMultiplier + acolyteBonus + reputationBonus + skillBonus) * efficiencyMultiplier);
    const maxIncome = Math.floor((baseIncome[1] * levelMultiplier + acolyteBonus + reputationBonus + skillBonus) * efficiencyMultiplier);

    const randomIncome = Math.floor(Math.random() * (maxIncome - minIncome + 1)) + minIncome;
    const acolyteCosts = guild.acolytes * Math.floor(guildType.acolyteCost * 0.6);

    return {
        revenue: randomIncome,
        expenses: acolyteCosts,
        profit: Math.max(0, randomIncome - acolyteCosts)
    };
}

// ENHANCED: Better experience and skill rewards
static async giveGuildExperience(profile, action, amount = 0) {
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
        case 'recruit':
            expGain = 10 * amount; // 10 XP per acolyte recruited
            skillGain = 1;
            break;
        case 'dismiss':
            expGain = 5;
            skillGain = 0;
            break;
        case 'delete':
            expGain = 15;
            skillGain = 2;
            break;
    }
    
    profile.experience = (profile.experience || 0) + expGain;
    profile.guildInfluence = Math.min(100, (profile.guildInfluence || 0) + skillGain);
    
    return { expGain, skillGain };
}

// NEW: Delete/Sell guild functionality
static async sellGuild(profile, guildIndex) {
    const guild = profile.guilds[guildIndex];
    const guildType = GUILD_TYPES[guild.type];
    
    // Calculate sell value (60-80% of purchase price based on level and reputation)
    const baseValue = guild.purchasePrice * 0.6;
    const levelBonus = guild.purchasePrice * 0.02 * guild.level; // 2% per level
    const reputationBonus = guild.purchasePrice * 0.002 * guild.reputation; // 0.2% per reputation point
    
    const sellValue = Math.floor(baseValue + levelBonus + reputationBonus);
    
    // Remove guild and add money
    profile.guilds.splice(guildIndex, 1);
    profile.wallet += sellValue;
    
    // Add transaction record
    profile.transactions.push({
        type: 'income',
        amount: sellValue,
        description: `Sold guild: ${guild.name}`,
        category: 'guild'
    });
    
    return sellValue;
}
static async collectGuildIncome(userId, guildId) {
    const profile = await this.getProfile(userId, guildId);
    let totalProfit = 0;
    let guildReport = [];

    for (let guild of profile.guilds) {
        const hoursSinceCollection = guild.lastCollection ?
            (Date.now() - guild.lastCollection.getTime()) / (1000 * 60 * 60) : 24;

        if (hoursSinceCollection >= 24) {
            // ✅ FIXED - Pass profile to get skill bonus
            const income = await this.calculateGuildIncome(guild, profile);
            guild.revenue += income.revenue;
            guild.expenses += income.expenses;
            guild.profit += income.profit;
            guild.lastCollection = new Date();

            totalProfit += income.profit;
            guildReport.push({
                name: guild.name,
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
            description: 'Guild profits collected',
            category: 'guild'
        });
    }

    await profile.save();
    return { totalProfit, guildReport };
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

    // Calculate work multiplier (FIXED: Requires citadel for follower bonus)
    static calculateWorkMultiplier(profile) {
        let multiplier = 1.0;

        // Follower allegiance bonus ONLY if they have a citadel
        const hasCitadel = profile.citadels.length > 0;
        if (hasCitadel && profile.followers.length > 0) {
            const followerBonus = (profile.followerAllegiance / 100) * 0.5;
            multiplier += followerBonus;
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
        const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
        let baseCapacity = primaryCitadel ? primaryCitadel.vaultCapacity : 0;

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

    // Calculate security level
    static calculateSecurityLevel(profile) {
        let security = 0;

        const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
        if (primaryCitadel) {
            security += primaryCitadel.securityLevel;
        }

        // Minion security bonuses
        profile.minions.forEach(minion => {
            security += Math.floor(minion.powerLevel * 0.1);
        });

        // Role bonuses
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                security += role.benefits.robberyProtection * 0.5;
            }
        });

        // Active effect bonuses
        profile.activeEffects.forEach(effect => {
            if (effect.type === 'security_boost') {
                security += effect.multiplier * effect.stacks;
            }
        });

        return Math.min(100, Math.floor(security));
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