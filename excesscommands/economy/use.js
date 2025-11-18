const { 
    TextDisplayBuilder,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { slayingData } = require('../../models/economy/slayingData');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'use',
    aliases: ['consume', 'apply'],
    description: 'Use a consumable item from your inventory, such as a potion, oil, or enchantment.',
    usage: 'use <item_id> [target_weapon_id]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            const itemId = args[0];
            const targetId = args[1];

            if (!itemId) {
                return this.sendError(message, `You must provide the ID of the item to use.\n**Usage:** \`${prefix}use <item_id> [target_weapon_id]\``);
            }

            const itemIndex = profile.slayingInventory.findIndex(i => i.itemId.slice(-8) === itemId);
            if (itemIndex === -1) {
                return this.sendError(message, `Could not find an item with the ID \`${itemId}\` in your inventory.`);
            }

            const itemToUse = profile.slayingInventory[itemIndex];
            const itemData = slayingData.items[itemToUse.name.toLowerCase()];

            if (!itemData || !['potion', 'oil', 'enchantment'].includes(itemData.type)) {
                return this.sendError(message, `**${itemToUse.name}** is not a usable item.`);
            }

            switch (itemData.type) {
                case 'potion':
                    return this.usePotion(message, profile, itemToUse, itemIndex, itemData);
                case 'oil':
                case 'enchantment':
                    if (!targetId) {
                        return this.sendError(message, `This item must be applied to a weapon. **Usage:** \`${prefix}use ${itemId} <weapon_id>\``);
                    }
                    return this.applyToWeapon(message, profile, itemToUse, itemIndex, itemData, targetId);
            }

        } catch (error) {
            console.error('Error in use command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
        }
    },

    async usePotion(message, profile, item, itemIndex, itemData) {
        const activeMount = profile.slayingMounts.find(m => m.mountId === profile.activeMount);
        if (!activeMount) {
            return this.sendError(message, 'You do not have an active mount to use this potion on.');
        }
        if (activeMount.currentStamina >= activeMount.maxStamina) {
            return this.sendError(message, `Your **${activeMount.name}** already has full stamina.`);
        }

        const staminaRestored = itemData.staminaValue;
        const oldStamina = activeMount.currentStamina;
        activeMount.currentStamina = Math.min(activeMount.maxStamina, oldStamina + staminaRestored);
        const actualStaminaGain = activeMount.currentStamina - oldStamina;

        this.consumeItem(profile, itemIndex);
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0x58D68D);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 🧪 Potion Used!\n## ${item.name.toUpperCase()}\n\n> You used a **${item.name}** on your **${activeMount.name}**.`),
            new TextDisplayBuilder().setContent(`**Stamina Restored:** +${actualStaminaGain}\n**New Stamina:** ${activeMount.currentStamina}/${activeMount.maxStamina}`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    async applyToWeapon(message, profile, item, itemIndex, itemData, targetId) {
        const weapon = profile.slayingWeapons.find(w => w.weaponId === targetId || w.itemId.slice(-8) === targetId);
        if (!weapon) {
            return this.sendError(message, `Could not find a weapon with the ID \`${targetId}\` in your inventory.`);
        }

        let successTitle, description, statChange;
        const boostAmount = itemData.boost;

        if (itemData.type === 'oil') {
            weapon.temporaryDamageBoost += boostAmount;
            successTitle = '💧 Oil Applied!';
            description = `You applied **${item.name}** to your **${weapon.name}**.`;
            statChange = `**Temporary Damage:** +${boostAmount}\n**Total Temp Damage:** ${weapon.temporaryDamageBoost}`;
        } else { // Enchantment
            weapon.baseDamage += boostAmount;
            successTitle = '✨ Weapon Enchanted!';
            description = `You successfully enchanted your **${weapon.name}** with **${item.name}**!`;
            statChange = `**Base Damage:** +${boostAmount}\n**New Base Damage:** ${weapon.baseDamage}`;
        }

        this.consumeItem(profile, itemIndex);
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0xAF7AC5);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${successTitle}\n## ${item.name.toUpperCase()}\n\n> ${description}`),
            new TextDisplayBuilder().setContent(statChange)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    consumeItem(profile, itemIndex) {
        if (profile.slayingInventory[itemIndex].quantity > 1) {
            profile.slayingInventory[itemIndex].quantity -= 1;
        } else {
            profile.slayingInventory.splice(itemIndex, 1);
        }
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ❌ Error\n## TASK FAILED\n\n> ${errorText}`)
        );
        return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
};