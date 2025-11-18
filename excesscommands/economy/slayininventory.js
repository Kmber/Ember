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
    name: 'slayininventory',
    aliases: ['sinv', 'slayinv', 'sloot'],
    description: 'View your slaying inventory and loot',
    usage: 'slayininventory [filter] [page]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (profile.slayingInventory.length === 0) {
                const emptyContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                emptyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 📦 Empty Inventory\n## NO SLAYING LOOT\n\n> Your slaying inventory is empty! Go on quests to find loot.`),
                    new TextDisplayBuilder().setContent(`**💡 How to Get Loot:**\n**\`${prefix}slay\`** - Go on a quest\n**\`${prefix}slayershop\`** - Buy supplies`)
                );
                return message.reply({ components: [emptyContainer], flags: MessageFlags.IsComponentsV2 });
            }

            const filter = args[0]?.toLowerCase() || 'all';
            const page = parseInt(args[1]) || 1;
            const itemsPerPage = 8;

            let filteredItems = profile.slayingInventory;
            if (filter !== 'all') {
                filteredItems = profile.slayingInventory.filter(item => {
                    const itemData = slayingData.items[item.name.toLowerCase()] || {};
                    const itemType = itemData.type || item.type; // Fallback to item.type if not in slayingData
                    switch(filter) {
                        case 'consumable':
                            return ['potion', 'oil', 'enchantment'].includes(itemType);
                        case 'material':
                            return ['flesh', 'hide', 'trophy', 'rare_essence', 'relic', 'artifact'].includes(itemType);
                        case 'chest':
                            return itemType === 'chest';
                        default:
                            return itemType === filter || item.rarity === filter;
                    }
                });
            }

            filteredItems.sort((a, b) => (b.currentValue * b.quantity) - (a.currentValue * a.quantity));

            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageItems = filteredItems.slice(startIndex, endIndex);

            const components = [];

            const headerContainer = new ContainerBuilder().setAccentColor(0x3498DB);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 🎒 ${message.author.username}'s Slaying Inventory\n## ${filter.toUpperCase()} | Page ${page}/${totalPages}`)
            );
            components.push(headerContainer);

            if (pageItems.length > 0) {
                const itemsContainer = new ContainerBuilder().setAccentColor(0xFF9800);
                for (const item of pageItems) {
                    const rarityEmoji = { 'common': '⚪', 'uncommon': '🟢', 'rare': '🔵', 'epic': '🟣', 'legendary': '🟡', 'mythic': '🔴' };
                    const typeEmoji = { 'flesh': '🥩', 'hide': '🦌', 'trophy': '🏆', 'rare_essence': '💎', 'relic': '🏺', 'artifact': '⚱️', 'chest': '📦', 'potion': '🧪', 'oil': '💧', 'enchantment': '✨' };
                    const itemData = slayingData.items[item.name.toLowerCase()] || {};
                    const itemType = itemData.type || item.type;

                    const emoji = rarityEmoji[item.rarity] || '📦';
                    const typeIcon = typeEmoji[itemType] || '';
                    
                    let itemText = `${emoji} **${item.name}** ${typeIcon}\n`;
                    itemText += `> **Value:** ${(item.currentValue * item.quantity).toLocaleString()} Embers`;
                    if (item.quantity > 1) itemText += ` (${item.quantity}x)`;
                    itemText += `\n> **ID:** \`${item.itemId.slice(-8)}\``;
                    
                    itemsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(itemText));
                }
                components.push(itemsContainer);
            }

            const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
            const commandText = 
                `**\`${prefix}use <id>\`** - Use a consumable\n` +
                `**\`${prefix}openchest <id>\`** - Open a chest\n` +
                `**\`${prefix}sell <id>\`** - Sell an item\n` +
                `**\`${prefix}sell all <type>\`** - Sell all of a type`;
            
            footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📋 **Quick Actions**\n${commandText}`));

            const navText = `**Filters:** \`all\`, \`consumable\`, \`material\`, \`chest\`\n**Page:** \`${prefix}sinv ${filter} <page>\``;
            footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### **Navigation & Filters**\n${navText}`));
            
            components.push(footerContainer);

            return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in inventory command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayDisplayBuilder().setContent(`## ❌ INVENTORY ERROR\n\nCouldn't load your inventory. Please try again.`)
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};