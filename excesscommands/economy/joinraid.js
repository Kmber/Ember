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
    name: 'joinraid',
    aliases: ['raid-join'],
    description: 'Join a planned raid.',
    usage: '!joinraid <raid_id> <role>',
    async execute(message, args) {
        try {
            if (!args[0] || !args[1]) {
                const components = [];
                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Join a Warband\n## MISSING INFORMATION\n\n> Specify the Raid ID and your desired role.\n> **Usage:** \`!joinraid <raid_id> <role>\``)
                );
                components.push(usageContainer);
                // ... (add more role info if you want)
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const raidId = args[0];
            const role = args[1]?.toLowerCase();
            const validRoles = ['arcanist', 'scout', 'vanguard', 'sentinel', 'berserker'];
            
            if (!role || !validRoles.includes(role)) {
                const components = [];
                const invalidRoleContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                invalidRoleContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Role\n## UNRECOGNIZED WARRIOR ARCHETYPE\n\n> **\`${role || 'none'}\`** is not a valid role for a raid.`)
                );
                components.push(invalidRoleContainer);
                 components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validRolesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validRolesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **VALID RAIDING ROLES**\n\n**\`arcanist\`** - Arcane support and disruption\n**\`scout\`** - Reconnaissance and infiltration\n**\`vanguard\`** - Frontline assault and defense\n**\`sentinel\`** - Defensive specialist and rearguard\n**\`berserker\`** - High-damage melee combatant`)
                );

                components.push(validRolesContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
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
            
            if (raid.status !== 'recruiting') {
                const components = [];
                const notRecruitingContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                notRecruitingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Not Recruiting\n## THE WARBAND IS CLOSED\n\n> The raid on **${raid.targetName}** is not recruiting.\n> **Current Status:** \`${raid.status.toUpperCase()}\``)
                );
                components.push(notRecruitingContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.shackledUntil && profile.shackledUntil > new Date()) {
                const hoursLeft = Math.ceil((profile.shackledUntil - new Date()) / (1000 * 60 * 60));
                const components = [];
                const shackledContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                shackledContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⛓️ Shackled\n## BOUND BY LAW\n\n> You are shackled and cannot join a raid.\n> **Time Remaining:** \`${hoursLeft} hour(s)\``)
                );
                components.push(shackledContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (raid.members.some(m => m.userId === message.author.id)) {
                const components = [];
                const alreadyMemberContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                const currentRole = raid.members.find(m => m.userId === message.author.id)?.role;
                alreadyMemberContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🛡️ Already in the Warband\n## YOUR AXE IS PLEDGED\n\n> You are already part of the raid on **${raid.targetName}**.\n> **Your Role:** \`${currentRole}\``)
                );
                components.push(alreadyMemberContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (raid.members.some(m => m.role === role)) {
                const components = [];
                const roleTakenContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                roleTakenContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎭 Role Already Taken\n## POSITION FILLED\n\n> The **${role}** role is already taken.`)
                );
                components.push(roleTakenContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const targetData = RAID_TARGETS[raid.targetType];
            
            if (!targetData.requiredRoles.includes(role)) {
                const components = [];
                const roleNotRequiredContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                roleNotRequiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Role Not Required\n## UNNECESSARY SPECIALIZATION\n\n> The raid on **${raid.targetName}** does not require a **${role}**.`)
                );
                components.push(roleNotRequiredContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (raid.members.length >= raid.requiredMembers) {
                const components = [];
                const fullTeamContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                fullTeamContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Warband Full\n## NO MORE ROOM\n\n> The warband for the raid on **${raid.targetName}** is full.`)
                );
                components.push(fullTeamContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            raid.members.push({
                userId: message.author.id,
                username: message.author.username,
                role,
                confirmed: true,
                joinedAt: new Date()
            });
            
            const wasReady = raid.status === 'ready';
            if (raid.members.length === raid.requiredMembers) {
                raid.status = 'ready';
            }
            
            await raid.save();
            
            profile.activeRaids = profile.activeRaids || [];
            profile.activeRaids.push(raidId);
            await profile.save();
            
            const components = [];
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);
            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ Successfully Joined the Warband!\n## TO GLORY AND PLUNDER!\n\n> You have joined the raid on **${raid.targetName}** as a **${role}**!`)
            );
            components.push(successContainer);
             components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const roleContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            roleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🎭 **YOUR ASSIGNMENT**')
            );

            const individualPayout = Math.floor(raid.potential_payout / raid.requiredMembers);
            roleContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Target:** \`${raid.targetName}\`\n**🎭 Your Role:** \`${role}\`\n**👥 Warband:** \`${raid.members.length}/${raid.requiredMembers} members\`\n**💰 Your Share:** \`${individualPayout.toLocaleString()} Embers\`\n**🆔 Raid ID:** \`${raidId}\``)
            );

            components.push(roleContainer);

            if (raid.status === 'ready' && !wasReady) {
                const readyNotification = new ContainerBuilder()
                    .setAccentColor(0xFF5722);
                readyNotification.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ WARBAND ASSEMBLED!\n## THE RAID ON ${raid.targetName.toUpperCase()} IS IMMINENT!\n\n> The warband is complete. Prepare for battle!\n> **Execute Command:** \`!executeraid ${raidId}\``)
                );
                message.channel.send({ components: [readyNotification], flags: MessageFlags.IsComponentsV2 });
            }


            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in joinraid command:', error);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FAILED TO JOIN RAID**\n\nAn error occurred. The Seers are investigating the cause.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};