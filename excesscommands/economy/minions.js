const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'minions',
    aliases: ['myminions'],
    description: 'View your minion collection and their status .',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.minions.length === 0) {
                const components = [];

                const noMinionsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noMinionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 No Minions in Your Horde\n## BUILD YOUR DARK ARMY\n\n> You don't have any minions yet! Minions provide power, protection, and carry out your dark will.\n> Each minion contributes to your citadel's overall power level.`)
                );

                components.push(noMinionsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const summoningContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                summoningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **START YOUR MINION HORDE**\n\n**Step 1:** Use \`!buyminion\` to see available minions\n**Step 2:** Choose a minion that fits your budget and needs\n**Step 3:** Give your new servant a fearsome name\n**Step 4:** Care for them with sustenance, tending, and communing!\n\n**💡 Benefits:**\n> • Enhanced power against rivals\n> • Loyal servants for your citadel\n> • Property protection and dark surveillance\n> • Building a powerful dark army`)
                );

                components.push(summoningContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x992d22);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 ${message.author.username}'s Minion Horde\n## YOUR DARK SERVANTS\n\n> Meet your dark servants who provide power, protection, and carry out your will.\n> Well-cared minions are more effective and loyal!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const minionGroups = [];
            for (let i = 0; i < profile.minions.length; i += 3) {
                minionGroups.push(profile.minions.slice(i, i + 3));
            }

            minionGroups.forEach((group, groupIndex) => {
                const minionContainer = new ContainerBuilder()
                    .setAccentColor(0x711a1a);

                minionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **MINION HORDE ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((minion, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const overallCondition = (minion.loyalty + minion.constitution + minion.corruption) / 3;
                    const conditionEmoji = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
                    const efficiency = ((minion.loyalty + minion.constitution + minion.corruption) / 300 * 100).toFixed(0);
                    
                    const daysSinceSummoned = minion.dateSummoned ? 
                        Math.floor((new Date() - new Date(minion.dateSummoned)) / (1000 * 60 * 60 * 24)) : 'Unknown';
                    
                    const minionText = `**${actualIndex}. ${minion.name}** (${minion.breed})\n` +
                        `> **⚔️ Power Level:** \`${minion.powerLevel}/100\`\n` +
                        `> **📈 Current Efficiency:** \`${efficiency}%\`\n` +
                        `> **🌟 Overall Condition:** ${conditionEmoji}\n` +
                        `> **🔥 Loyalty:** \`${minion.loyalty}%\` • **❤️ Constitution:** \`${minion.constitution}%\` • **💀 Corruption:** \`${minion.corruption}%\`\n` +
                        `> **⚡ Energy Level:** \`${minion.energy}%\`\n` +
                        `> **📅 Days Summoned:** \`${daysSinceSummoned}\``;

                    minionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(minionText)
                    );
                });

                components.push(minionContainer);
                
                if (groupIndex < minionGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **MINION HORDE STATISTICS**')
            );

            const totalPower = profile.minions.reduce((sum, minion) => {
                const efficiency = (minion.loyalty + minion.constitution + minion.corruption) / 300;
                return sum + (minion.powerLevel * efficiency);
            }, 0);

            const averageCondition = profile.minions.reduce((sum, minion) => {
                return sum + ((minion.loyalty + minion.constitution + minion.corruption) / 3);
            }, 0) / profile.minions.length;

            const averageLoyalty = profile.minions.reduce((sum, minion) => sum + minion.loyalty, 0) / profile.minions.length;
            const averageConstitution = profile.minions.reduce((sum, minion) => sum + minion.constitution, 0) / profile.minions.length;
            const averageCorruption = profile.minions.reduce((sum, minion) => sum + minion.corruption, 0) / profile.minions.length;

            const minionsNeedingCare = profile.minions.filter(minion => 
                minion.loyalty < 70 || minion.constitution < 70 || minion.corruption < 70 || minion.energy < 30
            ).length;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Total Minions:** \`${profile.minions.length}/${profile.maxMinions}\`\n**⚔️ Total Power:** \`${Math.floor(totalPower)}\`\n**📊 Average Condition:** \`${averageCondition.toFixed(1)}%\`\n**💰 Full Care Cost:** \`175 Embers (all minions)\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 Average Loyalty:** \`${averageLoyalty.toFixed(1)}%\`\n**❤️ Average Constitution:** \`${averageConstitution.toFixed(1)}%\`\n**💀 Average Corruption:** \`${averageCorruption.toFixed(1)}%\`\n**⚠️ Minions Needing Care:** \`${minionsNeedingCare}\``)
            );

            components.push(statsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🖤 **MINION CARE MANAGEMENT**')
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🍽️ Sustenance:** \`!minioncare sustain <minion_number>\` - Increases energy and constitution\n**🛁 Tending:** \`!minioncare tend <minion_number>\` - Improves corruption and loyalty\n**🎾 Communing:** \`!minioncare commune <minion_number>\` - Boosts loyalty and bonding\n**🌟 All Care:** \`!minioncare all <minion_number>\` - Complete care package\n**💰 Care All Minions:** \`!minioncare all 0\` - Care for every minion at once`)
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 Care Tips:**\n> • Happy, loyal minions provide better power\n> • Regular care maintains peak efficiency\n> • Well-fed minions are more loyal servants\n> • Tended minions contribute to citadel power\n\n**🛒 Shop Items:** Purchase minion sustenance and care items from the premium shop!`)
            );

            components.push(careContainer);

            if (totalPower > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const powerContainer = new ContainerBuilder()
                    .setAccentColor(0x28A745);

                powerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚔️ **POWER CONTRIBUTION**')
                );

                const maxPossiblePower = profile.minions.reduce((sum, minion) => sum + minion.powerLevel, 0);
                const powerEfficiency = ((totalPower / maxPossiblePower) * 100).toFixed(1);

                powerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔒 Current Power Level:** \`${Math.floor(totalPower)}\`\n**📊 Power Efficiency:** \`${powerEfficiency}%\`\n**🏆 Maximum Potential:** \`${maxPossiblePower}\`\n**💡 Improvement Potential:** \`+${Math.floor(maxPossiblePower - totalPower)}\` with better care\n\n> Your minions are actively protecting your citadel and deterring potential rivals!`)
                );

                components.push(powerContainer);
            }

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in minions command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **MINION HORDE ERROR**\n\nSomething went wrong while viewing your minion horde. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};