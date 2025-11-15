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
    name: 'tamebeast',
    aliases: ['beast-tame', 'tame'],
    description: 'Tame a beast for arena battles and expeditions.',
    usage: '!tamebeast <beast_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🐾 Beast Master's Den\n## A MENAGERIE OF LEGENDARY BEASTS\n\n> Welcome to the Beast Master's Den! Choose a formidable beast to join your quest for glory.`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const beastsByType = {};
                Object.entries(MOUNTS).forEach(([id, beast]) => {
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

                    for (let i = 0; i < beasts.length; i += 2) {
                        const beastGroup = beasts.slice(i, i + 2);
                        const beastText = beastGroup.map(([id, beast]) => 
                            `**\`${id}\`** - ${beast.name}\n> **Price:** \`${beast.price.toLocaleString()} Embers\`\n> **Stats:** Prowess ${beast.prowess} • Ferocity ${beast.ferocity} • Cunning ${beast.cunning}`
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
                    .setAccentColor(0x7F8C8D);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **HOW TO TAME**\n\n**Command:** \`!tamebeast <beast_id>\`\n**Example:** \`!tamebeast dire_wolf\`\n\n**💡 Wisdom:**\n> • Higher stats improve arena and expedition outcomes.\n> • Your first beast becomes your active beast automatically.\n> • Beasts are essential for many high-tier adventures.`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const beastId = args[0].toLowerCase();
            const beastData = MOUNTS[beastId];

            if (!beastData) {
                const components = [];
                const invalidBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Beast ID\n## CREATURE NOT FOUND\n\n> **\`${beastId}\`** is not a valid beast ID!\n> Use \`!tamebeast\` to see all available beasts.`)
                );
                components.push(invalidBeastContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.beasts.some(beast => beast.beastId === beastId)) {
                const components = [];
                const duplicateBeastContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                duplicateBeastContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Beast Already Tamed\n## DUPLICATE TAMING BLOCKED\n\n> You have already tamed a **${beastData.name}**!\n> Each warrior can only tame one of each beast species.`)
                );
                components.push(duplicateBeastContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            if (primaryStronghold && profile.beasts.length >= primaryStronghold.bestiaryCapacity) {
                const components = [];
                const bestiaryFullContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                bestiaryFullContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Bestiary Full\n## MAXIMUM BEAST CAPACITY REACHED\n\n> Your stronghold's bestiary is full! You cannot tame more beasts without expanding your capacity.`)
                );
                components.push(bestiaryFullContainer);
                // ... more details ...
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (profile.embers < beastData.price) {
                const components = [];
                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD BEAST\n\n> You lack the Embers to tame the **${beastData.name}**!\n> **Required:** ${beastData.price.toLocaleString()} Embers\n> **Your Purse:** ${profile.embers.toLocaleString()} Embers`)
                );
                components.push(insufficientContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            profile.embers -= beastData.price;
            profile.beasts.push({
                beastId,
                name: beastData.name,
                type: beastData.type,
                prowess: beastData.prowess,
                ferocity: beastData.ferocity,
                cunning: beastData.cunning,
                purchasePrice: beastData.price,
                currentValue: beastData.price,
                vitality: 100,
                arenaWins: 0,
                arenaLosses: 0,
                dateAcquired: new Date()
            });

            if (!profile.activeBeast) {
                profile.activeBeast = beastId;
            }

            profile.transactions.push({
                type: 'expense',
                amount: beastData.price,
                description: `Tamed beast: ${beastData.name}`,
                category: 'beast'
            });

            await profile.save();

            const components = [];
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🐾 Beast Tamed!\n## A NEW COMPANION JOINS YOU\n\n> Congratulations! You have successfully tamed a **${beastData.name}** for **\`${beastData.price.toLocaleString()} Embers\`**!`)
            );
            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const specsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);
            specsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚔️ **BEAST ATTRIBUTES**\n\n**🐾 Name:** \`${beastData.name}\`\n**🏷️ Type:** \`${beastData.type}\`\n**⚡ Prowess:** \`${beastData.prowess}/100\`\n**🚀 Ferocity:** \`${beastData.ferocity}/100\`\n**🎯 Cunning:** \`${beastData.cunning}/100\``)
            );
            components.push(specsContainer);

            return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in tamebeast command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **TAMING FAILED**\n\nAn unexpected error occurred while taming your beast. The spirits are displeased.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};

function getBeastTypeColor(type) {
    const colors = {
        'common': 0x95A5A6,
        'uncommon': 0x3498DB,
        'rare': 0x9B59B6,
        'epic': 0xE91E63,
        'legendary': 0xF39C12
    };
    return colors[type] || 0x0099FF;
}

function getBeastTypeEmoji(type) {
    const emojis = {
        'common': '🐾',
        'uncommon': '🐺',
        'rare': '🦄',
        'epic': '🐲',
        'legendary': '🔥'
    };
    return emojis[type] || '🐾';
}