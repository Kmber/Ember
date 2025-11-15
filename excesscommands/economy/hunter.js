const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'hunter',
    aliases: ['huntprofile', 'beasthunter'],
    description: 'View your monster hunting profile and equipment.',
    usage: '!hunter',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ Monster Hunter Profile\n## ${message.author.username.toUpperCase()}\n\n> A seasoned hunter of beasts and monsters.`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **HUNTING STATISTICS**`)
            );

            const hunterLevel = Math.floor(profile.huntingProfile.hunterExperience / 1000);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Hunter Level:** ${hunterLevel}\n**⭐ Experience:** ${profile.huntingProfile.hunterExperience.toLocaleString()} XP\n**🩸 Health:** ${profile.huntingProfile.currentHealth}/100`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚔️ Hunts:** ${profile.huntingStats.totalHunts} | **✅ Successful:** ${profile.huntingStats.successfulHunts} | **❌ Failed:** ${profile.huntingStats.failedHunts}`)
            );
            
            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💥 Damage Dealt:** ${profile.huntingStats.totalDamageDealt.toLocaleString()}\n**🩸 Damage Taken:** ${profile.huntingStats.totalDamageTaken.toLocaleString()}\n**🐾 Beasts Slain:** ${profile.huntingStats.beastsSlain}`)
            );

            components.push(statsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Weapons
            const weaponsContainer = new ContainerBuilder()
                .setAccentColor(0x2196F3);

            weaponsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🗡️ **WEAPON ARSENAL** (${profile.huntingWeapons.length}/5)`)
            );

            if (profile.huntingWeapons.length > 0) {
                profile.huntingWeapons.forEach((weapon, index) => {
                    const weaponText = `**${index + 1}. ${weapon.name}** (Lvl ${weapon.level})\n` +
                        `> **💥 Damage:** ${weapon.damage} | **🎯 Accuracy:** ${weapon.accuracy}% | **🔥 Crit:** ${weapon.criticalChance}%\n` +
                        `> **💰 Value:** ${weapon.currentValue.toLocaleString()} Embers`;
                    weaponsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(weaponText));
                });
            } else {
                weaponsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> Your weapon arsenal is empty. Visit the `!bestiary` to arm yourself.'));
            }

            components.push(weaponsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Mounts
            const mountsContainer = new ContainerBuilder()
                .setAccentColor(0xFF9800);

            mountsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🐎 **MOUNTS & BEASTS** (${profile.huntingMounts.length}/3)`)
            );

            if (profile.huntingMounts.length > 0) {
                profile.huntingMounts.forEach((mount, index) => {
                    const mountText = `**${index + 1}. ${mount.name}** (Tier ${mount.tier})\n` +
                        `> **📦 Capacity:** ${mount.capacity} | **💨 Stamina:** ${mount.staminaCapacity} | **🌲 Wilderness:** ${mount.wildernessDepth}/10\n` +
                        `> **💰 Value:** ${mount.currentValue.toLocaleString()} Embers`;
                    mountsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(mountText));
                });
            } else {
                mountsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> You have no mounts. Visit the `!bestiary` to acquire one.'));
            }

            components.push(mountsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Familiars
            const familiarsContainer = new ContainerBuilder()
                .setAccentColor(0x9C27B0);

            familiarsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🐾 **FAMILIARS** (${profile.huntingCompanions.length}/4)`)
            );

            if (profile.huntingCompanions.length > 0) {
                profile.huntingCompanions.forEach((familiar, index) => {
                    const familiarText = `**${index + 1}. ${familiar.name}** (${familiar.species})\n` +
                        `> **❤️ Health:** ${familiar.currentHealth}/${familiar.maxHealth} | **💥 Damage Bonus:** ${familiar.damageBonus}%\n` +
                        `> **💰 Value:** ${familiar.currentValue.toLocaleString()} Embers`;
                    familiarsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(familiarText));
                });
            } else {
                familiarsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> You have no familiars. Visit the `!bestiary` to bond with one.'));
            }
            
            components.push(familiarsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in hunter command:', error);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PROFILE ERROR**\n\nAn error occurred while summoning your hunter profile.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};