const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'work',
    description: 'Work to earn money (affected by follower allegiance and active effects) with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'work');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Work Cooldown Active\n## TAKE A WELL-DESERVED BREAK\n\n> You've already worked recently and need time to rest before your next shift!`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **COOLDOWN INFORMATION**\n\n**Time Remaining:** \`${hours}h ${minutes}m\`\n**Next Work Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n**Cooldown Duration:** \`1 hour\`\n\n> Use this time to plan your next financial moves!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const baseEarnings = Math.floor(Math.random() * 500) + 200;
            const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
            
            let followerEarnings = 0;
            const hasCitadel = profile.citadels.length > 0;
            
            if (hasCitadel && profile.followers.length > 0) {
                profile.followers.forEach(member => {
                    const memberEarnings = member.salary * member.workEfficiency * (member.allegiance / 100);
                    followerEarnings += memberEarnings;
                });
            }
            
            const personalEarnings = Math.floor(baseEarnings * workMultiplier);
            const totalEarnings = personalEarnings + Math.floor(followerEarnings);
            
            profile.wallet += totalEarnings;
            profile.experience += 10;
            profile.cooldowns.work = new Date();
            
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
                description: 'Work earnings',
                category: 'work'
            });
            
            await profile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💼 Work Shift Complete!\n## ANOTHER PRODUCTIVE DAY\n\n> You've completed a hard day's work and earned your wages!\n> ${leveledUp ? '🎉 **BONUS: You leveled up!**' : 'Keep building your career and wealth!'}`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const earningsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **EARNINGS BREAKDOWN**')
            );

            let earningsContent = `**💼 Personal Earnings:** \`$${personalEarnings.toLocaleString()}\``;
            if (followerEarnings > 0) {
                earningsContent += `\n**👥 Follower Contribution:** \`$${Math.floor(followerEarnings).toLocaleString()}\``;
            }
            earningsContent += `\n**💎 Total Earnings:** \`$${totalEarnings.toLocaleString()}\``;

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(earningsContent)
            );

            earningsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Work Multiplier:** \`${workMultiplier.toFixed(2)}x\`\n**⭐ Experience Gained:** \`+10 XP\`\n**💳 New Wallet Balance:** \`$${profile.wallet.toLocaleString()}\``)
            );

            components.push(earningsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const progressContainer = new ContainerBuilder()
                .setAccentColor(leveledUp ? 0xE74C3C : 0x3498DB);

            if (leveledUp) {
                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎉 **LEVEL UP CELEBRATION!**\n\n> **Congratulations!** You've reached **Level ${profile.level}**!\n> Your hard work is paying off with career advancement!`)
                );

                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🆙 New Level:** \`${profile.level}\`\n**🔄 Experience Reset:** \`0 / ${profile.level * 100} XP\`\n**🎯 Benefits:** Higher earnings potential and new opportunities!`)
                );
            } else {
                progressContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **PROGRESS TRACKING**')
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
                    .setAccentColor(hasCitadel ? 0x9B59B6 : 0xF39C12);

                if (hasCitadel) {
                    followerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 👥 **FOLLOWER WORKFORCE**')
                    );

                    const followerDetails = profile.followers.slice(0, 3).map(member => {
                        const memberEarnings = member.salary * member.workEfficiency * (member.allegiance / 100);
                        return `**${member.name}** (${member.relationship})\n> **Contribution:** \`$${Math.floor(memberEarnings).toLocaleString()}\` • **Allegiance:** \`${member.allegiance}%\``;
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
                            .setContent(`## 🏰 **FOLLOWERS NEED A CITADEL**\n\n> Your **${profile.followers.length}** followers want to help with work earnings, but they need a citadel first!\n\n**💡 Solution:** Acquire a citadel (\`!acquirecitadel\`) to unlock follower workforce contributions and boost your income significantly!`)
                    );
                }

                components.push(followerContainer);
            }

            const activeWorkEffects = profile.activeEffects.filter(e => e.type === 'work_boost');
            if (activeWorkEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **ACTIVE WORK BOOSTS**')
                );

                const effectsText = activeWorkEffects.map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    return `**\`${effect.name}\`**\n> **Multiplier:** \`${effect.multiplier}x\` • **Duration:** \`${timeLeft}h remaining\``;
                }).join('\n\n');

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(effectsText)
                );

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚡ Total Active Boosts:** \`${activeWorkEffects.length}\`\n\n> These effects are currently boosting your work earnings!`)
                );

                components.push(effectsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextWorkContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextWorkContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **NEXT WORK SHIFT**\n\n**Next Work Available:** \`${new Date(Date.now() + 3600000).toLocaleTimeString()}\`\n**Cooldown Duration:** \`1 hour\``)
            );

            components.push(nextWorkContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in work command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **WORK ERROR**\n\nSomething went wrong while processing your work shift. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};