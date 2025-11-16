const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Raid } = require('../../models/economy/economy');
const { RAID_TARGETS, RAID_EQUIPMENT } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'planraid',
    aliases: ['raid-plan', 'newraid'],
    description: 'Plan a raid and recruit fellow warriors.',
    usage: '!planraid <target>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0xFF5722);
                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ⚔️ Available Raid Targets\n## FIELDS OF BATTLE AWAIT`)
                );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const targetsByDifficulty = {};
                Object.entries(RAID_TARGETS).forEach(([id, target]) => {
                    const difficulty = target.difficulty;
                    if (!targetsByDifficulty[difficulty]) targetsByDifficulty[difficulty] = [];
                    targetsByDifficulty[difficulty].push([id, target]);
                });

                Object.entries(targetsByDifficulty).sort(([a], [b]) => a - b).forEach(([difficulty, targets]) => {
                    const difficultyContainer = new ContainerBuilder().setAccentColor(getDifficultyColor(parseInt(difficulty)));
                    difficultyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## ${getDifficultyEmoji(parseInt(difficulty))} **DIFFICULTY ${difficulty}/5 TARGETS**`)
                    );

                    targets.forEach(([id, target]) => {
                        const payoutRange = `${target.payout[0].toLocaleString()}-${target.payout[1].toLocaleString()} Embers`;
                        const targetText = `**\`${id}\`** - ${target.name}\n` +
                            `> **💰 Plunder:** \`${payoutRange}\`\n` +
                            `> **👥 Warband Size:** \`${target.requiredMembers} warriors\`\n` +
                            `> **🎯 Base Success:** \`${target.successChance}%\`\n` +
                            `> **⏳ Planning Time:** \`${target.planningTime} hours\`\n` +
                            `> **🎭 Required Roles:** ${target.requiredRoles.join(', ')}`;
                        difficultyContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(targetText));
                    });
                    components.push(difficultyContainer);
                });

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const targetType = args[0].toLowerCase();
            const targetData = RAID_TARGETS[targetType];
            
            if (!targetData) {
                const components = [];
                const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                errorContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ **INVALID TARGET**\n\n> The specified target does not exist.'));
                components.push(errorContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.shackledUntil && profile.shackledUntil > new Date()) {
                const components = [];
                const shackledContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                shackledContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⛓️ **SHACKLED**\n\n> You cannot plan a raid while you are shackled.'));
                components.push(shackledContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (profile.heatLevel < targetData.minHeatLevel) {
                const components = [];
                const infamyContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                infamyContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🔥 **INSUFFICIENT INFAMY**\n\n> Your infamy is too low to attempt this raid. You need at least \`${targetData.minHeatLevel}%\` infamy.`));
                components.push(infamyContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const existingRaid = await Raid.findOne({
                plannerUserId: message.author.id,
                guildId: message.guild.id,
                status: { $in: ['recruiting', 'ready'] }
            });

            if (existingRaid) {
                const components = [];
                const existingContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                existingContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚔️ **ALREADY PLANNING**\n\n> You are already planning a raid.'));
                components.push(existingContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const equipmentCost = targetData.equipment.reduce((sum, item) => sum + RAID_EQUIPMENT[item].cost, 0);

            if (profile.embers < equipmentCost) {
                const components = [];
                const fundsContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                fundsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 💰 **INSUFFICIENT FUNDS**\n\n> You cannot afford the equipment for this raid. You need \`${equipmentCost.toLocaleString()} Embers\`.`));
                components.push(fundsContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const raidId = `raid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const raid = new Raid({
                raidId: raidId,
                guildId: message.guild.id,
                plannerUserId: message.author.id,
                targetType,
                targetName: targetData.name,
                difficulty: targetData.difficulty,
                requiredMembers: targetData.requiredMembers,
                members: [{
                    userId: message.author.id,
                    username: message.author.username,
                    role: 'warlord',
                    confirmed: true,
                    joinedAt: new Date()
                }],
                plannedDate: new Date(Date.now() + targetData.planningTime * 60 * 60 * 1000),
                status: 'recruiting',
                potential_payout: Math.floor((targetData.payout[0] + targetData.payout[1]) / 2),
                success_chance: targetData.successChance,
                heat_level: profile.heatLevel,
                equipment_cost: equipmentCost,
                dateCreated: new Date()
            });
            
            await raid.save();
            
            profile.embers -= equipmentCost;
            profile.activeRaids = profile.activeRaids || [];
            profile.activeRaids.push(raidId);
            profile.transactions.push({
                type: 'expense',
                amount: equipmentCost,
                description: `Raid equipment for ${targetData.name}`,
                category: 'raid_planning'
            });
            
            await profile.save();
            
            const components = [];
            const successContainer = new ContainerBuilder().setAccentColor(0xFF5722);
            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ⚔️ Raid Planned!\n## THE ${targetData.name.toUpperCase()} CAMPAIGN BEGINS!`)
            );
            components.push(successContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder().setAccentColor(0xE91E63);
            detailsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📋 **RAID DETAILS**'));
            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**🎯 Target:** \`${targetData.name}\`\n**🆔 Raid ID:** \`${raidId}\`\n**⚡ Difficulty:** \`${targetData.difficulty}/5\`\n**💰 Plunder:** \`${raid.potential_payout.toLocaleString()} Embers\`\n**📊 Success Chance:** \`${targetData.successChance}%\``)
            );
            components.push(detailsContainer);

            setTimeout(() => {
                const recruitmentComponents = [];
                const recruitmentContainer = new ContainerBuilder().setAccentColor(0xFF9800);
                recruitmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 📢 Warriors Wanted!\n## JOIN THE RAID ON ${targetData.name.toUpperCase()}!\n\n> **Warlord:** \`${message.author.username}\` is planning a raid!\n> **Plunder:** \`${raid.potential_payout.toLocaleString()} Embers\`\n> **Needed:** ${targetData.requiredMembers - 1} warriors\n> **Roles:** ${targetData.requiredRoles.filter(role => role !== 'warlord').join(', ')}\n\n**JOIN NOW:** \`!joinraid ${raidId} <your_role>\``)
                );
                recruitmentComponents.push(recruitmentContainer);
                message.channel.send({ components: recruitmentComponents, flags: MessageFlags.IsComponentsV2 });
            }, 2000);

            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in planraid command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ❌ **RAID PLANNING FAILED**\n\nAn error occurred. The Seers are investigating.'));
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};

function getDifficultyColor(difficulty) {
    const colors = { 1: 0x4CAF50, 2: 0x8BC34A, 3: 0xFF9800, 4: 0xFF5722, 5: 0xF44336 };
    return colors[difficulty] || 0x95A5A6;
}

function getDifficultyEmoji(difficulty) {
    const emojis = { 1: '🟢', 2: '🟡', 3: '🟠', 4: '🔴', 5: '⚫' };
    return emojis[difficulty] || '⚪';
}