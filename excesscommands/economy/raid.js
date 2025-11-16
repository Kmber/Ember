const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Raid } = require('../../models/economy/economy');
const { RAID_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'raid',
    aliases: ['raids', 'pillage'],
    description: 'View and manage active raids and your raiding history.',
    usage: '!raid [status/history/leaderboard]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const action = args[0]?.toLowerCase();
            
            if (!action || action === 'status') {
                const activeRaids = await Raid.find({
                    raidId: { $in: profile.activeRaids || [] },
                    guildId: message.guild.id,
                    status: { $in: ['recruiting', 'ready'] }
                });
                
                const components = [];
                
                if (activeRaids.length === 0) {
                    const noRaidsContainer = new ContainerBuilder()
                        .setAccentColor(0x607D8B);

                    noRaidsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚔️ No Active Raids\n## THE REALM IS QUIET... FOR NOW\n\n> You are not currently involved in any raids. It is time to plan your next conquest!`)
                    );
                    components.push(noRaidsContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const startContainer = new ContainerBuilder()
                        .setAccentColor(0x3498DB);
                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📜 **BECOME A LEGENDARY RAIDER**')
                    );
                    startContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**策划突袭 (Plan a Raid):** \`!planraid\` - Organize your own daring assault.\n**加入突袭 (Join a Raid):** \`!joinraid <id> <role>\` - Join a warband.\n**了解角色 (Learn Roles):** Every raid needs an Arcanist, Scout, Vanguard, and Sentinel.`)
                    );
                    components.push(startContainer);

                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                }

                const activeHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);
                activeHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Active Raids\n## YOUR CAMPAIGNS OF CONQUEST\n\n> You are involved in **${activeRaids.length}** active raid(s).`)
                );
                components.push(activeHeaderContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                activeRaids.forEach((raid, index) => {
                    const target = RAID_TARGETS[raid.targetType];
                    const memberRole = raid.members.find(m => m.userId === message.author.id)?.role || 'Unknown';
                    const individualPayout = Math.floor(raid.potential_payout / raid.requiredMembers);

                    const raidContainer = new ContainerBuilder()
                        .setAccentColor(0xE91E63);
                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🏰 **${raid.targetName}** (${raid.status.toUpperCase()})`)
                    );
                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎭 Your Role:** \`${memberRole}\`\n**👥 Warband:** \`${raid.members.length}/${raid.requiredMembers} members\`\n**💰 Your Share:** \`${individualPayout.toLocaleString()} Embers\`\n**🎯 Target Type:** \`${raid.targetType}\`\n**🆔 Raid ID:** \`${raid.raidId}\``)
                    );
                    if (raid.status === 'ready') {
                         raidContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🚨 Status:** \`READY TO EXECUTE!\`\n**⚡ Action:** Use \`!executeraid ${raid.raidId}\` to begin!`)
                        );
                    }
                    components.push(raidContainer);
                });

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
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
                            .setContent(`# 📜 No Raid History\n## A CLEAN SLATE\n\n> You have no raid history. Your legend is yet to be written.`)
                    );
                    components.push(noHistoryContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                }

                const components = [];
                const historyHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);
                historyHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📜 Chronicle of Plunder\n## YOUR LEGACY OF RAIDS`)
                );
                components.push(historyHeaderContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                completedRaids.forEach(raid => {
                    const success = raid.status === 'completed';
                    const memberRole = raid.members.find(m => m.userId === message.author.id)?.role;
                    const outcome = success ? 
                        `✅ **VICTORY** - Plundered \`${Math.floor(raid.actual_payout / raid.members.length).toLocaleString()} Embers\`` :
                        `❌ **DEFEAT** - Suffered losses and disgrace`;
                    
                    const raidContainer = new ContainerBuilder()
                        .setAccentColor(success ? 0x4CAF50 : 0xE74C3C);

                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**${raid.targetName}** (${memberRole})\n> ${outcome}\n> **Date:** \`${new Date(raid.executionDate).toLocaleDateString()}\``)
                    );
                    components.push(raidContainer);
                });

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (action === 'leaderboard') {
                const topRaiders = await EconomyManager.Economy.find({ guildId: message.guild.id })
                    .sort({ completedRaids: -1 })
                    .limit(10);
                    
                if (topRaiders.length === 0) {
                    const components = [];
                    const noDataContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);
                    noDataContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏆 No Legendary Raiders\n## THE HALLS OF LEGENDS ARE EMPTY\n\n> No one has yet ascended to the status of Legendary Raider. Be the first!`)
                    );
                    components.push(noDataContainer);
                    return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
                }

                const components = [];
                const leaderboardHeaderContainer = new ContainerBuilder()
                    .setAccentColor(0xFFD700);
                leaderboardHeaderContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏆 Legendary Raiders of ${message.guild.name}\n## THE MOST FEARED WARLORDS`)
                );
                components.push(leaderboardHeaderContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const topThree = topRaiders.slice(0, 3);
                topThree.forEach((raider, index) => {
                    const user = message.guild.members.cache.get(raider.userId);
                    const username = user ? user.displayName : 'An Unknown Warlord';
                    const medal = ['🥇', '🥈', '🥉'][index];
                    const successRate = raider.completedRaids > 0 ?
                        Math.floor((raider.completedRaids / (raider.completedRaids + raider.failedRaids)) * 100) : 0;

                    const raiderContainer = new ContainerBuilder()
                        .setAccentColor(0xFFC107);
                    raiderContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`${medal} **${username}**\n> **Raids:** \`${raider.completedRaids}\` • **Success:** \`${successRate}%\`\n> **Skill:** \`${raider.raidingSkill}%\` • **Infamy:** \`${raider.notoriety}%\``)
                    );
                    components.push(raiderContainer);
                });

                if (topRaiders.length > 3) {
                    const remainingRaiders = topRaiders.slice(3);
                    const rankingContainer = new ContainerBuilder()
                        .setAccentColor(0x95A5A6);

                    const rankingText = remainingRaiders.map((raider, index) => {
                        const actualRank = 4 + index;
                        const user = message.guild.members.cache.get(raider.userId);
                        const username = user ? user.displayName : 'An Unknown Raider';
                        return `**${actualRank}.** ${username} - Raids: \`${raider.completedRaids}\``;
                    }).join('\n');

                    rankingContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(rankingText)
                    );
                    components.push(rankingContainer);
                }

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const components = [];
            const invalidContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            invalidContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid Command\n## UNKNOWN ACTION\n\n> **\`${action}\`** is not a valid raid command. Use \`!raid status\`, \`!raid history\`, or \`!raid leaderboard\`.`)
            );
            components.push(invalidContainer);

            return message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in raid command:', error);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID SYSTEM OFFLINE**\n\nAn error occurred while accessing the raid system. The Seers are investigating.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};