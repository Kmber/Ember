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
    aliases: ['flw'],
    description: 'View your followers and their status .',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.followers.length === 0) {
                const components = [];

                const noFollowersContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noFollowersContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⛪ No Followers Yet\n## BUILD YOUR CONGREGATION\n\n> You have no followers to support your dark ascent!\n> Followers provide ritual bonuses and strengthen your influence.`)
                );

                components.push(noFollowersContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⛪ **HOW TO BUILD YOUR CONGREGATION**\n\n**Step 1:** Acquire a Citadel with follower capacity (\`!acquirecitadel\`)\n**Step 2:** Recruit followers through recruitment commands (\`!addfollower\`)\n**Step 3:** Build allegiance through dark rituals and activities\n**Step 4:** Enjoy enhanced earnings and power\n\n**💡 Benefits:**\n> • Enhanced work income through follower support\n> • Dark allegiance that boosts productivity\n> • Unholy rituals and shared experiences\n> • Larger citadels with more capacity`)
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
                    .setContent(`# ⛪ ${message.author.username}'s Followers\n## YOUR DEVOTED CONGREGATION\n\n> Meet your followers who support your dark ascent with devotion, labor, and dedication.\n> Strong follower allegiance leads to better performance and higher earnings.`)
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

                group.forEach((member, index) => {
                    const actualIndex = groupIndex * 3 + index + 1;
                    const efficiency = (member.allegiance / 100 * member.workEfficiency * 100).toFixed(0);
                    const lastRitualText = member.lastRitual ? 
                        new Date(member.lastRitual).toLocaleDateString() : 'Never';
                    
                    const memberText = `**${actualIndex}. ${member.name}** (${member.profession})\n` +
                        `> **📜 Role:** \`${member.profession}\`\n` +
                        `> **💰 Tithe:** \`${member.salary} Embers/work\`\n` +
                        `> **🖤 Allegiance Level:** \`${member.allegiance}%\`\n` +
                        `> **📈 Work Efficiency:** \`${efficiency}%\`\n` +
                        `> **💀 Total Rituals:** \`${member.totalRituals}\`\n` +
                        `> **📅 Last Ritual:** \`${lastRitualText}\``;

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
                    .setContent('## 📊 **CONGREGATION STATISTICS**')
            );

      
            const totalIncome = profile.followers.reduce((sum, member) => {
                return sum + (member.salary * member.workEfficiency * (member.allegiance / 100));
            }, 0);

            const totalRituals = profile.followers.reduce((sum, m) => sum + m.totalRituals, 0);

            const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
            const maxCapacity = primaryCitadel ? primaryCitadel.maxFollowers : 0;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Combined Work Tithe:** \`${Math.floor(totalIncome).toLocaleString()} Embers/work\`\n**🖤 Follower Allegiance Average:** \`${profile.followerAllegiance}%\`\n**👥 Congregation Size:** \`${profile.followers.length}/${maxCapacity} followers\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💀 Total Follower Rituals:** \`${totalRituals}\`\n**🏰 Citadel Capacity:** \`${maxCapacity} followers max\`\n**📈 Work Multiplier Impact:** \`${EconomyManager.calculateWorkMultiplier(profile).toFixed(2)}x\``)
            );

            components.push(statsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const allegianceContainer = new ContainerBuilder()
                .setAccentColor(0xAD1457);

            allegianceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🖤 **ALLEGIANCE LEVEL ANALYSIS**')
            );

      
            const highAllegiance = profile.followers.filter(m => m.allegiance >= 80).length;
            const mediumAllegiance = profile.followers.filter(m => m.allegiance >= 50 && m.allegiance < 80).length;
            const lowAllegiance = profile.followers.filter(m => m.allegiance < 50).length;

            allegianceContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 High Allegiance (80%+):** \`${highAllegiance} followers\`\n**⭐ Medium Allegiance (50-79%):** \`${mediumAllegiance} followers\`\n**💔 Low Allegiance (<50%):** \`${lowAllegiance} followers\`\n\n**💡 Allegiance Impact:** Higher allegiance = better work efficiency and income!`)
            );

            if (lowAllegiance > 0) {
                allegianceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Improvement Tip:** Perform rituals to boost allegiance with followers below 50%!`)
                );
            }

            components.push(allegianceContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x8E24AA);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **CONGREGATION MANAGEMENT TIPS**\n\n**💀 Perform Rituals:** Use \`!ritual\` to improve follower allegiance and relationships\n**💼 Work Benefits:** Followers contribute to your work earnings automatically\n**🏰 Expand Citadel:** Upgrade to larger citadels with more follower capacity (\`!acquirecitadel\`)\n**❤️ Build Allegiance:** Higher allegiance levels = better work efficiency and income\n**📅 Regular Indoctrination:** Consistent rituals and attention maintain strong follower relationships\n\n> A devoted congregation is a productive congregation!`)
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