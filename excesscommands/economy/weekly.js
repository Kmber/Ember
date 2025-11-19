const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'weekly',
    aliases: ['week'],
    description: 'Claim your weekly reward with v2 components',
    async execute(message) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            const now = new Date();
            const cooldown = 7 * 24 * 60 * 60 * 1000; 

            if (profile.cooldowns.weekly && now - profile.cooldowns.weekly < cooldown) {
                const remaining = cooldown - (now - profile.cooldowns.weekly);
                const remainingDays = Math.floor(remaining / (24 * 60 * 60 * 1000));
                const remainingHours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Weekly Reward Cooldown\n## PATIENCE BRINGS GREATER REWARDS\n\n> You have already claimed your weekly reward this period!\n> The weekly reset brings substantial bonuses worth waiting for.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **TIME UNTIL NEXT WEEKLY**\n\n**Time Remaining:** \`${remainingDays}d ${remainingHours}h ${remainingMinutes}m\`\n**Next Available:** \`${new Date(now.getTime() + remaining).toLocaleDateString()} at ${new Date(now.getTime() + remaining).toLocaleTimeString()}\`\n**Reset Schedule:** \`Every 7 days\``)
                );

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 While You Wait:**\n> • Work regularly for consistent Embers\n> • Build follower allegiance for bigger bonuses\n> • Level up to increase weekly rewards\n> • The longer wait makes it more valuable!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const baseReward = 2500;
            const levelBonus = profile.level * 100;
            const followerBonus = Math.floor((profile.followerAllegiance / 100) * 1000);
            const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
            
            let totalReward = Math.floor((baseReward + levelBonus + followerBonus) * workMultiplier);
            
        
            let roleBonus = 0;
            profile.purchasedRoles.forEach(role => {
                if (!role.expiryDate || role.expiryDate > now) {
                    const bonus = role.benefits.workMultiplier * 500;
                    roleBonus += bonus;
                    totalReward += bonus;
                }
            });

         
            await EconomyManager.updateWallet(userId, guildId, totalReward);
            profile.cooldowns.weekly = now;
            profile.experience += 100;
            
       
            profile.transactions.push({
                type: 'income',
                amount: totalReward,
                description: 'Weekly reward',
                category: 'reward'
            });

            await profile.save();

            
            const components = [];

           
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🎁 Weekly Reward Claimed!\n## CONGRATULATIONS ON YOUR DEDICATION\n\n> You have successfully claimed your weekly reward of **\`${totalReward.toLocaleString()} Embers\`**!\n> Your consistent activity has paid off with substantial bonuses!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

       
            const breakdownContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **REWARD BREAKDOWN**')
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Base Weekly Reward:** \`${baseReward.toLocaleString()} Embers\`\n**⭐ Level Bonus:** \`${levelBonus.toLocaleString()} Embers\` (Level ${profile.level})\n**👥 Follower Bonus:** \`${followerBonus.toLocaleString()} Embers\` (${profile.followerAllegiance}% allegiance)`)
            );

            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Work Multiplier:** \`${workMultiplier.toFixed(2)}x\`\n**👑 Role Bonuses:** \`${roleBonus.toLocaleString()} Embers\`\n**🏆 Total Reward:** \`${totalReward.toLocaleString()} Embers\``)
            );

            components.push(breakdownContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const progressContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📈 **PROGRESS & ACHIEVEMENTS**')
            );

            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Experience Gained:** \`+100 XP\`\n**🏆 Current Level:** \`${profile.level}\`\n**💳 New Wallet Balance:** \`${profile.wallet.toLocaleString()} Embers\`\n**📊 Total Net Worth:** \`${(profile.wallet + profile.bank + profile.followerTithe).toLocaleString()} Embers\``)
            );

          
            const multiplierSources = [];
            if (profile.followers.length > 0 && profile.citadels.length > 0) {
                multiplierSources.push(`Follower Allegiance (+${((profile.followerAllegiance / 100) * 0.5 * 100).toFixed(1)}%)`);
            }
            if (profile.purchasedRoles.length > 0) {
                multiplierSources.push(`Active Roles (${profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > now).length})`);
            }

            if (multiplierSources.length > 0) {
                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚡ Bonus Sources:** ${multiplierSources.join(', ')}\n\n> Your investments in followers and roles are paying dividends!`)
                );
            }

            components.push(progressContainer);

          
            if (profile.followers.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const followerContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 👥 **FOLLOWER CONTRIBUTION**')
                );

                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Followers:** \`${profile.followers.length}\`\n**Average Follower Allegiance:** \`${profile.followerAllegiance}%\`\n**Follower Bonus Applied:** \`${followerBonus.toLocaleString()} Embers\`\n**Allegiance Impact:** \`${((profile.followerAllegiance / 100) * 100).toFixed(1)}% of maximum bonus\``)
                );

                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Tip:** Interact with your followers to increase allegiance and boost weekly rewards!\n\n> Strong follower relationships lead to better financial support.`)
                );

                components.push(followerContainer);
            }

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const scheduleContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            scheduleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **NEXT WEEKLY REWARD**\n\n**Next Claim Date:** \`${new Date(now.getTime() + cooldown).toLocaleDateString()}\`\n**Next Claim Time:** \`${new Date(now.getTime() + cooldown).toLocaleTimeString()}\`\n**Reset Schedule:** \`Every 7 days\`\n**Current Time:** \`${now.toLocaleString()}\`\n\n> Keep building your level, follower allegiance, and role collection for even bigger rewards next week!`)
            );

            components.push(scheduleContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in weekly command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **WEEKLY REWARD ERROR**\n\nSomething went wrong while processing your weekly reward. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};