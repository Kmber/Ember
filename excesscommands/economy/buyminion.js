const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { MINIONS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buyminion',
    aliases: ['minion-buy'],
    description: 'Summon a minion for power and protection with v2 components',
    usage: '!buyminion <minion_id> <name>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x992d22); // Dark Red

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Minion Summoning Circle\n## DARK SERVANTS AWAIT\n\n> Welcome to the summoning circle! Choose from our selection of dark and powerful minions.\n> Each minion provides power benefits and serves your dark ambitions.`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const minionEntries = Object.entries(MINIONS);
                const minionsByType = {};
                
                minionEntries.forEach(([id, minion]) => {
                    if (!minionsByType[minion.type]) {
                        minionsByType[minion.type] = [];
                    }
                    minionsByType[minion.type].push([id, minion]);
                });

                Object.entries(minionsByType).forEach(([type, minions]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getMinionTypeColor(type));

                    const emoji = getMinionTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} MINIONS**`)
                    );

                    for (let i = 0; i < minions.length; i += 3) {
                        const minionGroup = minions.slice(i, i + 3);
                        const minionText = minionGroup.map(([id, minion]) => 
                            `**\`${id}\`** - ${minion.name} (${minion.breed})\n> **Price:** \`$${minion.price.toLocaleString()}\`\n> **Power Level:** \`${minion.powerLevel}/100\`\n> **Type:** ${minion.type}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(minionText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **HOW TO SUMMON**\n\n**Command:** \`!buyminion <minion_id> <minion_name>\`\n**Example:** \`!buyminion hellhound Cerberus\`\n\n**💡 Benefits:**\n> • Enhanced power against rivals\n> • Loyal servants for your citadel\n> • Property protection and dark surveillance\n> • Customizable minion names for personalization`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const minionId = args[0].toLowerCase();
            const minionName = args.slice(1).join(' ') || MINIONS[minionId]?.name;
            const minionData = MINIONS[minionId];

            if (!minionData) {
                const components = [];

                const invalidMinionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidMinionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Minion ID\n## MINION NOT FOUND\n\n> **\`${minionId}\`** is not a valid minion ID!\n> Use \`!buyminion\` to see all available minions with their correct IDs.`)
                );

                components.push(invalidMinionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.minions.length >= profile.maxMinions) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 Minion Capacity Limit Reached\n## MAXIMUM MINIONS OWNED\n\n> You can only have **${profile.maxMinions}** minions with your current citadel!\n> Your lair doesn't have space for more dark servants.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏰 **EXPAND YOUR CAPACITY**\n\n**Current Minion Capacity:** \`${profile.maxMinions}\`\n**Current Minions:** \`${profile.minions.length}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger citadel with more space\n> • Citadels determine maximum minion capacity\n> • Bigger citadels = more dark servants!`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < minionData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD MINION SUMMONING\n\n> You don't have enough money to summon **${minionData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **SUMMONING FEES**\n\n**Minion:** \`${minionData.name} (${minionData.breed})\`\n**Summoning Fee:** \`$${minionData.price.toLocaleString()}\`\n**Your Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Shortage:** \`$${(minionData.price - profile.wallet).toLocaleString()}\`\n\n**💡 Earning Tips:** Work regularly, complete dailies, or run guilds to save for your new minion!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            profile.wallet -= minionData.price;
            profile.minions.push({
                minionId: `${minionId}_${Date.now()}`,
                name: minionName,
                type: minionData.type,
                breed: minionData.breed,
                powerLevel: minionData.powerLevel,
                energy: 50,
                constitution: 100,
                loyalty: 50,
                corruption: 50,
                purchasePrice: minionData.price,
                lastSustained: new Date(),
                lastTended: new Date(),
                lastCommuned: new Date(),
                dateSummoned: new Date()
            });

            profile.transactions.push({
                type: 'expense',
                amount: minionData.price,
                description: `Summoned minion: ${minionName} (${minionData.breed})`,
                category: 'minion'
            });

            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x992d22); // Dark Red

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 Minion Summoned Successfully!\n## WELCOME YOUR NEW SERVANT\n\n> Congratulations! You've successfully summoned **${minionName}** the ${minionData.breed} for **\`$${minionData.price.toLocaleString()}\`**!\n> Your new dark servant is ready to protect your citadel and bring chaos to your enemies!`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x711a1a); // Deeper Red

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🦇 **MINION PROFILE**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Minion Name:** \`${minionName}\`\n**🏷️ Minion Type:** \`${minionData.type}\`\n**🐾 Breed:** \`${minionData.breed}\`\n**⚔️ Power Level:** \`${minionData.powerLevel}/100\`\n**📅 Summon Date:** \`${new Date().toLocaleDateString()}\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚡ Energy:** \`50%\` (Starting level)\n**❤️ Constitution:** \`100%\` (Perfect condition)\n**🔥 Loyalty:** \`50%\` (Well sustained)\n**💀 Corruption:** \`50%\` (Tended and ready)`)
            );

            components.push(specsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const powerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            powerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **POWER BENEFITS**')
            );

            const newPowerLevel = EconomyManager.calculatePowerLevel(profile);
            powerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Enhanced Citadel Power:** Your citadel is now more formidable!\n**🔒 Rival Protection:** \`+${minionData.powerLevel}%\` power boost\n**📊 Total Power Level:** \`${newPowerLevel}%\`\n**🎯 Protection Value:** Your minion actively deters potential rivals`)
            );

            components.push(powerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🖤 **MINION CARE GUIDE**\n\n**🍽️ Sustenance:** Keep your minion well-fed for optimal energy\n**🛁 Tending:** Regular tending maintains constitution and loyalty\n**🎾 Communing:** Interact with your minion to boost their mood\n**🛒 Shop Items:** Purchase minion sustenance and care items from the shop\n**💊 Constitution:** Monitor your minion's constitution and energy levels\n\n> Happy minions provide better power for your citadel!`)
            );

            components.push(careContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **SUMMONING SUMMARY**\n\n**Summoning Fee:** \`$${minionData.price.toLocaleString()}\`\n**Remaining Wallet:** \`$${profile.wallet.toLocaleString()}\`\n**Total Minions:** \`${profile.minions.length}/${profile.maxMinions}\`\n**Transaction Logged:** Summoning recorded in your transaction history\n\n> Your investment in power and servitude is complete!`)
            );

            components.push(financialContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buyminion command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **MINION SUMMONING ERROR**\n\nSomething went wrong while processing your minion summoning. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};

function getMinionTypeColor(type) {
    const colors = {
        'imp': 0x992d22,      
        'hellhound': 0xE74C3C,         
        'gargoyle': 0x95A5A6,        
        'watcher': 0x9B59B6, 
        'raven': 0x34495E    
    };
    return colors[type] || 0x992d22;
}

function getMinionTypeEmoji(type) {
    const emojis = {
        'imp': '👿',
        'hellhound': '🔥', 
        'gargoyle': '🗿',
        'watcher': '👁️',
        'raven': '🐦'
    };
    return emojis[type] || '🦇';
}
