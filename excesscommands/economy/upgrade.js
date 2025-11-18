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
    name: 'upgrade',
    aliases: ['upg', 'improve', 'enhance'],
    description: 'Upgrade your slaying weapons and mounts',
    usage: 'upgrade weapon <#> OR upgrade mount <#>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!args[0] || !args[1]) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚡ Equipment Upgrade Center\n## IMPROVE YOUR GEAR\n\n> Enhance your weapons and mounts for better performance`)
                );

                components.push(helpContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔧 **UPGRADE COMMANDS**`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔫 Weapon Upgrades:**\n\`${prefix}upgrade weapon <number>\`\n> Increases damage, accuracy, and critical chance\n> Max level: 10`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🐎 Mount Upgrades:**\n\`${prefix}upgrade mount <number>\`\n> Increases capacity, stamina, and haunted lands tier\n> Max tier: 5`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 How to Find Numbers:**\n\`${prefix}slaying\` - Shows all your equipment with numbers\n\n**💰 Upgrade Costs:**\n> Weapons: 30% of purchase price × level\n> Mounts: 40% of purchase price × tier`)
                );

                components.push(commandsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const equipmentType = args[0].toLowerCase();
            const equipmentNumber = parseInt(args[1]);

            if (equipmentType === 'weapon') {
           
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.slayingWeapons.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Weapon Number\n## WEAPON NOT FOUND\n\n> Invalid weapon number! You have ${profile.slayingWeapons.length} weapons.\n> Use \`${prefix}slaying\` to see your weapons with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const weapon = profile.slayingWeapons[equipmentNumber - 1];
                
                try {
                    const result = await SlayingManager.upgradeWeapon(profile, weapon.weaponId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Weapon Upgraded!\n## ${weapon.name.toUpperCase()}\n\n> Successfully upgraded to level ${result.newLevel}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0x2196F3);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📈 **UPGRADE IMPROVEMENTS**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Upgrade Cost:** ${result.upgradeCost.toLocaleString()} Embers\n**⚡ New Level:** ${result.newLevel}/10\n**💳 Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
                    );

                    const improvementsText = `**💥 Damage:** ${result.newStats.damage} (+${result.improvements.damage})\n**🎯 Accuracy:** ${result.newStats.accuracy}% (+${result.improvements.accuracy}%)\n**💥 Critical Chance:** ${result.newStats.criticalChance}% (+${result.improvements.criticalChance}%)`;

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(improvementsText)
                    );

                    if (result.newLevel < 10) {
                        const nextUpgradeCost = Math.floor(weapon.purchasePrice * 0.3 * (result.newLevel + 1));
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🔮 Next Upgrade Cost:** ${nextUpgradeCost.toLocaleString()} Embers`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM LEVEL REACHED!**\n> This weapon is fully upgraded!`)
                        );
                    }

                    components.push(upgradeContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });

                } catch (error) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Upgrade Failed\n## ${error.message}\n\n> ${weapon.name} could not be upgraded.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (equipmentType === 'mount') {
              
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.slayingMounts.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Mount Number\n## MOUNT NOT FOUND\n\n> Invalid mount number! You have ${profile.slayingMounts.length} mounts.\n> Use \`${prefix}slaying\` to see your mounts with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const mount = profile.slayingMounts[equipmentNumber - 1];
                
                try {
                    const result = await SlayingManager.upgradeMount(profile, mount.mountId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Mount Upgraded!\n## ${mount.name.toUpperCase()}\n\n> Successfully upgraded to tier ${result.newTier}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🐎 **UPGRADE IMPROVEMENTS**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Upgrade Cost:** ${result.upgradeCost.toLocaleString()} Embers\n**⚡ New Tier:** ${result.newTier}/5\n**💳 Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
                    );

                    const improvementsText = `**📦 Capacity:** ${mount.capacity} items (+${result.improvements.capacity})\n**💨 Stamina:** ${mount.staminaCapacity} units (+${result.improvements.staminaCapacity})\n**🏞️ Haunted Lands Tier:** ${mount.hauntedLandsTier}/10 (+${result.improvements.hauntedLandsTier})`;

                    upgradeContainer.addTextDipartialisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(improvementsText)
                    );

                    if (result.newTier < 5) {
                        const nextUpgradeCost = Math.floor(mount.purchasePrice * 0.4 * result.newTier);
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🔮 Next Upgrade Cost:** ${nextUpgradeCost.toLocaleString()} Embers`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM TIER REACHED!**\n> This mount is fully upgraded!`)
                        );
                    }

                    components.push(upgradeContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });

                } catch (error) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Upgrade Failed\n## ${error.message}\n\n> ${mount.name} could not be upgraded.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

         
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid Equipment Type\n## UNKNOWN TYPE\n\n> Valid types are: \`weapon\` or \`mount\`\n> Example: \`${prefix}upgrade weapon 1\``)
            );

            components.push(errorContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in upgrade command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **UPGRADE ERROR**\n\nCouldn't process the upgrade: ${error.message}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};