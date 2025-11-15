const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'quest',
    description: 'Embark on a quest to earn Embers and experience.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'quest');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ On a Quest\n## YOU MUST RECOVER YOUR STRENGTH\n\n> You have already embarked on a quest recently and need time to recover.`)
                );

                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **RECOVERY TIME**\n\n**Time Remaining:** \`${hours}h ${minutes}m\`\n**Next Quest Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n**Cooldown Duration:** \`1 hour\`\n\n> Use this time to prepare for your next adventure!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const baseEarnings = Math.floor(Math.random() * 500) + 200;
            const questMultiplier = EconomyManager.calculateQuestMultiplier(profile);
            
            let followerEarnings = 0;
            const hasStronghold = profile.strongholds.length > 0;
            
            if (hasStronghold && profile.followers.length > 0) {
                profile.followers.forEach(follower => {
                    const followerContribution = follower.salary * follower.questEfficiency * (follower.loyalty / 100);
                    followerEarnings += followerContribution;
                });
            }
            
            const personalEarnings = Math.floor(baseEarnings * questMultiplier);
            const totalEarnings = personalEarnings + Math.floor(followerEarnings);
            
            profile.embers += totalEarnings;
            profile.experience += 10;
            profile.cooldowns.quest = new Date();
            
            const requiredXP = profile.level * 100;
            let leveledUp = false;
            if (profile.experience >= requiredXP) {
                profile.level += 1;
                profile.experience = 0;
                leveledUp = true;
            }
            
            profile.transactions.push({
                type: 'income',
                amount: totalEarnings,
                description: 'Quest rewards',
                category: 'quest'
            });
            
            await profile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ Quest Complete!\n## A SUCCESSFUL ADVENTURE\n\n> You have completed your quest and earned your rewards!\n> ${leveledUp ? '🎉 **BONUS: You have leveled up!**' : 'Continue your journey to build your legend!'}`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const earningsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **QUEST REWARDS**')
            );

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚔️ Personal Reward:** \`${personalEarnings.toLocaleString()} Embers\`\n**👥 Follower Contribution:** \`${Math.floor(followerEarnings).toLocaleString()} Embers\`\n**💎 Total Earnings:** \`${totalEarnings.toLocaleString()} Embers\``)
            );

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Quest Multiplier:** \`${questMultiplier.toFixed(2)}x\`\n**⭐ Experience Gained:** \`+10 XP\`\n**💳 New Coin Purse:** \`${profile.embers.toLocaleString()} Embers\``)
            );

            components.push(earningsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const progressContainer = new ContainerBuilder()
                .setAccentColor(leveledUp ? 0xE74C3C : 0x3498DB);

            if (leveledUp) {
                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎉 **LEVEL UP!**\n\n> **Congratulations!** You have reached **Level ${profile.level}**!\n> Your power and influence grow!`)
                );

                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🆙 New Level:** \`${profile.level}\`\n**🔄 Experience Reset:** \`0 / ${profile.level * 100} XP\`\n**🎯 Benefits:** Greater rewards and new opportunities await!`)
                );
            } else {
                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **PROGRESS**')
                );

                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Current Level:** \`${profile.level}\`\n**⭐ Experience:** \`${profile.experience} / ${requiredXP} XP\`\n**📈 Progress:** \`${((profile.experience / requiredXP) * 100).toFixed(1)}%\`\n**🎯 XP to Next Level:** \`${requiredXP - profile.experience} XP\``)
                );
            }

            components.push(progressContainer);

            if (profile.followers.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const followerContainer = new ContainerBuilder()
                    .setAccentColor(hasStronghold ? 0x9B59B6 : 0xF39C12);

                if (hasStronghold) {
                    followerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 👥 **LOYAL FOLLOWERS**')
                    );

                    const followerDetails = profile.followers.slice(0, 3).map(follower => {
                        const followerContribution = follower.salary * follower.questEfficiency * (follower.loyalty / 100);
                        return `**${follower.name}** (${follower.role})\n> **Contribution:** \`${Math.floor(followerContribution).toLocaleString()} Embers\` • **Loyalty:** \`${follower.loyalty}%\``;
                    }).join('\n\n');

                    followerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(followerDetails)
                    );

                    if (profile.followers.length > 3) {
                        followerContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.followers.length - 3} more followers contributed!*`)
                        );
                    }
                } else {
                    followerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏰 **FOLLOWERS NEED A STRONGHOLD**\n\n> Your **${profile.followers.length}** followers wish to aid you, but they need a stronghold to operate from!\n\n**💡 Solution:** Acquire a stronghold to unlock follower contributions and greatly increase your quest rewards!`)
                    );
                }

                components.push(followerContainer);
            }

            const activeQuestEffects = profile.activeEffects.filter(e => e.type === 'quest_boost');
            if (activeQuestEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **ACTIVE QUEST BOOSTS**')
                );

                const effectsText = activeQuestEffects.map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    return `**\`${effect.name}\`**\n> **Multiplier:** \`${effect.multiplier}x\` • **Duration:** \`${timeLeft}h remaining\``;
                }).join('\n\n');

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(effectsText)
                );

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚡ Total Active Boosts:** \`${activeQuestEffects.length}\`\n\n> These effects are currently boosting your quest rewards!`)
                );

                components.push(effectsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextQuestContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextQuestContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **NEXT QUEST**\n\n**Next Quest Available:** \`${new Date(Date.now() + 3600000).toLocaleDateString()} at ${new Date(Date.now() + 3600000).toLocaleTimeString()}\`\n**Cooldown Duration:** \`1 hour\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n> Continue your quests to build your legend and fortune!`)
            );

            components.push(nextQuestContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in quest command:', error);

            const errorContainer = a.ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **QUEST ERROR**\n\nSomething went wrong while embarking on your quest. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};