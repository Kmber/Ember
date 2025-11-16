const { Economy, Raid } = require('./schema');
const { GUILD_TYPES, RAID_TARGETS, RAID_EQUIPMENT } = require('./constants/businessData');

class EconomyManager {
    // Get or create a user's profile, now themed for a dark fantasy world
    static async getProfile(userId, guildId) {
        try {
            const profile = await Economy.findOneAndUpdate(
                { userId, guildId },
                {
                    $setOnInsert: {
                        userId,
                        guildId,
                        // Basic Economy
                        embers: 1000,
                        royal_treasury: 0,
                        treasury_limit: 10000,
                        // Followers System
                        followers_strongbox: 0,
                        followers: [],
                        followersBond: 0,
                        // Mount System
                        mounts: [],
                        activeMount: null,
                        // Familiar System
                        familiars: [],
                        maxFamiliars: 1,
                        // Stronghold System
                        strongholds: [],
                        primaryStronghold: null,
                        // Beast System
                        beasts: [],
                        activeBeast: null,
                        // Guild System
                        guilds: [],
                        maxGuilds: 1,
                        guildManagementSkill: 0,
                        // Raid System
                        activeRaids: [],
                        completedRaids: 0,
                        failedRaids: 0,
                        raidingSkill: 0,
                        notoriety: 0,
                        banishmentTime: null,
                        // Title System
                        acquiredTitles: [],
                        // Active Effects
                        activeEffects: [],
                        // Stats
                        level: 1,
                        experience: 0,
                        reputation: 0,
                        // Arena Stats
                        arenaStats: {
                            totalBattles: 0,
                            wins: 0,
                            losses: 0,
                            earnings: 0,
                            winStreak: 0
                        },
                        // Pillage Security
                        lastPillaged: null,
                        pillageAttempts: 0,
                        successfulPillages: 0,
                        // Cooldowns
                        cooldowns: {
                            daily: null,
                            weekly: null,
                            quest: null,
                            arena_battle: null,
                            journey: null,
                            familiarCare: null,
                            pillage: null,
                            plead: null,
                            mystic_gambling: null,
                            market: null,
                            guild: null,
                            raid: null
                        },
                        dailyStreak: 0,
                        transactions: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        // Hunting Fields
                        conveyances: [],
                        activeConveyance: null,
                        weapons: [],
                        activeWeapon: null,
                        allies: [],
                        activeAllies: [],
                        troves: [],
                        inventory: [],
                        huntingSkill: 0,
                        currentHealth: 100
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            // Initialize missing fields for existing profiles
            let needsSave = false;
            if (!profile.beasts) {
                profile.beasts = [];
                needsSave = true;
            }
            if (profile.activeBeast === undefined) {
                profile.activeBeast = null;
                needsSave = true;
            }
            if (needsSave) {
                await profile.save();
            }

            return profile;
            
        } catch (error) {
            if (error.code === 11000) {
                console.log(`Duplicate key handled for user ${userId} in guild ${guildId}, fetching existing profile`);
                return await Economy.findOne({ userId, guildId });
            }
            
            console.error('Error in getProfile:', error);
            throw error;
        }
    }

    // Update embers
    static async updateEmbers(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.embers = Math.max(0, profile.embers + amount);
        await profile.save();
        return profile;
    }

    // Update royal treasury
    static async updateRoyalTreasury(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.royal_treasury = Math.max(0, profile.royal_treasury + amount);
        await profile.save();
        return profile;
    }

    // Followers strongbox operations
    static async updateFollowersStrongbox(userId, guildId, amount) {
        const profile = await this.getProfile(userId, guildId);
        profile.followers_strongbox = Math.max(0, profile.followers_strongbox + amount);
        await profile.save();
        return profile;
    }

    // Check cooldown with fantasy-themed commands
    static checkCooldown(profile, commandName) {
        const cooldownTimes = {
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000,
            quest: 60 * 60 * 1000,
            arena_battle: 5 * 60 * 1000,
            journey: 24 * 60 * 60 * 1000,
            familiarCare: 30 * 60 * 1000,
            pillage: 30 * 60 * 1000,
            plead: 10 * 60 * 1000,
            mystic_gambling: 30 * 1000,
            market: 10 * 1000,
            guild: 24 * 60 * 60 * 1000,
            raid: 60 * 60 * 1000,
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

    // Calculate total warding level
    static calculateWardingLevel(profile) {
        let totalWarding = 0;

        const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
        if (primaryStronghold) {
            totalWarding += primaryStronghold.securityLevel * 10;
        }

        profile.familiars.forEach(familiar => {
            const familiarEfficiency = (familiar.happiness + familiar.health + familiar.cleanliness) / 300;
            totalWarding += familiar.securityLevel * familiarEfficiency;
        });

        profile.acquiredTitles.forEach(title => {
            if (!title.expiryDate || title.expiryDate > new Date()) {
                totalWarding += title.benefits.pillageProtection;
            }
        });

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'pillage_protection') {
                totalWarding += effect.multiplier * effect.stacks;
            }
        });

        return Math.min(100, Math.floor(totalWarding));
    }

    // Calculate guild income
    static async calculateGuildIncome(guild, profile = null) {
        const guildType = GUILD_TYPES[guild.type];
        const baseIncome = guildType.dailyIncome;

        const levelMultiplier = guild.level * 0.5 + 0.5;
        const apprenticeBonus = guild.apprentices * (200 + (guild.level * 50));
        const efficiencyMultiplier = guild.efficiency || 1.0;
        const reputationBonus = (guild.reputation / 100) * (500 + guild.level * 100);
        
        const skillBonus = profile ? ((profile.guildManagementSkill || 0) * 10) : 0;

        const minIncome = Math.floor((baseIncome[0] * levelMultiplier + apprenticeBonus + reputationBonus + skillBonus) * efficiencyMultiplier);
        const maxIncome = Math.floor((baseIncome[1] * levelMultiplier + apprenticeBonus + reputationBonus + skillBonus) * efficiencyMultiplier);

        const randomIncome = Math.floor(Math.random() * (maxIncome - minIncome + 1)) + minIncome;
        const apprenticeCosts = guild.apprentices * Math.floor(guildType.apprenticeCost * 0.6);

        return {
            revenue: randomIncome,
            expenses: apprenticeCosts,
            profit: Math.max(0, randomIncome - apprenticeCosts)
        };
    }

    // Grant experience and skill for guild activities
    static async giveBusinessExperience(profile, action, amount = 0) {
        let expGain = 0;
        let skillGain = 0;
        
        switch(action) {
            case 'collect':
                expGain = Math.min(50, Math.floor(amount / 1000));
                skillGain = Math.min(5, Math.floor(amount / 5000));
                break;
            case 'upgrade':
                expGain = 25;
                skillGain = 3;
                break;
            case 'hire':
                expGain = 10 * amount;
                skillGain = 1;
                break;
            case 'fire':
                expGain = 5;
                skillGain = 0;
                break;
            case 'disband':
                expGain = 15;
                skillGain = 2;
                break;
        }
        
        profile.experience = (profile.experience || 0) + expGain;
        profile.guildManagementSkill = Math.min(100, (profile.guildManagementSkill || 0) + skillGain);
        
        return { expGain, skillGain };
    }

    // Disband a guild
    static async disbandGuild(profile, guildIndex) {
        const guild = profile.guilds[guildIndex];
        
        const baseValue = guild.purchasePrice * 0.6;
        const levelBonus = guild.purchasePrice * 0.02 * guild.level;
        const reputationBonus = guild.purchasePrice * 0.002 * guild.reputation;
        
        const disbandValue = Math.floor(baseValue + levelBonus + reputationBonus);
        
        profile.guilds.splice(guildIndex, 1);
        profile.embers += disbandValue;
        
        profile.transactions.push({
            type: 'income',
            amount: disbandValue,
            description: `Disbanded guild: ${guild.name}`,
            category: 'guild'
        });
        
        return disbandValue;
    }

    static async collectGuildIncome(userId, guildId) {
        const profile = await this.getProfile(userId, guildId);
        let totalProfit = 0;
        let guildReport = [];

        for (let guild of profile.guilds) {
            const hoursSinceCollection = guild.lastCollection ?
                (Date.now() - guild.lastCollection.getTime()) / (1000 * 60 * 60) : 24;

            if (hoursSinceCollection >= 24) {
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
            profile.embers += totalProfit;
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

    // RAID SYSTEM METHODS
    static async calculateRaidSuccess(raid, members) {
        const target = RAID_TARGETS[raid.targetType];
        let successChance = target.successChance;

        for (let member of members) {
            const profile = await this.getProfile(member.userId, raid.guildId);
            const skillBonus = profile.raidingSkill * 0.5;
            successChance += skillBonus / members.length;
        }

        const requiredEquipment = target.equipment;
        const hasAllEquipment = requiredEquipment.every(item =>
            raid.members.some(member => member.equipment.includes(item))
        );
        if (hasAllEquipment) successChance += 20;

        const notorietyPenalty = raid.notoriety_level * 0.3;
        successChance -= notorietyPenalty;

        if (raid.preparation_time >= target.planningTime) {
            successChance += 15;
        }

        return Math.max(5, Math.min(95, successChance));
    }

    static async executeRaid(raidId) {
        const raid = await Raid.findOne({ raidId });
        const target = RAID_TARGETS[raid.targetType];

        const memberProfiles = await Promise.all(
            raid.members.map(member => this.getProfile(member.userId, raid.guildId))
        );

        const successChance = await this.calculateRaidSuccess(raid, memberProfiles);
        const success = Math.random() * 100 < successChance;

        if (success) {
            const basePayout = Math.floor(Math.random() * (target.payout[1] - target.payout[0] + 1)) + target.payout[0];
            const memberShare = Math.floor(basePayout / raid.members.length);

            for (let i = 0; i < raid.members.length; i++) {
                const profile = memberProfiles[i];
                const member = raid.members[i];

                let roleBonus = 1.0;
                if (member.role === 'warlord') roleBonus = 1.5;
                else if (member.role === 'arcanist') roleBonus = 1.3;
                else if (member.role === 'rune_forger') roleBonus = 1.2;
                else if (member.role === 'scout') roleBonus = 1.1;
                else if (member.role === 'sentinel') roleBonus = 1.0;
                else if (member.role === 'vanguard') roleBonus = 1.0;
                else if (member.role === 'berserker') roleBonus = 1.2;

                const finalPayout = Math.floor(memberShare * roleBonus);

                profile.embers += finalPayout;
                profile.completedRaids += 1;
                profile.raidingSkill = Math.min(100, profile.raidingSkill + 10);
                profile.experience += 100;
                profile.notoriety = Math.min(100, profile.notoriety + target.difficulty * 10);

                profile.transactions.push({
                    type: 'income',
                    amount: finalPayout,
                    description: `Raid: ${target.name}`,
                    category: 'raid'
                });

                await profile.save();
            }

            raid.status = 'completed';
            raid.actual_payout = basePayout;
            raid.executionDate = new Date();

        } else {
            for (let i = 0; i < raid.members.length; i++) {
                const profile = memberProfiles[i];
                const banishmentHours = target.difficulty * 6;
                profile.banishmentTime = new Date(Date.now() + banishmentHours * 60 * 60 * 1000);

                const fine = Math.floor(profile.embers * 0.2);
                profile.embers = Math.max(0, profile.embers - fine);
                profile.failedRaids += 1;
                profile.notoriety = Math.min(100, profile.notoriety + target.difficulty * 15);

                profile.transactions.push({
                    type: 'expense',
                    amount: fine,
                    description: `Raid failure fine: ${target.name}`,
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

    // Calculate quest multiplier
    static calculateQuestMultiplier(profile) {
        let multiplier = 1.0;

        const hasStronghold = profile.strongholds.length > 0;
        if (hasStronghold && profile.followers.length > 0) {
            const followersBonus = (profile.followersBond / 100) * 0.5;
            multiplier += followersBonus;
        }

        profile.acquiredTitles.forEach(title => {
            if (!title.expiryDate || title.expiryDate > new Date()) {
                multiplier += title.benefits.workMultiplier - 1;
            }
        });

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'quest_boost') {
                multiplier += (effect.multiplier - 1) * effect.stacks;
            }
        });

        return multiplier;
    }

    // Get mystic gambling luck
    static getMysticGamblingLuck(profile) {
        let luckMultiplier = 1.0;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'mystic_luck') {
                luckMultiplier += (effect.multiplier - 1) * effect.stacks;
            }
        });

        return Math.min(2.5, luckMultiplier);
    }

    // Get treasury capacity
    static getTreasuryCapacity(profile) {
        const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
        let baseCapacity = primaryStronghold ? primaryStronghold.treasuryCapacity : 0;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'treasury_boost') {
                baseCapacity *= effect.multiplier;
            }
        });
        
        return Math.floor(baseCapacity);
    }

    // Get royal treasury limit
    static getRoyalTreasuryLimit(profile) {
        let baseLimit = profile.treasury_limit;

        profile.activeEffects.forEach(effect => {
            if (effect.type === 'royal_treasury_boost') {
                baseLimit *= effect.multiplier;
            }
        });

        return Math.floor(baseLimit);
    }

    // Calculate follower income
    static calculateFollowerIncome(profile) {
        return profile.followers.reduce((sum, follower) => {
            return sum + (follower.tribute * follower.questEfficiency * (follower.loyalty / 100));
        }, 0);
    }

    // Add active effect
    static async addActiveEffect(userId, guildId, effectType, multiplier, duration, stacks = 1) {
        const profile = await this.getProfile(userId, guildId);

        const existingEffect = profile.activeEffects.find(e => e.type === effectType);

        if (existingEffect && effectType === 'mystic_luck') {
            existingEffect.stacks = Math.min(5, existingEffect.stacks + stacks);
            existingEffect.expiryTime = new Date(Date.now() + duration);
        } else {
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