const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { BEASTS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'summon',
    aliases: ['beast-summon'],
    description: 'Summon a beast for racing and other activities .',
    usage: '!summon <beast_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
              
                const components = [];

               
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x992D22);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👹 Bestiary of Summons\n## LEGENDARY CREATURES\n\n> Welcome to the Bestiary! Choose from our selection of powerful beasts to summon.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const beastEntries = Object.entries(BEASTS);
                const beastsByType = {};
                
           
                beastEntries.forEach(([id, beast]) => {
                    if (!beastsByType[beast.type]) {
                        beastsByType[beast.type] = [];
                    }
                    beastsByType[beast.type].push([id, beast]);
                });

             
                Object.entries(beastsByType).forEach(([type, beasts]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getBeastTypeColor(type));

                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${getBeastTypeEmoji(type)} **${type.toUpperCase()} BEASTS**`)
                    );

              
                    for (let i = 0; i < beasts.length; i += 3) {
                        const beastGroup = beasts.slice(i, i + 3);
                        const beastText = beastGroup.map(([id, beast]) => 
                            `**\`${id}\`** - ${beast.name}\n> **Price:** \`${beast.price.toLocaleString()} Embers\`\n> **Stats:** Speed ${beast.speed} • Power ${beast.acceleration} • Control ${beast.handling}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(beastText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

           
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📜 **HOW TO SUMMON**\n\n**Command:** \`!summon <beast_id>\`\n**Example:** \`!summon shadow_panther\`\n\n**💡 Tips:**\n> • Higher stats = Better performance in activities\n> • Your first beast automatically becomes your active one\n> • Beasts are required for certain quests and races`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const beastId = args[0].toLowerCase();
            const beastData = BEASTS[beastId];

            if (!beastData) {
                const components = [];

                const invalidBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Beast ID\n## CREATURE NOT FOUND\n\n> **\`${beastId}\`** is not a valid beast ID!\n> Use \`!summon\` to see all available beasts with their correct IDs.`)
                );

                components.push(invalidBeastContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

      
            if (profile.beasts.some(beast => beast.beastId === beastId)) {
                const components = [];

                const duplicateBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Beast Already Summoned\n## DUPLICATE SUMMONING BLOCKED\n\n> You have already summoned a **${beastData.name}**!\n> Each summoner can only have one of each beast.\n\n**💡 Tip:** Check your bestiary with beast management commands.`)
                );

                components.push(duplicateBeastContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

           
            const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
            if (primaryCitadel && profile.beasts.length >= primaryCitadel.lairCapacity) {
                const components = [];

                const lairFullContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                lairFullContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Lair Full\n## MAXIMUM BEAST CAPACITY REACHED\n\n> Your lair is at maximum capacity!\n> You can't summon more beasts without more space.`)
                );

                components.push(lairFullContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **LAIR STATUS**\n\n**Current Beasts:** \`${profile.beasts.length}\`\n**Lair Capacity:** \`${primaryCitadel.lairCapacity}\`\n**Citadel:** \`${primaryCitadel.name}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger citadel with a bigger lair\n> • Release existing beasts to make space`)
                );

                components.push(capacityContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < beastData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD BEAST\n\n> You don't have enough Embers to summon the **${beastData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Beast:** \`${beastData.name}\`\n**Price:** \`${beastData.price.toLocaleString()} Embers\`\n**Your Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**Shortage:** \`${(beastData.price - profile.wallet).toLocaleString()} Embers\`\n\n**💡 Earning Tips:** Work, complete dailies, race, or run guilds to earn more Embers!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

      
            profile.wallet -= beastData.price;
            profile.beasts.push({
                beastId,
                name: beastData.name,
                type: beastData.type,
                speed: beastData.speed,
                acceleration: beastData.acceleration,
                handling: beastData.handling,
                purchasePrice: beastData.price,
                currentValue: beastData.price,
                upkeepCost: beastData.upkeepCost,
                durability: 100,
                raceWins: 0,
                raceLosses: 0,
                totalDistance: 0,
                dateAcquired: new Date()
            });

           
            if (!profile.activeBeast) {
                profile.activeBeast = beastId;
            }

          
            profile.transactions.push({
                type: 'expense',
                amount: beastData.price,
                description: `Summoned beast: ${beastData.name}`,
                category: 'beast'
            });

            await profile.save();

      
            const components = [];

      
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x992D22);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👹 Beast Summoning Successful!\n## CREATURE ACQUIRED\n\n> Congratulations! You've successfully summoned a **${beastData.name}** for **\`${beastData.price.toLocaleString()} Embers\`**!\n> ${!profile.beasts.find(c => c.beastId !== beastId) ? 'This is now your active beast and ready for battle!' : 'Your new beast is ready for action!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📜 **BEAST SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👹 Beast Name:** \`${beastData.name}\`\n**🏷️ Beast Type:** \`${beastData.type}\`\n**⚔️ Speed:** \`${beastData.speed}/100\`\n**🔥 Power:** \`${beastData.acceleration}/100\`\n**🧠 Control:** \`${beastData.handling}/100\``)
            );

            const overallPerformance = ((beastData.speed + beastData.acceleration + beastData.handling) / 3).toFixed(1);
            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📊 Overall Rating:** \`${overallPerformance}/100\`\n**CONDITION:** \`100%\` (Pristine)\n**💰 Upkeep Cost:** \`${beastData.upkeepCost} Embers/day\`\n**📅 Summon Date:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(specsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **TRANSACTION SUMMARY**\n\n**Summoning Cost:** \`${beastData.price.toLocaleString()} Embers\`\n**Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**Total Beasts:** \`${profile.beasts.length}\`\n**Transaction Logged:** Purchase recorded in your transaction history`)
            );

            components.push(financialContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**🏁 Racing:** Use \`!beastrace\` to compete and earn Embers\n**🛡️ Quests:** Take your beast on epic quests\n**🔧 Upkeep:** Keep your beast well-maintained for best performance\n**📊 Stats:** Check your beast collection and racing statistics\n\n> Your new beast opens up exciting gameplay opportunities!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in summon command:', error);

        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **BEAST SUMMONING ERROR**\n\nSomething went wrong while processing your beast summoning. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getBeastTypeColor(type) {
    const colors = {
        'terrestrial': 0x8B4513,  
        'aquatic': 0x1E90FF,      
        'aerial': 0x87CEEB,     
    };
    return colors[type] || 0x992D22;
}

function getBeastTypeEmoji(type) {
    const emojis = {
        'terrestrial': '🐾',
        'aquatic': '💧',
        'aerial': '🦅',
    };
    return emojis[type] || '👹';
}