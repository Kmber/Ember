const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'deeds',
    aliases: ['records', 'ledger'],
    description: 'View your chronicle of deeds and financial records with filtering options.',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;

            if (targetUser.id !== message.author.id && !message.member.permissions.has('Administrator')) {
                const components = [];
                const permissionContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                permissionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🚫 Access Denied\n## SCROLL IS SEALED\n\n> You can only view your own chronicle of deeds!\n> These records are magically sealed and private.`)
                );
                components.push(permissionContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);

            const filterType = args.find(arg => ['earnings', 'expenditures', 'tribute', 'investment', 'trade', 'races', 'pillage', 'guild_work', 'wagers', 'market'].includes(arg.toLowerCase()));
            const filterCategory = args.find(arg => ['guild', 'dungeon_raid', 'races', 'wagers', 'market', 'retinue', 'labor'].includes(arg.toLowerCase()));

            let deeds = [...(profile.transactions || [])];

            if (filterType) {
                deeds = deeds.filter(d => d.type === (filterType === 'earnings' ? 'income' : (filterType === 'expenditures' ? 'expense' : filterType.toLowerCase())));
            }

            if (filterCategory) {
                deeds = deeds.filter(d => d.category === filterCategory.toLowerCase());
            }

            deeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (deeds.length === 0) {
                const components = [];
                const noDeedsContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                noDeedsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 📜 No Deeds Found\n## EMPTY CHRONICLE\n\n> ${filterType || filterCategory ? 'No deeds match your filter criteria' : 'No deeds recorded in your chronicle yet'}!\n> Embark on adventures to forge your legacy.`)
                );
                components.push(noDeedsContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const itemsPerPage = 8;
            const totalPages = Math.ceil(deeds.length / itemsPerPage);
            let currentPage = 1;

            const pageArg = args.find(arg => !isNaN(arg) && parseInt(arg) > 0);
            if (pageArg) {
                currentPage = Math.min(parseInt(pageArg), totalPages);
            }

            const generatePageComponents = (page) => {
                const components = [];
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageDeeds = deeds.slice(start, end);

                const totalEarnings = deeds.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpenditures = deeds.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const netGain = totalEarnings - totalExpenditures;

                const headerContainer = new ContainerBuilder().setAccentColor(netGain >= 0 ? 0x4CAF50 : 0xF44336);
                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 📜 ${targetUser.username}\'s Chronicle of Deeds\n## A RECORD OF YOUR JOURNEY\n\n> **Page ${page} of ${totalPages}** | ${deeds.length} total deeds${filterType || filterCategory ? ' (filtered)' : ''}\n> A detailed account of your adventures and economic activities.`)
                );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const summaryContainer = new ContainerBuilder().setAccentColor(0x2196F3);
                summaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 📊 **LEDGER SUMMARY**')
                );
                const gainColor = netGain >= 0 ? '+' : '';
                summaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**💚 Total Earnings:** ${totalEarnings.toLocaleString()} Embers\n**💸 Total Expenditures:** ${totalExpenditures.toLocaleString()} Embers\n**📈 Net Gain/Loss:** ${gainColor}${netGain.toLocaleString()} Embers\n**📝 Deed Count:** ${deeds.length} records`)
                );
                components.push(summaryContainer);

                if (pageDeeds.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    const deedsContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
                    deedsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ✒️ **RECORDED DEEDS**'));
                    pageDeeds.forEach((deed) => {
                        const emoji = getDeedEmoji(deed.type, deed.category);
                        const sign = deed.type === 'income' ? '+' : '-';
                        const amount = `${sign}${deed.amount.toLocaleString()} Embers`;
                        const date = new Date(deed.timestamp).toLocaleDateString();
                        const description = deed.description || 'An undocumented deed';

                        const deedText = `${emoji} **${amount}** - ${description}\n` +
                            `> **Date:** \`${date}\`\n` +
                            `> **Type:** \`${deed.type === 'income' ? 'Earning' : 'Expenditure'}\`${deed.category ? ` • **Category:** \`${deed.category}\`` : ''}`;
                        deedsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(deedText));
                    });
                    components.push(deedsContainer);
                }


                if (totalPages > 1) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    const navigationContainer = new ContainerBuilder().setAccentColor(0x607D8B);
                    const navText = `## 📄 **SCROLL NAVIGATION**\n\n**Current Page:** ${page} of ${totalPages}\n\n**💡 Navigation:**\n> Use reactions to turn the pages of the chronicle.`;
                    navigationContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(navText));
                    components.push(navigationContainer);
                }

                return components;
            };

            const pageComponents = generatePageComponents(currentPage);

            const msg = await message.reply({
                components: pageComponents,
                flags: MessageFlags.IsComponentsV2
            });

            if (totalPages > 1) {
                await msg.react('⏮️');
                await msg.react('◀️');
                await msg.react('▶️');
                await msg.react('⏭️');
                await msg.react('❌');

                const reactionCollector = msg.createReactionCollector({
                    filter: (reaction, user) => ['⏮️', '◀️', '▶️', '⏭️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 300000
                });

                reactionCollector.on('collect', async (reaction, user) => {
                    await reaction.users.remove(user.id);
                    let newPage = currentPage;
                    switch (reaction.emoji.name) {
                        case '⏮️': newPage = 1; break;
                        case '◀️': newPage = Math.max(1, currentPage - 1); break;
                        case '▶️': newPage = Math.min(totalPages, currentPage + 1); break;
                        case '⏭️': newPage = totalPages; break;
                        case '❌':
                            reactionCollector.stop();
                            const closedContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
                            closedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📜 Chronicle Closed\n## SESSION ENDED\n\n> You have closed the chronicle.\n> Use \`!deeds\` to open it again.`));
                            await msg.edit({ components: [closedContainer], flags: MessageFlags.IsComponentsV2 });
                            return;
                    }

                    if (newPage !== currentPage) {
                        currentPage = newPage;
                        const newComponents = generatePageComponents(currentPage);
                        await msg.edit({ components: newComponents, flags: MessageFlags.IsComponentsV2 });
                    }
                });

                reactionCollector.on('end', () => {
                    if (!msg.deleted) {
                        msg.reactions.removeAll().catch(() => {});
                    }
                });
            }

        } catch (error) {
            console.error('Error in deeds command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **DEEDS ERROR**\n\nSomething went wrong while accessing your chronicle of deeds. The scrolls are temporarily unreadable.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};

function getDeedEmoji(type, category) {
    const emojiMap = {
        income: {
            guild: '🏰',
            dungeon_raid: '💰',
            races: '🐎',
            wagers: '🎲',
            labor: '⚒️',
            default: '💚'
        },
        expense: {
            market: '🛒',
            wagers: '🎲',
            dungeon_raid: '🛡️',
            familiar_care: '🐾',
            retinue: '👥',
            default: '💸'
        },
        tribute: '👑',
        investment: '📈',
        trade: '🤝',
        pillage: '🔓'
    };

    if (type === 'income' || type === 'expense') {
        return emojiMap[type][category] || emojiMap[type].default;
    }

    return emojiMap[type] || '📜';
}