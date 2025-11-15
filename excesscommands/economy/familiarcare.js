const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'familiarcare',
    aliases: ['nourish', 'cleanse', 'bond'],
    description: 'Care for your familiars to improve their warding effectiveness',
    usage: '!familiarcare <action> [familiar_index]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.familiars.length === 0) {
                const components = [];

                const noFamiliarsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFamiliarsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 No Familiars to Care For\n## ATTUNE A FAMILIAR FIRST\n\n> You don't have any familiars to care for!\n> Familiars need regular care including nourishing, cleansing, and bonding to stay loyal and effective.`)
                );

                components.push(noFamiliarsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const attunementContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                attunementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔮 **GET STARTED WITH FAMILIARS**\n\n**Step 1:** Use \`!attunefamiliar\` to bind your first companion\n**Step 2:** Choose a powerful name for your new familiar\n**Step 3:** Return here to provide daily care\n**Step 4:** Watch them become powerful guardians!\n\n**💡 Benefits of Familiar Care:**\n> • Loyal familiars provide better warding\n> • Well-nourished familiars are more powerful\n> • Regular care maintains peak effectiveness\n> • Builds strong bonds with your companions`)
                );

                components.push(attunementContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0]?.toLowerCase();
            const familiarIndex = parseInt(args[1]) || 1;
            
            if (!action || !['nourish', 'cleanse', 'bond', 'all'].includes(action)) {
                const components = [];

                const invalidActionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidActionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Care Action\n## PLEASE SPECIFY CARE TYPE\n\n> Please specify what kind of care you want to provide!\n> Your familiars are waiting for your dark attention.`)
                );

                components.push(invalidActionContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const actionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                actionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔮 **AVAILABLE CARE OPTIONS**\n\n**🍖 \`nourish\`** - Nourish your familiar to reduce hunger and boost health (\`50 Souls\`)\n**🛁 \`cleanse\`** - Cleanse your familiar for purity and loyalty (\`100 Souls\`)\n**💖 \`bond\`** - Bond with your familiar to increase loyalty and connection (\`25 Souls\`)\n**🌟 \`all\`** - Complete care package for maximum effect (\`175 Souls\`)\n\n**Examples:**\n> \`!familiarcare nourish 1\` - Nourish your first familiar\n> \`!familiarcare all 2\` - Complete care for second familiar`)
                );

                components.push(actionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (familiarIndex < 1 || familiarIndex > profile.familiars.length) {
                const components = [];

                const invalidFamiliarContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidFamiliarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Invalid Familiar Selection\n## FAMILIAR NUMBER OUT OF RANGE\n\n> Familiar number must be between **1** and **${profile.familiars.length}**!\n> Use \`!familiars\` to see your numbered familiar list.`)
                );

                components.push(invalidFamiliarContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const familiarListContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                familiarListContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🦇 **YOUR FAMILIAR COMPANIONS**\n\n${profile.familiars.map((familiar, index) => 
                            `**${index + 1}.** ${familiar.name} (${familiar.species})`
                        ).join('\n')}\n\n**💡 Tip:** Choose the number of the familiar you want to care for!`)
                );

                components.push(familiarListContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const familiar = profile.familiars[familiarIndex - 1];
            const costs = { nourish: 50, cleanse: 100, bond: 25, all: 175 };
            const cost = costs[action];
            
            if (profile.souls < cost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Souls for Familiar Care\n## CANNOT AFFORD ${action.toUpperCase()} CARE\n\n> You need **\`${cost} Souls\`** to provide **${action}** care for **${familiar.name}**!\n> Your souls total **\`${profile.souls.toLocaleString()}\`**`)
                );

                components.push(insufficientContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const earningContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                earningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **GATHER SOULS FOR FAMILIAR CARE**\n\n**Shortage:** \`${cost - profile.souls} Souls\`\n\n**💡 Quick Soul Gathering Tips:**\n> • Use \`!quest\` to earn regular souls\n> • Complete \`!offering\` rituals\n> • Try your luck with \`!gamble\`\n> • Rule your dominion for passive income\n\n**🦇 Your familiar is counting on you!**`)
                );

                components.push(earningContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const beforeStats = {
                hunger: familiar.hunger,
                health: familiar.health,
                purity: familiar.purity,
                loyalty: familiar.loyalty
            };
            
            profile.souls -= cost;
            
            if (action === 'nourish' || action === 'all') {
                familiar.hunger = Math.min(100, familiar.hunger + 30);
                familiar.health = Math.min(100, familiar.health + 5);
                familiar.lastNourished = new Date();
            }
            
            if (action === 'cleanse' || action === 'all') {
                familiar.purity = Math.min(100, familiar.purity + 40);
                familiar.loyalty = Math.min(100, familiar.loyalty + 10);
                familiar.lastCleansed = new Date();
            }
            
            if (action === 'bond' || action === 'all') {
                familiar.loyalty = Math.min(100, familiar.loyalty + 25);
                familiar.health = Math.min(100, familiar.health + 5);
                familiar.lastBonded = new Date();
            }

            profile.transactions.push({
                type: 'expense',
                amount: cost,
                description: `Familiar care (${action}) for ${familiar.name}`,
                category: 'familiar_care'
            });
            
            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 Familiar Care Complete!\n## ${familiar.name.toUpperCase()} FEELS EMPOWERED\n\n> You provided dark **${action}** care for **${familiar.name}**!\n> Your loyal familiar is more powerful and effective as a guardian.`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const resultsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **CARE RESULTS**')
            );

            const improvements = [];
            if (familiar.hunger > beforeStats.hunger) improvements.push(`🍖 Hunger: \`${beforeStats.hunger}%\` → \`${familiar.hunger}%\` (+${familiar.hunger - beforeStats.hunger})`);
            if (familiar.health > beforeStats.health) improvements.push(`🏥 Health: \`${beforeStats.health}%\` → \`${familiar.health}%\` (+${familiar.health - beforeStats.health})`);
            if (familiar.purity > beforeStats.purity) improvements.push(`🛁 Purity: \`${beforeStats.purity}%\` → \`${familiar.purity}%\` (+${familiar.purity - beforeStats.purity})`);
            if (familiar.loyalty > beforeStats.loyalty) improvements.push(`💖 Loyalty: \`${beforeStats.loyalty}%\` → \`${familiar.loyalty}%\` (+${familiar.loyalty - beforeStats.loyalty})`);

            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Care Cost:** \`${cost} Souls\`\n**💳 Remaining Souls:** \`${profile.souls.toLocaleString()}\`\n**🎯 Care Type:** \`${action.toUpperCase()}\`\n**⏰ Care Time:** \`${new Date().toLocaleString()}\``)
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
                .setAccentColor(0x3498DB);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🦇 **FAMILIAR STATUS AFTER CARE**')
            );

            const overallCondition = (familiar.loyalty + familiar.health + familiar.purity) / 3;
            const conditionStatus = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
            const efficiency = ((familiar.loyalty + familiar.health + familiar.purity) / 300 * 100).toFixed(0);

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Familiar:** \`${familiar.name} (${familiar.species})\`\n**🌟 Overall Condition:** ${conditionStatus}\n**📈 Warding Efficiency:** \`${efficiency}%\`\n**🛡️ Warding Level:** \`${familiar.wardingLevel}/100\``)
            );

            statusContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Current Stats:**\n🍖 Hunger: \`${familiar.hunger}%\`\n🏥 Health: \`${familiar.health}%\`\n🛁 Purity: \`${familiar.purity}%\`\n💖 Loyalty: \`${familiar.loyalty}%\``)
            );

            components.push(statusContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const securityContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **WARDING IMPACT**')
            );

            const beforeEfficiency = ((beforeStats.loyalty + beforeStats.health + beforeStats.purity) / 300 * 100).toFixed(0);
            const afterEfficiency = efficiency;
            const securityImprovement = (afterEfficiency - beforeEfficiency).toFixed(0);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Warding Efficiency:** \`${beforeEfficiency}%\` → \`${afterEfficiency}%\` ${securityImprovement > 0 ? `(+${securityImprovement}%)` : ''}\n**Effective Warding:** \`${(familiar.wardingLevel * afterEfficiency / 100).toFixed(1)}\`\n**Maximum Potential:** \`${familiar.wardingLevel}\`\n\n**💡 Impact:** ${securityImprovement > 0 ? `Your care improved ${familiar.name}'s protective abilities!` : `${familiar.name} maintains their protective effectiveness!`}`)
            );

            components.push(securityContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const recommendationsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            recommendationsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💡 **CARE RECOMMENDATIONS**')
            );

            const careNeeds = [];
            if (familiar.hunger < 70) careNeeds.push('🍖 **Nourish** your familiar to restore hunger');
            if (familiar.purity < 70) careNeeds.push('🛁 **Cleanse** your familiar for purity');
            if (familiar.loyalty < 70) careNeeds.push('💖 **Bond** with your familiar for loyalty');
            if (familiar.health < 70) careNeeds.push('🏥 Familiar **health** could use attention');

            if (careNeeds.length > 0) {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Next Care Suggestions:**\n${careNeeds.join('\n')}\n\n**💰 Care Costs:** Nourish \`50 Souls\` • Cleanse \`100 Souls\` • Bond \`25 Souls\` • All \`175 Souls\``)
                );
            } else {
                recommendationsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🌟 Perfect Care!** ${familiar.name} is in excellent condition!\n\n**🎯 Maintenance:** Check back regularly to maintain this level of care\n**💡 Tip:** Well-cared familiars provide maximum warding benefits`)
                );
            }

            components.push(recommendationsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in familiarcare command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILIAR CARE ERROR**\n\nSomething went wrong while caring for your familiar. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
