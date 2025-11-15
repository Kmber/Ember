const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { HuntingManager } = require('../../models/economy/huntingManager');
const { 
    HUNTING_MOUNTS, 
    HUNTING_WEAPONS, 
    HUNTING_FAMILIARS, 
    HUNTING_LAIRS,
    PROVISION_TYPES,
    ENCHANTMENT_TYPES,
    SUPPLY_TYPES
} = require('../../models/economy/constants/huntingData');

module.exports = {
    name: 'huntershop',
    aliases: ['huntshop', 'outfitter'],
    description: 'Acquire mounts, weapons, familiars, and supplies for your hunts.',
    usage: '!huntershop [category] OR !huntershop buy [item_id] [quantity] OR !huntershop resupply/enchant',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            // Handle resupply for mounts
            if (args[0] === 'resupply' && args[1] && args[2]) {
                const mountIndex = parseInt(args[1]) - 1;
                const provisionType = args[2].toLowerCase();
                const quantity = parseInt(args[3]) || 1;

                if (isNaN(mountIndex) || mountIndex < 0 || mountIndex >= profile.huntingMounts.length) {
                    return this.sendError(message, 'Invalid mount number! Use `!hunter` to see your mounts.');
                }

                const mount = profile.huntingMounts[mountIndex];
                
                try {
                    const result = await HuntingManager.resupplyMount(profile, mount.mountId, provisionType, quantity);
                    await profile.save();

                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🐴 Mount Resupplied!\n## ${mount.name.toUpperCase()}\n\n> Successfully added ${result.provisionsAdded} provisions!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🥕 Provisions Added:** ${result.provisionsAdded} units\n**🔋 New Stamina:** ${result.newStamina}/${mount.staminaCapacity}\n**💰 Cost:** ${result.cost.toLocaleString()} Embers\n**🪙 Remaining Embers:** ${profile.embers.toLocaleString()}`)
                    );

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

                } catch (error) {
                    return this.sendError(message, error.message);
                }
            }

            // Handle enchanting weapons
            if (args[0] === 'enchant' && args[1] && args[2]) {
                const weaponIndex = parseInt(args[1]) - 1;
                const enchantmentType = args[2].toLowerCase();
                const quantity = parseInt(args[3]) || 1;

                if (isNaN(weaponIndex) || weaponIndex < 0 || weaponIndex >= profile.huntingWeapons.length) {
                    return this.sendError(message, 'Invalid weapon number! Use `!hunter` to see your arsenal.');
                }

                const weapon = profile.huntingWeapons[weaponIndex];
                
                try {
                    const result = await HuntingManager.enchantWeapon(profile, weapon.weaponId, enchantmentType, quantity);
                    await profile.save();

                    const components = [];
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ✨ Weapon Enchanted!\n## ${weapon.name.toUpperCase()}\n\n> Successfully applied ${result.runesApplied} enchantments!`)
                    );

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✨ Runes Applied:** ${result.runesApplied}\n**🪄 New Power Level:** ${result.newPowerLevel}/${weapon.powerCapacity}\n**💰 Cost:** ${result.cost.toLocaleString()} Embers\n**🪙 Remaining Embers:** ${profile.embers.toLocaleString()}`)
                    );

                    components.push(successContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

                } catch (error) {
                    return this.sendError(message, error.message);
                }
            }

            // Handle buying items
            if (args[0] === 'buy' && args[1]) {
                const itemId = args[1].toLowerCase();
                const quantity = parseInt(args[2]) || 1;
                let item = null;
                let category = '';
                let price = 0;

                if (HUNTING_MOUNTS[itemId]) {
                    item = HUNTING_MOUNTS[itemId];
                    category = 'mount';
                    price = item.price;
                } else if (HUNTING_WEAPONS[itemId]) {
                    item = HUNTING_WEAPONS[itemId];
                    category = 'weapon';
                    price = item.price;
                } else if (HUNTING_FAMILIARS[itemId]) {
                    item = HUNTING_FAMILIARS[itemId];
                    category = 'familiar';
                    price = item.price;
                } else if (HUNTING_LAIRS[itemId]) {
                    item = HUNTING_LAIRS[itemId];
                    category = 'lair';
                    price = item.price;
                } else if (PROVISION_TYPES[itemId]) {
                    item = PROVISION_TYPES[itemId];
                    category = 'provision';
                    price = item.price * quantity;
                } else if (ENCHANTMENT_TYPES[itemId]) {
                    item = ENCHANTMENT_TYPES[itemId];
                    category = 'enchantment';
                    price = item.price * quantity;
                } else if (SUPPLY_TYPES[itemId]) {
                    item = SUPPLY_TYPES[itemId];
                    category = 'supply';
                    price = item.price * quantity;
                }

                if (!item) {
                    return this.sendError(message, `Item \`${itemId}\` not found! Use \`!huntershop\` to browse available items.`);
                }

                if (profile.embers < price) {
                    return this.sendInsufficientFunds(message, item.name, price, profile.embers);
                }
                // Logic for purchasing items and consumables will go here...
            }

            // Main shop overview
            const category = args[0]?.toLowerCase() || 'overview';
            const components = [];

            if (category === 'overview') {
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏹 Hunter's Outfitter\n## THE BEAST'S DEN\n\n> All you need for a successful monster hunt.`)
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
                        .setContent(`**🐎 Mounts & Beasts** - \`!huntershop mounts\`\n**🗡️ Weapons & Arms** - \`!huntershop weapons\`\n**🐾 Familiars & Creatures** - \`!huntershop familiars\`\n**🏰 Lairs & Hideouts** - \`!huntershop lairs\``)
                );
                
                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🥕 Provisions** - \`!huntershop provisions\`\n**✨ Enchantments** - \`!huntershop enchantments\`\n**🛠️ Supplies** - \`!huntershop supplies\``)
                );

                categoriesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Quick Actions:**\n\`!huntershop resupply <mount#> <provision_type> [amount]\`\n\`!huntershop enchant <weapon#> <enchantment_type> [amount]\``)
                );

                components.push(categoriesContainer);

                const playerContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                playerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **YOUR COIN PURSE**\n\n**Current Embers:** ${profile.embers.toLocaleString()}\n**💡 How to Buy:** \`!huntershop buy <item_id> [quantity]\``)
                );

                components.push(playerContainer);

            } else {
                this.displayCategory(components, category, profile);
            }

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in huntershop command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
        }
    },

    displayCategory(components, category, profile) {
        // This function will be filled with logic to display items in a category
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xE74C3C);
        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ❌ Error\n## ACTION FAILED\n\n> ${errorText}`)
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
                .setContent(`# 💸 Insufficient Embers\n## CANNOT PURCHASE\n\n> You need ${price.toLocaleString()} Embers to acquire **${itemName}**!`)
        );
        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**💰 Current Balance:** ${currentBalance.toLocaleString()} Embers\n**💰 Required:** ${price.toLocaleString()} Embers\n**💰 Shortfall:** ${(price - currentBalance).toLocaleString()} Embers`)
        );
        return message.reply({
            components: [insufficientContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
};