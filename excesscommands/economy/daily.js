const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'daily',
    description: 'Claim your daily blessing of Embers.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const now = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;
            
            if (profile.cooldowns.daily && (now - profile.cooldowns.daily.getTime()) < oneDayMs) {
                const timeLeft = oneDayMs - (now - profile.cooldowns.daily.getTime());
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Daily Blessing Cooldown\n## THE GODS REWARD THE FAITHFUL\n\n> You have already received your daily blessing! Return on the morrow for another.\n> Blessings are bestowed every 24 hours to honor the dedicated.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **TIME UNTIL NEXT BLESSING**\n\n**Time Remaining:** \`${hoursLeft}h ${minutesLeft}m\`\n**Next Available:** \`${new Date(now + timeLeft).toLocaleDateString()} at ${new Date(now + timeLeft).toLocaleTimeString()}\`\n**Current Allegiance:** \`${profile.dailyStreak} days\`\n\n> Maintain your allegiance by claiming your blessing each day!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const wasYesterday = profile.cooldowns.daily && (now - profile.cooldowns.daily.getTime()) < (2 * oneDayMs);
            
            if (wasYesterday) {
                profile.dailyStreak += 1;
            } else {
                profile.dailyStreak = 1;
            }
            
            const baseBlessing = 500;
            const allegianceBonus = Math.min(profile.dailyStreak * 50, 1000);
            const titleBonus = profile.acquiredTitles
                .filter(t => !t.expiryDate || t.expiryDate > new Date())
                .reduce((sum, title) => sum + (title.benefits.followerBonus * 100), 0);
            
            const totalBlessing = baseBlessing + allegianceBonus + titleBonus;
            
            profile.embers += totalBlessing;
            profile.cooldowns.daily = new Date();
            profile.experience += 5;

            profile.transactions.push({
                type: 'income',
                amount: totalBlessing,
                description: `Daily blessing (${profile.dailyStreak} day allegiance)`,
                category: 'daily'
            });
            
            await profile.save();
            
            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFFD700);

            const streakMessage = profile.dailyStreak === 1 ? 
                'You have begun a new allegiance!' : 
                `A commendable ${profile.dailyStreak}-day allegiance!`;

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎁 Daily Blessing Received!\n## YOUR LOYALTY IS REWARDED\n\n> Congratulations! You have received a daily blessing of **\`${totalBlessing.toLocaleString()} Embers\`**!\n> ${streakMessage}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const breakdownContainer = new ContainerBuilder()
                .setAccentColor(0xFFC107);

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **BLESSING BREAKDOWN**')
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Base Daily Blessing:** \`${baseBlessing.toLocaleString()} Embers\`\n**🔥 Allegiance Bonus:** \`${allegianceBonus.toLocaleString()} Embers\` (${profile.dailyStreak} days)\n**👑 Title Bonus:** \`${titleBonus.toLocaleString()} Embers\`\n**💰 Total Blessing:** \`${totalBlessing.toLocaleString()} Embers\``)
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**✨ Arcane Power Gained:** \`+5 XP\`\n**💳 New Ember Sachel Balance:** \`${profile.embers.toLocaleString()} Embers\`\n**📊 Ledger Updated:** Daily blessing recorded`)
            );

            components.push(breakdownContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const streakContainer = new ContainerBuilder()
                .setAccentColor(profile.dailyStreak >= 7 ? 0xE74C3C : 0x3498DB);

            streakContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔥 **ALLEGIANCE STATUS**')
            );

            const nextAllegianceBonus = Math.min((profile.dailyStreak + 1) * 50, 1000);

            streakContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 Current Allegiance:** \`${profile.dailyStreak} days\`\n**💵 Current Bonus:** \`${allegianceBonus}\` per day\n**📈 Next Day's Bonus:** \`${nextAllegianceBonus}\`\n**🎯 Max Bonus:** \`1,000 Embers\` (20+ day allegiance)`)
            );

            if (profile.dailyStreak >= 7) {
                streakContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 ALLEGIANCE MILESTONE!** You have maintained a ${profile.dailyStreak}-day allegiance!\n\n> Your dedication is noted! Continue for even greater rewards!`)
                );
            } else {
                streakContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Allegiance Tips:** Claim your blessing daily to build a powerful bonus!\n\n> ${7 - profile.dailyStreak} more days until your first weekly milestone!`)
                );
            }

            components.push(streakContainer);

            if (titleBonus > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const roleContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                roleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 👑 **NOBLE TITLE BENEFITS**')
                );

                const activeTitles = profile.acquiredTitles.filter(t => !t.expiryDate || t.expiryDate > new Date());
                roleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Active Noble Titles:** \`${activeTitles.length}\`\n**Daily Title Bonus:** \`${titleBonus.toLocaleString()} Embers\`\n**Monthly Title Value:** \`${(titleBonus * 30).toLocaleString()} Embers\`\n\n> Your noble status enhances your daily blessings!`)
                );

                components.push(roleContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRewardContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextRewardContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **NEXT DAILY BLESSING**\n\n**Next Blessing Available:** \`${new Date(now + oneDayMs).toLocaleDateString()} at ${new Date(now + oneDayMs).toLocaleTimeString()}\`\n**Projected Next Blessing:** \`${baseBlessing + nextAllegianceBonus + titleBonus}\`\n**Allegiance Continuation:** Return within 48 hours to maintain your allegiance\n\n> Set a reminder to maximize your divine favor!`)
            );

            components.push(nextRewardContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in daily command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **DIVINE INTERFERENCE**\n\nSomething went wrong while bestowing your daily blessing. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};