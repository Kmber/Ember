const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

const GIFT_MINIMUM = 10;
const GIFT_MAXIMUM = 1000000;
const GIFT_TAX_RATE = 0.02;

module.exports = {
    name: 'gift',
    aliases: ['give', 'transfer'],
    description: 'Bestow a gift of Embers upon another denizen of the realm.',
    usage: '!gift @user <amount>',
    cooldown: 5000,
    async execute(message, args) {
        try {
            if (args.length < 2) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Command Usage\n## A GIFT REQUIRES A RECIPIENT AND AN AMOUNT\n\n> **Correct Usage:** \`!gift @user <amount>\`\n> **Example:** \`!gift @friend 1000\`\n> **Gift All:** \`!gift @friend all\``)
                );

                components.push(usageContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const target = message.mentions.users.first();
            if (!target) {
                const components = [];

                const noUserContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noUserContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ No Recipient Mentioned\n## A GIFT MUST HAVE A DESTINATION\n\n> You must mention a valid denizen of the realm to bestow a gift upon!\n> **Example:** \`!gift @friend 500\`\n\n**💡 Tip:** Use the @ symbol to mention the user correctly.`)
                );

                components.push(noUserContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.id === message.author.id) {
                const components = [];

                const selfGiftContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                selfGiftContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 A Gift to Oneself?\n## SUCH ACTS ARE FORBIDDEN\n\n> A noble gesture, but you cannot bestow a gift upon yourself!\n> Share your fortune with another soul in the realm.`)
                );

                components.push(selfGiftContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.bot) {
                const components = [];

                const botGiftContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                botGiftContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 A Gift for an Automaton?\n## THEY HAVE NO NEED FOR EMBERS\n\n> You cannot gift Embers to a bot! They have no presence in the ethereal economy.\n> Find a mortal to receive your generosity.`)
                );

                components.push(botGiftContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let amount;
            try {
                const tempProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
                if (args[1].toLowerCase() === 'all' || args[1].toLowerCase() === 'max') {
                    amount = tempProfile.embers;
                } else {
                    amount = parseInt(args[1].replace(/[,$]/g, ''), 10);
                }
            } catch (parseError) {
                const components = [];

                const parseErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                parseErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Illegible Amount\n## THE SCRIBE IS CONFUSED\n\n> The amount you inscribed is unreadable: \`${args[1]}\`\n> **Valid Forms:** \`1000\`, \`1,000\`, \`all\`, \`max\``)
                );

                components.push(parseErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (isNaN(amount) || amount <= 0) {
                const components = [];

                const invalidAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ A Worthless Gift\n## THE AMOUNT MUST BE GREATER THAN ZERO\n\n> You must bestow a gift of value!\n> **Examples:** \`!gift @friend 100\` or \`!gift @friend all\``)
                );

                components.push(invalidAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount < GIFT_MINIMUM) {
                const components = [];

                const minAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                minAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 A Meager Offering\n## A MORE SUBSTANTIAL GIFT IS REQUIRED\n\n> The minimum gift is **\`${GIFT_MINIMUM} Embers\`**.\n> You attempted to gift: **\`${amount} Embers\`**\n\n**💡 A Scribe's Note:** A larger gift is a more meaningful gesture and covers the cost of its transcription.`)
                );

                components.push(minAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (amount > GIFT_MAXIMUM) {
                const components = [];

                const maxAmountContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                maxAmountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💎 A Gift of Unprecedented Scale\n## SUCH GENEROSITY IS TOO GREAT FOR A SINGLE TRANSACTION\n\n> The maximum gift is **\`${GIFT_MAXIMUM.toLocaleString()} Embers\`**.\n> You attempted to gift: **\`${amount.toLocaleString()} Embers\`**\n\n**💡 A Scribe's Note:** If you wish to bestow such a fortune, you must do so in multiple, smaller gifts.`)
                );

                components.push(maxAmountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            let donorProfile, recipientProfile;
            
            try {
                donorProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            } catch (donorError) {
                const components = [];

                const donorErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                donorErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Donor Profile Unreadable\n## YOUR OWN CHRONICLE IS OBSCURED\n\n> Your own economic profile could not be read. Try \`!balance\` to refresh your chronicle.\n\n**💡 Troubleshooting:** Wait a moment and try the command again.`)
                );

                components.push(donorErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            try {
                recipientProfile = await EconomyManager.getProfile(target.id, message.guild.id);
            } catch (recipientError) {
                const components = [];

                const recipientErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                recipientErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Recipient Profile Unreadable\n## THEIR CHRONICLE IS OBSCURED\n\n> The economic profile of **${target.username}** could not be read.\n> They may need to use \`!balance\` to establish their chronicle.`)
                );

                components.push(recipientErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (donorProfile.embers < amount) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 An Empty Ember Sachel\n## YOU CANNOT GIFT WHAT YOU DO NOT HAVE\n\n> Your Ember Sachel does not hold enough Embers for this gift!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balanceContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                balanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **A TALE OF TWO PURSES**\n\n**Your Ember Sachel:** \`${donorProfile.embers.toLocaleString()} Embers\`\n**Intended Gift:** \`${amount.toLocaleString()} Embers\`\n**The Difference:** \`${(amount - donorProfile.embers).toLocaleString()} Embers\``)
                );

                components.push(balanceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            try {
                const tax = Math.floor(amount * GIFT_TAX_RATE);
                const netAmount = amount - tax;

                donorProfile.embers -= amount;
                recipientProfile.embers += netAmount;

                const timestamp = new Date();
                
                donorProfile.transactions.push({
                    type: 'expense',
                    amount: amount,
                    description: `Gifted to ${target.username}`,
                    category: 'gift',
                    timestamp: timestamp
                });

                recipientProfile.transactions.push({
                    type: 'income',
                    amount: netAmount,
                    description: `Received gift from ${message.author.username}`,
                    category: 'gift',
                    timestamp: timestamp
                });

                donorProfile.experience += Math.min(50, Math.floor(amount / 1000));
                recipientProfile.experience += 5;

                await donorProfile.save();
                await recipientProfile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💝 A Gift Bestowed!\n## GENEROSITY ECHOES THROUGH THE REALM\n\n> **${message.author.username}** has gifted **\`${amount.toLocaleString()} Embers\`** to **${target.username}**!\n> Such kindness strengthens the bonds between the people.`)
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
                        .setContent(`**💰 The Gift:** \`${amount.toLocaleString()} Embers\`\n**💸 The Crown's Tithe:** \`${tax.toLocaleString()} Embers\` (${GIFT_TAX_RATE * 100}%)\n**💎 The Net Bestowment:** \`${netAmount.toLocaleString()} Embers\`\n**⏰ The Hour of Giving:** \`${timestamp.toLocaleString()}\``)
                );

                components.push(detailsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const balancesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏦 **THE STATE OF THE COFFERS**')
                );

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**${message.author.username}** (The Giver)\n> **New Ember Sachel:** \`${donorProfile.embers.toLocaleString()} Embers\`\n> **Arcane Power Gained:** \`+${Math.min(50, Math.floor(amount / 1000))}\``)
                );

                balancesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**${target.username}** (The Receiver)\n> **New Ember Sachel:** \`${recipientProfile.embers.toLocaleString()} Embers\`\n> **Arcane Power Gained:** \`+5\``)
                );

                components.push(balancesContainer);

                await message.channel.send({ 
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });

                try {
                    await target.send(`💸 You have received a gift of **${netAmount.toLocaleString()} Embers** from **${message.author.username}** in **${message.guild.name}**!`);
                } catch (dmError) {
                    // It is not critical if the DM fails.
                }

            } catch (transactionError) {
                throw transactionError;
            }

        } catch (error) {
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ A Gift Lost to the Ether\n## A SCRIBING ERROR HAS OCCURRED\n\n> An error occurred while attempting to bestow your gift upon **${target?.username || 'an unknown soul'}**.`)
            );

            components.push(errorContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const errorDetailsContainer = new ContainerBuilder()
                .setAccentColor(0xC0392B);

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🔍 **A DEEPER LOOK INTO THE ERROR**')
            );

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**The Error's Name:**\n\`\`\`${error.message || 'An Unknown Anomaly'}\`\`\``)
            );

            errorDetailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**Error Code:** \`${Date.now()}\`\n**Timestamp:** \`${new Date().toLocaleString()}\``)
            );

            components.push(errorDetailsContainer);
        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const troubleshootContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            troubleshootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🛠️ **TROUBLESHOOTING THE ANOMALY**\n\n**1.** Both you and the recipient should try \`!balance\` to refresh your chronicles.\n**2.** Wait a moment and attempt the gift again.\n**3.** If the ether remains disturbed, contact a Realm Administrator.\n**4.** Provide the error code for a swifter resolution.`)
            );

            components.push(troubleshootContainer);
                
            return message.reply({ 
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};