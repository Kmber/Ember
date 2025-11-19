const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'bestiary',
    aliases: ['beasts', 'mybeasts'],
    description: 'View and manage your beast collection .',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.beasts.length === 0) {
                const components = [];

                const noBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👹 Empty Bestiary\n## NO BEASTS IN YOUR COLLECTION\n\n> Your bestiary is currently empty! You need to summon beasts to start building your collection.\n> Beasts are essential for racing and other activities.`)
                );

                components.push(noBeBeastContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **GET YOUR FIRST BEAST**\n\n**Step 1:** Use \`!summon\` to see available beasts\n**Step 2:** Choose a beast that fits your budget\n**Step 3:** Summon your first beast\n**Step 4:** Start racing and taking on quests!\n\n**💡 Benefits:**\n> • Unlock beast races for prize money\n> • Enable special quests and events\n> • Build a valuable collection of beasts\n> • Show off your power and success`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0]?.toLowerCase();
            
            if (action === 'select' && args[1]) {
                const beastIndex = parseInt(args[1]) - 1;
                if (beastIndex < 0 || beastIndex >= profile.beasts.length) {
                    const components = [];

                    const invalidSelectionContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    invalidSelectionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Beast Selection\n## BEAST NUMBER OUT OF RANGE\n\n> Beast number must be between **1** and **${profile.beasts.length}**!\n> Use \`!bestiary\` to see your numbered beast list.`)
                    );

                    components.push(invalidSelectionContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                const selectedBeast = profile.beasts[beastIndex];
                profile.activeBeast = selectedBeast.beastId;
                await profile.save();
                
                const components = [];

                const selectionSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                selectionSuccessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👹 Active Beast Changed!\n## NEW BEAST SELECTED\n\n> You have successfully selected **${selectedBeast.name}** as your active beast!\n> This beast will now be used for races and quests.`)
                );

                components.push(selectionSuccessContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const beastStatsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                beastStatsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **ACTIVE BEAST STATS**\n\n**👹 Beast:** \`${selectedBeast.name}\`\n**⚔️ Speed:** \`${selectedBeast.speed}/100\`\n**🔥 Power:** \`${selectedBeast.acceleration}/100\`\n**🧠 Control:** \`${selectedBeast.handling}/100\`\n**CONDITION:** \`${selectedBeast.durability}%\`\n**🏁 Race Record:** \`${selectedBeast.raceWins}W/${selectedBeast.raceLosses}L\``)
                );

                components.push(beastStatsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
       
            const components = [];

         
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x992D22);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👹 ${message.author.username}'s Bestiary\n## YOUR BEAST COLLECTION\n\n> Welcome to your personal bestiary! Here you can view all your beasts, check their condition, and manage your collection.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

         
            const beastGroups = [];
            for (let i = 0; i < profile.beasts.length; i += 3) {
                beastGroups.push(profile.beasts.slice(i, i + 3));
            }

            beastGroups.forEach((group, groupIndex) => {
                const beastContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                beastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **BEAST COLLECTION ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((beast, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const isActive = beast.beastId === profile.activeBeast ? '👹 **ACTIVE**' : '🐾 Stabled';
                    const condition = beast.durability > 80 ? '🟢 Excellent' : beast.durability > 50 ? '🟡 Good' : '🔴 Needs Care';
                    const performanceRating = ((beast.speed + beast.acceleration + beast.handling) / 3).toFixed(1);
                    
                    const beastText = `**${actualIndex}. ${beast.name}** ${isActive}\n` +
                        `> **📊 Performance:** \`${performanceRating}/100\` overall\n` +
                        `> **⚔️ Speed:** \`${beast.speed}\` • **🔥 Power:** \`${beast.acceleration}\` • **🧠 Control:** \`${beast.handling}\`\n` +
                        `> **CONDITION:** ${condition} (\`${beast.durability}%\`)\n` +
                        `> **🏁 Racing Record:** \`${beast.raceWins}\` wins, \`${beast.raceLosses}\` losses\n` +
                        `> **💰 Current Value:** \`${(beast.currentValue || beast.purchasePrice).toLocaleString()} Embers\``;

                    beastContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(beastText)
                    );
                });

                components.push(beastContainer);
                
                if (groupIndex < beastGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xFF9800);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **BESTIARY STATISTICS**')
            );

            const totalValue = profile.beasts.reduce((sum, beast) => sum + (beast.currentValue || beast.purchasePrice), 0);
            const averageCondition = profile.beasts.reduce((sum, beast) => sum + beast.durability, 0) / profile.beasts.length;
            const totalRaceWins = profile.beasts.reduce((sum, beast) => sum + beast.raceWins, 0);
            const totalRaceLosses = profile.beasts.reduce((sum, beast) => sum + beast.raceLosses, 0);
            const averagePerformance = profile.beasts.reduce((sum, beast) => sum + ((beast.speed + beast.acceleration + beast.handling) / 3), 0) / profile.beasts.length;

         
            const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
            const lairCapacity = primaryCitadel ? primaryCitadel.lairCapacity : 'Unlimited';

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👹 Total Beasts:** \`${profile.beasts.length}${typeof lairCapacity === 'number' ? `/${lairCapacity}` : ''}\`\n**💰 Collection Value:** \`${totalValue.toLocaleString()} Embers\`\n**CONDITION:** \`${averageCondition.toFixed(1)}%\`\n**📊 Average Performance:** \`${averagePerformance.toFixed(1)}/100\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏆 Total Race Wins:** \`${totalRaceWins}\`\n**📉 Total Race Losses:** \`${totalRaceLosses}\`\n**📈 Overall Win Rate:** \`${totalRaceWins + totalRaceLosses > 0 ? ((totalRaceWins / (totalRaceWins + totalRaceLosses)) * 100).toFixed(1) : '0.0'}%\`\n**👹 Active Beast:** \`${profile.beasts.find(c => c.beastId === profile.activeBeast)?.name || 'None selected'}\``)
            );

            components.push(statsContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🔧 **BESTIARY MANAGEMENT**\n\n**👹 Select Active Beast:** \`!bestiary select <number>\`\n**🏁 Race Your Beasts:** Use \`!beastrace\` with your active beast\n**🛡️ Quests:** Take your beast on epic quests\n**🛒 Expand Collection:** Summon more beasts with \`!summon\`\n**🔧 Upkeep:** Use shop items to care for your beasts\n**📈 Performance:** Better beasts = higher race win chances\n\n> Keep your beasts well-cared for optimal performance!`)
            );

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        } catch (error) {
            console.error('Error in bestiary command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BESTIARY ERROR**\n\nSomething went wrong while accessing your bestiary. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};