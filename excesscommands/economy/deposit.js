const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'deposit',
    aliases: ['dep', 'secure'],
    description: 'Secure your Embers in the Royal Treasury.',
    async execute(message, args) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            const royalTreasuryLimit = EconomyManager.getRoyalTreasuryLimit(profile);

            let amount;
            if (args[0] && (args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'max')) {
                amount = Math.min(profile.embers, royalTreasuryLimit - profile.royal_treasury);
            } else {
                amount = parseInt(args[0], 10);
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ An Invalid Sum\n## YOU MUST DECREE A VALID NUMBER OF EMBERS\n\n> Decree a valid number of Embers to secure, or use a keyword.`)
                );

                components.push(invalidContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **HOW TO SECURE YOUR EMBERS**\n\n**\`!deposit 1000\`** - Secure a specific amount.\n**\`!deposit all\`** - Secure all Embers from your coin purse.\n**\`!deposit max\`** - Secure the maximum possible amount.\n\n**Your Coin Purse:** \`${profile.embers.toLocaleString()} Embers\`\n**Available Treasury Space:** \`${(royalTreasuryLimit - profile.royal_treasury).toLocaleString()} Embers\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount > profile.embers) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 A Pauper's Purse\n## YOUR COIN PURSE LACKS THE REQUIRED EMBERS\n\n> You do not possess enough Embers for this deposit!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **A SCRIBE'S RECKONING**\n\n**Your Coin Purse:** \`${profile.embers.toLocaleString()} Embers\`\n**Intended Deposit:** \`${amount.toLocaleString()} Embers\`\n**The Shortfall:** \`${(amount - profile.embers).toLocaleString()} Embers\`\n\n**💡 A Sage's Advice:** Try \`!deposit all\` to secure all the Embers you currently possess!`)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.royal_treasury + amount > royalTreasuryLimit) {
                const maxDeposit = royalTreasuryLimit - profile.royal_treasury;
                const components = [];

                const limitContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                limitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👑 The Royal Treasury Overflows\n## ITS CAPACITY HAS BEEN REACHED\n\n> The Royal Treasury cannot hold this amount. Its vaults are too full!`)
                );

                components.push(limitContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const limitDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                limitDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **TREASURY MANIFEST**\n\n**Current Treasury Hoard:** \`${profile.royal_treasury.toLocaleString()} Embers\`\n**Treasury Limit:** \`${royalTreasuryLimit.toLocaleString()} Embers\`\n**Available Space:** \`${maxDeposit.toLocaleString()} Embers\`\n**Intended Deposit:** \`${amount.toLocaleString()} Embers\``)
                );

                limitDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 A Chancellor's Counsel:**\n> • Try \`!deposit ${maxDeposit}\` to fill the remaining space.\n> • Expand your treasury by acquiring grander strongholds or noble titles.\n> • Use \`!deposit max\` to automatically deposit the maximum amount.`)
                );

                components.push(limitDetailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            profile.embers -= amount;
            profile.royal_treasury += amount;

            profile.transactions.push({
                type: 'transfer',
                amount: amount,
                description: 'Deposited to Royal Treasury',
                category: 'banking'
            });
            await profile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ A Successful Deposit!\n## YOUR EMBERS ARE NOW SECURED\n\n> You have successfully secured **\`${amount.toLocaleString()} Embers\`** in the Royal Treasury!\n> Your wealth is now under the watchful eye of the Crown.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **THE SCRIBES LEDGER**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Deposit Amount:** \`${amount.toLocaleString()} Embers\`\n**⏰ Time of Deposit:** \`${new Date().toLocaleString()}\`\n**📝 Transaction Type:** \`Royal Treasury Deposit\`\n**🏷️ Category:** \`Banking\``)
            );

            components.push(detailsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const balancesContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👑 **THE STATE OF YOUR HOARD**')
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Your Coin Purse:** \`${profile.embers.toLocaleString()} Embers\`\n**Your Royal Treasury:** \`${profile.royal_treasury.toLocaleString()} Embers\`\n**Treasury Limit:** \`${royalTreasuryLimit.toLocaleString()} Embers\``)
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Treasury Fullness:** \`${((profile.royal_treasury / royalTreasuryLimit) * 100).toFixed(1)}%\`\n**Remaining Space:** \`${(royalTreasuryLimit - profile.royal_treasury).toLocaleString()} Embers\`\n**Total Worth:** \`${(profile.embers + profile.royal_treasury + profile.family_strongbox).toLocaleString()} Embers\``)
            );

            components.push(balancesContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **THE BENEFITS OF THE TREASURY**\n\n**🛡️ Security:** Embers secured in the Treasury are safer from the grasp of pillagers.\n**📈 The King's Favor:** The Crown may, from time to time, grant favor to its most loyal subjects.\n**🏰 A Lord's Prerequisite:** Some grand acquisitions can only be made from the Royal Treasury.\n**👨‍👩‍👧‍👦 A Family's Wealth:** Keep your personal hoard separate from your family's strongbox for meticulous financial management.\n\n> Use \`!withdraw <amount>\` to retrieve your Embers when they are needed.`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in deposit command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ A DEPOSIT GONE AWRY\n\nAn error occurred while attempting to deposit your Embers into the Royal Treasury. Please try again.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};