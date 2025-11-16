const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { Economy } = require('../../models/economy/economy');

module.exports = {
    name: 'annals',
    aliases: ['lb', 'top', 'legends'],
    description: 'View the Annals of the Realm, showcasing the most powerful and influential adventurers.',
    usage: '!annals [wealth|renown|conquests|allegiance]',
    async execute(message, args) {
        try {
            const type = args[0]?.toLowerCase() || 'wealth';
            const validTypes = ['wealth', 'renown', 'conquests', 'allegiance'];
            
            if (!validTypes.includes(type)) {
                const components = [];
                const invalidTypeContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                invalidTypeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ❌ Invalid Chronicle Category\n## PLEASE SELECT A VALID ANNALS\n\n> **\`${type}\`** is not a valid category!\n> Choose from the available chronicles below.`)
                );
                components.push(invalidTypeContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const typesContainer = new ContainerBuilder().setAccentColor(0x3498DB);
                typesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 🏆 **AVAILABLE ANNALS**\n\n**💰 \`wealth\`** - Total wealth (Embers, Treasury, Guild Coffers)\n**⭐ \`renown\`** - Adventurer levels and experience\n**⚔️ \`conquests\`** - Campaign victories and success rates\n**👥 \`allegiance\`** - Retinue loyalty and size\n\n**Example:** \`!annals wealth\``)
                );
                components.push(typesContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            let leaderboardData = [];
            let title = '';
            let emoji = '';
            let description = '';

            switch (type) {
                case 'wealth':
                    leaderboardData = await Economy.aggregate([
                        { $match: { guildId: message.guild.id } },
                        { $addFields: { totalWealth: { $add: ['$embers', '$treasury', '$guild_coffers'] } } },
                        { $sort: { totalWealth: -1 } },
                        { $limit: 15 }
                    ]);
                    title = 'Lords of Wealth';
                    emoji = '💰';
                    description = 'The most affluent adventurers by total wealth (Embers, Treasury, and Guild Coffers)';
                    break;
                case 'renown':
                    leaderboardData = await Economy.find({ guildId: message.guild.id }).sort({ level: -1, experience: -1 }).limit(15);
                    title = 'Legends of Renown';
                    emoji = '⭐';
                    description = 'The most legendary adventurers by level and experience';
                    break;
                case 'conquests':
                    leaderboardData = await Economy.find({ guildId: message.guild.id }).sort({ 'campaignStats.wins': -1 }).limit(15);
                    title = 'Warlords of Conquest';
                    emoji = '⚔️';
                    description = 'The most dominant warlords by successful campaigns';
                    break;
                case 'allegiance':
                    leaderboardData = await Economy.find({ guildId: message.guild.id, 'followers.0': { $exists: true } }).sort({ followerLoyalty: -1 }).limit(15);
                    title = 'Masters of Allegiance';
                    emoji = '👥';
                    description = 'The most influential leaders by retinue loyalty and size';
                    break;
            }

            if (!leaderboardData || leaderboardData.length === 0) {
                const components = [];
                const noDataContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                noDataContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📊 No Entries in the Annals\n## THIS CHRONICLE IS YET TO BE WRITTEN\n\n> No data found for the **${type}** annals!\n> Be the first to carve your name into history!`));
                components.push(noDataContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const components = [];
            const headerContainer = new ContainerBuilder().setAccentColor(0xFFD700);
            headerContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${emoji} ${title}\n## THE ANNALS OF ${message.guild.name.toUpperCase()}\n\n> ${description}\n> Honoring the most legendary figures of our realm!`));
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const podiumContainer = new ContainerBuilder().setAccentColor(0xFFC107);
            podiumContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏆 **INNER CIRCLE**'));
            const topThree = leaderboardData.slice(0, 3);
            topThree.forEach((profile, index) => {
                const user = message.guild.members.cache.get(profile.userId);
                const username = user ? user.displayName : 'A mysterious figure';
                const medal = ['🥇', '🥈', '🥉'][index];
                let valueText = '';
                switch (type) {
                    case 'wealth': valueText = `${(profile.totalWealth || 0).toLocaleString()} Embers`; break;
                    case 'renown': valueText = `Level ${profile.level} (${profile.experience} XP)`; break;
                    case 'conquests':
                        const totalCampaigns = profile.campaignStats.totalCampaigns || 0;
                        const winRate = totalCampaigns > 0 ? ((profile.campaignStats.wins / totalCampaigns) * 100).toFixed(1) : '0.0';
                        valueText = `${profile.campaignStats.wins} victories (${winRate}% success)`;
                        break;
                    case 'allegiance': valueText = `${profile.followerLoyalty}% loyalty (${profile.followers.length} followers)`; break;
                }
                podiumContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${medal} **${username}**\n> ${valueText}`));
            });
            components.push(podiumContainer);

            if (leaderboardData.length > 3) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const remainingData = leaderboardData.slice(3);
                const rankingContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
                rankingContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📜 **CHRONICLES OF HEROES (4-15)**'));
                const rankingText = remainingData.map((profile, index) => {
                    const actualRank = 4 + index;
                    const user = message.guild.members.cache.get(profile.userId);
                    const username = user ? user.displayName : 'A mysterious figure';
                    let valueText = '';
                    switch (type) {
                        case 'wealth': valueText = `${(profile.totalWealth || 0).toLocaleString()} Embers`; break;
                        case 'renown': valueText = `Level ${profile.level} (${profile.experience} XP)`; break;
                        case 'conquests':
                             const totalCampaigns = profile.campaignStats.totalCampaigns || 0;
                             const winRate = totalCampaigns > 0 ? ((profile.campaignStats.wins / totalCampaigns) * 100).toFixed(1) : '0.0';
                             valueText = `${profile.campaignStats.wins} victories (${winRate}% success)`;
                             break;
                        case 'allegiance': valueText = `${profile.followerLoyalty}% loyalty (${profile.followers.length} followers)`; break;
                    }
                    return `**${actualRank}.** ${username}\n> ${valueText}`;
                }).join('\n\n');
                rankingContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(rankingText));
                components.push(rankingContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            const statsContainer = new ContainerBuilder().setAccentColor(0x17A2B8);
            statsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📈 **ANNALS STATISTICS**'));
            let statsText = '';
            switch (type) {
                case 'wealth':
                    const totalWealth = leaderboardData.reduce((sum, p) => sum + (p.totalWealth || 0), 0);
                    statsText = `**💰 Combined Wealth of Legends:** ${totalWealth.toLocaleString()} Embers`;
                    break;
                case 'renown':
                    const averageLevel = leaderboardData.reduce((sum, p) => sum + p.level, 0) / leaderboardData.length;
                    statsText = `**⭐ Average Renown Level:** ${averageLevel.toFixed(1)}`;
                    break;
                case 'conquests':
                    const totalWins = leaderboardData.reduce((sum, p) => sum + p.campaignStats.wins, 0);
                    statsText = `**⚔️ Total Campaigns Won:** ${totalWins}`;
                    break;
                case 'allegiance':
                    const averageLoyalty = leaderboardData.reduce((sum, p) => sum + p.followerLoyalty, 0) / leaderboardData.length;
                    statsText = `**❤️ Average Retinue Loyalty:** ${averageLoyalty.toFixed(1)}%`;
                    break;
            }
            statsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${statsText}\n**📅 Annals Last Scribed:** ${new Date().toLocaleString()}`));
            components.push(statsContainer);

            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in annals command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ **ANNALS ERROR**\n\nSomething went wrong while transcribing the annals. The histories are momentarily lost.'));
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};