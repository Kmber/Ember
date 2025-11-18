const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Raid } = require('../../models/economy/economy');
const { RAID_DUNGEONS } = require('../../models/economy/constants/guildData');

module.exports = {
    name: 'raid',
    aliases: ['raids'],
    description: 'View active raids and raid management with v2 components',
    usage: '!raid [status/history/leaderboard]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const action = args[0]?.toLowerCase();
            
            if (!action || action === 'status') {
              
                const activeRaids = await Raid.find({
                    raidId: { $in: profile.activeRaids },
                    guildId: message.guild.id,
                    status: { $in: ['planning', 'recruiting', 'ready'] }
                });
                
                const components = [];
                
                if (activeRaids.length === 0) {
                 
                    const noRaidsContainer = new ContainerBuilder()
                        .setAccentColor(0x607D8B);

                    noRaidsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚔️ No Active Raids\n## READY FOR ADVENTURE\n\n> You\'re not currently on any raids. Time to plan your next expedition!\n> The dungeons await your courage and strategic mind.`)
                    );

                    components.push(noRaidsContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                  
                    const startContainer = new ContainerBuilder()
                        .setAccentColor(0x3498DB);

                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📜 **GET STARTED WITH RAIDS**')
                    );

                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🆕 Plan a Raid:** \`!planraid\` - Organize your own expedition\n**🤝 Join Others:** \`!joinraid <id> <class>\` - Join existing raid parties\n**📚 Learn Classes:** Each raid needs warriors, mages, healers, and thieves\n**💡 Strategy:** Choose dungeons based on your skill level and threat`)
                    );

                    components.push(startContainer);

                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                 
                    const statsContainer = new ContainerBuilder()
                        .setAccentColor(0x9B59B6);

                    statsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📊 **YOUR ADVENTURER\'S LOG**')
                    );

                    const successRate = (profile.completedRaids + profile.failedRaids) > 0 ? 
                        Math.floor((profile.completedRaids / (profile.completedRaids + profile.failedRaids)) * 100) : 0;

                    statsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✅ Completed Raids:** \`${profile.completedRaids}\`\n**❌ Failed Raids:** \`${profile.failedRaids}\`\n**📈 Success Rate:** \`${successRate}%\`\n**🔥 Threat Level:** \`${profile.threatLevel}%\`\n**🎓 Raid Skill:** \`${profile.raidSkill}%\``)
                    );

               
                    if (profile.recoveryTime && profile.recoveryTime > new Date()) {
                        const hoursLeft = Math.ceil((profile.recoveryTime - new Date()) / (1000 * 60 * 60));
                        statsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🤕 Recovery Status:** \`${hoursLeft} hours remaining\`\n\n> You\'re currently recovering from your last adventure! Rest up before starting a new raid.`)
                        );
                    } else {
                        statsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**✨ Adventuring Status:** \`Ready for a new raid!\`\n\n> You\'re ready to plan and embark on new adventures!`)
                        );
                    }

                    components.push(statsContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                const activeHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                activeHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Active Raid Expeditions\n## DUNGEONS BEING EXPLORED\n\n> You\'re currently involved in **${activeRaids.length}** active raid${activeRaids.length !== 1 ? 's' : ''}!\n> Manage your expeditions carefully to ensure successful outcomes.`)
                );

                components.push(activeHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                activeRaids.forEach((raid, index) => {
                    const dungeon = RAID_DUNGEONS[raid.dungeonType];
                    const memberClass = raid.members.find(m => m.userId === message.author.id)?.class || 'Unknown';
                    const timeLeft = raid.plannedDate ? Math.max(0, Math.floor((raid.plannedDate - new Date()) / (1000 * 60 * 60))) : 0;
                    const individualReward = Math.floor(raid.potential_reward / raid.requiredMembers);

                    const raidContainer = new ContainerBuilder()
                        .setAccentColor(0xE91E63);

                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏰 **${raid.dungeonName}** (${raid.status.toUpperCase()})`)
                    );

                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎭 Your Class:** \`${memberClass}\`\n**👥 Party Status:** \`${raid.members.length}/${raid.requiredMembers} members\`\n**💰 Your Share:** \`$${individualReward.toLocaleString()}\`\n**🎯 Dungeon Type:** \`${raid.dungeonType}\`\n**🆔 Raid ID:** \`${raid.raidId}\``)
                    );

                    if (timeLeft > 0) {
                        raidContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**⏰ Time Until Ready:** \`${timeLeft} hours\`\n**📅 Planned Date:** \`${raid.plannedDate.toLocaleString()}\`\n\n> **Status:** Preparation phase - gathering gear and supplies`)
                        );
                    } else {
                        raidContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🚨 Status:** \`READY TO EMBARK!\`\n**⚡ Action Required:** Use \`!executeraid ${raid.raidId}\` to begin\n\n> **Alert:** Your party is ready - the dungeon awaits!`)
                        );
                    }

                    components.push(raidContainer);

                    if (index < activeRaids.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });

             
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x795548);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **ADVENTURER STATISTICS**\n\n**✅ Completed:** \`${profile.completedRaids}\` • **❌ Failed:** \`${profile.failedRaids}\`\n**🔥 Threat Level:** \`${profile.threatLevel}%\` • **🎓 Skill:** \`${profile.raidSkill}%\`\n\n> Higher skill and lower threat improve your success chances!`)
                );

                components.push(statsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'history') {
                const completedRaids = await Raid.find({
                    guildId: message.guild.id,
                    'members.userId': message.author.id,
                    status: { $in: ['completed', 'failed'] }
                }).sort({ executionDate: -1 }).limit(10);
                
                if (completedRaids.length === 0) {
                    const components = [];

                    const noHistoryContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noHistoryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 📜 No Raid History\n## A BLANK PARCHMENT\n\n> You haven\'t completed any raids yet! Your adventuring career is just beginning.\n> Start planning raids to build your reputation as a legendary adventurer.`)
                    );

                    components.push(noHistoryContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const components = [];

                
                const historyHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                historyHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📜 Raid History\n## YOUR ADVENTURING LEGACY\n\n> Here\'s your complete raid history showing all completed and failed expeditions.\n> Learn from past experiences to improve future success rates.`)
                );

                components.push(historyHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                
                const historyGroups = [];
                for (let i = 0; i < completedRaids.length; i += 4) {
                    historyGroups.push(completedRaids.slice(i, i + 4));
                }

                historyGroups.forEach((group, groupIndex) => {
                    const historyContainer = new ContainerBuilder()
                        .setAccentColor(0xAB47BC);

                    historyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📜 **RAID RECORDS ${groupIndex > 0 ? `(Continued)` : ''}**`)
                    );

                    const historyText = group.map(raid => {
                        const success = raid.status === 'completed';
                        const memberClass = raid.members.find(m => m.userId === message.author.id)?.class;
                        const outcome = success ? 
                            `✅ **SUCCESS** - Earned \`$${Math.floor(raid.actual_reward / raid.members.length).toLocaleString()}\`` :
                            `❌ **FAILED** - Recovery time and penalties`;
                        
                        return `**${raid.dungeonName}** (${memberClass})\n> ${outcome}\n> **Date:** \`${new Date(raid.executionDate).toLocaleDateString()}\``;
                    }).join('\n\n');

                    historyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(historyText)
                    );

                    components.push(historyContainer);

                    if (groupIndex < historyGroups.length - 1) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    }
                });

        
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const analysisContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                const successRate = profile.completedRaids > 0 ? 
                    Math.floor((profile.completedRaids / (profile.completedRaids + profile.failedRaids)) * 100) : 0;

                analysisContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📈 **PERFORMANCE ANALYSIS**\n\n**🎯 Success Rate:** \`${successRate}%\`\n**📊 Total Expeditions:** \`${profile.completedRaids + profile.failedRaids}\`\n**💰 Successful Raids:** \`${profile.completedRaids}\`\n**🚫 Failed Attempts:** \`${profile.failedRaids}\`\n\n**💡 Improvement Tips:** ${successRate < 70 ? 'Focus on skill building and threat management' : 'Excellent track record - keep up the strategic planning!'}`)
                );

                components.push(analysisContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (action === 'leaderboard') {
                const topPlayers = await EconomyManager.Economy.find({ guildId: message.guild.id })
                    .sort({ completedRaids: -1 })
                    .limit(15);
                    
                if (topPlayers.length === 0) {
                    const components = [];

                    const noDataContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noDataContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏆 No Raid Data\n## THE AGE OF HEROES AWAITS\n\n> No one has completed any raids yet! Be the first to become a legendary adventurer.\n> The leaderboard will track the most successful adventurers.`)
                    );

                    components.push(noDataContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const components = [];

           
                const leaderboardHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);

                leaderboardHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏆 Legendary Adventurers Leaderboard\n## TOP RAIDERS\n\n> These are the most successful adventurers in **${message.guild.name}**.\n> Their skills, success rates, and completed raids set the standard for all adventurers.`)
                );

                components.push(leaderboardHeaderContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const podiumContainer = new ContainerBuilder()
                    .setAccentColor(0xFFC107);

                podiumContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🥇 **TOP 3 LEGENDARY ADVENTURERS**')
                );

                const topThree = topPlayers.slice(0, 3);
                topThree.forEach((player, index) => {
                    const user = message.guild.members.cache.get(player.userId);
                    const username = user ? user.displayName : 'Unknown Adventurer';
                    const medal = ['🥇', '🥈', '🥉'][index];
                    const successRate = player.completedRaids > 0 ? 
                        Math.floor((player.completedRaids / (player.failedRaids + player.completedRaids)) * 100) : 0;

                    podiumContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${medal} **${username}**\n> **Completed:** \`${player.completedRaids}\` • **Success Rate:** \`${successRate}%\`\n> **Skill:** \`${player.raidSkill}%\` • **Threat:** \`${player.threatLevel}%\``)
                    );
                });

                components.push(podiumContainer);

          
                if (topPlayers.length > 3) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const remainingPlayers = topPlayers.slice(3);
                    const rankingGroups = [];
                    
                    for (let i = 0; i < remainingPlayers.length; i += 6) {
                        rankingGroups.push(remainingPlayers.slice(i, i + 6));
                    }

                    rankingGroups.forEach((group, groupIndex) => {
                        const rankingContainer = new ContainerBuilder()
                            .setAccentColor(0x95A5A6);

                        rankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🎯 **RANKINGS ${groupIndex === 0 ? '4-9' : '10-15'}**`)
                        );

                        const rankingText = group.map((player, index) => {
                            const actualRank = 4 + (groupIndex * 6) + index;
                            const user = message.guild.members.cache.get(player.userId);
                            const username = user ? user.displayName : 'Unknown Adventurer';
                            const successRate = player.completedRaids > 0 ? 
                                Math.floor((player.completedRaids / (player.failedRaids + player.completedRaids)) * 100) : 0;

                            return `**${actualRank}.** ${username}\n> **Raids:** \`${player.completedRaids}\` • **Rate:** \`${successRate}%\` • **Skill:** \`${player.raidSkill}%\``;
                        }).join('\n\n');

                        rankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(rankingText)
                        );

                        components.push(rankingContainer);

                        if (groupIndex < rankingGroups.length - 1) {
                            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                        }
                    });
                }

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

      
            const components = [];

            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            invalidContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid Raid Action\n## UNKNOWN COMMAND\n\n> **\`${action}\`** is not a valid raid action!\n> Choose from the available options below.`)
            );

            components.push(invalidContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const optionsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            optionsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚔️ **AVAILABLE RAID COMMANDS**\n\n**\`!raid\`** or **\`!raid status\`** - View your active raids\n**\`!raid history\`** - See your completed raid history\n**\`!raid leaderboard\`** - Check top adventurers\n\n**Additional Commands:**\n> • \`!planraid\` - Plan a new raid expedition\n> • \`!joinraid <id> <class>\` - Join an existing raid party`)
            );

            components.push(optionsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in raid command:', error);

       
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID SYSTEM ERROR**\n\nSomething went wrong while accessing raid information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
