const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'mountrace',
    description: 'Race your mount in the arena to win Embers.',
    cooldown: 300, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'arena_battle');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Arena Cooldown Active\n## YOUR MOUNT MUST REST\n\n> Your mount needs to recover its strength after the last battle!\n> The arena demands that all combatants are well-rested.`)
                );

                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **RECOVERY INFORMATION**\n\n**Time Remaining:** \`${hours}h ${minutes}m\`\n**Next Battle Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n**Cooldown Duration:** \`5 minutes\`\n\n> Use this time to tend to your mount or visit the bestiary.`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (!profile.activeMount) {
                const components = [];

                const noMountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noMountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐾 No Active Mount\n## A MOUNT IS REQUIRED FOR BATTLE\n\n> You must select a mount from your stable before entering the arena!\n> You cannot compete without a trained beast.`)
                );

                components.push(noMountContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐎 **PREPARE FOR THE ARENA**\n\n**Step 1:** Use \`!buymount\` to acquire a mount\n**Step 2:** Set it as your active mount in the stables\n**Step 3:** Return here to enter the arena!\n\n**💡 Tip:** More powerful mounts have a greater chance of victory and earn larger prizes!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const mount = profile.mounts.find(m => m.mountId === profile.activeMount);
            if (!mount) {
                const components = [];

                const mountNotFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                mountNotFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Active Mount Not Found\n## STABLE ERROR\n\n> Your active mount was not found in your stables!\n> This could be a clerical error. Please try selecting your active mount again.`)
                );

                components.push(mountNotFoundContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const performance = (mount.speed + mount.acceleration + mount.handling) / 3;
            const winChance = Math.min(90, Math.max(10, performance + Math.random() * 20));
            
            const won = Math.random() * 100 < winChance;
            const baseWinnings = Math.floor(Math.random() * 5000) + 1000;
            const winnings = Math.floor(baseWinnings * (performance / 50));
            
            let titleBonus = 0;
            profile.acquiredTitles.forEach(title => {
                if (!title.expiryDate || title.expiryDate > new Date()) {
                    titleBonus += title.benefits.arenaBonus || 0;
                }
            });
            
            profile.cooldowns.arena_battle = new Date();
            
            const components = [];

            if (won) {
                const totalWinnings = winnings + titleBonus;
                profile.embers += totalWinnings;
                profile.arenaStats.wins += 1;
                profile.arenaStats.winStreak += 1;
                profile.arenaStats.earnings += totalWinnings;
                mount.battleWins += 1;

                const victoryContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                victoryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏆 ARENA VICTORY!\n## CHAMPION OF THE REALM\n\n> Congratulations! You have dominated the arena with your **${mount.name}**!\n> Your tactical prowess and your mount's power led to a glorious victory!`)
                );

                components.push(victoryContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **BATTLE SPOILS**\n\n**🏆 Base Prize:** \`${winnings.toLocaleString()} Embers\`\n**👑 Title Bonus:** \`${titleBonus.toLocaleString()} Embers\`\n**💎 Total Winnings:** \`${totalWinnings.toLocaleString()} Embers\`\n**💳 New Coin Purse:** \`${profile.embers.toLocaleString()} Embers\``)
                );
                
                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚔️ Win Streak:** \`${profile.arenaStats.winStreak}\`\n**📊 Mount Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Victory Chance:** \`${winChance.toFixed(1)}%\``)
                );

                components.push(resultsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🐎 **MOUNT & RIDER STATS**\n\n**🐎 Mount:** \`${mount.name}\`\n**⚡ Speed:** \`${mount.speed}/100\`\n**🚀 Acceleration:** \`${mount.acceleration}/100\`\n**🎯 Handling:** \`${mount.handling}/100\`\n**❤️ Durability:** \`${mount.durability}%\``)
                );
                
                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Mount Victories:** \`${mount.battleWins}\`\n**📈 Total Career Earnings:** \`${profile.arenaStats.earnings.toLocaleString()} Embers\`\n**⚔️ Total Battles:** \`${profile.arenaStats.totalBattles + 1}\``)
                );

                components.push(statsContainer);

            } else {
                const loss = Math.floor(winnings * 0.3);
                profile.embers = Math.max(0, profile.embers - loss);
                profile.arenaStats.losses += 1;
                profile.arenaStats.winStreak = 0;
                mount.battleLosses += 1;
                const durabilityLoss = Math.floor(Math.random() * 5);
                mount.durability = Math.max(0, mount.durability - durabilityLoss);

                const lossContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                lossContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Arena Defeat\n## A VALIANT EFFORT, BUT NOT ENOUGH\n\n> Unfortunately, you were outmatched in the arena today.\n> The battle was fierce, but victory slipped through your grasp.`)
                );

                components.push(lossContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const lossDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💸 **BATTLE CONSEQUENCES**\n\n**💰 Recovery Costs:** \`${loss.toLocaleString()} Embers\`\n**💳 Remaining Coin Purse:** \`${profile.embers.toLocaleString()} Embers\`\n**💔 Durability Loss:** \`-${durabilityLoss}%\`\n**🐎 Mount Condition:** \`${mount.durability}%\``)
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📊 Mount Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Victory Chance:** \`${winChance.toFixed(1)}%\`\n**💔 Win Streak:** \`Reset to 0\``)
                );
                
                components.push(lossDetailsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const tipsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                tipsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **BATTLE TIPS**\n\n**🛡️ Tend to Your Mount:** Use potions to restore its durability\n**🐎 Acquire a Better Mount:** More powerful mounts have higher victory rates\n**👑 Earn Noble Titles:** Gain bonus Embers from title benefits\n**⚔️ Keep Battling:** Experience is the greatest teacher!\n\n> Every champion has faced defeat - return to the arena stronger!`)
                );

                components.push(tipsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRaceContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextRaceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚔️ **NEXT BATTLE AVAILABILITY**\n\n**Next Battle:** \`${new Date(Date.now() + 300000).toLocaleDateString()} at ${new Date(Date.now() + 300000).toLocaleTimeString()}\`\n**Cooldown:** \`5 minutes\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n> Use this time to recover and prepare your strategy for the next battle!`)
            );

            components.push(nextRaceContainer);

            profile.arenaStats.totalBattles += 1;
            await profile.save();

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in mountrace command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **ARENA BATTLE ERROR**\n\nSomething went wrong during the battle. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
