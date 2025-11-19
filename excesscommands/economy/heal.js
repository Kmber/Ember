const { 
    TextDisplayBuilder,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'heal',
    aliases: ['restore', 'recover'],
    description: 'Heal yourself or your allies after a slay quest',
    usage: 'heal self OR heal allies',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!args[0]) {
                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ❤️ Healing Services\n## RESTORE YOUR STRENGTH\n\n> Use your Embers to heal yourself or your allies.`),
                        new TextDisplayBuilder().setContent(`### Commands\n**${prefix}heal self** - Heal your own wounds.\n**${prefix}heal allies** - Heal your injured allies.`)
                    );
                return message.reply({ components: [helpContainer], flags: MessageFlags.IsComponentsV2 });
            }

            const healType = args[0].toLowerCase();

            if (healType === 'self') {
                return this.healSelf(message, profile);
            }

            if (healType === 'allies') {
                return this.healAllies(message, profile);
            }

            return this.sendError(message, `Invalid healing type. Use \`${prefix}heal self\` or \`${prefix}heal allies\`.`);

        } catch (error) {
            console.error('Error in heal command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
        }
    },

    async healSelf(message, profile) {
        if (profile.slayingProfile.currentHealth >= 100) {
            return this.sendError(message, 'You are already at full health!');
        }

        const healingCost = Math.floor((100 - profile.slayingProfile.currentHealth) * 50);

        if (profile.wallet < healingCost) {
            return this.sendInsufficientFunds(message, 'healing', healingCost, profile.wallet);
        }

        profile.wallet -= healingCost;
        profile.slayingProfile.currentHealth = 100;
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ✅ Healing Successful!\n## FULLY RESTORED\n\n> You have been restored to full health!`),
            new TextDisplayBuilder().setContent(`**Cost:** ${healingCost.toLocaleString()} Embers\n**Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    async healAllies(message, profile) {
        const injuredAllies = profile.slayingAllies.filter(ally => ally.injured);

        if (injuredAllies.length === 0) {
            return this.sendError(message, 'None of your allies are injured!');
        }

        const totalHealingCost = injuredAllies.reduce((sum, ally) => sum + ally.healingCost, 0);

        if (profile.wallet < totalHealingCost) {
            return this.sendInsufficientFunds(message, 'ally healing', totalHealingCost, profile.wallet);
        }

        profile.wallet -= totalHealingCost;
        for (const ally of injuredAllies) {
            ally.injured = false;
            ally.health = ally.maxHealth;
        }
        await profile.save();

        const healedAlliesNames = injuredAllies.map(a => `> ${a.name}`).join('\n');

        const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ✅ Ally Healing Successful!\n## ALLIES RESTORED\n\n> All injured allies have been restored to full health!`),
            new TextDisplayBuilder().setContent(`### Healed Allies\n${healedAlliesNames}`),
            new TextDisplayBuilder().setContent(`**Total Cost:** ${totalHealingCost.toLocaleString()} Embers\n**Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ❌ Error\n## TASK FAILED\n\n> ${errorText}`)
        );
        return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    },

    sendInsufficientFunds(message, itemName, price, currentBalance) {
        const shortFall = price - currentBalance;
        const insufficientContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
        insufficientContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 💸 Insufficient Embers\n## PURCHASE FAILED\n\n> You do not have enough Embers for **${itemName}**:`),
            new TextDisplayBuilder().setContent(`**Required:** ${price.toLocaleString()} Embers\n**You Have:** ${currentBalance.toLocaleString()} Embers\n**Shortage:** ${shortFall.toLocaleString()} Embers`)
        );
        return message.reply({ components: [insufficientContainer], flags: MessageFlags.IsComponentsV2 });
    }
};