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
    aliases: ['with'],
    description: 'Withdraw Embers from your bank to your wallet with v2 components',
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
                        .setContent(`# ❌ Missing Withdrawal Amount\n## PLEASE SPECIFY AMOUNT\n\n> Please specify an amount to withdraw from your bank account.`)
                );

                components.push(missingContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **USAGE EXAMPLES**\n\n**\`!withdraw 1000\`** - Withdraw specific amount\n**\`!withdraw all\`** - Withdraw all bank funds\n**\`!withdraw max\`** - Withdraw maximum available\n\n**🏦 Available Balance:** \`${profile.bank.toLocaleString()} Embers\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let amount;
            if (args[0] === 'all' || args[0] === 'max') {
                amount = profile.bank;
            } else {
                amount = parseInt(args[0], 10);
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Withdrawal Amount\n## PLEASE ENTER VALID NUMBER\n\n> Please enter a valid positive number or use special keywords.`)
                );

                components.push(invalidContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const examplesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                examplesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **VALID FORMATS**\n\n**Numbers:** \`1000\`, \`2500\`, \`10000\`\n**Keywords:** \`all\`, \`max\`\n**Invalid:** \`${args[0]}\` (not recognized)\n\n**🏦 Your Bank Balance:** \`${profile.bank.toLocaleString()} Embers\``)
                );

                components.push(examplesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.bank < amount) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Bank Funds\n## NOT ENOUGH EMBERS IN BANK\n\n> You don't have enough Embers in your bank account for this withdrawal!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏦 **ACCOUNT BREAKDOWN**\n\n**Bank Balance:** \`${profile.bank.toLocaleString()} Embers\`\n**Attempted Withdrawal:** \`${amount.toLocaleString()} Embers\`\n**Shortage:** \`${(amount - profile.bank).toLocaleString()} Embers\`\n**Wallet Balance:** \`${profile.wallet.toLocaleString()} Embers\``)
                );

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Suggestions:**\n> • Try \`!withdraw all\` to withdraw everything\n> • Check \`!balance\` for complete financial overview\n> • Consider depositing more Embers first`)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const newWallet = profile.wallet + amount;
            const newBank = profile.bank - amount;
            const totalWealth = newWallet + newBank + profile.followerTithe;

        
            await EconomyManager.updateWallet(userId, guildId, amount);
            await EconomyManager.updateBank(userId, guildId, -amount);

          
            profile.transactions.push({
                type: 'transfer',
                amount: amount,
                description: 'Bank withdrawal',
                category: 'banking'
            });
            await profile.save();

       
            const components = [];

  
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Withdrawal Successful!\n## EMBERS TRANSFERRED TO WALLET\n\n> You have successfully withdrawn **\`${amount.toLocaleString()} Embers\`** from your bank to your wallet!\n> Your funds are now available for immediate use.`)
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
                    .setContent(`**💰 Withdrawal Amount:** \`${amount.toLocaleString()} Embers\`\n**⏰ Transaction Time:** \`${new Date().toLocaleString()}\`\n**📝 Transaction Type:** \`Bank Withdrawal\`\n**🏷️ Category:** \`Banking\``)
            );

            components.push(detailsContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const balancesContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏦 **UPDATED ACCOUNT BALANCES**')
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💳 Wallet Balance:** \`${newWallet.toLocaleString()} Embers\`\n**🏦 Bank Balance:** \`${newBank.toLocaleString()} Embers\`\n**👥 Follower Tithe:** \`${profile.followerTithe.toLocaleString()} Embers\``)
            );

            balancesContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💎 Total Net Worth:** \`${totalWealth.toLocaleString()} Embers\`\n**📈 Liquid Assets:** \`${newWallet.toLocaleString()} Embers\` (Available for spending)\n**🛡️ Secured Assets:** \`${(newBank + profile.followerTithe).toLocaleString()} Embers\``)
            );

            components.push(balancesContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **FINANCIAL MANAGEMENT TIPS**\n\n**💳 Wallet Embers:** Ready for purchases, gambling, and donations\n**🏦 Bank Embers:** Safer from robberies, earns potential interest\n**🔄 Quick Banking:** Use \`!deposit <amount>\` to secure funds again\n**📊 Monitoring:** Check \`!balance\` for complete financial overview\n\n> Keep some Embers in the bank for security and some in wallet for convenience!`)
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
                    .setContent('## ❌ **WITHDRAWAL ERROR**\n\nSomething went wrong while processing your bank withdrawal. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    },
};