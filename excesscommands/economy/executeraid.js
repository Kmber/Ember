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
    name: 'executeraid',
    aliases: ['raid-execute', 'startraid'],
    description: 'Execute a planned raid.',
    usage: '!executeraid <raid_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];
                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Execute Raid\n## MISSING RAID ID\n\n> Specify the Raid ID to execute.\n> **Usage:** \`!executeraid <raid_id>\``)
                );
                components.push(usageContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const raidId = args[0];
            const raid = await Raid.findOne({ raidId: raidId, guildId: message.guild.id });
            
            if (!raid) {
                const components = [];
                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Not Found\n## INVALID RAID ID\n\n> Raid ID **\`${raidId}\`** does not exist or has concluded.`)
                );
                components.push(notFoundContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (raid.plannerUserId !== message.author.id) {
                const components = [];
                const notPlannerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                notPlannerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Unauthorized Execution\n## ONLY THE WARLORD CAN EXECUTE\n\n> Only the warlord who planned the raid can execute it.`)
                );
                components.push(notPlannerContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            if (raid.status !== 'ready') {
                const components = [];
                const notReadyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                notReadyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Not Ready\n## WARBAND NOT ASSEMBLED\n\n> The raid on **${raid.targetName}** is not ready. The warband is not yet fully assembled.\n> **Current Status:** \`${raid.status.toUpperCase()}\``)
                );
                components.push(notReadyContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const executionContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`The raid on **${raid.targetName}** is beginning... The warband is on the move...`)
                );

            const executionMsg = await message.reply({
                components: [executionContainer],
                flags: MessageFlags.IsComponentsV2
            });

            setTimeout(async () => {
                const assaultContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`The warband has reached the target. The assault has begun!`)
                    );
                await executionMsg.edit({ components: [assaultContainer] });
            }, 3000);

            setTimeout(async () => {
                raid.status = 'in_progress';
                await raid.save();
                
                const result = await EconomyManager.executeRaid(raidId);
                
                if (result.success) {
                    const memberPayouts = result.raid.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const roleMultiplier = { warlord: 1.5, arcanist: 1.3, scout: 1.2, vanguard: 1.1, sentinel: 1.0, berserker: 1.2 }[member.role] || 1.0;
                        const basePayout = Math.floor(result.raid.actual_payout / result.raid.members.length);
                        const finalPayout = Math.floor(basePayout * roleMultiplier);
                        return `**${member.username}** (${member.role}): \`${finalPayout.toLocaleString()} Embers\``;
                    }).join('\n');

                    const successEmbed = new ContainerBuilder()
                        .setAccentColor(0x4CAF50)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# 🎉 RAID SUCCESSFUL!\n## ${result.raid.targetName.toUpperCase()} PLUNDERED!\n\n> Your warband has achieved a glorious victory!\n\n**Total Plunder:** \`${result.raid.actual_payout.toLocaleString()} Embers\`\n\n**Warband's Share:**\n${memberPayouts}`)
                        );

                    await executionMsg.edit({ components: [successEmbed] });

                } else {
                     const memberPenalties = result.raid.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const shackledHours = RAID_TARGETS[result.raid.targetType].difficulty * 6;
                        const fine = Math.floor(profile.embers * 0.2);
                        return `**${member.username}** (${member.role}): Shackled for \`${shackledHours} hours\` and fined \`${fine.toLocaleString()} Embers\``;
                    }).join('\n');

                    const failureEmbed = new ContainerBuilder()
                        .setAccentColor(0xF44336)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# 🚨 RAID FAILED!\n## THE ASSAULT ON ${result.raid.targetName.toUpperCase()} HAS BEEN REPELLED!\n\n> Your warband was defeated and has scattered.\n\n**Consequences:**\n${memberPenalties}`)
                        );

                    await executionMsg.edit({ components: [failureEmbed] });
                }

                for (const member of result.raid.members) {
                    const profile = await EconomyManager.getProfile(member.userId, result.raid.guildId);
                    profile.activeRaids = profile.activeRaids.filter(id => id !== raidId);
                    await profile.save();
                }
                
            }, 6000);

        } catch (error) {
            console.error('Error in executeraid command:', error);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID EXECUTION FAILED**\n\nAn error occurred during the raid execution. The Seers are investigating.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};