const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'guildcoffer',
    aliases: ['gcoffer'],
    description: 'Manage your guild\'s coffer, secured by ancient wards.',
    usage: '!guildcoffer <deposit/withdraw> <amount>',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            if (!primaryStronghold) {
                const components = [];
                const noStrongholdContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                noStrongholdContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🏰 Stronghold Required\n## A COFFER NEEDS A KEEP\n\n> You must possess a stronghold to establish a guild coffer.`)
                );
                components.push(noStrongholdContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const cofferCapacity = EconomyManager.getCofferCapacity(profile);
            const wardLevel = EconomyManager.calculateWardLevel(profile);
            
            if (!args[0]) {
                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🏰 Guild Coffer Management\n## SECURE YOUR GUILD\'S WEALTH\n\n> Your guild\'s treasury, protected by powerful wards and runes.`)
                );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statusContainer = new ContainerBuilder().setAccentColor(0x27AE60);
                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 💰 **COFFER STATUS**\n\n**Current Balance:** \`${profile.guild_coffers.toLocaleString()} Embers\`\n**Coffer Capacity:** \`${cofferCapacity.toLocaleString()} Embers\`\n**Ward Level:** \`${wardLevel}%\``)
                );
                components.push(statusContainer);

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const action = args[0].toLowerCase();
            let amount;

            if (!['deposit', 'withdraw'].includes(action)) {
                // Invalid action message
            }

            if (args[1] === 'all' || args[1] === 'max') {
                if (action === 'deposit') {
                    amount = Math.min(profile.embers, cofferCapacity - profile.guild_coffers);
                } else {
                    amount = profile.guild_coffers;
                }
            } else {
                amount = parseInt(args[1]);
            }
            
            if (isNaN(amount) || amount <= 0) {
                // Invalid amount message
            }
            
            if (action === 'deposit') {
                if (amount > profile.embers) {
                    // Insufficient funds message
                }
                
                if (profile.guild_coffers + amount > cofferCapacity) {
                    // Coffer capacity exceeded message
                }
                
                profile.embers -= amount;
                profile.guild_coffers += amount;

                profile.transactions.push({
                    type: 'expense',
                    amount: amount,
                    description: 'Deposited Embers into the guild coffer.',
                    category: 'guild'
                });

                const components = [];
                const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ✅ Deposit Successful!\n## EMBERS SECURED IN THE COFFER\n\n> Successfully deposited **\`${amount.toLocaleString()} Embers\`**.`)
                );
                components.push(successContainer);
                await message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                
            } else if (action === 'withdraw') {
                if (amount > profile.guild_coffers) {
                    // Insufficient coffer funds message
                }
                
                profile.guild_coffers -= amount;
                profile.embers += amount;

                profile.transactions.push({
                    type: 'income',
                    amount: amount,
                    description: 'Withdrew Embers from the guild coffer.',
                    category: 'guild'
                });
                
                const components = [];
                const withdrawSuccessContainer = new ContainerBuilder().setAccentColor(0xFF9800);
                withdrawSuccessContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ✅ Withdrawal Successful!\n## EMBERS TRANSFERRED TO Ember Sachel\n\n> Successfully withdrew **\`${amount.toLocaleString()} Embers\`**.`)
                );
                components.push(withdrawSuccessContainer);
                await message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            await profile.save();

        } catch (error) {
            console.error('Error in guildcoffer command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **GUILD COFFER ERROR**\n\nAn ancient curse has sealed the coffer. Try again later.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};