const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'myroles',
    aliases: ['titles', 'mytitles'],
    description: 'View your purchased lordly titles with v2 components',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const now = new Date();
            const activeTitles = profile.purchasedRoles.filter(role => 
                !role.expiryDate || new Date(role.expiryDate) > now
            );
            
            const expiredTitles = profile.purchasedRoles.filter(role => 
                role.expiryDate && new Date(role.expiryDate) <= now
            );
            
            if (activeTitles.length === 0 && expiredTitles.length === 0) {
                const components = [];

                const noTitlesContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noTitlesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👑 No Lordly Titles Found\n## FORGE YOUR LEGACY\n\n> You have not earned any lordly titles yet! Titles provide significant advantages in your dark journey.\n> Unlock enhanced power, bonuses, and exclusive benefits with these honors.`)
                );

                components.push(noTitlesContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const purchaseContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                purchaseContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏆 **ACQUIRE YOUR FIRST TITLE**\n\n**Step 1:** Use \`!buyrole\` to see available lordly titles\n**Step 2:** Choose a title that fits your ambition and power\n**Step 3:** Enjoy enhanced earnings and exclusive benefits\n**Step 4:** Stack multiple titles for maximum dominion!\n\n**💡 Benefits of Lordly Titles:**\n> • Enhanced quest earnings with multipliers\n> • Conquest bonuses for competitive advantage\n> • Warding boosts against pillaging\n> • Retinue bonuses for follower management\n> • Exclusive status and recognition`)
                );

                components.push(purchaseContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(activeTitles.length > 0 ? 0xFFD700 : 0x808080);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 👑 ${message.author.username}\'s Lordly Titles\n## YOUR EXCLUSIVE HONORS\n\n> Welcome to your collection of titles! These honors provide valuable bonuses and enhance your dominion.\n> ${activeTitles.length > 0 ? `You have ${activeTitles.length} active title${activeTitles.length !== 1 ? 's' : ''} empowering you!` : 'All your honors have faded - time to reclaim your glory!'}`)
            );

            components.push(headerContainer);

            if (activeTitles.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const activeContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                activeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🟢 **ACTIVE LORDLY TITLES**')
                );

                activeTitles.forEach((role, index) => {
                    const daysLeft = role.expiryDate ? 
                        Math.ceil((new Date(role.expiryDate) - now) / (1000 * 60 * 60 * 24)) : 
                        'Eternal';

                    const timeLeftText = typeof daysLeft === 'number' ? 
                        daysLeft > 0 ? `${daysLeft} days remaining` : 'Fades today!' :
                        daysLeft;

                    const purchaseDate = role.datePurchased ? 
                        new Date(role.datePurchased).toLocaleDateString() : 'Unknown';

                    const roleText = `**${index + 1}. ${role.roleName}**\n` +
                        `> **⏰ Status:** \`${timeLeftText}\`\n` +
                        `> **📜 Quest Multiplier:** \`${role.benefits.workMultiplier}x\` bonus\n` +
                        `> **⚔️ Conquest Bonus:** \`+${role.benefits.racingBonus} Souls\` per win\n` +
                        `> **🛡️ Warding Bonus:** \`+${role.benefits.robberyProtection}%\` protection\n` +
                        `> **👥 Retinue Bonus:** \`+${role.benefits.familyBonus}\` multiplier\n` +
                        `> **💰 Price:** \`${role.price?.toLocaleString() || 'Unknown'} Souls\`\n` +
                        `> **📅 Bestowed:** \`${purchaseDate}\``;

                    activeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(roleText)
                    );
                });

                components.push(activeContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const benefitsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **COMBINED POWERS ACTIVE**')
                );

                const totalQuestMultiplier = activeTitles.reduce((sum, role) => 
                    sum + (role.benefits.workMultiplier - 1), 0) + 1;
                const totalConquestBonus = activeTitles.reduce((sum, role) => 
                    sum + role.benefits.racingBonus, 0);
                const totalWardingBonus = activeTitles.reduce((sum, role) => 
                    sum + role.benefits.robberyProtection, 0);
                const totalRetinueBonus = activeTitles.reduce((sum, role) => 
                    sum + role.benefits.familyBonus, 0);

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📜 Total Quest Multiplier:** \`${totalQuestMultiplier.toFixed(2)}x\` (${((totalQuestMultiplier - 1) * 100).toFixed(0)}% bonus)\n**⚔️ Total Conquest Bonus:** \`+${totalConquestBonus} Souls\` per conquest win\n**🛡️ Total Warding Bonus:** \`+${totalWardingBonus}%\` pillage protection\n**👥 Total Retinue Bonus:** \`+${totalRetinueBonus}\` retinue multiplier`)
                );

                benefitsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Power Status:** Your titles are actively enhancing every aspect of your dominion!\n\n> These bonuses are applied automatically to all relevant activities.`)
                );

                components.push(benefitsContainer);
            }

            if (expiredTitles.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const expiredContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                expiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🔴 **FADED HONORS**')
                );

                const recentExpired = expiredTitles.slice(-3);
                recentExpired.forEach((role, index) => {
                    const expiredDate = role.expiryDate ? 
                        new Date(role.expiryDate).toLocaleDateString() : 'Unknown';

                    const expiredText = `**${index + 1}. ${role.roleName}** (Faded)\n` +
                        `> **📅 Faded On:** \`${expiredDate}\`\n` +
                        `> **💡 Status:** Powers no longer active`;

                    expiredContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(expiredText)
                    );
                });

                if (expiredTitles.length > 3) {
                    expiredContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${expiredTitles.length - 3} more faded honors*`)
                    );
                }

                expiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🔄 Reclaim Glory:** Use \`!buyrole\` to acquire new titles and restore your power!`)
                );

                components.push(expiredContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💡 **TITLE MANAGEMENT TIPS**')
            );

            if (activeTitles.length > 0) {
                const soonToExpire = activeTitles.filter(role => {
                    if (!role.expiryDate) return false;
                    const daysLeft = Math.ceil((new Date(role.expiryDate) - now) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 3;
                });

                if (soonToExpire.length > 0) {
                    managementContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⚠️ FADING ALERT:** ${soonToExpire.length} title${soonToExpire.length !== 1 ? 's' : ''} fading soon!\n**🔄 Action Needed:** Consider renewing to maintain your power.`)
                    );
                }

                managementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🛒 Expand Collection:** Use \`!buyrole\` to acquire more titles\n**📊 Monitor Powers:** Your titles are actively boosting your might\n**💰 ROI Tracking:** Lordly titles typically pay for themselves quickly\n**⏰ Renewal Planning:** Plan renewals before expiration to avoid power gaps`)
                );
            } else {
                managementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Rebuild Your Collection:** All your honors have faded\n**💡 Strategic Restart:** Choose titles that align with your current ambitions\n**📈 Compounding Powers:** Multiple titles stack for maximum advantage\n**🔄 Fresh Start:** Use your experience to make wiser choices`)
                );
            }

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in myroles command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **TITLE COLLECTION ERROR**\n\nSomething went wrong while retrieving your lordly titles. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
