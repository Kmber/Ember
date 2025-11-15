const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'embers'],
    description: 'Check your worldly possessions and status.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const totalWealth = profile.embers + profile.royal_treasury + profile.family_strongbox;
            const wardingLevel = EconomyManager.calculateWardingLevel(profile);
            const treasuryCapacity = EconomyManager.getTreasuryCapacity(profile);
            const royalTreasuryLimit = EconomyManager.getRoyalTreasuryLimit(profile);
            
            const components = [];

            // Header
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📜 ${message.author.username}\'s Chronicle of Wealth\\n## A TALLY OF YOUR WORLDLY POSSESSIONS\\n\\n> Your current standing in the realm and accounting of your riches.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Liquid Assets -> Hoard
            const hoardContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            hoardContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔥 **EMBER HOARD**')
            );

            hoardContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Coin Purse:** \\`${profile.embers.toLocaleString()} Embers\\\`\\n**👑 Royal Treasury:** \\`${profile.royal_treasury.toLocaleString()} Embers\\\`\\n**📈 Treasury Limit:** \\`${royalTreasuryLimit.toLocaleString()} Embers\\``)
            );

            hoardContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Family Strongbox:** \\`${profile.family_strongbox.toLocaleString()} Embers\\\`\\n**📦 Treasury Capacity:** \\`${treasuryCapacity.toLocaleString()} Embers\\\`\\n**🛡️ Warding Level:** \\`${wardingLevel}%\\``)
            );

            components.push(hoardContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Wealth Summary -> Realm Standing
            const realmStandingContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            realmStandingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **REALM STANDING**')
            );

            realmStandingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Total Net Worth:** \\`${totalWealth.toLocaleString()} Embers\\\`\\n**🌟 Character Level:** \\`${profile.level}\\\`\\n**✨ Arcane Power:** \\`${profile.experience.toLocaleString()} XP\\``)
            );

            realmStandingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👨‍👩‍👧‍👦 Family Loyalty:** \\`${profile.familyBond}%\\\`\\n**🏆 Renown:** \\`${profile.reputation}\\``)
            );

            components.push(realmStandingContainer);

            // Active Effects -> Blessings & Curses
            if (profile.activeEffects && profile.activeEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ✨ **BLESSINGS & CURSES**')
                );

                let effectsText = profile.activeEffects.map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (x${effect.stacks})` : '';
                    return `**\\\`${effect.name}\\\`**${stackText} • ${effect.description || 'An active enchantment'}\\n\\n> **Duration:** \\`${timeLeft}h remaining\\``;
                }).join('\\n\\n');

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(effectsText)
                );

                components.push(effectsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **SCRIBE'S NOTES**\\n\\n**Last Scribed:** \\`${new Date().toLocaleString()}\\`\\n**Chronicle Began:** \\`${new Date(profile.createdAt).toLocaleDateString()}\\``)
            );

            components.push(footerContainer);

            // Send the message
            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in balance command:', error);
            
            // Error Message
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **SCROLLING ERROR**\\n\\nUnable to read your chronicle of wealth. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};