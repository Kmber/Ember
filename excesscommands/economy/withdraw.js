const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'withdraw',
    aliases: ['with', 'retrieve'],
    description: 'Retrieve Embers from the Royal Treasury to your Ember Sachel.',
    usage: '<amount | all | max>',
    async execute(message, args) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            if (!args[0]) {
                const components = [];

                const missingContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                missingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Missing Withdrawal Amount\n## YOU MUST SPECIFY AN AMOUNT OF EMBERS\n\n> Specify the number of Embers to retrieve from the Royal Treasury.`)
                );

                components.push(missingContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **USAGE EXAMPLES**\n\n**\`!withdraw 1000\`** - Retrieve a specific amount\n**\`!withdraw all\`** - Retrieve all Embers from the treasury\n**\`!withdraw max\`** - Retrieve the maximum available\n\n**👑 Available Balance:** \`${profile.royal_treasury.toLocaleString()} Embers\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let amount;
            if (args[0] === 'all' || args[0] === 'max') {
                amount = profile.royal_treasury;
            } else {
                amount = parseInt(args[0], 10);
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Withdrawal Amount\n## PLEASE ENTER A VALID NUMBER\n\n> Enter a valid positive number of Embers or use a keyword.`)
                );

                components.push(invalidContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const examplesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                examplesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **VALID FORMATS**\n\n**Numbers:** \`1000\`, \`2500\`, \`10000\`\n**Keywords:** \`all\`, \`max\`\n**Invalid:** \`${args[0]}\` (not recognized)\n\n**👑 Your Treasury Balance:** \`${profile.royal_treasury.toLocaleString()} Embers\``)
                );

                components.push(examplesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.royal_treasury < amount) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Treasury Funds\n## NOT ENOUGH EMBERS IN THE TREASURY\n\n> You do not have enough Embers in the Royal Treasury for this withdrawal!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👑 **TREASURY BREAKDOWN**\n\n**Treasury Balance:** \`${profile.royal_treasury.toLocaleString()} Embers\`\n**Attempted Withdrawal:** \`${amount.toLocaleString()} Embers\`\n**Shortage:** \`${(amount - profile.royal_treasury).toLocaleString()} Embers\`\n**Ember Sachel Balance:** \`${profile.embers.toLocaleString()} Embers\``)
                );

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Suggestions:**\n> • Try \`!withdraw all\` to retrieve everything\n> • Check \`!balance\` for a complete chronicle of your wealth\n> • Consider depositing more Embers first`)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const newCoinPurse = profile.embers + amount;
            const newRoyalTreasury = profile.royal_treasury - amount;
            const totalWealth = newCoinPurse + newRoyalTreasury + profile.followers_strongbox;

            await EconomyManager.updateEmbers(userId, guildId, amount);
            await EconomyManager.updateRoyalTreasury(userId, guildId, -amount);

            profile.transactions.push({
                type: 'transfer',
                amount: amount,
                description: 'Royal Treasury withdrawal',
                category: 'banking'
            });
            await profile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Withdrawal Successful!\n## EMBERS TRANSFERRED TO Ember Sachel\n\n> You have successfully retrieved **\`${amount.toLocaleString()} Embers\`** from the Royal Treasury to your Ember Sachel!\n> Your Embers are now ready for use.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **WITHDRAWAL SUMMARY**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Withdrawal Amount:** \`${amount.toLocaleString()} Embers\`\n**⏰ Transaction Time:** \`${new Date().toLocaleString()}\`\n**📝 Transaction Type:** \`Royal Treasury Withdrawal\`\n**🏷️ Category:** \`Banking\``)
            );

            components.push(detailsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const balancesContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👑 **UPDATED BALANCES**')
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💳 Ember Sachel Balance:** \`${newCoinPurse.toLocaleString()} Embers\`\n**👑 Royal Treasury Balance:** \`${newRoyalTreasury.toLocaleString()} Embers\`\n**🏰 Followers Strongbox:** \`${profile.followers_strongbox.toLocaleString()} Embers\``)
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Total Net Worth:** \`${totalWealth.toLocaleString()} Embers\`\n**📈 Liquid Embers:** \`${newCoinPurse.toLocaleString()} Embers\` (Available for use)\n**🛡️ Secured Embers:** \`${(newRoyalTreasury + profile.followers_strongbox).toLocaleString()} Embers\``)
            );

            components.push(balancesContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **WEALTH MANAGEMENT TIPS**\n\n**💳 Ember Sachel Embers:** Ready for the market, mystic gambling, and tributes\n**👑 Treasury Embers:** Safer from pillaging, may gain the crown's favor\n**🔄 Quick Banking:** Use \`!deposit <amount>\` to secure Embers again\n**📊 Monitoring:** Check \`!balance\` for a complete chronicle of your wealth\n\n> Keep some Embers in the treasury for security and some in your Ember Sachel for convenience!`)
            );

            components.push(tipsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **TRANSACTION INFO**\n\n**Requested by:** \`${message.author.tag}\`\n**User ID:** \`${message.author.id}\`\n**Timestamp:** \`${new Date().toLocaleString()}\``)
            );

            components.push(footerContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in withdraw command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **WITHDRAWAL ERROR**\n\nSomething went wrong while processing your withdrawal from the Royal Treasury. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};
