const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { FAMILIARS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'attunefamiliar',
    aliases: ['familiar-attune', 'bond'],
    description: 'Attune with a familiar for warding with v2 components',
    usage: '!attunefamiliar <familiar_id> <name>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF69B4);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Familiar Attunement Sanctum\n## MYSTICAL COMPANIONS AWAIT\n\n> Welcome to the Familiar Attunement Sanctum! Choose from our selection of mystical and protective companions.\n> Each familiar provides warding benefits and mystical companionship for your stronghold.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const familiarEntries = Object.entries(FAMILIARS);
                const familiarsByType = {};
                
                familiarEntries.forEach(([id, familiar]) => {
                    if (!familiarsByType[familiar.type]) {
                        familiarsByType[familiar.type] = [];
                    }
                    familiarsByType[familiar.type].push([id, familiar]);
                });

                Object.entries(familiarsByType).forEach(([type, familiars]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getFamiliarTypeColor(type));

                    const emoji = getFamiliarTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} COMPANIONS**`)
                    );

                    for (let i = 0; i < familiars.length; i += 3) {
                        const familiarGroup = familiars.slice(i, i + 3);
                        const familiarText = familiarGroup.map(([id, familiar]) => 
                            `**\`${id}\`** - ${familiar.name} (${familiar.species})\n> **Attunement Cost:** \`${familiar.price.toLocaleString()} Embers\`\n> **Warding Level:** \`${familiar.wardingLevel}/100\`\n> **Type:** ${familiar.type}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(familiarText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **HOW TO ATTUNE**\n\n**Command:** \`!attunefamiliar <familiar_id> <familiar_name>\`\n**Example:** \`!attunefamiliar shadow_wisp Luna\`\n\n**💡 Benefits:**\n> • Enhanced warding against pillaging\n> • Mystical companionship for your retinue\n> • Stronghold protection and surveillance\n> • Customizable familiar names for personalization`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const familiarId = args[0].toLowerCase();
            const familiarName = args.slice(1).join(' ') || FAMILIARS[familiarId]?.name;
            const familiarData = FAMILIARS[familiarId];

            if (!familiarData) {
                const components = [];

                const invalidFamiliarContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidFamiliarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Familiar ID\n## FAMILIAR NOT FOUND\n\n> **\`${familiarId}\`** is not a valid familiar ID!\n> Use \`!attunefamiliar\` to see all available familiars with their correct IDs.`)
                );

                components.push(invalidFamiliarContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.familiars.length >= profile.maxFamiliars) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Familiar Capacity Limit Reached\n## MAXIMUM FAMILIARS BONDED\n\n> You can only have **${profile.maxFamiliars}** familiars with your current stronghold!\n> Your sanctum doesn't have space for more mystical companions.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏰 **EXPAND YOUR CAPACITY**\n\n**Current Familiar Capacity:** \`${profile.maxFamiliars}\`\n**Current Familiars:** \`${profile.familiars.length}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger stronghold with more space\n> • Strongholds determine maximum familiar capacity\n> • Mightier strongholds = more mystical companions!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.embers < familiarData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD ATTUNEMENT\n\n> You don't have enough embers to attune with **${familiarData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **ATTUNEMENT COSTS**\n\n**Familiar:** \`${familiarData.name} (${familiarData.species})\`\n**Attunement Cost:** \`${familiarData.price.toLocaleString()} Embers\`\n**Your Embers:** \`${profile.embers.toLocaleString()} Embers\`\n**Shortage:** \`${(familiarData.price - profile.embers).toLocaleString()} Embers\`\n\n**💡 Earning Tips:** Complete quests, dailies, or manage your dominion to save for your new companion!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            profile.embers -= familiarData.price;
            profile.familiars.push({
                familiarId: `${familiarId}_${Date.now()}`,
                name: familiarName,
                type: familiarData.type,
                species: familiarData.species,
                wardingLevel: familiarData.wardingLevel,
                bond: 50,
                health: 100,
                maxHealth: familiarData.maxHealth,
                mana: 50,
                essence: 50,
                attunementPrice: familiarData.price,
                lastFed: new Date(),
                lastGroomed: new Date(),
                lastPlayed: new Date(),
                dateAttuned: new Date()
            });

            profile.transactions.push({
                type: 'expense',
                amount: familiarData.price,
                description: `Attuned with familiar: ${familiarName} (${familiarData.species})`,
                category: 'familiar'
            });

            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 Familiar Attunement Successful!\n## WELCOME YOUR NEW COMPANION\n\n> Congratulations! You've successfully attuned with **${familiarName}** the ${familiarData.species} for **\`${familiarData.price.toLocaleString()} Embers\`**!\n> Your new mystical friend is ready to protect your stronghold and bring power to your retinue!`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const specsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🐾 **FAMILIAR PROFILE**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Familiar Name:** \`${familiarName}\`\n**🏷️ Familiar Type:** \`${familiarData.type}\`\n**🐾 Species:** \`${familiarData.species}\`\n**🛡️ Warding Level:** \`${familiarData.wardingLevel}/100\`\n**📅 Attunement Date:** \`${new Date().toLocaleDateString()}\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**❤️ Bond:** \`50%\` (Starting level)\n**🏥 Health:** \`100%\` (Perfect condition)\n**💧 Mana:** \`50%\` (Wellspring of power)\n**✨ Essence:** \`50%\` (Pure and ready)`)
            );

            components.push(specsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const wardingContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            wardingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **WARDING BENEFITS**')
            );

            const newWardingLevel = EconomyManager.calculateWardingLevel(profile);
            wardingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Enhanced Stronghold Warding:** Your stronghold is now better protected!\n**🔒 Pillaging Protection:** \`+${familiarData.wardingLevel}%\` warding boost\n**📊 Total Warding Level:** \`${newWardingLevel}%\`\n**🎯 Protection Value:** Your familiar actively deters potential intruders`)
            );

            components.push(wardingContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💝 **FAMILIAR CARE GUIDE**\n\n**💧 Mana:** Keep your familiar's mana high for optimal power\n**✨ Essence:** Regular cleansing maintains purity and bond\n**❤️ Bonding:** Interact with your familiar to boost their loyalty\n** Marketplace Items:** Purchase mana crystals and cleansing items from the market\n**💊 Health:** Monitor your familiar's health and bond levels\n\n> A happy familiar provides better warding for your stronghold!`)
            );

            components.push(careContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **ATTUNEMENT SUMMARY**\n\n**Attunement Cost:** \`${familiarData.price.toLocaleString()} Embers\`\n**Remaining Embers:** \`${profile.embers.toLocaleString()} Embers\`\n**Total Familiars:** \`${profile.familiars.length}/${profile.maxFamiliars}\`\n**Transaction Logged:** Attunement recorded in your transaction history\n\n> Your investment in companionship and power is complete!`)
            );

            components.push(financialContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in attunefamiliar command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILIAR ATTUNEMENT ERROR**\n\nSomething went wrong while processing your familiar attunement. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};

function getFamiliarTypeColor(type) {
    const colors = {
        'arcane': 0xFF69B4,      
        'elemental': 0x9B59B6,         
        'fey': 0x3498DB,        
        'shadow': 0xE74C3C, 
        'celestial': 0xF39C12    
    };
    return colors[type] || 0xFF69B4;
}

function getFamiliarTypeEmoji(type) {
    const emojis = {
        'arcane': '🔮',
        'elemental': '🔥', 
        'fey': '✨',
        'shadow': '🦇',
        'celestial': '🌟'
    };
    return emojis[type] || '🐾';
}
