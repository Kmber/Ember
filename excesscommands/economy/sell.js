const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { SlayingManager } = require('../../models/economy/slayingManager');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'sell',
    aliases: ['sellitem', 'ssly', 'sellloot'],
    description: 'Sell slaying loot and items',
    usage: 'sell <item_id> OR !sell all <type> OR !sell confirm',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!args[0]) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Sell Slaying Loot\n## HOW TO SELL ITEMS\n\n> Various ways to sell your slaying inventory`)
                );

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Sell Specific Item:**\n\`${prefix}sell <item_id>\` - Sell one item\n\n**📦 Sell by Type:**\n\`${prefix}sell all flesh\` - Sell all flesh\n\`${prefix}sell all common\` - Sell all common items\n\`${prefix}sell all hide\` - Sell all hides`)
                );

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Available Types:**\n\`flesh\`, \`hide\`, \`trophies\`, \`rare_essence\`, \`relic\`, \`artifact\`, \`common\`, \`uncommon\`, \`rare\`\n\n**📋 Use \`${prefix}inventory\` to see your items and their IDs**`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (args[0] === 'all' && args[1]) {
              
                const type = args[1].toLowerCase();
                
                let itemsToSell = [];
                profile.slayingInventory.forEach(item => {
                    switch(type) {
                        case 'flesh':
                            if (item.type === 'flesh') itemsToSell.push(item.itemId);
                            break;
                        case 'hide':
                        case 'hides':
                            if (item.type === 'hide') itemsToSell.push(item.itemId);
                            break;
                        case 'trophies':
                        case 'trophy':
                            if (item.type === 'trophy') itemsToSell.push(item.itemId);
                            break;
                        case 'rare_essence':
                        case 'essence':
                            if (item.type === 'rare_essence') itemsToSell.push(item.itemId);
                            break;
                        case 'relics':
                        case 'relic':
                            if (item.type === 'relic') itemsToSell.push(item.itemId);
                            break;
                        case 'artifacts':
                        case 'artifact':
                            if (item.type === 'artifact') itemsToSell.push(item.itemId);
                            break;
                        case 'common':
                        case 'uncommon':
                        case 'rare':
                        case 'epic':
                        case 'legendary':
                        case 'mythic':
                            if (item.rarity === type) itemsToSell.push(item.itemId);
                            break;
                    }
                });

                if (itemsToSell.length === 0) {
                    const components = [];

                    const noItemsContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noItemsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📦 No Items Found\n## NOTHING TO SELL\n\n> You don't have any **${type}** items to sell!`)
                    );

                    components.push(noItemsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                let totalValue = 0;
                const itemDetails = [];
                
                itemsToSell.forEach(itemId => {
                    const item = profile.slayingInventory.find(i => i.itemId === itemId);
                    if (item) {
                        let sellValue = item.currentValue;
                        const vault = profile.slayingVaults.find(v => item.location === v.vaultId);
                        if (vault) {
                            sellValue = Math.floor(sellValue * vault.bonusMultiplier);
                        }
                        
                        totalValue += sellValue * item.quantity;
                        itemDetails.push({
                            name: item.name,
                            value: sellValue * item.quantity,
                            quantity: item.quantity
                        });
                    }
                });

             
                const result = await SlayingManager.sellSlayingItems(profile, itemsToSell);
                await profile.save();

                const components = [];

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Bulk Sale Complete!\n## SOLD ALL ${type.toUpperCase()}\n\n> Successfully sold ${result.soldItems.length} items!`)
                );

                components.push(successContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **SALE SUMMARY**`)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Total Earned:** ${result.totalValue.toLocaleString()} Embers\n**📦 Items Sold:** ${result.soldItems.length}\n**💳 New Balance:** ${profile.wallet.toLocaleString()} Embers\n**📈 Total Slaying Earnings:** ${profile.slayingStats.totalEarnings.toLocaleString()} Embers`)
                );

               
                const topItems = result.soldItems
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map(item => `**${item.name}** - ${item.value.toLocaleString()} Embers`)
                    .join('\n');

                if (topItems) {
                    detailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🏆 Most Valuable Items:**\n${topItems}`)
                    );
                }

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const itemId = args[0];
            
          
            let item = profile.slayingInventory.find(i => i.itemId === itemId);
            if (!item) {
                item = profile.slayingInventory.find(i => i.itemId.endsWith(itemId));
            }

            if (!item) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Item Not Found\n## INVALID ITEM ID\n\n> Item with ID \`${itemId}\` not found!\n> Use \`${prefix}inventory\` to see your items and their IDs.`)
                );

                components.push(notFoundContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            let sellValue = item.currentValue;
            const vault = profile.slayingVaults.find(v => item.location === v.vaultId);
            let vaultBonus = 0;
            
            if (vault) {
                const bonusValue = Math.floor(item.currentValue * vault.bonusMultiplier) - item.currentValue;
                vaultBonus = bonusValue * item.quantity;
                sellValue = Math.floor(item.currentValue * vault.bonusMultiplier);
            }

            const totalSellValue = sellValue * item.quantity;

           
            const result = await SlayingManager.sellSlayingItems(profile, [item.itemId]);
            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💰 Item Sold Successfully!\n## ${item.name.toUpperCase()}\n\n> Sold for ${totalSellValue.toLocaleString()} Embers!`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📋 **SALE DETAILS**`)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📦 Item:** ${item.name}\n**⭐ Rarity:** ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}\n**📊 Quantity:** ${item.quantity}`)
            );

            let valueBreakdown = `**💰 Base Value:** ${(item.currentValue * item.quantity).toLocaleString()} Embers`;
            if (vaultBonus > 0) {
                valueBreakdown += `\n**🏰 Vault Bonus:** +${vaultBonus.toLocaleString()} Embers`;
            }
            valueBreakdown += `\n**💎 Total Earned:** ${totalSellValue.toLocaleString()} Embers\n**💳 New Balance:** ${profile.wallet.toLocaleString()} Embers`;

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(valueBreakdown)
            );

            components.push(detailsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in sell command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **SELL ERROR**\n\nCouldn't process the sale: ${error.message}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};