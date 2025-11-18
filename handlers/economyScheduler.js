
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { Economy, EconomyManager } = require('../models/economy/economy');
const EconomyUtils = require('../utils/economyUtils');

module.exports = (client) => {
    // Nightly robbery system (2 AM daily)
    cron.schedule('0 2 * * *', async () => {
        await handleNightlyRobberies(client);
    });
    
    // Pet stat decay (every 6 hours)
    cron.schedule('0 */6 * * *', async () => {
        await EconomyUtils.decayPetStats();
    });
    
    // Monthly bills (1st of each month at midnight)
    cron.schedule('0 0 1 * *', async () => {
        await EconomyUtils.handleMonthlyBills();
    });
    
    // Role expiry check (daily at 1 AM)
    cron.schedule('0 1 * * *', async () => {
        await handleRoleExpiries(client);
    });
    
    // Random events (every 4 hours)
    cron.schedule('0 */4 * * *', async () => {
        await handleRandomEvents(client);
    });
    
    async function handleNightlyRobberies(client) {
        try {
            const allProfiles = await Economy.find({});
            let robberiesAttempted = 0;
            let successfulRobberies = 0;
            
            for (const profile of allProfiles) {
                if (profile.followerTithe < 5000) continue; // Not worth robbing
                
                const securityLevel = EconomyManager.calculateSecurityLevel(profile);
                const baseRobberyChance = 25; // Base 25% chance
                const robberyChance = Math.max(2, baseRobberyChance - securityLevel);
                
                robberiesAttempted++;
                
                if (Math.random() * 100 < robberyChance) {
                    successfulRobberies++;
                    await executeRobbery(client, profile, securityLevel);
                }
            }
            
            console.log(`🚨 Robberies: ${successfulRobberies}/${robberiesAttempted} successful`);
        } catch (error) {
            console.error('Error in nightly robbery system:', error);
        }
    }
    
    async function executeRobbery(client, profile, securityLevel) {
        const user = await client.users.fetch(profile.userId).catch(() => null);
        if (!user) return;
        
        const vaultAmount = profile.followerTithe;
        const baseStealPercentage = 0.6; // 60% base
        const securityReduction = (securityLevel / 100) * 0.3; // Up to 30% reduction
        const stealPercentage = Math.max(0.2, baseStealPercentage - securityReduction);
        
        const stolenAmount = Math.floor(vaultAmount * stealPercentage);
        const remainingAmount = vaultAmount - stolenAmount;
        
        profile.followerTithe = remainingAmount;
        profile.lastRobbed = new Date();
        profile.robberyAttempts += 1;
        
        profile.transactions.push({
            type: 'expense',
            amount: -stolenAmount,
            description: `Robbed during the night (Security: ${securityLevel}%)`,
            category: 'robbery'
        });
        
        profile.pets.forEach(pet => {
            if (pet.health > 80 && pet.happiness > 70) {
                pet.health = Math.max(50, pet.health - Math.floor(Math.random() * 20));
                pet.happiness = Math.max(30, pet.happiness - Math.floor(Math.random() * 15));
            }
        });
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🚨 ROBBERY ALERT!')
            .setDescription('Your follower tithe chest was broken into during the night!')
            .addFields(
                { name: '💸 Amount Stolen', value: `$${stolenAmount.toLocaleString()}`, inline: true },
                { name: '🏦 Remaining in Tithe Chest', value: `$${remainingAmount.toLocaleString()}`, inline: true },
                { name: '🛡️ Your Security Level', value: `${securityLevel}%`, inline: true }
            )
            .setColor('#FF0000')
            .setFooter({ text: '💡 Tip: Improve security with better pets, properties, and roles!' })
            .setTimestamp();
            
        try {
            await user.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Could not send robbery notification to ${profile.userId}`);
        }
    }
    
    async function handleRoleExpiries(client) {
        try {
            const profiles = await Economy.find({
                'purchasedRoles.expiryDate': { $lte: new Date() }
            });
            
            for (const profile of profiles) {
                const user = await client.users.fetch(profile.userId).catch(() => null);
                if (!user) continue;
                
                const expiredRoles = profile.purchasedRoles.filter(role => 
                    role.expiryDate && role.expiryDate <= new Date()
                );
                
                if (expiredRoles.length === 0) continue;
                
                const expiredRoleNames = expiredRoles.map(role => role.roleName);
                
                try {
                    const guild = client.guilds.cache.get(profile.guildId);
                    if (guild) {
                        const member = await guild.members.fetch(profile.userId).catch(() => null);
                        if (member) {
                            for (const roleName of expiredRoleNames) {
                                const discordRole = guild.roles.cache.find(r => 
                                    r.name.toLowerCase() === roleName.toLowerCase()
                                );
                                if (discordRole && member.roles.cache.has(discordRole.id)) {
                                    await member.roles.remove(discordRole);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log('Could not remove Discord roles:', error.message);
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('👑 Premium Roles Expired')
                    .setDescription(`The following premium roles have expired:\n**${expiredRoleNames.join(', ')}**`)
                    .addFields({
                        name: '🔄 Renew Your Roles',
                        value: 'Use `!buyrole` command to purchase roles again and regain your benefits!'
                    })
                    .setColor('#FF9800')
                    .setTimestamp();
                    
                try {
                    await user.send({ embeds: [embed] });
                } catch (error) {
                    console.log(`Could not send role expiry notification to ${profile.userId}`);
                }
            }
        } catch (error) {
            console.error('Error in role expiry system:', error);
        }
    }
    
    async function handleRandomEvents(client) {
        try {
            const activeProfiles = await Economy.find({
                $or: [
                    { 'cooldowns.work': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                    { 'cooldowns.daily': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                ]
            }).limit(10);
            
            for (const profile of activeProfiles) {
                if (Math.random() < 0.1) { // 10% chance per active user
                    await triggerRandomEvent(client, profile);
                }
            }
        } catch (error) {
            console.error('Error in random events system:', error);
        }
    }
    
    async function triggerRandomEvent(client, profile) {
        const user = await client.users.fetch(profile.userId).catch(() => null);
        if (!user) return;
        
        const events = [
            {
                name: 'Lucky Find',
                type: 'positive',
                action: () => {
                    const amount = Math.floor(Math.random() * 2000) + 500;
                    profile.wallet += amount;
                    return {
                        title: '🍀 Lucky Find!',
                        description: `You found $${amount} while walking around the neighborhood!`,
                        color: '#4CAF50'
                    };
                }
            },
            {
                name: 'Beast Sickness',
                type: 'negative',
                condition: () => profile.beasts.length > 0,
                action: () => {
                    const beast = profile.beasts[Math.floor(Math.random() * profile.beasts.length)];
                    const vetCost = Math.floor(Math.random() * 1000) + 200;
                    const durabilityLoss = Math.floor(Math.random() * 20) + 5;
                    
                    profile.wallet = Math.max(0, profile.wallet - vetCost);
                    beast.durability = Math.max(0, beast.durability - durabilityLoss);
                    
                    return {
                        title: '🐾 Beast Sickness!',
                        description: `Your ${beast.name} fell ill! Vet cost: ${vetCost}. Durability: ${beast.durability}%`,
                        color: '#FF5722'
                    };
                }
            },
            {
                name: 'Pet Illness',
                type: 'negative',
                condition: () => profile.pets.length > 0,
                action: () => {
                    const pet = profile.pets[Math.floor(Math.random() * profile.pets.length)];
                    const vetCost = Math.floor(Math.random() * 500) + 100;
                    
                    profile.wallet = Math.max(0, profile.wallet - vetCost);
                    pet.health = Math.max(20, pet.health - 30);
                    pet.happiness = Math.max(10, pet.happiness - 20);
                    
                    return {
                        title: '🏥 Pet Emergency!',
                        description: `${pet.name} got sick and needed veterinary care! Cost: ${vetCost}`,
                        color: '#FF9800'
                    };
                }
            },
            {
                name: 'Follower Blessing',
                type: 'positive',
                condition: () => profile.followers.length > 0,
                action: () => {
                    const follower = profile.followers[Math.floor(Math.random() * profile.followers.length)];
                    const bonus = Math.floor(Math.random() * 1500) + 500;
                    
                    profile.wallet += bonus;
                    follower.allegiance = Math.min(100, follower.allegiance + 5);
                    
                    return {
                        title: '🙏 Follower Blessing!',
                        description: `${follower.name} had a divine revelation and shared their newfound wealth of ${bonus} gold with the cult!`,
                        color: '#E91E63'
                    };
                }
            },
            {
                name: 'Property Appreciation',
                type: 'positive',
                condition: () => profile.properties.length > 0,
                action: () => {
                    const property = profile.properties[Math.floor(Math.random() * profile.properties.length)];
                    const appreciation = Math.floor(property.currentValue * 0.02); // 2% appreciation
                    
                    property.currentValue += appreciation;
                    
                    return {
                        title: '🏠 Property Value Up!',
                        description: `Your ${property.name} increased in value by ${appreciation}!`,
                        color: '#2196F3'
                    };
                }
            },
            {
                name: 'Utility Bill Spike',
                type: 'negative',
                condition: () => profile.properties.length > 0,
                action: () => {
                    const extraCost = Math.floor(Math.random() * 800) + 200;
                    profile.wallet = Math.max(0, profile.wallet - extraCost);
                    
                    return {
                        title: '⚡ High Utility Bill!',
                        description: `Unexpected utility surge cost you an extra ${extraCost}!`,
                        color: '#FF5722'
                    };
                }
            },
            {
                name: 'Investment Opportunity',
                type: 'neutral',
                action: () => {
                    const investmentAmount = Math.floor(Math.random() * 5000) + 1000;
                    const potential = Math.floor(Math.random() * 3000) + 500;
                    
                    return {
                        title: '💼 Investment Opportunity!',
                        description: `A friend offered you an investment opportunity! Cost: ${investmentAmount}, Potential return: ${potential + investmentAmount}. Use your judgment!`,
                        color: '#9C27B0'
                    };
                }
            }
        ];
        
        const availableEvents = events.filter(event => 
            !event.condition || event.condition()
        );
        
        if (availableEvents.length === 0) return;
        
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        const result = randomEvent.action();
        
        if (randomEvent.type === 'positive' || randomEvent.type === 'negative') {
            const amountMatch = result.description.match(/\$?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

            if (amount !== 0) {
                profile.transactions.push({
                    type: randomEvent.type === 'positive' ? 'income' : 'expense',
                    amount: amount,
                    description: `Random Event: ${randomEvent.name}`,
                    category: 'random_event'
                });
            }
        }
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle(result.title)
            .setDescription(result.description)
            .setColor(result.color)
            .setFooter({ text: 'Random Event' })
            .setTimestamp();
            
        try {
            await user.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Could not send random event notification to ${profile.userId}`);
        }
    }
};
