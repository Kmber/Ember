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
const { 
    SLAYING_MOUNTS, 
    SLAYING_WEAPONS, 
    SLAYING_ALLIES, 
    SLAYING_VAULTS,
    POTION_TYPES,
    WEAPON_OILS,
    ENCHANTMENT_SUPPLIES
} = require('../../models/economy/constants/slayingData');

module.exports = {
    name: 'slayershop',
    aliases: ['slaystore', 'buygear', 'sshop'],
    description: 'Buy slaying mounts, weapons, allies, vaults, potions, and oils',
    usage: 'slayershop [category] [item] OR slayershop buy [item_id] [quantity] OR slayershop enchant/fortify',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            
            if (args[0] === 'enchant' && args[1] && args[2]) {
                const weaponIndex = parseInt(args[1]) - 1;
                const oilType = args[2].toLowerCase();
                const quantity = parseInt(args[3]) || 1;

                if (isNaN(weaponIndex) || weaponIndex < 0 || weaponIndex >= profile.slayingWeapons.length) {
                    return this.sendError(message, `Invalid weapon number! Use \`${prefix}slaying\` to see your weapons.`);
                }

                const weapon = profile.slayingWeapons[weaponIndex];
                
                try {
                    const result = await SlayingManager.enchantWeapon(profile, weapon.weaponId, oilType, quantity);
                    await profile.save();

                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ✨ Weapon Enchanted!\n## ${weapon.name.toUpperCase()}\n\n> Successfully applied ${result.oilApplied} of oil!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✨ Oil Applied:** ${result.oilApplied} units\n**🗡️ New Enchantment Level:** ${result.newEnchantmentLevel}/${weapon.enchantmentCapacity}\n**💰 Cost:** ${result.cost.toLocaleString()} Embers\n**💳 Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
                    );

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

                } catch (error) {
                    return this.sendError(message, error.message);
                }
            }

            if (args[0] === 'buy' && args[1]) {
                const itemId = args[1].toLowerCase();
                const quantity = parseInt(args[2]) || 1;
                let item = null;
                let category = '';
                let price = 0;

                if (SLAYING_MOUNTS[itemId]) {
                    item = SLAYING_MOUNTS[itemId];
                    category = 'mount';
                    price = item.price;
                } else if (SLAYING_WEAPONS[itemId]) {
                    item = SLAYING_WEAPONS[itemId];
                    category = 'weapon';
                    price = item.price;
                } else if (SLAYING_ALLIES[itemId]) {
                    item = SLAYING_ALLIES[itemId];
                    category = 'ally';
                    price = item.price;
                } else if (SLAYING_VAULTS[itemId]) {
                    item = SLAYING_VAULTS[itemId];
                    category = 'vault';
                    price = item.price;
                } else if (POTION_TYPES[itemId]) {
                    item = POTION_TYPES[itemId];
                    category = 'potion';
                    price = item.price * quantity;
                } else if (WEAPON_OILS[itemId]) {
                    item = WEAPON_OILS[itemId];
                    category = 'oil';
                    price = item.price * quantity;
                } else if (ENCHANTMENT_SUPPLIES[itemId]) {
                    item = ENCHANTMENT_SUPPLIES[itemId];
                    category = 'enchantment';
                    price = item.price * quantity;
                }

                if (!item) {
                    return this.sendError(message, `Item \`${itemId}\` not found! Use \`${prefix}slayershop\` to browse available items.`);
                }

                if (profile.wallet < price) {
                    return this.sendInsufficientFunds(message, item.name, price, profile.wallet);
                }

                profile.wallet -= price;

                if (category === 'potion' || category === 'oil' || category === 'enchantment') {
                    profile.slayingInventory.push({
                        itemId: `${itemId}_${Date.now()}`,
                        name: `${item.name} (x${quantity})`,
                        type: category,
                        rarity: 'common',
                        baseValue: price,
                        currentValue: price,
                        weight: quantity,
                        quantity: quantity,
                        slayDate: new Date(),
                        description: item.description,
                        consumableData: {
                            itemType: itemId,
                            usesRemaining: quantity
                        }
                    });
                } else {
                    // Handle non-consumable items
                    const newItem = {
                        ...item,
                        itemId: `${itemId}_${Date.now()}`
                    };

                    switch (category) {
                        case 'mount':
                            profile.slayingMounts.push(newItem);
                            break;
                        case 'weapon':
                            profile.slayingWeapons.push(newItem);
                            break;
                        case 'ally':
                            profile.slayingAllies.push(newItem);
                            break;
                        case 'vault':
                            profile.slayingVaults.push(newItem);
                            break;
                    }
                }

                profile.transactions.push({
                    type: 'expense',
                    amount: price,
                    description: `Purchased ${quantity}x ${item.name}`,
                    category: 'slaying'
                });

                await profile.save();

                const components = [];
                const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ✅ Purchase Successful!\n## ${item.name.toUpperCase()}\n\n> Purchased ${quantity}x **${item.name}**!`)
                );

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Total Cost:** ${price.toLocaleString()} Embers\n**💳 Remaining Balance:** ${profile.wallet.toLocaleString()} Embers\n**📦 Added to Inventory:** Use \`${prefix}inventory\` to see your new item!`)
                );

                if (category === 'oil') {
                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💡 How to Use:** \`${prefix}slayershop enchant <weapon#> ${itemId} <amount>\``)
                    );
                }

                components.push(successContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const category = args[0]?.toLowerCase() || 'overview';
            const components = [];

            if (category === 'overview') {
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ The Slayer\'s Emporium\n## SANCTYR ARMORY\n\n> Everything you need for your monster-slaying quests!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const categoriesContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏪 **SHOP CATEGORIES**`)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🐎 Mounts** - \`${prefix}slayershop mounts\`\n**⚔️ Weapons** - \`${prefix}slayershop weapons\`\n**👥 Allies** - \`${prefix}slayershop allies\`\n**🏰 Vaults** - \`${prefix}slayershop vaults\``)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🧪 Potions** - \`${prefix}slayershop potions\`\n**✨ Weapon Oils** - \`${prefix}slayershop oils\`\n**📜 Enchantments** - \`${prefix}slayershop enchantments\``)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Quick Actions:**\n\`${prefix}slayershop enchant <weapon#> <oil_type> [amount]\``)
                );

                components.push(categoriesContainer);

                const playerContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                playerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **YOUR COIN**\n\n**Current Balance:** ${profile.wallet.toLocaleString()} Embers\n**💡 How to Buy:** \`${prefix}slayershop buy <item_id> [quantity]\``)
                );

                components.push(playerContainer);

            } else {
                this.displayCategory(components, category, profile, prefix);
                if (components.length === 0) {
                    return this.sendError(message, `Invalid category: \`${category}\`. Use \`${prefix}slayershop\` to see available categories.`);
                }
            }

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in slayershop command:', error);
            return this.sendError(message, `Couldn\'t process your request: ${error.message}`);
        }
    },

    displayCategory(components, category, profile, prefix) {
        let items = {};
        let categoryName = '';
        let categoryIcon = '';
        let accentColor = 0x3498DB;

        switch(category) {
            case 'mounts':
                items = SLAYING_MOUNTS;
                categoryName = 'Mounts';
                categoryIcon = '🐎';
                accentColor = 0x3498DB;
                break;
            case 'weapons':
                items = SLAYING_WEAPONS;
                categoryName = 'Weapons';
                categoryIcon = '⚔️';
                accentColor = 0xE74C3C;
                break;
            case 'allies':
                items = SLAYING_ALLIES;
                categoryName = 'Allies';
                categoryIcon = '👥';
                accentColor = 0x9B59B6;
                break;
            case 'vaults':
                items = SLAYING_VAULTS;
                categoryName = 'Vaults';
                categoryIcon = '🏰';
                accentColor = 0xFF9800;
                break;
            case 'potions':
                items = POTION_TYPES;
                categoryName = 'Potions';
                categoryIcon = '🧪';
                accentColor = 0x2ECC71;
                break;
            case 'oils':
                items = WEAPON_OILS;
                categoryName = 'Weapon Oils';
                categoryIcon = '✨';
                accentColor = 0xFF5722;
                break;
            case 'enchantments':
                items = ENCHANTMENT_SUPPLIES;
                categoryName = 'Enchantments';
                categoryIcon = '📜';
                accentColor = 0x607D8B;
                break;
            default:
                return;
        }

        const headerContainer = new ContainerBuilder()
            .setAccentColor(accentColor);

        headerContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ${categoryIcon} ${categoryName} Shop\n## BROWSE ${categoryName.toUpperCase()}\n\n> Available ${categoryName.toLowerCase()} for purchase`)
        );

        components.push(headerContainer);
        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        const itemEntries = Object.entries(items).slice(0, 4);
        
        itemEntries.forEach(([itemId, item], index) => {
            const canAfford = profile.wallet >= item.price;
            
            const itemContainer = new ContainerBuilder()
                .setAccentColor(canAfford ? accentColor : 0x95A5A6);

            itemContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ${item.name}`)
            );

            let specs = '';
            if (category === 'potions') {
                specs = `**✨ Effect:** Restores ${item.staminaValue} stamina\n**⏳ Duration:** Instant`;
            } else if (category === 'oils') {
                const compatibleText = item.compatibleWeapons.join(', ');
                specs = `**⚔️ Compatible:** ${compatibleText}\n**💥 Damage Bonus:** +${Math.floor((item.damage - 1) * 100)}%\n**🎯 Accuracy Bonus:** +${Math.floor((item.accuracy - 1) * 100)}%`;
            } else if (category === 'enchantments') {
                specs = `**📜 Type:** ${item.type}\n`;
                if (item.enchantmentAmount) {
                    specs += `**✨ Effect:** Adds +${item.enchantmentAmount} enchantment points\n`;
                }
                if (item.effect) {
                    const effectText = item.effect.replace(/_/g, ' ');
                    specs += `**🛡️ Effect:** ${effectText}\n`;
                }
                if (item.rejuvenationAmount) {
                    specs += `**🐎 Effect:** Restores ${item.rejuvenationAmount} health and stamina\n`;
                }
                if (item.duration) {
                    specs += `**⏳ Duration:** ${item.duration} quests\n`;
                }
                if (item.uses) {
                    specs += `**🔄 Uses:** ${item.uses} applications`;
                }
                // Trim trailing newline
                specs = specs.trim();
            }

            if (specs) {
                itemContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(specs)
                );
            }

            itemContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Price:** ${item.price.toLocaleString()} Embers ${canAfford ? '✅' : '❌'}\n**📖 Description:** ${item.description}\n**💡 Buy:** \`${prefix}slayershop buy ${itemId} [quantity]\``)
            );

            components.push(itemContainer);
            
            if (index < itemEntries.length - 1) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            }
        });

        if (Object.keys(items).length > 4) {
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const moreContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            moreContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*... and ${Object.keys(items).length - 4} more ${categoryName.toLowerCase()} available*\n\n**💰 Your Coin:** ${profile.wallet.toLocaleString()} Embers`)
            );

            components.push(moreContainer);
        }
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C);

        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ❌ Error\n## TASK FAILED\n\n> ${errorText}`)
        );

        return message.reply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    },

    sendInsufficientFunds(message, itemName, price, currentBalance) {
        const insufficientContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C);

        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 💸 Insufficient Coin\n## CANNOT PURCHASE\n\n> You need ${price.toLocaleString()} Embers to acquire **${itemName}**!`)
        );

        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**💰 Current Coin:** ${currentBalance.toLocaleString()} Embers\n**💰 Required:** ${price.toLocaleString()} Embers\n**💰 Shortage:** ${(price - currentBalance).toLocaleString()} Embers`)
        );

        return message.reply({
            components: [insufficientContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
};