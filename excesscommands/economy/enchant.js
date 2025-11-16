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
    name: 'enchant',
    aliases: ['enc', 'enhance'],
    description: 'Enchant your hunting weapons and mounts',
    usage: '!enchant weapon <#> OR !enchant mount <#>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (!args[0] || !args[1]) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚡ Arcane Enchanter\n## ENHANCE YOUR GEAR\n\n> Imbue your weapons and mounts with powerful enchantments`)
                );

                components.push(helpContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔧 **ENCHANTMENT COMMANDS**`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚔️ Weapon Enchantments:**\n\`!enchant weapon <number>\`\n> Increases damage, accuracy, and critical chance\n> Max level: 10`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🐎 Mount Enchantments:**\n\`!enchant mount <number>\`\n> Increases capacity, stamina, and wilderness depth\n> Max tier: 5`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 How to Find Numbers:**\n\`!hunting\` - Shows all your equipment with numbers\n\n**💰 Enchantment Costs:**\n> Weapons: 30% of purchase price × level\n> Mounts: 40% of purchase price × tier`)
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
           
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.weapons.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Weapon Number\n## WEAPON NOT FOUND\n\n> Invalid weapon number! You have ${profile.weapons.length} weapons.\n> Use \`!hunting\` to see your weapons with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const weapon = profile.weapons[equipmentNumber - 1];
                
                try {
                    const result = await HuntingManager.upgradeWeapon(profile, weapon.weaponId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Weapon Enchanted!\n## ${weapon.name.toUpperCase()}\n\n> Successfully enchanted to level ${result.newLevel}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0x2196F3);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📈 **ENCHANTMENT BONUSES**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Enchantment Cost:** ${result.upgradeCost.toLocaleString()} Embers\n**⚡ New Level:** ${result.newLevel}/10\n**💳 Remaining Embers:** ${profile.embers.toLocaleString()} Embers`)
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
                                .setContent(`**🔮 Next Enchantment Cost:** ${nextUpgradeCost.toLocaleString()} Embers`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM LEVEL REACHED!**\n> This weapon is fully enchanted!`)
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
                            .setContent(`# ❌ Enchantment Failed\n## ${error.message}\n\n> ${weapon.name} could not be enchanted.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            }

            if (equipmentType === 'mount') {
              
                if (isNaN(equipmentNumber) || equipmentNumber < 1 || equipmentNumber > profile.conveyances.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Mount Number\n## MOUNT NOT FOUND\n\n> Invalid mount number! You have ${profile.conveyances.length} mounts.\n> Use \`!hunting\` to see your mounts with numbers.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const mount = profile.conveyances[equipmentNumber - 1];
                
                try {
                    const result = await HuntingManager.upgradeConveyance(profile, mount.conveyanceId);
                    await profile.save();

                    const components = [];

                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚡ Mount Enchanted!\n## ${mount.name.toUpperCase()}\n\n> Successfully enchanted to tier ${result.newTier}!`)
                    );

                    components.push(successContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const upgradeContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🐎 **ENCHANTMENT BONUSES**`)
                    );

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💰 Enchantment Cost:** ${result.upgradeCost.toLocaleString()} Embers\n**⚡ New Tier:** ${result.newTier}/5\n**💳 Remaining Embers:** ${profile.embers.toLocaleString()} Embers`)
                    );

                    const improvementsText = `**📦 Capacity:** ${mount.capacity} beasts (+${result.improvements.capacity})\n**💨 Stamina:** ${mount.staminaCapacity} units (+${result.improvements.staminaCapacity})\n**🌲 Wilderness Depth:** ${mount.wildernessDepth}/10 (+${result.improvements.wildernessDepth})`;

                    upgradeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(improvementsText)
                    );

                    if (result.newTier < 5) {
                        const nextUpgradeCost = Math.floor(mount.purchasePrice * 0.4 * result.newTier);
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🔮 Next Enchantment Cost:** ${nextUpgradeCost.toLocaleString()} Embers`)
                        );
                    } else {
                        upgradeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🏆 MAXIMUM TIER REACHED!**\n> This mount is fully enchanted!`)
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
                            .setContent(`# ❌ Enchantment Failed\n## ${error.message}\n\n> ${mount.name} could not be enchanted.`)
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
                    .setContent(`# ❌ Invalid Equipment Type\n## UNKNOWN TYPE\n\n> Valid types are: \`weapon\` or \`mount\`\n> Example: \`!enchant weapon 1\``)
            );

            components.push(errorContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in enchant command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **ENCHANTMENT ERROR**\n\nCouldn't process the enchantment: ${error.message}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};