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
    name: 'openchest',
    aliases: ['oc', 'unlock'],
    description: 'Open a treasure chest from your slaying inventory',
    usage: 'openchest <item_id>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!args[0]) {
                return this.sendError(message, `You must provide the ID of the chest you want to open.\n**Usage:** \`${prefix}openchest <item_id>\``);
            }

            const itemId = args[0];
            const chestIndex = profile.slayingInventory.findIndex(item => item.itemId.slice(-8) === itemId && item.type === 'chest');

            if (chestIndex === -1) {
                return this.sendError(message, `Chest with ID \`${itemId}\` not found in your inventory, or it is not a chest.`);
            }

            const chest = profile.slayingInventory[chestIndex];

            // --- Loot Generation ---
            const embersGained = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000; // Random embers between 5k and 15k
            const loot = [];

            // Remove the chest from inventory
            profile.slayingInventory.splice(chestIndex, 1);

            // Add embers to wallet
            profile.wallet += embersGained;
            loot.push(`**${embersGained.toLocaleString()}** Embers`);

            // Transaction for embers
            profile.transactions.push({
                type: 'income',
                amount: embersGained,
                description: `Opened a ${chest.name}`,
                category: 'slaying'
            });

            await profile.save();

            // --- Display Results ---
            const components = [];
            const successContainer = new ContainerBuilder().setAccentColor(0xFFD700);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🔓 Chest Opened!\n## ${chest.name.toUpperCase()}\n\n> You unlocked the chest and found some treasure!`)
            );

            const lootContainer = new ContainerBuilder().setAccentColor(0x2ECC71);

            lootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💎 **TREASURE ACQUIRED**')
            );

            lootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(loot.join('\n'))
            );

            lootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`\n**💰 New Balance:** ${profile.wallet.toLocaleString()} Embers`)
            );

            components.push(successContainer);
            components.push(lootContainer);

            return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in openchest command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
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
    }
};