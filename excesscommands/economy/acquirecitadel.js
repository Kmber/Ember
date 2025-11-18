const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { CITADELS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'acquirecitadel',
    aliases: ['citadel-buy', 'citadel'],
    description: 'Acquire a citadel to house your followers and treasures.',
    usage: '!acquirecitadel <citadel_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
          
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🏰 Grand Citadel Market\n## EXCLUSIVE CITADEL COLLECTION\n\n> Welcome to the grand citadel market! Invest in a citadel to expand your follower capacity, secure storage, and unlock new gameplay features.')
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const citadelEntries = Object.entries(CITADELS);
                const citadelsByType = {};
                
                citadelEntries.forEach(([id, citadel]) => {
                    if (!citadelsByType[citadel.type]) {
                        citadelsByType[citadel.type] = [];
                    }
                    citadelsByType[citadel.type].push([id, citadel]);
                });

                Object.entries(citadelsByType).forEach(([type, citadels]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getCitadelTypeColor(type));

                    const emoji = getCitadelTypeEmoji(type);
                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${emoji} **${type.toUpperCase()} CITADELS**`)
                    );

                    for (let i = 0; i < citadels.length; i += 3) {
                        const citadelGroup = citadels.slice(i, i + 3);
                        const citadelText = citadelGroup.map(([id, citadel]) => 
                            `**\\`${id}\\`** - ${citadel.name}\n> **Price:** \\`$${citadel.price.toLocaleString()}\\`\n> **Followers:** ${citadel.maxFamilyMembers} • **Security:** ${citadel.securityLevel} • **Vault:** $${citadel.vaultCapacity.toLocaleString()}\n> **Garrison:** ${citadel.garrisonCapacity > 0 ? `${citadel.garrisonCapacity} units` : 'None'} • **Upkeep:** $${citadel.monthlyUpkeep.toLocaleString()}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(citadelText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

   
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO ACQUIRE**\n\n**Command:** \\`!acquirecitadel <citadel_id>\\`\n**Example:** \\`!acquirecitadel outpost\\`\n\n**💡 Benefits:**\n> • House your followers securely\n> • Unlock vault storage\n> • Enable garrison for multiple units\n> • Increase security against raids\n> • First citadel becomes your primary stronghold`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const citadelId = args[0].toLowerCase();
            const citadelData = CITADELS[citadelId];

            if (!citadelData) {
                const components = [];

                const invalidCitadelContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidCitadelContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Citadel ID\n## CITADEL NOT FOUND\n\n> **\\`${citadelId}\\`** is not a valid citadel ID!\n> Use \\`!acquirecitadel\\` to see all available citadels with their correct IDs.')
                );

                components.push(invalidCitadelContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            
            if (profile.citadels.some(c => c.propertyId === citadelId)) {
                const components = [];

                const duplicateCitadelContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateCitadelContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🏰 Citadel Already Acquired\n## DUPLICATE ACQUISITION BLOCKED\n\n> You already own **${citadelData.name}**!\n> Each player can only own one of each citadel type.\n\n**💡 Tip:** Check your citadel portfolio with \`!mycitadel\` to see your current holdings.')
                );

                components.push(duplicateCitadelContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < citadelData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD CITADEL\n\n> You don't have enough money to acquire **${citadelData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Citadel:** \\`${citadelData.name}\\`\n**Price:** \\`$${citadelData.price.toLocaleString()}\\`\n**Your Wallet:** \\`$${profile.wallet.toLocaleString()}\\`\n**Shortage:** \\`$${(citadelData.price - profile.wallet).toLocaleString()}\\`\n\n**💡 Investment Tips:** Complete quests, manage businesses, or engage in profitable ventures to build wealth for citadel investments!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

       
            profile.wallet -= citadelData.price;
            profile.citadels.push({
                propertyId: citadelId,
                name: citadelData.name,
                type: citadelData.type,
                purchasePrice: citadelData.price,
                currentValue: citadelData.price,
                monthlyUpkeep: citadelData.monthlyUpkeep,
                securityLevel: citadelData.securityLevel,
                maxFamilyMembers: citadelData.maxFamilyMembers,
                garrisonCapacity: citadelData.garrisonCapacity,
                vaultCapacity: citadelData.vaultCapacity,
                condition: 'pristine',
                dateAcquired: new Date()
            });

        
            if (!profile.primaryCitadel) {
                profile.primaryCitadel = citadelId;
                profile.maxPets = Math.floor(citadelData.maxFamilyMembers / 2);
            }

         
            profile.transactions.push({
                type: 'expense',
                amount: citadelData.price,
                description: `Acquired citadel: ${citadelData.name}`,
                category: 'citadel'
            });

            await profile.save();

           
            const components = [];

         
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 Citadel Acquisition Successful!\n## CITADEL ACQUIRED\n\n> Congratulations! You've successfully acquired **${citadelData.name}** for **\\`$${citadelData.price.toLocaleString()}\\`**!\n> ${!profile.citadels.find(c => c.propertyId !== citadelId) ? 'This is now your primary stronghold!' : 'Your citadel portfolio is growing!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏘️ **CITADEL SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Citadel Name:** \\`${citadelData.name}\\`\n**🏷️ Citadel Type:** \\`${citadelData.type}\\`\n**👨‍👩‍👧‍👦 Follower Capacity:** \\`${citadelData.maxFamilyMembers} followers\\`\n**🛡️ Security Level:** \\`${citadelData.securityLevel}/10\\`\n**🏦 Vault Capacity:** \\`$${citadelData.vaultCapacity.toLocaleString()}\\``)
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🚗 Garrison:** ${citadelData.garrisonCapacity > 0 ? `\\`${citadelData.garrisonCapacity} units\\`` : '\\`None\\`'}\n**💰 Monthly Upkeep:** \\`$${citadelData.monthlyUpkeep.toLocaleString()}\\`\n**📅 Acquisition Date:** \\`${new Date().toLocaleDateString()}\\``)
            );

            components.push(specsContainer);

      
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const featuresContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🎉 **UNLOCKED FEATURES**')
            );

            const unlockedFeatures = [];
            if (citadelData.maxFamilyMembers > 0) unlockedFeatures.push(`**👨‍👩‍👧‍👦 Follower Housing:** Accommodate up to ${citadelData.maxFamilyMembers} followers`);
            if (citadelData.vaultCapacity > 0) unlockedFeatures.push(`**🏦 Vault:** Secure storage for $${citadelData.vaultCapacity.toLocaleString()}`);
            if (citadelData.garrisonCapacity > 0) unlockedFeatures.push(`**🚗 Garrison:** House up to ${citadelData.garrisonCapacity} units safely`);
            if (citadelData.securityLevel > 0) unlockedFeatures.push(`**🛡️ Enhanced Security:** Level ${citadelData.securityLevel} protection against raids`);
            if (!profile.citadels.find(c => c.propertyId !== citadelId)) unlockedFeatures.push(`**🐕 Beast Taming:** Tame up to ${Math.floor(citadelData.maxFamilyMembers / 2)} beasts`);

            featuresContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(unlockedFeatures.join('\n\n'))
            );

            components.push(featuresContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **FINANCIAL SUMMARY**\n\n**Acquisition Price:** \\`$${citadelData.price.toLocaleString()}\\`\n**Remaining Wallet:** \\`$${profile.wallet.toLocaleString()}\\`\n**Total Citadels:** \\`${profile.citadels.length}\\`\n**Citadel Investment:** \\`$${profile.citadels.reduce((sum, c) => sum + c.purchasePrice, 0).toLocaleString()}\\`\n**Transaction Logged:** Acquisition recorded in your transaction history`)
            );

            components.push(financialContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            nextStepsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**👨‍👩‍👧‍👦 Recruit Followers:** Recruit followers to work and earn bonuses\n**🏦 Use Vault:** Deposit money in your vault for security\n**🚗 Garrison Units:** Store multiple units in your garrison\n**🐕 Tame Beasts:** Tame beasts for companionship and security\n**📈 Citadel Value:** Watch your citadel investment appreciate over time\n\n> Your new citadel opens up exciting expansion opportunities!`)
            );

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in acquirecitadel command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **CITADEL ACQUISITION ERROR**\n\nSomething went wrong while processing your citadel acquisition. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getCitadelTypeColor(type) {
    const colors = {
        'outpost': 0x95A5A6,     
        'fortress': 0x607D8B,  
        'sanctuary': 0x4CAF50,     
        'castle': 0x9C27B0,     
        'palace': 0xFF9800
    };
    return colors[type] || 0x4CAF50;
}

function getCitadelTypeEmoji(type) {
    const emojis = {
        'outpost': '🏰',
        'fortress': '🏰',
        'sanctuary': '🏰',
        'castle': '🏰',
        'palace': '🏰'
    };
    return emojis[type] || '🏰';
}
