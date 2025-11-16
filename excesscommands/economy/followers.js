const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'followers',
    aliases: ['retinue'],
    description: 'View your followers and their status.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (!profile.followers || profile.followers.length === 0) {
                const components = [];

                const noFollowerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFollowerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ No Followers Yet\n## BUILD YOUR RETINUE\n\n> You don't have any followers to support your dominion!\n> Followers provide quest bonuses and unwavering support for your conquests.`)
                );

                components.push(noFollowerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏰 **HOW TO BUILD YOUR RETINUE**\n\n**Step 1:** Acquire a stronghold with follower capacity\n**Step 2:** Recruit followers through retinue management commands\n**Step 3:** Build loyalty through quests and boons\n**Step 4:** Enjoy enhanced quest earnings and a powerful retinue\n\n**💡 Benefits:**\n> • Enhanced quest income through follower support\n> • Loyalty that boosts quest efficiency\n> • Quests and shared victories\n> • Larger retinues with more power`)
                );

                components.push(solutionContainer);

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
                    .setContent(`# ⚔️ ${message.author.username}'s Retinue\n## YOUR LOYAL FOLLOWERS\n\n> Meet your followers who support your dominion with loyalty, strength, and dedication.\n> Strong follower loyalty leads to better quest performance and higher tribute.`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const followerGroups = [];
            for (let i = 0; i < profile.followers.length; i += 3) {
                followerGroups.push(profile.followers.slice(i, i + 3));
            }

            followerGroups.forEach((group, groupIndex) => {
                const memberContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC0CB);

                memberContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **FOLLOWERS ${groupIndex > 0 ? `(Continued)` : ''}**`)
                );

                group.forEach((follower, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const efficiency = (follower.loyalty / 100 * follower.questEfficiency * 100).toFixed(0);
                    const lastQuestText = follower.lastQuest ? 
                        new Date(follower.lastQuest).toLocaleDateString() : 'Never';
                    
                    const memberText = `**${actualIndex}. ${follower.name}** (${follower.role})\n` +
                        `> **⚔️ Class:** \`${follower.class}\`\n` +
                        `> **💰 Tribute:** \`${follower.tribute} Embers/quest\`\n` +
                        `> **❤️ Loyalty Level:** \`${follower.loyalty}%\`\n` +
                        `> **📈 Quest Efficiency:** \`${efficiency}%\`\n` +
                        `> **🗺️ Total Quests:** \`${follower.totalQuests}\`\n` +
                        `> **📅 Last Quest:** \`${lastQuestText}\``;

                    memberContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(memberText)
                    );
                });

                components.push(memberContainer);
                
                if (groupIndex < followerGroups.length - 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                }
            });

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **RETINUE STATISTICS**')
            );

            const totalIncome = profile.followers.reduce((sum, follower) => {
                return sum + (follower.tribute * follower.questEfficiency * (follower.loyalty / 100));
            }, 0);

            const averageLoyalty = profile.followers.length > 0 ? 
                profile.followers.reduce((sum, f) => sum + f.loyalty, 0) / profile.followers.length : 0;

            const totalQuests = profile.followers.reduce((sum, f) => sum + f.totalQuests, 0);

            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            const maxCapacity = primaryStronghold ? primaryStronghold.maxFollowers : 0;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Combined Quest Tribute:** \`${Math.floor(totalIncome).toLocaleString()} Embers/quest\`\n**❤️ Retinue Loyalty Average:** \`${averageLoyalty.toFixed(1)}%\`\n**👥 Retinue Size:** \`${profile.followers.length}/${maxCapacity} followers\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🗺️ Total Quests:** \`${totalQuests}\`\n**🏰 Stronghold Capacity:** \`${maxCapacity} followers max\`\n**📈 Quest Multiplier Impact:** \`${EconomyManager.calculateQuestMultiplier(profile).toFixed(2)}x\``)
            );

            components.push(statsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const loyaltyContainer = new ContainerBuilder()
                .setAccentColor(0xAD1457);

            loyaltyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **LOYALTY LEVEL ANALYSIS**')
            );

            const highLoyalty = profile.followers.filter(f => f.loyalty >= 80).length;
            const mediumLoyalty = profile.followers.filter(f => f.loyalty >= 50 && f.loyalty < 80).length;
            const lowLoyalty = profile.followers.filter(f => f.loyalty < 50).length;

            loyaltyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 High Loyalty (80%+):** \`${highLoyalty} followers\`\n**⭐ Medium Loyalty (50-79%):** \`${mediumLoyalty} followers\`\n**💔 Low Loyalty (<50%):** \`${lowLoyalty} followers\`\n\n**💡 Loyalty Impact:** Higher loyalty = better quest efficiency and tribute!`)
            );

            if (lowLoyalty > 0) {
                loyaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Improvement Tip:** Take your followers on quests to boost loyalty with members below 50%!`)
                );
            }

            components.push(loyaltyContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x8E24AA);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **RETINUE MANAGEMENT TIPS**\n\n**🗺️ Embark on Quests:** Use \`!quest\` to improve follower loyalty\n**💰 Quest Benefits:** Followers contribute to your quest earnings automatically\n**🏰 Expand:** Upgrade to larger strongholds to accommodate more followers\n**❤️ Build Loyalty:** Higher loyalty levels = better quest efficiency and tribute\n**📅 Regular Attention:** Consistent quests and boons maintain strong follower loyalty\n\n> A loyal retinue is a powerful retinue!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in followers command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FOLLOWER ERROR**\n\nSomething went wrong while retrieving your follower information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
