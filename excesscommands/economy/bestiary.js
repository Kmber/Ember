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
    description: 'View and manage your collection of tamed beasts.',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.beasts.length === 0) {
                const components = [];

                const noBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐾 Empty Bestiary\n## NO BEASTS IN YOUR COLLECTION\n\n> Your bestiary is currently empty! You need to tame beasts to start building your menagerie.\n> Beasts are essential for arena battles and expeditions.`)
                );

                components.push(noBeastContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **TAME YOUR FIRST BEAST**\n\n**Step 1:** Use \`!tamebeast\` to see available beasts\n**Step 2:** Choose a beast that fits your budget and style\n**Step 3:** Tame your first beast\n**Step 4:** Start competing in the arena and going on expeditions!\n\n**💡 Benefits:**\n> • Unlock arena battles for glory and riches\n> • Enable expeditions to gain rare items\n> • Build a valuable collection of powerful beasts\n> • Display your dominance and power`)
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
                        .setContent(`# 🐾 Active Beast Changed!\n## NEW BEAST SELECTED\n\n> You have successfully selected **${selectedBeast.name}** as your active beast!\n> This beast will now be used for arena battles and expeditions.`)
                );

                components.push(selectionSuccessContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const beastStatsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                beastStatsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **ACTIVE BEAST STATS**\n\n**🐾 Beast:** \`${selectedBeast.name}\`\n**⚡ Prowess:** \`${selectedBeast.prowess}/100\`\n**🚀 Ferocity:** \`${selectedBeast.ferocity}/100\`\n**🎯 Cunning:** \`${selectedBeast.cunning}/100\`\n**❤️ Vitality:** \`${selectedBeast.vitality}%\`\n**🏆 Arena Record:** \`${selectedBeast.arenaWins}W/${selectedBeast.arenaLosses}L\``)
                );

                components.push(beastStatsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x0099FF);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐾 ${message.author.username}'s Bestiary\n## YOUR COLLECTION OF TAMED BEASTS\n\n> Welcome to your personal bestiary! Here you can view all your tamed beasts, check their vitality, and manage your menagerie.`)
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
                        .setContent(`## 🐾 **BEAST COLLECTION ${groupIndex > 0 ? '(Continued)' : ''}**`)
                );

                group.forEach((beast, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const isActive = beast.beastId === profile.activeBeast ? '🐾 **ACTIVE**' : 'Resting';
                    const vitality = beast.vitality > 80 ? '🟢 Excellent' : beast.vitality > 50 ? '🟡 Good' : '🔴 Needs Care';
                    const powerRating = ((beast.prowess + beast.ferocity + beast.cunning) / 3).toFixed(1);
                    
                    const beastText = `**${actualIndex}. ${beast.name}** ${isActive}\n` +
                        `> **📊 Power:** \`${powerRating}/100\` overall\n` +
                        `> **⚡ Prowess:** \`${beast.prowess}\` • **🚀 Ferocity:** \`${beast.ferocity}\` • **🎯 Cunning:** \`${beast.cunning}\`\n` +
                        `> **❤️ Vitality:** ${vitality} (\`${beast.vitality}%\`)\n` +
                        `> **🏆 Arena Record:** \`${beast.arenaWins}\` wins, \`${beast.arenaLosses}\` losses\n` +
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
            const averageVitality = profile.beasts.reduce((sum, beast) => sum + beast.vitality, 0) / profile.beasts.length;
            const totalArenaWins = profile.beasts.reduce((sum, beast) => sum + beast.arenaWins, 0);
            const totalArenaLosses = profile.beasts.reduce((sum, beast) => sum + beast.arenaLosses, 0);
            const averagePower = profile.beasts.reduce((sum, beast) => sum + ((beast.prowess + beast.ferocity + beast.cunning) / 3), 0) / profile.beasts.length;

            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            const bestiaryCapacity = primaryStronghold ? primaryStronghold.bestiaryCapacity : 'Unlimited';

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐾 Total Beasts:** \`${profile.beasts.length}${typeof bestiaryCapacity === 'number' ? `/${bestiaryCapacity}` : ''}\`\n**💰 Collection Value:** \`${totalValue.toLocaleString()} Embers\`\n**❤️ Average Vitality:** \`${averageVitality.toFixed(1)}%\`\n**📊 Average Power:** \`${averagePower.toFixed(1)}/100\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏆 Total Arena Wins:** \`${totalArenaWins}\`\n**📉 Total Arena Losses:** \`${totalArenaLosses}\`\n**📈 Overall Win Rate:** \`${totalArenaWins + totalArenaLosses > 0 ? ((totalArenaWins / (totalArenaWins + totalArenaLosses)) * 100).toFixed(1) : '0.0'}%\`\n**🐾 Active Beast:** \`${profile.beasts.find(b => b.beastId === profile.activeBeast)?.name || 'None selected'}\``)
            );

            components.push(statsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🔧 **BESTIARY MANAGEMENT**\n\n**🐾 Select Active Beast:** \`!bestiary select <number>\`\n**⚔️ Battle Your Beasts:** Use \`!arena\` with your active beast\n**🗺️ Expeditions:** Take your followers on expeditions\n**🛒 Expand Menagerie:** Tame more beasts with \`!tamebeast\`\n**❤️ Beast Care:** Use items from the market to restore vitality\n**📈 Power:** Mightier beasts have a higher chance of victory in the arena\n\n> Keep your beasts in good health for optimal performance!`)
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
