const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'equip',
    aliases: ['eq', 'setactive', 'loadout'],
    description: 'Equip or manage your slaying gear.',
    usage: 'equip [type] [item_id] OR equip unequip ally [item_id]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            const type = args[0]?.toLowerCase();
            const itemId = args[1];

            if (!type) {
                return this.displayLoadout(message, profile, prefix);
            }

            if (type === 'unequip') {
                const unequipType = args[1]?.toLowerCase();
                const unequipId = args[2];
                if (unequipType !== 'ally') {
                    return this.sendError(message, `You can only unequip allies. Usage: \`${prefix}equip unequip ally <item_id>\``);
                }
                if (!unequipId) {
                    return this.sendError(message, `You must provide the ID of the ally to unequip.`);
                }
                return this.unequipAlly(message, profile, unequipId);
            }

            if (!itemId) {
                return this.sendError(message, `You must provide the ID of the item to equip.`);
            }

            switch (type) {
                case 'weapon':
                case 'mount':
                    return this.equipItem(message, profile, type, itemId);
                case 'ally':
                    return this.equipAlly(message, profile, itemId);
                default:
                    return this.sendError(message, `Invalid equipment type. Must be weapon, mount, or ally.`);
            }

        } catch (error) {
            console.error('Error in equip command:', error);
            return this.sendError(message, `Couldn't process your request: ${error.message}`);
        }
    },

    async displayLoadout(message, profile, prefix) {
        const components = [];
        const loadoutContainer = new ContainerBuilder().setAccentColor(0x3498DB);

        loadoutContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ⚔️ Your Slaying Loadout`)
        );

        const activeWeapon = profile.slayingWeapons.find(w => w.weaponId === profile.activeWeapon);
        const activeMount = profile.slayingMounts.find(m => m.mountId === profile.activeMount);

        loadoutContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Active Weapon:** ${activeWeapon ? activeWeapon.name : 'None'}\n` +
                `**Active Mount:** ${activeMount ? activeMount.name : 'None'}`
            )
        );

        let activeAlliesContent = '**Active Allies:**\n';
        if (profile.activeAllies.length > 0) {
            const activeAllyObjects = profile.slayingAllies.filter(a => profile.activeAllies.includes(a.allyId));
            activeAlliesContent += activeAllyObjects.map(a => `> ${a.name}`).join('\n');
        } else {
            activeAlliesContent += '> None';
        }
        loadoutContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(activeAlliesContent));

        const helpContainer = new ContainerBuilder().setAccentColor(0xFFC107);
        helpContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## Equip Commands\n` +
                `**${prefix}equip weapon <id>**: Set active weapon.\n` +
                `**${prefix}equip mount <id>**: Set active mount.\n` +
                `**${prefix}equip ally <id>**: Add an ally.\n` +
                `**${prefix}equip unequip ally <id>**: Remove an ally.`
            )
        );

        helpContainer.addTextDisplayComponents(
             new TextDisplayBuilder().setContent('**Tip:** Find item IDs with `!slaying` or `!slayinv`')
        );

        components.push(loadoutContainer, helpContainer);

        return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
    },

    async equipItem(message, profile, type, itemId) {
        const itemArray = type === 'weapon' ? profile.slayingWeapons : profile.slayingMounts;
        const idKey = type === 'weapon' ? 'weaponId' : 'mountId';
        const item = itemArray.find(i => i[idKey] === itemId || i.itemId.slice(-8) === itemId);

        if (!item) {
            return this.sendError(message, `Could not find a ${type} with that ID in your inventory.`);
        }

        const activeField = type === 'weapon' ? 'activeWeapon' : 'activeMount';
        profile[activeField] = item[idKey];
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Equipped!\n## ${item.name.toUpperCase()}\n\n> You have equipped the **${item.name}**. It is now your active ${type}.`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    async equipAlly(message, profile, itemId) {
        if (profile.activeAllies.length >= profile.maxAllies) {
            return this.sendError(message, `You cannot have more than ${profile.maxAllies} active allies.`);
        }

        const ally = profile.slayingAllies.find(a => a.allyId === itemId || a.itemId.slice(-8) === itemId);
        if (!ally) {
            return this.sendError(message, `Could not find an ally with that ID in your inventory.`);
        }

        if (profile.activeAllies.includes(ally.allyId)) {
            return this.sendError(message, `**${ally.name}** is already in your active team.`);
        }

        profile.activeAllies.push(ally.allyId);
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ✅ Ally Equipped!\n## ${ally.name.toUpperCase()}\n\n> **${ally.name}** has joined your active team.`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    async unequipAlly(message, profile, itemId) {
        const ally = profile.slayingAllies.find(a => a.allyId === itemId || a.itemId.slice(-8) === itemId);
        if (!ally || !profile.activeAllies.includes(ally.allyId)) {
            return this.sendError(message, `Could not find an active ally with that ID.`);
        }

        profile.activeAllies = profile.activeAllies.filter(id => id !== ally.allyId);
        await profile.save();

        const successContainer = new ContainerBuilder().setAccentColor(0xF39C12);
        successContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ✅ Ally Unequipped!\n## ${ally.name.toUpperCase()}\n\n> **${ally.name}** has been removed from your active team.`)
        );
        return message.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    },

    sendError(message, errorText) {
        const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
        errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ❌ Error\n## TASK FAILED\n\n> ${errorText}`)
        );
        return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
};