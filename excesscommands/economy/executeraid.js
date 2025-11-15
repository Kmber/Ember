const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Heist } = require('../../models/economy/economy');
const { RAID_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'executeraid',
    aliases: ['raid-execute', 'startraid'],
    description: 'Execute a planned raid.',
    usage: '!executeraid <raid_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                return message.reply({ content: 'Please specify the raid ID.', flags: MessageFlags.IsComponentsV2 });
            }
            
            const raidId = args[0];
            const raid = await Heist.findOne({ heistId: raidId, guildId: message.guild.id });
            
            if (!raid) {
                return message.reply({ content: `Raid ID **${raidId}** not found.`, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (raid.plannerUserId !== message.author.id) {
                return message.reply({ content: 'Only the warlord who planned the raid can execute it.', flags: MessageFlags.IsComponentsV2 });
            }
            
            if (raid.status !== 'ready') {
                return message.reply({ content: `The raid on **${raid.targetName}** is not ready. The warband is not yet fully assembled.`, flags: MessageFlags.IsComponentsV2 });
            }
            
            const executionMsg = await message.reply({
                content: `The raid on **${raid.targetName}** is beginning... The warband is on the move...`,
                flags: MessageFlags.IsComponentsV2
            });

            setTimeout(async () => {
                await executionMsg.edit({ content: `The warband has reached the target. The assault has begun!` });
            }, 3000);

            setTimeout(async () => {
                raid.status = 'executing';
                await raid.save();
                
                const result = await EconomyManager.executeHeist(raidId);
                
                if (result.success) {
                    const memberPayouts = result.heist.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const roleMultiplier = { warlord: 1.5, arcanist: 1.3, scout: 1.2, vanguard: 1.1, sentinel: 1.0, berserker: 1.2 }[member.role] || 1.0;
                        const basePayout = Math.floor(result.heist.actual_payout / result.heist.members.length);
                        const finalPayout = Math.floor(basePayout * roleMultiplier);
                        return `**${member.username}** (${member.role}): \`${finalPayout.toLocaleString()} Embers\``;
                    }).join('\n');

                    const successEmbed = new ContainerBuilder()
                        .setAccentColor(0x4CAF50)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# 🎉 RAID SUCCESSFUL!\n## ${result.heist.targetName.toUpperCase()} PLUNDERED!\n\n> Your warband has achieved a glorious victory!\n\n**Total Plunder:** \`${result.heist.actual_payout.toLocaleString()} Embers\`\n\n**Warband's Share:**\n${memberPayouts}`)
                        );

                    await executionMsg.edit({ components: [successEmbed], content: '' });

                } else {
                     const memberPenalties = result.heist.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const shackledHours = RAID_TARGETS[result.heist.targetType].difficulty * 4;
                        const fine = Math.floor(profile.embers * 0.15);
                        return `**${member.username}** (${member.role}): Shackled for \`${shackledHours} hours\` and fined \`${fine.toLocaleString()} Embers\``;
                    }).join('\n');

                    const failureEmbed = new ContainerBuilder()
                        .setAccentColor(0xF44336)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# 🚨 RAID FAILED!\n## THE ASSAULT ON ${result.heist.targetName.toUpperCase()} HAS BEEN REPELLED!\n\n> Your warband was defeated and has scattered.\n\n**Consequences:**\n${memberPenalties}`)
                        );

                    await executionMsg.edit({ components: [failureEmbed], content: '' });
                }

                for (const member of result.heist.members) {
                    const profile = await EconomyManager.getProfile(member.userId, result.heist.guildId);
                    profile.activeHeists = profile.activeHeists.filter(id => id !== raidId);
                    await profile.save();
                }
                
            }, 6000);

        } catch (error) {
            console.error('Error in executeraid command:', error);
            return message.reply({ content: 'An error occurred during the raid execution.', flags: MessageFlags.IsComponentsV2 });
        }
    }
};