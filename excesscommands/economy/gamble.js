const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'gamble',
    aliases: ['bet'],
    description: 'Gamble your Embers for a chance to win more! (Affected by your luck)',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'gambling');
            if (cooldownCheck.onCooldown) {
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏳ A Moment of Respite\n## THE FATES DEMAND PATIENCE\n\n> You have tempted the fates too recently. Another wager requires a moment of pause.`)
                );
                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);
                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏱️ **A PAUSE IN FORTUNE**\n\n**Time Remaining:** \`${cooldownCheck.timeLeft.seconds}s\`\n**Wagering Interval:** \`30 seconds\``)
                );
                components.push(timeContainer);

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            let amount;
            if (args[0] === 'all' || args[0] === 'max') {
                amount = profile.embers;
            } else {
                amount = parseInt(args[0], 10);
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];
                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Wager\n## A FOOL'S BET\n\n> You must wager a valid amount of Embers.\n> **Examples:** \`!gamble 1000\`, \`!gamble all\``)
                );
                components.push(invalidAmountContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (profile.embers < amount) {
                const components = [];
                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## A PAUPER'S PURSE\n\n> You possess only **\`${profile.embers.toLocaleString()} Embers\`**.\n> You cannot wager **\`${amount.toLocaleString()} Embers\`**.`)
                );
                components.push(insufficientContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const luckMultiplier = EconomyManager.getMysticGamblingLuck(profile);
            const baseLuckBonus = (luckMultiplier - 1) * 10;
            const winChance = Math.min(75, 45 + baseLuckBonus);
            const won = Math.random() * 100 < winChance;
            
            profile.cooldowns.gambling = new Date();
            
            const components = [];

            if (won) {
                let multiplier;
                const roll = Math.random() * 100;
                
                if (roll > 98) multiplier = 5.0 * luckMultiplier;
                else if (roll > 90) multiplier = 3.0 * luckMultiplier;
                else if (roll > 70) multiplier = 2.5 * luckMultiplier;
                else multiplier = 2.0 * luckMultiplier;
                
                const winnings = Math.floor(amount * multiplier);
                const profit = winnings - amount;
                
                profile.embers += profit;
                
                let winType = '';
                if (multiplier >= 4) winType = '🎉 **A LEGENDARY HAUL!** 🎉';
                else if (multiplier >= 3) winType = '⭐ **A KING\'S RANSOM!** ⭐';
                else if (multiplier >= 2.5) winType = '🎰 **A FORTUNE FAVORS YOU!** 🎰';
                
                profile.transactions.push({
                    type: 'income',
                    amount: profit,
                    description: `Gambling win (${multiplier.toFixed(2)}x)`,
                    category: 'gambling'
                });

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎰 A Fortunate Wager!\n## ${winType || 'THE GODS SMILE UPON YOU!'}\n\n> You wagered **\`${amount.toLocaleString()} Embers\`** and won **\`${winnings.toLocaleString()} Embers\`**!`)
                );
                components.push(successContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const winDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);
                winDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **SPOILS OF FORTUNE**\n\n**🔥 Net Gain:** \`${profit.toLocaleString()} Embers\`\n**📈 Multiplier:** \`${multiplier.toFixed(2)}x\`\n**🍀 Luck's Favor:** \`${luckMultiplier.toFixed(2)}x\`\n**🎯 Chance of Success:** \`${winChance.toFixed(1)}%\``)
                );
                components.push(winDetailsContainer);

            } else {
                profile.embers -= amount;
                
                profile.transactions.push({
                    type: 'expense',
                    amount: amount,
                    description: 'Gambling loss',
                    category: 'gambling'
                });

                const lossContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                lossContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎲 An Unfortunate Wager\n## THE FATES ARE CRUEL\n\n> You wagered **\`${amount.toLocaleString()} Embers\`** and lost it all.`)
                );
                components.push(lossContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const lossDetailsContainer = new ContainerBuilder()
                    .setAccentColor(0xDC3545);
                lossDetailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **A CRUEL REALITY**\n\n**🎯 Your Chance of Success:** \`${winChance.toFixed(1)}%\`\n**🍀 Luck's Favor:** \`${luckMultiplier.toFixed(2)}x\`\n**💸 Embers Lost:** \`${amount.toLocaleString()}\`\n**💰 Remaining Purse:** \`${profile.embers.toLocaleString()}\``)
                );
                components.push(lossDetailsContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextGambleContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);
            nextGambleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎰 **NEXT WAGER**\n\n**Respite:** \`30 seconds\`\n**Next Wager Available:** \`${new Date(Date.now() + 30000).toLocaleTimeString()}\`\n**Current Purse:** \`${profile.embers.toLocaleString()} Embers\``)
            );
            components.push(nextGambleContainer);

            await profile.save();
            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            
        } catch (error) {
            console.error('Error in gamble command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **A TWIST OF FATE**\n\nAn unforeseen error has occurred. Your wager has been returned to you.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};