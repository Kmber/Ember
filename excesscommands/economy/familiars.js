const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'familiars',
    aliases: ['myfamiliars'],
    description: 'View your familiar collection and their status.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.familiars.length === 0) {
                const components = [];

                const noFamiliarsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFamiliarsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🦇 No Familiars in Your Collection\n## BUILD YOUR MYSTICAL RETINUE\n\n> You don't have any familiars yet! Familiars provide warding, companionship, and protection for your stronghold.\n> Each familiar contributes to your stronghold's overall warding level.`)
                );

                components.push(noFamiliarsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const attunementContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                attunementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔮 **START YOUR FAMILIAR COLLECTION**\n\n**Step 1:** Use \`!attunefamiliar\` to see available familiars\n**Step 2:** Choose a familiar that fits your budget and needs\n**Step 3:** Give your new companion a mystical name\n**Step 4:** Care for them with mana, essence, and bonding!\n\n**💡 Benefits:**\n> • Enhanced warding against pillaging\n> • Mystical companionship and support\n> • Stronghold protection and surveillance\n> • Building a powerful mystical retinue`)
                );

                components.push(attunementContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🦇 ${message.author.username}'s Familiar Collection\n## YOUR MYSTICAL COMPANIONS\n\n> Meet your mystical companions who provide warding, power, and protection for your stronghold.\n> Well-cared for familiars are more effective guardians and more powerful companions!`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const familiarGroups = [];
            for (let i = 0; i < profile.familiars.length; i += 3) {
                familiarGroups.push(profile.familiars.slice(i, i + 3));
            }

            familiarGroups.forEach((group, groupIndex) => {
                const familiarContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC0CB);

                familiarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔮 **FAMILIAR RETINUE ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((familiar, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const overallCondition = (familiar.bond + familiar.health + familiar.mana) / 3;
                    const conditionEmoji = overallCondition > 80 ? '🟢 Excellent' : overallCondition > 50 ? '🟡 Good' : '🔴 Needs Care';
                    const efficiency = ((familiar.bond + familiar.health + familiar.mana) / 300 * 100).toFixed(0);
                    
                    const daysSinceAttunement = familiar.dateAttuned ? 
                        Math.floor((new Date() - new Date(familiar.dateAttuned)) / (1000 * 60 * 60 * 24)) : 'Unknown';
                    
                    const familiarText = `**${actualIndex}. ${familiar.name}** (${familiar.species})\n` +
                        `> **🛡️ Warding Level:** \`${familiar.wardingLevel}/100\`\n` +
                        `> **📈 Current Efficiency:** \`${efficiency}%\`\n` +
                        `> **🌟 Overall Condition:** ${conditionEmoji}\n` +
                        `> **❤️ Bond:** \`${familiar.bond}%\` • **🏥 Health:** \`${familiar.health}%\` • **💧 Mana:** \`${familiar.mana}%\`\n` +
                        `> **✨ Essence Level:** \`${familiar.essence}%\`\n` +
                        `> **📅 Days Owned:** \`${daysSinceAttunement}\``;

                    familiarContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(familiarText)
                    );
                });

                components.push(familiarContainer);
                
                if (groupIndex < familiarGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **FAMILIAR COLLECTION STATISTICS**')
            );

            const totalWarding = profile.familiars.reduce((sum, familiar) => {
                const efficiency = (familiar.bond + familiar.health + familiar.mana) / 300;
                return sum + (familiar.wardingLevel * efficiency);
            }, 0);

            const averageCondition = profile.familiars.reduce((sum, familiar) => {
                return sum + ((familiar.bond + familiar.health + familiar.mana) / 3);
            }, 0) / profile.familiars.length;

            const averageBond = profile.familiars.reduce((sum, familiar) => sum + familiar.bond, 0) / profile.familiars.length;
            const averageHealth = profile.familiars.reduce((sum, familiar) => sum + familiar.health, 0) / profile.familiars.length;
            const averageMana = profile.familiars.reduce((sum, familiar) => sum + familiar.mana, 0) / profile.familiars.length;

            const familiarsNeedingCare = profile.familiars.filter(familiar => 
                familiar.bond < 70 || familiar.health < 70 || familiar.mana < 70 || familiar.essence < 30
            ).length;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Total Familiars:** \`${profile.familiars.length}/${profile.maxFamiliars}\`\n**🛡️ Total Warding:** \`${Math.floor(totalWarding)}\`\n**📊 Average Condition:** \`${averageCondition.toFixed(1)}%\`\n**💰 Full Care Cost:** \`175 Embers (all familiars)\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**❤️ Average Bond:** \`${averageBond.toFixed(1)}%\`\n**🏥 Average Health:** \`${averageHealth.toFixed(1)}%\`\n**💧 Average Mana:** \`${averageMana.toFixed(1)}%\`\n**⚠️ Familiars Needing Care:** \`${familiarsNeedingCare}\``)
            );

            components.push(statsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const careContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **FAMILIAR CARE MANAGEMENT**')
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💧 Mana:** \`!familiarcarerecharge <familiar_number>\` - Increases mana and health\n**✨ Essence:** \`!familiarcarecleanse <familiar_number>\` - Improves essence and bond\n**❤️ Bonding:** \`!familiarcarebond <familiar_number>\` - Boosts bond and loyalty\n**🌟 All Care:** \`!familiarcareall <familiar_number>\` - Complete care package\n**💰 Care All Familiars:** \`!familiarcareall 0\` - Care for every familiar at once`)
            );

            careContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 Care Tips:**\n> • Happy, healthy familiars provide better warding\n> • Regular care maintains peak efficiency\n> • Well-fed familiars are more loyal guardians\n> • Pure familiars contribute to stronghold power\n\n**🛒 Marketplace Items:** Purchase mana crystals and cleansing items from the premium marketplace!`)
            );

            components.push(careContainer);

            if (totalWarding > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const wardingContainer = new ContainerBuilder()
                    .setAccentColor(0x28A745);

                wardingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🛡️ **WARDING CONTRIBUTION**')
                );

                const maxPossibleWarding = profile.familiars.reduce((sum, familiar) => sum + familiar.wardingLevel, 0);
                const wardingEfficiency = ((totalWarding / maxPossibleWarding) * 100).toFixed(1);

                wardingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔒 Current Warding Level:** \`${Math.floor(totalWarding)}\`\n**📊 Warding Efficiency:** \`${wardingEfficiency}%\`\n**🏆 Maximum Potential:** \`${maxPossibleWarding}\`\n**💡 Improvement Potential:** \`+${Math.floor(maxPossibleWarding - totalWarding)}\` with better care\n\n> Your familiars are actively protecting your stronghold and deterring potential threats!`)
                );

                components.push(wardingContainer);
            }

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in familiars command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAMILIAR COLLECTION ERROR**\n\nSomething went wrong while viewing your familiar collection. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
