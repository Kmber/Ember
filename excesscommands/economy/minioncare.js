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
    name: 'minioncare',
    aliases: ['sustain', 'tend', 'commune'],
    description: 'Care for your minions to improve their power and effectiveness .',
    usage: 'minioncare <action> [minion_index]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            
            if (profile.minions.length === 0) {
                const components = [];

                const noMinionsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noMinionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 No Minions to Command\n## SUMMON A SERVANT FIRST\n\n> You don\'t have any minions to care for!\n> Minions need regular sustenance, tending, and communion to stay loyal and powerful.`)
                );

                components.push(noMinionsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const summoningContainer = new ContainerBuilder()
                    .setAccentColor(0x992d22);

                summoningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **BEGIN YOUR REIGN**\n\n**Step 1:** Use \`${prefix}buyminion\` to summon your first servant\n**Step 2:** Bestow a fearsome name upon your new minion\n**Step 3:** Return here to provide dark care\n**Step 4:** Watch them become powerful agents of your will!\n\n**💡 Benefits of Minion Care:**\n> • Loyal minions provide greater power\n> • Well-sustained minions are more formidable\n> • Regular care maintains peak effectiveness\n> • Builds a stronger bond with your dark servants`)
                );

                components.push(summoningContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0]?.toLowerCase();
            const minionIndex = parseInt(args[1]) || 1;
            
            if (!action || !['sustain', 'tend', 'commune', 'all'].includes(action)) {
                const components = [];

                const invalidActionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidActionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Care Action\n## SPECIFY THE RITUAL\n\n> Please specify which dark ritual you want to perform!\n> Your minions crave your attention.`)
                );

                components.push(invalidActionContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const actionsContainer = new ContainerBuilder()
                    .setAccentColor(0x992d22);

                actionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **AVAILABLE RITUALS**\n\n**⚡ \`sustain\`** - Sustain your minion to restore energy and constitution (\`75 Embers\`)\n**🖤 \`tend\`** - Tend to your minion to increase corruption and loyalty (\`150 Embers\`)\n**💀 \`commune\`** - Commune with your minion to boost loyalty and bonding (\`50 Embers\`)\n**🌟 \`all\`** - Perform a grand ritual for maximum effect (\`275 Embers\`)\n\n**Examples:**\n> \`${prefix}minioncare sustain 1\` - Sustain your first minion\n> \`${prefix}minioncare all 2\` - Perform a grand ritual for your second minion`)
                );

                components.push(actionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (minionIndex < 1 || minionIndex > profile.minions.length) {
                const components = [];

                const invalidMinionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidMinionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Invalid Minion Selection\n## MINION NUMBER OUT OF RANGE\n\n> Minion number must be between **1** and **${profile.minions.length}**!\n> Use \`${prefix}minions\` to see your numbered minion list.`)
                );

                components.push(invalidMinionContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const minionListContainer = new ContainerBuilder()
                    .setAccentColor(0x992d22);

                minionListContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **YOUR DARK HORDE**\n\n${profile.minions.map((minion, index) => 
                            `**${index + 1}.** ${minion.name} (${minion.breed})`
                        ).join('\n')}\n\n**💡 Tip:** Choose the number of the minion you wish to command!`)
                );

                components.push(minionListContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const minion = profile.minions[minionIndex - 1];
            const costs = { sustain: 75, tend: 150, commune: 50, all: 275 };
            const cost = costs[action];
            
            if (profile.wallet < cost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds for Dark Ritual\n## CANNOT AFFORD ${action.toUpperCase()} RITUAL\n\n> You need **\`${cost} Embers\`** to perform the **${action}** ritual for **${minion.name}**!\n> Your wallet has **\`${profile.wallet.toLocaleString()} Embers\`**`)
                );

                components.push(insufficientContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const earningContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                earningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **GATHER MORE WEALTH**\n\n**Shortage:** \`${cost - profile.wallet} Embers\`\n\n**💡 Quick Earning Tips:**\n> • Use \`${prefix}work\` to earn regular income\n> • Complete \`${prefix}daily\` rewards\n> • Try your luck with \`${prefix}gamble\`\n> • Run guilds for passive income\n\n**🦇 Your minion awaits its tribute!**`)
                );

                components.push(earningContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const beforeStats = {
                energy: minion.energy,
                constitution: minion.constitution,
                corruption: minion.corruption,
                loyalty: minion.loyalty
            };
            
            profile.wallet -= cost;
            
            if (action === 'sustain' || action === 'all') {
                minion.energy = Math.min(100, minion.energy + 30);
                minion.constitution = Math.min(100, minion.constitution + 5);
                minion.lastSustained = new Date();
            }
            
            if (action === 'tend' || action === 'all') {
                minion.corruption = Math.min(100, minion.corruption + 40);
                minion.loyalty = Math.min(100, minion.loyalty + 10);
                minion.lastTended = new Date();
            }
            
            if (action === 'commune' || action === 'all') {
                minion.loyalty = Math.min(100, minion.loyalty + 25);
                minion.constitution = Math.min(100, minion.constitution + 5);
                minion.lastCommuned = new Date();
            }

            profile.transactions.push({
                type: 'expense',
                amount: cost,
                description: `Minion care (${action}) for ${minion.name}`,
                category: 'minion_care'
            });
            
            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 Dark Ritual Complete!\n## ${minion.name.toUpperCase()} IS EMPOWERED\n\n> You performed the **${action}** ritual for **${minion.name}**!\n> Your dark servant is now more powerful and loyal.`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const resultsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **RITUAL RESULTS**')
            );

            const improvements = [];
            if (minion.energy > beforeStats.energy) improvements.push(`⚡ Energy: \`${beforeStats.energy}%\` → \`${minion.energy}%\` (+${minion.energy - beforeStats.energy})`);
            if (minion.constitution > beforeStats.constitution) improvements.push(`❤️ Constitution: \`${beforeStats.constitution}%\` → \`${minion.constitution}%\` (+${minion.constitution - beforeStats.constitution})`);
            if (minion.corruption > beforeStats.corruption) improvements.push(`💀 Corruption: \`${beforeStats.corruption}%\` → \`${minion.corruption}%\` (+${minion.corruption - beforeStats.corruption})`);
            if (minion.loyalty > beforeStats.loyalty) improvements.push(`🔥 Loyalty: \`${beforeStats.loyalty}%\` → \`${minion.loyalty}%\` (+${minion.loyalty - beforeStats.loyalty})`);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Ritual Cost:** \`${cost} Embers\`\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**🎯 Ritual Type:** \`${action.toUpperCase()}\`\n**⏰ Ritual Time:** \`${new Date().toLocaleString()}\``)
            );

            if (improvements.length > 0) {
                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📈 IMPROVEMENTS:**\n${improvements.join('\n')}`)
                );
            }

            components.push(resultsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statusContainer = new ContainerBuilder()
                .setAccentColor(0x992d22);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🦇 **MINION STATUS AFTER RITUAL**')
            );

            const overallCondition = (minion.loyalty + minion.constitution + minion.corruption) / 3;
            const conditionStatus = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
            const efficiency = ((minion.loyalty + minion.constitution + minion.corruption) / 300 * 100).toFixed(0);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Minion:** \`${minion.name} (${minion.breed})\`\n**🌟 Overall Condition:** ${conditionStatus}\n**📈 Power Efficiency:** \`${efficiency}%\`\n**⚔️ Power Level:** \`${minion.powerLevel}/100\``)
            );

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Current Stats:**\n⚡ Energy: \`${minion.energy}%\`\n❤️ Constitution: \`${minion.constitution}%\`\n💀 Corruption: \`${minion.corruption}%\`\n🔥 Loyalty: \`${minion.loyalty}%\``)
            );

            components.push(statusContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const powerContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            powerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **POWER IMPACT**')
            );

            const beforeEfficiency = ((beforeStats.loyalty + beforeStats.constitution + beforeStats.corruption) / 300 * 100).toFixed(0);
            const afterEfficiency = efficiency;
            const powerImprovement = (afterEfficiency - beforeEfficiency).toFixed(0);

            powerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Power Efficiency:** \`${beforeEfficiency}%\` → \`${afterEfficiency}%\` ${powerImprovement > 0 ? `(+${powerImprovement}%)` : ''}\n**Effective Power:** \`${(minion.powerLevel * afterEfficiency / 100).toFixed(1)}\`\n**Maximum Potential:** \`${minion.powerLevel}\`\n\n**💡 Impact:** ${powerImprovement > 0 ? `Your ritual empowered ${minion.name}\'s dark abilities!` : `${minion.name} maintains its dark effectiveness!`}`)
            );

            components.push(powerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const recommendationsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            recommendationsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💡 **RITUAL RECOMMENDATIONS**')
            );

            const careNeeds = [];
            if (minion.energy < 70) careNeeds.push('⚡ **Sustain** your minion to restore energy');
            if (minion.corruption < 70) careNeeds.push('🖤 **Tend** to your minion for corruption');
            if (minion.loyalty < 70) careNeeds.push('💀 **Commune** with your minion for loyalty');
            if (minion.constitution < 70) careNeeds.push('❤️ Minion **constitution** could use attention');

            if (careNeeds.length > 0) {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Next Ritual Suggestions:**\n${careNeeds.join('\n')}\n\n**💰 Ritual Costs:** Sustain \`75 Embers\` • Tend \`150 Embers\` • Commune \`50 Embers\` • All \`275 Embers\``)
                );
            } else {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🌟 Perfect Ritual!** ${minion.name} is in excellent condition!\n\n**🎯 Maintenance:** Check back regularly to maintain this level of dark power\n**💡 Tip:** Well-cared minions provide maximum power benefits`)
                );
            }

            components.push(recommendationsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in minioncare command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **MINION CARE ERROR**\n\nSomething went wrong while caring for your minion. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
  
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};