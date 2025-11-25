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
const slayingData = require('../../models/economy/constants/slayingData');

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

                    if (profile.slayingInventory.length === 0 && profile.slayingMounts.length === 0 && profile.slayingWeapons.length === 0 && profile.slayingAllies.length === 0) {
                        const emptyContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                        emptyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# 📦 Empty Inventory\n## NO SLAYING LOOT\n\n> Your slaying inventory is empty! Go on quests to find loot.`),
                            new TextDisplayBuilder().setContent(`**💡 How to Get Loot:**\n**\`${prefix}slay\`** - Go on a quest\n**\`${prefix}slayershop\`** - Buy supplies`)
                        );
                        return message.reply({ components: [emptyContainer], flags: MessageFlags.IsComponentsV2 });
                    }

                    const filter = args[0]?.toLowerCase() || 'all';
                    const page = parseInt(args[1]) || 1;
                    const itemsPerPage = 10;

                    // Define categories to group items
                    const categories = {
                        mounts: [],
                        weapons: [],
                        potions: [],
                        allies: [],
                        chests: [],
                        materials: [],
                        others: []
                    };

                    // Helper function to categorize an item
                    function categorizeItem(item) {
                        // Prioritize type field from item directly for categorization
                        const type = item.type || 'others';

                        if (type === 'mount' || type === 'horse' || type === 'griffon' || type === 'wyvern' || type === 'pegasus' || type === 'dragon') {
                            return 'mounts';
                        }
                        if (type === 'weapon' || type === 'sword' || type === 'axe' || type === 'mace' || type === 'greatsword' || type === 'staff') {
                            return 'weapons';
                        }
                        if (['potion', 'oil', 'enchantment'].includes(type)) {
                            return 'potions';
                        }
                        if (type === 'ally' || type === 'squire' || type === 'mystic' || type === 'ranger' || type === 'cleric' || type === 'paladin') {
                            return 'allies';
                        }
                        if (type === 'chest') {
                            return 'chests';
                        }
                        if (['flesh', 'hide', 'trophy', 'rare_essence', 'relic', 'artifact'].includes(type)) {
                            return 'materials';
                        }
                        return 'others';
                    }

                    // Combine all slaying collections into one list for categorizing and display
                    let combinedItems = [];

            // Format mounts from profile.slayingMounts
            if (profile.slayingMounts && profile.slayingMounts.length > 0) {
                const mounts = profile.slayingMounts.map(mount => ({
                    itemId: mount.mountId, // Explicitly assign mountId
                    name: mount.name,
                    quantity: 1,
                    currentValue: mount.price ?? 0,
                    type: mount.type ?? 'mount',
                    rarity: mount.rarity ?? 'common'
                }));
                combinedItems = combinedItems.concat(mounts);
            }

                    // Format weapons from profile.slayingWeapons
                    if (profile.slayingWeapons && profile.slayingWeapons.length > 0) {
                const weapons = profile.slayingWeapons.map(weapon => ({
                    itemId: weapon.weaponId, // Explicitly assign weaponId
                    name: weapon.name,
                    quantity: 1,
                    currentValue: weapon.price ?? 0,
                    type: weapon.type ?? 'weapon',
                    rarity: weapon.rarity ?? 'common'
                }));
                combinedItems = combinedItems.concat(weapons);
            }

                // Format allies from profile.slayingAllies
                if (profile.slayingAllies && profile.slayingAllies.length > 0) {
                    const allies = profile.slayingAllies.map(ally => ({
                        itemId: ally.allyId, // Explicitly assign allyId
                        name: ally.name,
                        quantity: 1,
                        currentValue: ally.price ?? 0,
                        type: ally.type ?? 'ally',
                        rarity: ally.rarity ?? 'common'
                    }));
                    combinedItems = combinedItems.concat(allies);
                }

                    // Add the rest of items in inventory
                    if (profile.slayingInventory && profile.slayingInventory.length > 0) {
                        combinedItems = combinedItems.concat(profile.slayingInventory);
                    }

                    // Filter combined items based on filter argument
                    let filteredItems = combinedItems;
                    if (filter !== 'all') {
                        if (Object.keys(categories).includes(filter)) {
                            filteredItems = combinedItems.filter(i => categorizeItem(i) === filter);
                        }
                        else {
                            filteredItems = combinedItems.filter(item => {
                                const itemData = slayingData.items[item.name.toLowerCase()] || {};
                                const itemType = itemData.type || item.type;
                                return itemType === filter || item.rarity === filter;
                            });
                        }
                    }

                    // Sort items descending by total value
                    filteredItems.sort((a, b) => (b.currentValue * b.quantity) - (a.currentValue * a.quantity));

                    // Categorize filtered items into categories object
                    Object.keys(categories).forEach(cat => {
                        categories[cat] = [];
                    });
                    for (const item of filteredItems) {
                        const cat = categorizeItem(item);
                        if (categories[cat]) {
                            categories[cat].push(item);
                        } else {
                            categories.others.push(item);
                        }
                    }

                    // Pagination across all items combined
                    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
                    const currentPage = Math.min(page, totalPages);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const pageItems = filteredItems.slice(startIndex, endIndex);

                    // Create a map for items on the current page for display grouped again
                    const pageCategories = {};
                    for (const item of pageItems) {
                        const cat = categorizeItem(item);
                        if (!pageCategories[cat]) pageCategories[cat] = [];
                        pageCategories[cat].push(item);
                    }

                    const rarityEmoji = { 'common': '⚪', 'uncommon': '🟢', 'rare': '🔵', 'epic': '🟣', 'legendary': '🟡', 'mythic': '🔴' };
                    const typeEmoji = { 'flesh': '🥩', 'hide': '🦌', 'trophy': '🏆', 'rare_essence': '💎', 'relic': '🏺', 'artifact': '⚱️', 'chest': '📦', 'potion': '🧪', 'oil': '💧', 'enchantment': '✨', 'mount': '🐎', 'weapon': '🗡️', 'ally': '🧙‍♂️' };

                    const components = [];

                    // Header with user and filter info
                    const headerContainer = new ContainerBuilder().setAccentColor(0x3498DB);
                    headerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# 🎒 ${message.author.username}'s Slaying Inventory\n## ${filter.toUpperCase()} | Page ${currentPage}/${totalPages}`)
                    );
                    components.push(headerContainer);

                    // Display items grouped by category
                    for (const [cat, items] of Object.entries(pageCategories)) {
                        if (items.length === 0) continue;

                        // Category header
                        const catContainer = new ContainerBuilder().setAccentColor(0xFF9800);
                        catContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`## 🗂️ ${cat.charAt(0).toUpperCase() + cat.slice(1)}`)
                        );

                        for (const item of items) {
                            const itemData = slayingData.items[item.name.toLowerCase()] || {};
                            const itemType = itemData.type || item.type || 'others';
                            const emoji = rarityEmoji[item.rarity] || '📦';
                            const typeIcon = typeEmoji[itemType] || '';

                            let itemText = `${emoji} **${item.name}** ${typeIcon}\n`;
                            itemText += `> **Value:** ${(item.currentValue * item.quantity).toLocaleString()} Embers`;
                            if (item.quantity > 1) itemText += ` (${item.quantity}x)`;
                            // Display last 8 characters of id for mounts, weapons, allies, other items for better UI
                            // Safely determine display ID by checking multiple possible id fields
                            // Determine display ID with fallback to array index if missing
                            let displayId = 'unknown';
                            if (item.itemId || item.mountId || item.weaponId || item.allyId) {
                                displayId = (item.itemId ?? item.mountId ?? item.weaponId ?? item.allyId).slice(-8);
                            } else {
                                // Fallback: find index in original arrays for mounts, weapons, allies for the name match
                                let fallbackIndex = -1;
                                if (item.type && ['mount', 'horse', 'griffon', 'wyvern', 'pegasus', 'dragon'].includes(item.type)) {
                                    fallbackIndex = profile.slayingMounts.findIndex(m => m.name === item.name);
                                    if (fallbackIndex !== -1) {
                                        displayId = `idx:${fallbackIndex}`;
                                    }
                                } else if (item.type && ['weapon', 'sword', 'axe', 'mace', 'greatsword', 'staff'].includes(item.type)) {
                                    fallbackIndex = profile.slayingWeapons.findIndex(w => w.name === item.name);
                                    if (fallbackIndex !== -1) {
                                        displayId = `idx:${fallbackIndex}`;
                                    }
                                } else if (item.type && ['ally', 'squire', 'mystic', 'ranger', 'cleric', 'paladin'].includes(item.type)) {
                                    fallbackIndex = profile.slayingAllies.findIndex(a => a.name === item.name);
                                    if (fallbackIndex !== -1) {
                                        displayId = `idx:${fallbackIndex}`;
                                    }
                                }
                            }
                            itemText += `\n> **ID:** \`${displayId}\``;

                            catContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(itemText));
                        }
                        components.push(catContainer);
                    }

                    // Footer container with commands and navigation
                    const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
                    const commandText = 
                        `**\`${prefix}use <id>\`** - Use a consumable\n` +
                        `**\`${prefix}openchest <id>\`** - Open a chest\n` +
                        `**\`${prefix}sell <id>\`** - Sell an item\n` +
                        `**\`${prefix}sell all <type>\`** - Sell all of a type`;

                    footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📋 **Quick Actions**\n${commandText}`));

                    const navText = `**Filters:** \`all\`, \`mounts\`, \`weapons\`, \`potions\`, \`allies\`, \`chests\`, \`materials\`\n**Page:** \`${prefix}sinv ${filter} <page>\``;
                    footerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### **Navigation & Filters**\n${navText}`));
                    
                    components.push(footerContainer);

                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                } catch (error) {
                    console.error('Error in inventory command:', error);
                    const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## ❌ INVENTORY ERROR\n\nCouldn't load your inventory. Please try again.`)
                    );
                    return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                }
            }
};
