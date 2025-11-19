const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'beastrace',
    description: 'Race your beast to win Embers .',
    cooldown: 300, 
    usage: 'beastrace',
    async execute(message) {
        try {
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
         
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'beastrace');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Beast Race Cooldown Active\n## BEAST NEEDS TO REST\n\n> Your beast needs time to recover after the last race!\n> Racing requires proper rest breaks between events.`)
                );

                components.push(cooldownContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **COOLDOWN INFORMATION**\n\n**Time Remaining:** \`${hours}h ${minutes}m\`\n**Next Race Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n**Cooldown Duration:** \`5 minutes\`\n\n> Use this time to care for your beast or check racing stats!`)
                );

                components.push(timeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (!profile.activeBeast) {
                const components = [];

                const noBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👹 No Active Beast\n## BEAST REQUIRED FOR RACING\n\n> You need to summon and select a beast before you can race!\n> Can't participate in races without a proper beast.`)
                );

                components.push(noBeastContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **GET RACING READY**\n\n**Step 1:** Use \`${prefix}summon\` to summon a beast\n**Step 2:** Set it as your active beast\n**Step 3:** Return here to start racing!\n\n**💡 Tip:** Better beasts have higher win chances and bigger payouts!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const beast = profile.beasts.find(b => b.beastId === profile.activeBeast);
            if (!beast) {
                const components = [];

                const beastNotFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                beastNotFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Active Beast Not Found\n## DATABASE ERROR\n\n> Your active beast was not found in your bestiary!\n> This might be a system error. Please try setting your active beast again.`)
                );

                components.push(beastNotFoundContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const performance = (beast.speed + beast.acceleration + beast.handling) / 3;
            const winChance = Math.min(90, Math.max(10, performance + Math.random() * 20));
            
            const won = Math.random() * 100 < winChance;
            const baseWinnings = Math.floor(Math.random() * 5000) + 1000;
            const winnings = Math.floor(baseWinnings * (performance / 50));
            
            let roleBonus = 0;
            profile.purchasedRoles.forEach(role => {
                if (!role.expiryDate || role.expiryDate > new Date()) {
                    roleBonus += role.benefits.racingBonus;
                }
            });
            
         
            profile.cooldowns.beastrace = new Date();
            
            const components = [];

            if (won) {
                const totalWinnings = winnings + roleBonus;
                profile.wallet += totalWinnings;
                profile.racingStats.wins += 1;
                profile.racingStats.winStreak += 1;
                profile.racingStats.earnings += totalWinnings;
                beast.raceWins += 1;

                const victoryContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                victoryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏁 BEAST RACE VICTORY!\n## CHAMPION OF THE COURSE\n\n> Congratulations! You dominated the course with your **${beast.name}**!\n> Your skills and beast's power led to a spectacular win!`)
                );

                components.push(victoryContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **RACE EARNINGS**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Base Winnings:** \`${winnings} Embers\`\n**👑 Role Bonus:** \`${roleBonus} Embers\`\n**💎 Total Winnings:** \`${totalWinnings} Embers\`\n**💳 New Wallet:** \`${profile.wallet} Embers\``)
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏁 Win Streak:** \`${profile.racingStats.winStreak}\`\n**📊 Beast Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Win Chance:** \`${winChance.toFixed(1)}%\``)
                );

                components.push(resultsContainer);

              
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📜 **BEAST & RIDER STATS**')
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**👹 Beast:** \`${beast.name}\`\n**⚔️ Speed:** \`${beast.speed}/100\`\n**🔥 Power:** \`${beast.acceleration}/100\`\n**🧠 Control:** \`${beast.handling}/100\`\n**CONDITION:** \`${beast.durability}%\``)
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏆 Beast Race Wins:** \`${beast.raceWins}\`\n**📈 Total Career Earnings:** \`${profile.racingStats.earnings} Embers\`\n**🏁 Total Races:** \`${profile.racingStats.totalRaces + 1}\``)
                );

                components.push(statsContainer);

            } else {
                const loss = Math.floor(winnings * 0.3);
                profile.wallet = Math.max(0, profile.wallet - loss);
                profile.racingStats.losses += 1;
                profile.racingStats.winStreak = 0;
                beast.raceLosses += 1;
                const durabilityLoss = Math.floor(Math.random() * 5);
                beast.durability = Math.max(0, beast.durability - durabilityLoss);

            
                const lossContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                lossContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏁 Beast Race Defeat\n## TOUGH LUCK ON THE COURSE\n\n> Unfortunately, you didn't place well in this race.\n> Sometimes the competition is just too fierce, but that's racing!`)
                );

                components.push(lossContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const lossDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💸 **RACE CONSEQUENCES**')
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Care Costs:** \`${loss} Embers\`\n**💳 Remaining Wallet:** \`${profile.wallet} Embers\`\n**Stamina Loss:** \`-${durabilityLoss}%\`\n**👹 Beast Condition:** \`${beast.durability}%\``)
                );

                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📊 Beast Performance:** \`${performance.toFixed(1)}/100\`\n**🎯 Win Chance:** \`${winChance.toFixed(1)}%\`\n**💔 Win Streak:** \`Reset to 0\``)
                );

                components.push(lossDetailsContainer);

               
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const tipsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                tipsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **IMPROVEMENT TIPS**\n\n**🔧 Care For Your Beast:** Use shop items to restore stamina\n**👹 Upgrade Your Beast:** Better beasts have higher win rates\n**👑 Get Racing Roles:** Bonus earnings from role benefits\n**🏁 Keep Racing:** Practice makes perfect!\n\n> Every champion has faced defeats - comeback stronger!`)
                );

                components.push(tipsContainer);
            }

    
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRaceContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            nextRaceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🏁 **NEXT RACE AVAILABILITY**\n\n**Next Race:** \`${new Date(Date.now() + 300000).toLocaleDateString()} at ${new Date(Date.now() + 300000).toLocaleTimeString()}\`\n**Cooldown:** \`5 minutes\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n> Use the break to care for your beast and plan your next racing strategy!`)
            );

            components.push(nextRaceContainer);

            profile.racingStats.totalRaces += 1;
            await profile.save();

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in beastrace command:', error);

     
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BEAST RACE ERROR**\n\nSomething went wrong during the race. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};