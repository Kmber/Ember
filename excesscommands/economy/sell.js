const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { HuntingManager } = require('../../models/economy/huntingManager');

module.exports = {
    name: 'barter',
    aliases: ['trade', 'exchange'],
    description: 'Barter monster spoils and rare artifacts for Embers.',
    usage: '!barter <item_id> OR !barter all <type>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (!args[0]) {
                const components = [];
                const helpContainer = new ContainerBuilder().setAccentColor(0x3498DB);
                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 💰 Spoils Exchange\n## HOW TO EXCHANGE ITEMS\n\n> \`!barter <item_id>\` - Exchange an item\n> \`!barter all <type>\` - Exchange all items of a type (e.g., \`relics\`, \`essences\`, \`hides\`)`)
                );
                components.push(helpContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (args[0] === 'all' && args[1]) {
                const type = args[1].toLowerCase();
                let itemsToSell = [];
                profile.monsterSpoils.forEach(item => {
                    if (item.type === type || item.rarity === type) {
                        itemsToSell.push(item.itemId);
                    }
                });

                if (itemsToSell.length === 0) {
                    const components = [];
                    const noItemsContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                    noItemsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# 📦 No Spoils Found\n## NOTHING TO BARTER\n\n> You have no **${type}** to trade.`)
                    );
                    components.push(noItemsContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                }

                let totalValue = 0;
                itemsToSell.forEach(itemId => {
                    const item = profile.monsterSpoils.find(i => i.itemId === itemId);
                    if (item) {
                        totalValue += item.value * item.quantity;
                    }
                });

                const result = await HuntingManager.sellHuntingItems(profile, itemsToSell);
                await profile.save();

                const components = [];
                const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 💰 Barter Complete!\n## SOLD ALL ${type.toUpperCase()}\n\n> Exchanged ${result.soldItems.length} items for **${result.totalValue.toLocaleString()} Embers**.`)
                );
                components.push(successContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const itemId = args[0];
            let item = profile.monsterSpoils.find(i => i.itemId === itemId);
            if (!item) {
                item = profile.monsterSpoils.find(i => i.itemId.endsWith(itemId));
            }

            if (!item) {
                const components = [];
                const notFoundContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ❌ Spoil Not Found\n## INVALID ID\n\n> No monster spoil with ID \`${itemId}\` was found.`)
                );
                components.push(notFoundContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const totalSellValue = item.value * item.quantity;
            const result = await HuntingManager.sellHuntingItems(profile, [item.itemId]);
            await profile.save();

            const components = [];
            const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 💰 Barter Successful!\n## ${item.name.toUpperCase()}\n\n> Exchanged for **${totalSellValue.toLocaleString()} Embers**!`)
            );
            components.push(successContainer);
            return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in barter command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## ❌ **BARTER ERROR**\n\nCould not process the exchange: ${error.message}`)
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};