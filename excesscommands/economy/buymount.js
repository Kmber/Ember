const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { MOUNTS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buymount',
    aliases: ['mount-buy'],
    description: 'Buy a mount for mount racing and family quests with v2 components',
    usage: '!buymount <mount_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
              
                const components = [];

               
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x0099FF);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐎 Mount Stables\n## MYTHICAL MOUNT COLLECTION\n\n> Welcome to the mount stables! Choose from our selection of legendary mounts for mount racing and family quests.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
                const mountEntries = Object.entries(MOUNTS);
                const mountsByType = {};


                mountEntries.forEach(([id, mount]) => {
                    if (!mountsByType[mount.type]) {
                        mountsByType[mount.type] = [];
                    }
                    mountsByType[mount.type].push([id, mount]);
                });


                Object.entries(mountsByType).forEach(([type, mounts]) => {
                    const categoryContainer = new ContainerBuilder()
                        .setAccentColor(getMountTypeColor(type));

                    categoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${getMountTypeEmoji(type)} **${type.toUpperCase().replace('_', ' ')} MOUNTS**`)
                    );


                    for (let i = 0; i < mounts.length; i += 3) {
                        const mountGroup = mounts.slice(i, i + 3);
                        const mountText = mountGroup.map(([id, mount]) =>
                            `**\`${id}\`** - ${mount.name}\n> **Price:** \`${mount.price.toLocaleString()} Embers\`\n> **Performance:** Speed ${mount.prowess} • Acceleration ${mount.ferocity} • Handling ${mount.cunning}`
                        ).join('\n\n');

                        categoryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(mountText)
                        );
                    }

                    components.push(categoryContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

           
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **HOW TO PURCHASE**\n\n**Command:** \`!buymount <mount_id>\`\n**Example:** \`!buymount war_horse\`\n\n**💡 Tips:**\n> • Higher performance = Better mount racing results\n> • First mount automatically becomes your active mount\n> • Mounts enable family quests and mount racing participation`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const mountId = args[0].toLowerCase();
            const mountData = MOUNTS[mountId];

            if (!mountData) {
                const components = [];

                const invalidMountContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidMountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Mount ID\n## MOUNT NOT FOUND\n\n> **\`${mountId}\`** is not a valid mount ID!\n> Use \`!buymount\` to see all available mounts with their correct IDs.`)
                );

                components.push(invalidMountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

      
            if (profile.mounts.some(mount => mount.mountId === mountId)) {
                const components = [];

                const duplicateMountContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateMountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Mount Already Owned\n## DUPLICATE PURCHASE BLOCKED\n\n> You already own a **${mountData.name}**!\n> Each player can only own one of each mount model.\n\n**💡 Tip:** Check your stables with mount management commands to see your current collection.`)
                );

                components.push(duplicateMountContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

           
           
            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            if (primaryStronghold && primaryStronghold.hasStable && profile.mounts.length >= primaryStronghold.stableCapacity) {
                const components = [];

                const stablesFullContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                stablesFullContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏠 Stables Full\n## MAXIMUM MOUNT CAPACITY REACHED\n\n> Your stronghold's stables are at maximum capacity!\n> You can't purchase more mounts without additional stable space.`)
                );

                components.push(stablesFullContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **STABLES STATUS**\n\n**Current Mounts:** \`${profile.mounts.length}\`\n**Stables Capacity:** \`${primaryStronghold.stableCapacity}\`\n**Stronghold:** \`${primaryStronghold.name}\`\n\n**💡 Solutions:**\n> • Upgrade to a larger stronghold with bigger stables\n> • Sell existing mounts to make space\n> • Consider strongholds with premium stable features`)
                );

                components.push(capacityContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.embers < mountData.price) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD MOUNT\n\n> You don't have enough embers to purchase the **${mountData.name}**!`)
                );

                components.push(insufficientContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const priceBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                priceBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Mount:** \`${mountData.name}\`\n**Price:** \`${mountData.price.toLocaleString()} Embers\`\n**Your Ember Sachel:** \`${profile.embers.toLocaleString()} Embers\`\n**Shortage:** \`${(mountData.price - profile.embers).toLocaleString()} Embers\`\n\n**💡 Earning Tips:** Complete quests, hunt monsters, or participate in raids to earn more embers!`)
                );

                components.push(priceBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

      
      
            profile.embers -= mountData.price;
            profile.mounts.push({
                mountId,
                name: mountData.name,
                type: mountData.type,
                speed: mountData.prowess,
                acceleration: mountData.ferocity,
                handling: mountData.cunning,
                purchasePrice: mountData.price,
                currentValue: mountData.price,
                maintenanceCost: 1000,
                durability: 100,
                raceWins: 0,
                raceLosses: 0,
                totalDistance: 0,
                dateAcquired: new Date()
            });

           
            if (!profile.activeMount) {
                profile.activeMount = mountId;
            }

          
            profile.transactions.push({
                type: 'expense',
                amount: mountData.price,
                description: `Purchased mount: ${mountData.name}`,
                category: 'mount'
            });

            await profile.save();

      
            const components = [];

      
      
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x0099FF);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐎 Mount Purchase Successful!\n## MOUNT ACQUIRED\n\n> Congratulations! You've successfully purchased a **${mountData.name}** for **\`${mountData.price.toLocaleString()} Embers\`**!\n> ${!profile.mounts.find(m => m.mountId !== mountId) ? 'This is now your active mount and ready for racing!' : 'Your new mount is ready for action!'}`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏁 **MOUNT SPECIFICATIONS**')
            );

            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐎 Mount Name:** \`${mountData.name}\`\n**🏷️ Mount Type:** \`${mountData.type}\`\n**🏁 Speed:** \`${mountData.prowess}/100\`\n**⚡ Acceleration:** \`${mountData.ferocity}/100\`\n**🎯 Handling:** \`${mountData.cunning}/100\``)
            );

            const overallPerformance = ((mountData.prowess + mountData.ferocity + mountData.cunning) / 3).toFixed(1);
            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📊 Overall Performance:** \`${overallPerformance}/100\`\n**🔧 Condition:** \`100%\` (Brand New)\n**💰 Maintenance Cost:** \`1000 Embers/repair\`\n**📅 Purchase Date:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(specsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💰 **TRANSACTION SUMMARY**\n\n**Purchase Price:** \`${mountData.price.toLocaleString()} Embers\`\n**Remaining Embers:** \`${profile.embers.toLocaleString()} Embers\`\n**Total Mounts Owned:** \`${profile.mounts.length}\`\n**Transaction Logged:** Purchase recorded in your transaction history`)
            );

            components.push(financialContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **WHAT'S NEXT?**\n\n**🏁 Racing:** Use \`!mount_race\` to compete and earn money\n**👨‍👩‍👧‍👦 Family Quests:** Take your family on adventures with \`!family_quest\`\n**🔧 Maintenance:** Keep your mount in top condition for best performance\n**📊 Stats:** Check your mount collection and racing statistics\n\n> Your new mount opens up exciting gameplay opportunities!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in buymount command:', error);


            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **MOUNT PURCHASE ERROR**\n\nSomething went wrong while processing your mount purchase. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getMountTypeColor(type) {
    const colors = {
        'ground': 0x95A5A6,
        'predator': 0x3498DB,
        'flying': 0x9B59B6,
        'dragonkin': 0xE91E63,
        'dragon': 0xF39C12
    };
    return colors[type] || 0x0099FF;
}

function getMountTypeEmoji(type) {
    const emojis = {
        'ground': '🐴',
        'predator': '🐆',
        'flying': '🦅',
        'dragonkin': '🐉',
        'dragon': '🐲'
    };
    return emojis[type] || '🐎';
}
