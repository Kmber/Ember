const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'beg',
    aliases: ['ask', 'plead'],
    description: 'Plead for Embers from the denizens of the realm.',
    async execute(message) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            const now = new Date();
            const cooldown = 10 * 60 * 1000; // 10 minutes

            if (profile.cooldowns.beg && now - profile.cooldowns.beg < cooldown) {
                const remaining = cooldown - (now - profile.cooldowns.beg);
                const remainingMinutes = Math.ceil(remaining / (60 * 1000));
                
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xFF6B35);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏳ A Moment of Repose\n## THE STREETS ARE NOT SO GENEROUS\n\n> You have pleaded too recently. The townsfolk tire of your constant appeals.`)
                );

                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                infoContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **Patience, Pauper**\n\n**Respite Remaining:** \`${remainingMinutes} minute(s)\`\n**Pleading Interval:** \`10 minutes\``)
                );

                components.push(infoContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **PLEADING LOG**\n\n**Pauper:** \`${message.author.tag}\`\n**Timestamp:** \`${new Date().toLocaleString()}\``)
                );
                components.push(footerContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const outcomes = [
                { success: true, min: 25, max: 75, message: "A merciful traveler tossed you a few Embers." },
                { success: true, min: 50, max: 100, message: "A clumsy merchant dropped a pouch of Embers, unnoticed." },
                { success: true, min: 10, max: 40, message: "An old woman shared a piece of her meager fortune." },
                { success: true, min: 75, max: 150, message: "A noble, amused by your audacity, threw you a handful of Embers." },
                { success: false, amount: 0, message: "The townsfolk avert their eyes, ignoring your desperate cries." },
                { success: false, amount: 0, message: "A stern-faced guard rapped his spear on the cobblestones, telling you to move along." },
                { success: false, amount: 0, message: "The bustling crowd offers no quarter for a lowly beggar." }
            ];

            const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            let earnings = 0;
            
            if (outcome.success) {
                earnings = Math.floor(Math.random() * (outcome.max - outcome.min + 1)) + outcome.min;
                const levelBonus = Math.floor(profile.level * 2);
                earnings += levelBonus;
            }

            const updatedProfile = await EconomyManager.updateEmbers(userId, guildId, earnings);
            updatedProfile.cooldowns.beg = now;

            if (earnings > 0) {
                updatedProfile.experience += 5;
                updatedProfile.transactions.push({
                    type: 'income',
                    amount: earnings,
                    description: 'Alms from pleading',
                    category: 'begging'
                });
            }

            await updatedProfile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(earnings > 0 ? 0x2ECC71 : 0xE74C3C);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ${earnings > 0 ? '🙏 Alms Received!' : '😔 Empty Handed'}\n## ${earnings > 0 ? 'A SHIMMER OF HOPE' : 'THE REALM TURNS A BLIND EYE'}\n\n> ${outcome.message}`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            if (earnings > 0) {
                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **MEAGER GAINS**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔥 Embers Gained:** \`${earnings.toLocaleString()} Embers\`\n**💰 Ember Sachel:** \`${updatedProfile.embers.toLocaleString()} Embers\`\n**✨ Arcane Power Gained:** \`+5 XP\`\n**📈 Current Level:** \`${updatedProfile.level}\``)
                );

                const levelBonus = Math.floor(updatedProfile.level * 2);
                if (levelBonus > 0) {
                    resultsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🌟 Level Bonus:** \`+${levelBonus} Embers\` (Level ${updatedProfile.level} bonus)\n**🪙 Base Alms:** \`${earnings - levelBonus} Embers\``)
                    );
                }

                components.push(resultsContainer);
            } else {
                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💸 **A FRUITLESS PLEA**')
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔥 Embers Gained:** \`0 Embers\`\n**💰 Ember Sachel:** \`${profile.embers.toLocaleString()} Embers\`\n**💡 A Pauper\'s Wisdom:** \`Patience may yet be rewarded. Try again in 10 minutes.\`\n**🎲 Fate may smile upon you next time.**`)
                );

                components.push(failureContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📜 **PLEADING LOG**\n\n**Pauper:** \`${message.author.tag}\`\n**Pleading Interval:** \`10 minutes\`\n**Next Plea:** \`${new Date(now.getTime() + cooldown).toLocaleTimeString()}\``)
            );

            components.push(footerContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in beg command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **DIVINE MISFORTUNE**\n\nThe fates have conspired against you. Your plea went unheard due to an unforeseen error.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};