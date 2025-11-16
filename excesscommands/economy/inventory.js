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
    name: 'satchel',
    aliases: ['bag', 'possessions', 'treasures'],
    description: 'View your adventurer\'s satchel and collected treasures.',
    usage: '!satchel [filter] [page]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (!profile.inventory || profile.inventory.length === 0) {
                const components = [];
                const emptyContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                emptyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🎒 Empty Satchel\n## NO TREASURES FOUND\n\n> Your adventurer\'s satchel is empty!\n> Embark on quests and hunts to discover valuable treasures.`)
                );
                emptyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**💡 How to Get Treasures:**\n\`!hunt\` - Slay monsters for loot\n\`!quest\` - Complete quests for rewards`)
                );
                components.push(emptyContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const filter = args[0]?.toLowerCase() || 'all';
            const page = parseInt(args[1]) || 1;
            const itemsPerPage = 8;

            let filteredItems = profile.inventory;
            
            if (filter !== 'all') {
                // Fantasy-themed filters
                filteredItems = profile.inventory.filter(item => {
                    switch(filter) {
                        case 'relics':
                            return ['rare', 'epic', 'legendary', 'mythic'].includes(item.rarity);
                        case 'curios':
                            return ['common', 'uncommon'].includes(item.rarity);
                        case 'treasure_chests':
                            return item.type === 'treasure_chest';
                        case 'monster_parts':
                            return item.type === 'monster_part';
                        case 'hides':
                            return item.type === 'hide';
                        case 'trophies':
                            return item.type === 'trophy';
                        case 'gemstones':
                            return item.type === 'gemstone';
                        case 'artifacts':
                            return item.type === 'artifact';
                        default:
                            return item.type === filter || item.rarity === filter;
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
                new TextDisplayBuilder().setContent(`# 🎒 ${message.author.username}\'s Satchel of Treasures\n## SPOILS OF ADVENTURE\n\n> Showing ${filter === 'all' ? 'all treasures' : filter} (Page ${page}/${totalPages})`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder().setAccentColor(0x2ECC71);
            const totalItems = profile.inventory ? profile.inventory.length : 0;
            const totalValue = profile.inventory ? profile.inventory.reduce((sum, item) => sum + (item.currentValue * item.quantity), 0) : 0;
            const storageUsed = HuntingManager.calculateInventoryWeight(profile); // Assumes this function is updated or generic enough
            const storageCapacity = HuntingManager.calculateStorageCapacity(profile); // Assumes this function is updated

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 📊 **SATCHEL STATISTICS**`)
            );
            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**📦 Total Treasures:** ${totalItems}\n**💰 Total Value:** ${totalValue.toLocaleString()} Embers\n**⚖️ Encumbrance:** ${storageUsed}/${storageCapacity} capacity`)
            );

            const rarityCount = {};
            if (profile.inventory) {
                profile.inventory.forEach(item => {
                    rarityCount[item.rarity] = (rarityCount[item.rarity] || 0) + 1;
                });
            }

            const rarityText = Object.entries(rarityCount)
                .map(([rarity, count]) => `**${rarity.charAt(0).toUpperCase() + rarity.slice(1)}:** ${count}`)
                .join('\n');

            statsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(rarityText));
            components.push(statsContainer);

            if (pageItems.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const itemsContainer = new ContainerBuilder().setAccentColor(0xFF9800);
                itemsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 💎 **TREASURES (${startIndex + 1}-${Math.min(endIndex, filteredItems.length)} of ${filteredItems.length})**`)
                );

                for (let i = 0; i < pageItems.length; i += 2) {
                    let itemText = '';
                    for (let j = i; j < Math.min(i + 2, pageItems.length); j++) {
                        const item = pageItems[j];
                        const rarityEmoji = { 'common': '⚪', 'uncommon': '🟢', 'rare': '🔵', 'epic': '🟣', 'legendary': '🟡', 'mythic': '🔴' };
                        const typeEmoji = { 'monster_part': '🦴', 'hide': '🦌', 'trophy': '🏆', 'gemstone': '💎', 'artifact': '⚱️', 'treasure_chest': '📦' };
                        const emoji = rarityEmoji[item.rarity] || '⚪';
                        const typeIcon = typeEmoji[item.type] || '📦';
                        
                        itemText += `${emoji} **${item.name}** ${typeIcon}\n`;
                        itemText += `> **Value:** ${ (item.currentValue * item.quantity).toLocaleString()} Embers`;
                        if (item.quantity > 1) {
                            itemText += ` (${item.quantity}x ${item.currentValue.toLocaleString()} Embers)`;
                        }
                        itemText += `\n> **ID:** \`${item.itemId.slice(-8)}\`\n`;
                        
                        if (j < Math.min(i + 2, pageItems.length) - 1) {
                            itemText += '\n';
                        }
                    }
                    itemsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(itemText));
                }
                components.push(itemsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
            footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📜 **QUICK ACTIONS**`));

            let commandText = `**\`!sell <item_id>\`** - Sell a specific treasure\n**\`!sell all <type>\`** - Sell all of a certain type\n**\`!open <chest_id>\`** - Open a treasure chest`;
            
            if (totalPages > 1) {
                commandText += `\n\n**Navigation:** Page ${page}/${totalPages}\n\`!satchel ${filter} ${page + 1}\` - Next page`;
            }

            footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(commandText));
            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Filters:** \`all\`, \`relics\`, \`curios\`, \`treasure_chests\`, \`monster_parts\`, \`hides\`, \`trophies\`, \`gemstones\`, \`artifacts\``)
            );
            components.push(footerContainer);

            return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in satchel command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## ❌ **SATCHEL ERROR**\n\nCouldn\'t access your satchel. The magical bindings may be temporarily disrupted.`)
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};