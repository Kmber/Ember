const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { STRONGHOLDS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buystronghold',
    aliases: ['stronghold-buy', 'citadel'],
    description: 'Acquire a stronghold to house your followers and beasts.',
    usage: '!buystronghold <stronghold_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 The Realm's Strongholds\n## FORGE YOUR DOMINION\n\n> Welcome to the stronghold market! Invest in a fortress to expand your influence, house followers, and unlock powerful new abilities.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const strongholdEntries = Object.entries(STRONGHOLDS);
                const strongholdsByType = {};
                
                strongholdEntries.forEach(([id, prop]) => {
                    if (!strongholdsByType[prop.type]) {
                        strongholdsByType[prop.type] = [];
                    }
                    strongholdsByType[prop.type].push([id, prop]);
                });

                Object.entries(strongholdsByType).forEach(([type, strongholds]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getStrongholdTypeColor(type));

                    const emoji = getStrongholdTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} STRONGHOLDS**`)
                    );

                    for (let i = 0; i < strongholds.length; i += 3) {
                        const strongholdGroup = strongholds.slice(i, i + 3);
                        const strongholdText = strongholdGroup.map(([id, prop]) =>
                            `**\`${id}\`** - ${prop.name}\n> **Price:** \`${prop.price.toLocaleString()} Embers\`\n> **Followers:** ${prop.maxFollowers} • **Warding:** ${prop.wardingLevel} • **Treasury:** ${(prop.treasuryCapacity || 0).toLocaleString()} Embers\n> **Bestiary:** ${prop.hasBestiary ? `${prop.bestiaryCapacity} beasts` : 'None'} • **Upkeep:** ${prop.upkeep.toLocaleString()} Embers`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(strongholdText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO ACQUIRE**\n\n**Command:** \`!buystronghold <stronghold_id>\`\n**Example:** \`!buystronghold fortress\`\n\n**💡 Benefits:**\n> • House your followers securely\n> • Unlock a treasury for your riches\n> • Enable a bestiary for multiple beasts\n> • Increase warding against pillaging\n> • Your first stronghold becomes your primary seat of power`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const strongholdId = args[0].toLowerCase();
            const strongholdData = STRONGHOLDS[strongholdId];

            if (!strongholdData) {
                const components = [];

                const invalidStrongholdContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidStrongholdContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Stronghold ID\n## STRONGHOLD NOT FOUND\n\n> **\`${strongholdId}\`** is not a valid stronghold ID!\n> Use \`!buystronghold\` to see all available strongholds and their IDs.`)
                );

                components.push(invalidStrongholdContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.strongholds.some(s => s.strongholdId === strongholdId)) {
                const components = [];

                const duplicateStrongholdContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateStrongholdContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Stronghold Already Acquired\n## DUPLICATE ACQUISITION BLOCKED\n\n> You already possess **${strongholdData.name}**!\n> Each lord may only acquire one of each type of stronghold.\n\n**💡 Tip:** Check your domain with stronghold management commands.`)
                );

                components.push(duplicateStrongholdContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.embers < strongholdData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD STRONGHOLD\n\n> You do not have enough Embers to acquire **${strongholdData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Stronghold:** \`${strongholdData.name}\`\n**Price:** \`${strongholdData.price.toLocaleString()} Embers\`\n**Your Ember Sachel:** \`${profile.embers.toLocaleString()} Embers\`\n**Shortage:** \`${(strongholdData.price - profile.embers).toLocaleString()} Embers\`\n\n**💡 Tip:** Undertake quests, manage guilds, or engage in arena battles to amass wealth for a stronghold!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            profile.embers -= strongholdData.price;
            profile.strongholds.push({
                strongholdId,
                name: strongholdData.name,
                type: strongholdData.type,
                purchasePrice: strongholdData.price,
                currentValue: strongholdData.price,
                upkeep: strongholdData.upkeep,
                wardingLevel: strongholdData.wardingLevel,
                maxFollowers: strongholdData.maxFollowers,
                hasBestiary: strongholdData.hasBestiary,
                bestiaryCapacity: strongholdData.bestiaryCapacity,
                treasuryCapacity: strongholdData.treasuryCapacity,
                condition: 'excellent',
                dateAcquired: new Date()
            });

            if (!profile.primaryStronghold) {
                profile.primaryStronghold = strongholdId;
                profile.maxFamiliars = Math.floor(strongholdData.maxFollowers / 2);
            }

            profile.transactions.push({
                type: 'expense',
                amount: strongholdData.price,
                description: `Acquired stronghold: ${strongholdData.name}`,
                category: 'stronghold'
            });

            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 Stronghold Acquisition Successful!\n## A NEW SEAT OF POWER IS YOURS\n\n> Congratulations! You have successfully acquired **${strongholdData.name}** for **\`${strongholdData.price.toLocaleString()} Embers\`**!\n> ${!profile.strongholds.find(s => s.strongholdId !== strongholdId) ? 'This is now your primary seat of power!' : 'Your domain expands!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **STRONGHOLD SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Stronghold Name:** \`${strongholdData.name}\`\n**🏷️ Stronghold Type:** \`${strongholdData.type}\`\n**👨‍👩‍👧‍👦 Follower Capacity:** \`${strongholdData.maxFollowers} followers\`\n**🛡️ Warding Level:** \`${strongholdData.wardingLevel}/10\`\n**🏦 Treasury Capacity:** \`${(strongholdData.treasuryCapacity || 0).toLocaleString()} Embers\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐾 Bestiary:** ${strongholdData.hasBestiary ? `\`${strongholdData.bestiaryCapacity} beasts\`` : '\`None\`'}\n**🔥 Upkeep:** \`${strongholdData.upkeep.toLocaleString()} Embers\`\n**📅 Date Acquired:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(specsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const featuresContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🎉 **UNLOCKED ABILITIES**')
            );

            const unlockedFeatures = [];
            if (strongholdData.maxFollowers > 0) unlockedFeatures.push(`**👨‍👩‍👧‍👦 House Followers:** Accommodate up to ${strongholdData.maxFollowers} loyal followers`);
            if (strongholdData.treasuryCapacity > 0) unlockedFeatures.push(`**🏦 Treasury:** Secure your riches with a capacity of ${(strongholdData.treasuryCapacity || 0).toLocaleString()} Embers`);
            if (strongholdData.hasBestiary) unlockedFeatures.push(`**🐾 Bestiary:** Tame and house up to ${strongholdData.bestiaryCapacity} beasts`);
            if (strongholdData.wardingLevel > 0) unlockedFeatures.push(`**🛡️ Enhanced Warding:** Level ${strongholdData.wardingLevel} protection against pillaging`);
            if (!profile.strongholds.find(s => s.strongholdId !== strongholdId)) unlockedFeatures.push(`**🐕 Familiar Attunement:** Attune with up to ${Math.floor(strongholdData.maxFollowers / 2)} familiars`);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(unlockedFeatures.join('\n\n'))
            );

            components.push(featuresContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **FINANCIAL SUMMARY**\n\n**Acquisition Price:** \`${strongholdData.price.toLocaleString()} Embers\`\n**Remaining Ember Sachel:** \`${profile.embers.toLocaleString()} Embers\`\n**Total Strongholds:** \`${profile.strongholds.length}\`\n**Stronghold Investment:** \`${profile.strongholds.reduce((sum, s) => sum + s.purchasePrice, 0).toLocaleString()} Embers\`\n**Ledger Updated:** Acquisition recorded in your transaction history`)
            );

            components.push(financialContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            nextStepsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**👨‍👩‍👧‍👦 Recruit Followers:** Gather followers to work and earn bonuses\n**🏦 Use Treasury:** Secure your Embers in your stronghold's treasury\n**🐾 Tame Beasts:** House multiple beasts in your bestiary\n**🐕 Attune with Familiars:** Add familiars for companionship and arcane power\n**📈 Stronghold Value:** Watch your dominion grow in power and influence\n\n> Your new stronghold opens up exciting paths to domination!`)
            );

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buystronghold command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **STRONGHOLD ACQUISITION ERROR**\n\nSomething went wrong while processing your stronghold acquisition. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};

function getStrongholdTypeColor(type) {
    const colors = {
        'outpost': 0x95A5A6,
        'tower': 0x607D8B,
        'fortress': 0x4CAF50,
        'citadel': 0x9C27B0,
        'castle': 0xFF9800,
        'palace': 0xE91E63
    };
    return colors[type] || 0x4CAF50;
}

function getStrongholdTypeEmoji(type) {
    const emojis = {
        'outpost': '🏕️',
        'tower': '🗼',
        'fortress': '🏰',
        'citadel': '🏛️',
        'castle': '👑',
        'palace': '⚜️'
    };
    return emojis[type] || '🏰';
}
