const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'tithe',
    aliases: ['t'],
    description: 'Manage your follower tithe .',
    usage: 'tithe <deposit/withdraw> <amount>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            
            const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
            if (!primaryCitadel) {
                const components = [];

                const noCitadelContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noCitadelContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Citadel Required for Tithe\n## SECURE STORAGE NEEDS A CITADEL\n\n> You need to own a citadel to collect a tithe!\n> A tithe requires a secure location to store your followers' contributions.`)
                );

                components.push(noCitadelContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **GET STARTED WITH A CITADEL**\n\n**💡 Solutions:**\n> • Acquire a citadel through the citadel market (\`${prefix}acquirecitadel\`)\n> • Set it as your primary stronghold\n> • Unlock tithe storage capacity\n> • Enjoy secure wealth storage\n\n**Benefits of Follower Tithe:**\n> • Enhanced security from robberies\n> • Separate from personal banking\n> • Follower-focused wealth management`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        
        
            const vaultCapacity = EconomyManager.getVaultCapacity(profile);
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            
            if (!args[0]) {
          
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Follower Tithe Management\n## SECURE WEALTH STORAGE CENTER\n\n> Your followers' secure financial storage facility\n> Protected by advanced security systems and citadel-based encryption`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **TITHE STATUS**')
                );

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Current Tithe:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**📊 Tithe Capacity:** \`${vaultCapacity.toLocaleString()} Embers\`\n**📈 Usage:** \`${((profile.followerTithe / vaultCapacity) * 100).toFixed(1)}%\`\n**💾 Available Space:** \`${(vaultCapacity - profile.followerTithe).toLocaleString()} Embers\``)
                );

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🛡️ Security Level:** \`${securityLevel}%\`\n**🏰 Citadel:** \`${primaryCitadel.name}\`\n**🏘️ Citadel Type:** \`${primaryCitadel.type}\``)
                );

                components.push(statusContainer);

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **TITHE OPERATIONS**\n\n**\`${prefix}tithe deposit <amount>\`** - Store Embers securely\n**\`${prefix}tithe withdraw <amount>\`** - Retrieve stored Embers\n**\`${prefix}tithe deposit all\`** - Deposit all available wallet funds\n**\`${prefix}tithe withdraw all\`** - Withdraw all tithe funds\n\n**💡 Tip:** Keep emergency funds in the tithe for maximum security!`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const action = args[0].toLowerCase();
            let amount;

            if (!['deposit', 'withdraw'].includes(action)) {
                const components = [];

                const invalidActionContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidActionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Tithe Operation\n## UNKNOWN COMMAND\n\n> **\`${action}\`** is not a valid tithe operation!\n> Use **\`deposit\`** or **\`withdraw\`** only.`)
                );

                components.push(invalidActionContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **CORRECT USAGE**\n\n**\`${prefix}tithe deposit <amount>\`** - Store Embers in tithe\n**\`${prefix}tithe withdraw <amount>\`** - Take Embers from tithe\n\n**Examples:**\n> \`${prefix}tithe deposit 5000\`\n> \`${prefix}tithe withdraw 2000\`\n> \`${prefix}tithe deposit all\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

          
            if (args[1] === 'all' || args[1] === 'max') {
                if (action === 'deposit') {
                    amount = Math.min(profile.wallet, vaultCapacity - profile.followerTithe);
                } else {
                    amount = profile.followerTithe;
                }
            } else {
                amount = parseInt(args[1]);
            }
            
            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Amount\n## PLEASE ENTER VALID NUMBER\n\n> Please enter a valid amount greater than zero!\n> **Examples:** \`1000\`, \`5000\`, \`all\`, \`max\``)
                );

                components.push(invalidAmountContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **CURRENT BALANCES**\n\n**💳 Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**🏦 Follower Tithe:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**📊 Tithe Capacity:** \`${vaultCapacity.toLocaleString()} Embers\``)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'deposit') {
                if (amount > profile.wallet) {
                    const components = [];

                    const insufficientWalletContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientWalletContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Wallet Funds\n## NOT ENOUGH EMBERS TO DEPOSIT\n\n> You don't have enough Embers in your wallet for this deposit!`)
                    );

                    components.push(insufficientWalletContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const walletBreakdownContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    walletBreakdownContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💳 **WALLET ANALYSIS**\n\n**Current Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**Attempted Deposit:** \`${amount.toLocaleString()} Embers\`\n**Shortage:** \`${(amount - profile.wallet).toLocaleString()} Embers\`\n\n**💡 Suggestion:** Try \`${prefix}tithe deposit all\` to deposit everything you have!`)
                    );

                    components.push(walletBreakdownContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
                if (profile.followerTithe + amount > vaultCapacity) {
                    const maxDeposit = vaultCapacity - profile.followerTithe;
                    const components = [];

                    const capacityContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    capacityContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📊 Tithe Capacity Exceeded\n## MAXIMUM STORAGE LIMIT REACHED\n\n> Your tithe storage doesn't have enough space for this deposit!`)
                    );

                    components.push(capacityContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const capacityDetailsContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    capacityDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏦 **TITHE CAPACITY ANALYSIS**\n\n**Current Tithe Balance:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**Maximum Capacity:** \`${vaultCapacity.toLocaleString()} Embers\`\n**Available Space:** \`${maxDeposit.toLocaleString()} Embers\`\n**Attempted Deposit:** \`${amount.toLocaleString()} Embers\``)
                    );

                    capacityDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💡 Solutions:**\n> • Try \`${prefix}tithe deposit ${maxDeposit}\` to fill remaining space\n> • Upgrade your citadel for more tithe capacity\n> • Use \`${prefix}tithe deposit max\` for automatic maximum deposit`)
                    );

                    components.push(capacityDetailsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
             
                profile.wallet -= amount;
                profile.followerTithe += amount;
                
                const components = [];

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Tithe Deposit Successful!\n## FUNDS SECURELY STORED\n\n> Successfully deposited **\`${amount.toLocaleString()} Embers\`** into your follower tithe!\n> Your followers' contributions are now safely protected.`)
                );

                components.push(successContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const transactionContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                transactionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **TRANSACTION SUMMARY**\n\n**💰 Deposited Amount:** \`${amount.toLocaleString()} Embers\`\n**💳 New Wallet Balance:** \`${profile.wallet.toLocaleString()} Embers\`\n**🏦 New Tithe Balance:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**📈 Tithe Usage:** \`${((profile.followerTithe / vaultCapacity) * 100).toFixed(1)}%\``)
                );

                components.push(transactionContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
                
            } else if (action === 'withdraw') {
                if (amount > profile.followerTithe) {
                    const components = [];

                    const insufficientTitheContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientTitheContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Tithe Funds\n## NOT ENOUGH EMBERS IN TITHE\n\n> You don't have enough Embers in your follower tithe for this withdrawal!`)
                    );

                    components.push(insufficientTitheContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const titheBreakdownContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    titheBreakdownContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏦 **TITHE ANALYSIS**\n\n**Current Tithe Balance:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**Attempted Withdrawal:** \`${amount.toLocaleString()} Embers\`\n**Shortage:** \`${(amount - profile.followerTithe).toLocaleString()} Embers\`\n\n**💡 Suggestion:** Try \`${prefix}tithe withdraw all\` to withdraw everything available!`)
                    );

                    components.push(titheBreakdownContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }
                
         
                profile.followerTithe -= amount;
                profile.wallet += amount;
                
                const components = [];

                const withdrawSuccessContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                withdrawSuccessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏦 Tithe Withdrawal Successful!\n## FUNDS TRANSFERRED TO WALLET\n\n> Successfully withdrew **\`${amount.toLocaleString()} Embers\`** from your follower tithe!\n> The Embers are now available in your wallet for immediate use.`)
                );

                components.push(withdrawSuccessContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const withdrawTransactionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                withdrawTransactionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **WITHDRAWAL SUMMARY**\n\n**💰 Withdrawn Amount:** \`${amount.toLocaleString()} Embers\`\n**💳 New Wallet Balance:** \`${profile.wallet.toLocaleString()} Embers\`\n**🏦 New Tithe Balance:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**📈 Tithe Usage:** \`${((profile.followerTithe / vaultCapacity) * 100).toFixed(1)}%\``)
                );

                components.push(withdrawTransactionContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            await profile.save();

        } catch (error) {
            console.error('Error in tithe command:', error);

      
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **TITHE ERROR**\n\nSomething went wrong while processing your tithe operation. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};