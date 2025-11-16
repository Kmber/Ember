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

            const hunterLevel = Math.floor((profile.huntingProfile?.hunterExperience || 0) / 1000);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Hunter Level:** ${hunterLevel}\n**⭐ Experience:** ${(profile.huntingProfile?.hunterExperience || 0).toLocaleString()} XP\n**🩸 Health:** ${(profile.currentHealth || 100)}/100`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚔️ Hunts:** ${(profile.huntingStats?.totalHunts || 0)} | **✅ Successful:** ${(profile.huntingStats?.successfulHunts || 0)} | **❌ Failed:** ${(profile.huntingStats?.failedHunts || 0)}`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💥 Damage Dealt:** ${(profile.huntingStats?.totalDamageDealt || 0).toLocaleString()}\n**🩸 Damage Taken:** ${(profile.huntingStats?.totalDamageTaken || 0).toLocaleString()}\n**🐾 Beasts Slain:** ${(profile.huntingStats?.monstersSlain || 0)}`)
            );

            components.push(statsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Weapons
            const weaponsContainer = new ContainerBuilder()
                .setAccentColor(0x2196F3);

            weaponsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🗡️ **WEAPON ARSENAL** (${profile.weapons.length}/5)`)
            );

            if (profile.weapons.length > 0) {
                profile.weapons.forEach((weapon, index) => {
                    const weaponText = `**${index + 1}. ${weapon.name}** (Lvl ${weapon.upgradeLevel || 0})\n` +
                        `> **💥 Damage:** ${weapon.damage} | **🎯 Accuracy:** ${weapon.accuracy}% | **🔥 Crit:** ${weapon.criticalChance}%\n` +
                        `> **💰 Value:** ${(weapon.price || 0).toLocaleString()} Embers`;
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
                    .setContent(`## 🐎 **MOUNTS** (${profile.conveyances.length}/3)`)
            );

            if (profile.conveyances.length > 0) {
                profile.conveyances.forEach((mount, index) => {
                    const mountText = `**${index + 1}. ${mount.name}** (Tier ${mount.tier})\n` +
                        `> **📦 Capacity:** ${mount.capacity} | **💨 Stamina:** ${mount.fuelCapacity} | **🌲 Wilderness:** ${mount.dungeonDepth}/10\n` +
                        `> **💰 Value:** ${(mount.price || 0).toLocaleString()} Embers`;
                    mountsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(mountText));
                });
            } else {
                mountsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> You have no mounts. Visit the `!bestiary` to acquire one.'));
            }

            components.push(mountsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Beasts
            const beastsContainer = new ContainerBuilder()
                .setAccentColor(0x8BC34A);

            beastsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🐾 **BEASTS** (${profile.beasts.length})`)
            );

            if (profile.beasts.length > 0) {
                profile.beasts.slice(0, 3).forEach((beast, index) => {
                    const beastText = `**${index + 1}. ${beast.name}**\n` +
                        `> **⚡ Prowess:** ${beast.prowess} | **🚀 Ferocity:** ${beast.ferocity} | **🎯 Cunning:** ${beast.cunning}\n` +
                        `> **❤️ Vitality:** ${beast.vitality}% | **🏆 Wins:** ${beast.arenaWins}`;
                    beastsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(beastText));
                });
                if (profile.beasts.length > 3) {
                    beastsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ...and ${profile.beasts.length - 3} more beasts`));
                }
            } else {
                beastsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> You have no tamed beasts. Use `!tamebeast` to tame your first beast.'));
            }

            components.push(beastsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Familiars
            const familiarsContainer = new ContainerBuilder()
                .setAccentColor(0x9C27B0);

            familiarsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🐾 **FAMILIARS** (${profile.familiars.length}/4)`)
            );

            if (profile.familiars.length > 0) {
                profile.familiars.forEach((familiar, index) => {
                    const familiarText = `**${index + 1}. ${familiar.name}** (${familiar.species})\n` +
                        `> **❤️ Health:** ${familiar.health}/${familiar.maxHealth} | **💥 Damage Bonus:** ${familiar.wardingLevel}%\n` +
                        `> **💰 Value:** ${(familiar.attunementPrice || 0).toLocaleString()} Embers`;
                    familiarsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(familiarText));
                });
            } else {
                familiarsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('> You have no familiars. Use `!attunefamiliar` to summon your first familiar.'));
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