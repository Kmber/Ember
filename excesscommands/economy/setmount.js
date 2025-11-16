const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'setmount',
    aliases: ['activemount', 'selectmount'],
    description: 'Set your active mount for mount racing and family quests',
    usage: '!setmount <mount_id>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.mounts.length === 0) {
                const components = [];

                const noMountsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noMountsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐾 No Mounts Owned\n## STABLES ARE EMPTY\n\n> You don't own any mounts yet!\n> Visit the mount stables to purchase your first mount.`)
                );

                components.push(noMountsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const purchaseContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                purchaseContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET STARTED**\n\n**Command:** \`!buymount\` to browse available mounts\n**First Mount:** Automatically becomes your active mount\n\n**💡 Tip:** Higher performance mounts excel in racing and quests!`)
                );

                components.push(purchaseContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (!args[0]) {
                // List owned mounts
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x0099FF);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐎 Your Mount Collection\n## SELECT ACTIVE MOUNT\n\n> Choose from your owned mounts to set as your active mount for racing and quests.`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                // Group mounts by type
                const mountsByType = {};
                profile.mounts.forEach(mount => {
                    if (!mountsByType[mount.type]) {
                        mountsByType[mount.type] = [];
                    }
                    mountsByType[mount.type].push(mount);
                });

                Object.entries(mountsByType).forEach(([type, mounts]) => {
                    const typeContainer = new ContainerBuilder()
                        .setAccentColor(getMountTypeColor(type));

                    typeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${getMountTypeEmoji(type)} **${type.toUpperCase().replace('_', ' ')} MOUNTS**`)
                    );

                    mounts.forEach(mount => {
                        const isActive = profile.activeMount === mount.mountId;
                        const performance = ((mount.speed + mount.acceleration + mount.handling) / 3).toFixed(1);

                        typeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**${isActive ? '✅' : '🔸'} \`${mount.mountId}\`** - ${mount.name}\n> **Performance:** ${performance}/100 | **Durability:** ${mount.durability}%\n> **Speed:** ${mount.speed} | **Acceleration:** ${mount.acceleration} | **Handling:** ${mount.handling}${isActive ? '\n> *Currently Active*' : ''}`)
                        );
                    });

                    components.push(typeContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **HOW TO SET ACTIVE MOUNT**\n\n**Command:** \`!setmount <mount_id>\`\n**Example:** \`!setmount war_horse\`\n\n**✅ Active Mount:** Used for \`!mountrace\` and family quests\n**🔄 Switching:** No cooldown - change anytime\n**💡 Tip:** Choose based on your current needs!`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const mountId = args[0].toLowerCase();
            const selectedMount = profile.mounts.find(m => m.mountId === mountId);

            if (!selectedMount) {
                const components = [];

                const notOwnedContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notOwnedContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Mount Not Found\n## NOT IN YOUR STABLES\n\n> You don't own a mount with ID **\`${mountId}\`**!\n> Check your mount collection with \`!setmount\` to see available mounts.`)
                );

                components.push(notOwnedContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            // Set as active mount
            profile.activeMount = mountId;
            await profile.save();

            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Active Mount Set!\n## MOUNT SELECTED FOR BATTLE\n\n> **${selectedMount.name}** is now your active mount!\n> Ready for racing in the arena and family quests.`)
            );

            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🏁 **MOUNT SPECIFICATIONS**`)
            );

            const performance = ((selectedMount.speed + selectedMount.acceleration + selectedMount.handling) / 3).toFixed(1);
            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐎 Mount:** \`${selectedMount.name}\`\n**🏷️ Type:** \`${selectedMount.type}\`\n**📊 Performance:** \`${performance}/100\`\n**💔 Durability:** \`${selectedMount.durability}%\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏁 Speed:** \`${selectedMount.speed}/100\`\n**⚡ Acceleration:** \`${selectedMount.acceleration}/100\`\n**🎯 Handling:** \`${selectedMount.handling}/100\``)
            );

            components.push(specsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const battleStatsContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            battleStatsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚔️ **BATTLE RECORD**\n\n**🏆 Wins:** \`${selectedMount.battleWins}\`\n**💀 Losses:** \`${selectedMount.battleLosses}\`\n**📏 Total Distance:** \`${selectedMount.totalDistanceTraveled || 0} units\`\n**📅 Acquired:** \`${selectedMount.dateAcquired.toLocaleDateString()}\``)
            );

            components.push(battleStatsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in setmount command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **SET MOUNT ERROR**\n\nSomething went wrong while setting your active mount. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};

function getMountTypeColor(type) {
    const colors = {
        'ground': 0x95A5A6,
        'predator': 0xE74C3C,
        'flying': 0x3498DB,
        'dragonkin': 0x9B59B6,
        'dragon': 0xF39C12
    };
    return colors[type] || 0x0099FF;
}

function getMountTypeEmoji(type) {
    const emojis = {
        'ground': '🐎',
        'predator': '🐺',
        'flying': '🦅',
        'dragonkin': '🐉',
        'dragon': '🐲'
    };
    return emojis[type] || '🐎';
}
