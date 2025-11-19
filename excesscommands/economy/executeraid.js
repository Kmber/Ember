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
    name: 'executeraid',
    aliases: ['raid-execute', 'startraid'],
    description: 'Execute a planned raid with v2 components',
    usage: '!executeraid <raid_id>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Execute Raid Expedition\n## MISSING RAID IDENTIFIER\n\n> Please specify the raid ID to begin the expedition!\n> **Usage:** \`!executeraid <raid_id>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **EXECUTION REQUIREMENTS**\n\n**🆔 Raid ID:** Find this in your active raids (\`!raid\`)\n**👑 Authority:** Only the raid planner can execute\n**👥 Party Status:** All party members must be recruited\n**⏰ Timing:** Execute when the party is ready\n\n**Example:** \`!executeraid ABC123\`\n\n**⚠️ Warning:** Once executed, there\'s no turning back! `)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const raidId = args[0];
            const raid = await Raid.findOne({ raidId, guildId: message.guild.id });
            
            if (!raid) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Expedition Not Found\n## INVALID EXPEDITION ID\n\n> Raid ID **\`${raidId}\`** doesn\'t exist or has been completed!\n> Verify the raid identifier and try again.`)
                );

                components.push(notFoundContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔍 **FIND YOUR ACTIVE RAIDS**\n\n**Check Status:** Use \`!raid\` to see your active expeditions\n**Verify ID:** Copy the exact raid ID from your active list\n**Case Sensitive:** Raid IDs must match exactly\n\n**💡 Alternatives:**\n> • Check if the raid has already been executed\n> • Verify you\'re in the correct server\n> • Plan a new raid with \`!planraid\``)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (raid.plannerUserId !== message.author.id) {
                const components = [];

                const unauthorizedContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                const planner = message.guild.members.cache.get(raid.plannerUserId);
                const plannerName = planner ? planner.displayName : 'Unknown';

                unauthorizedContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Unauthorized Execution\n## INSUFFICIENT AUTHORITY\n\n> Only the raid planner can execute this expedition!\n> **Raid Planner:** \`${plannerName}\`\n> **Your Role:** Party member`)
                );

                components.push(unauthorizedContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const hierarchyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                hierarchyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👑 **RAID HIERARCHY**\n\n**⚔️ Dungeon:** \`${raid.dungeonName}\`\n**👑 Leader:** \`${plannerName}\`\n**🛡️ Your Class:** \`${raid.members.find(m => m.userId === message.author.id)?.class || 'Unknown'}\`\n\n**💡 Chain of Command:**\n> • Only the planner has execution authority\n> • Party members await orders from the leader\n> • Contact the planner to request execution\n> • Trust the chain of command for success`)
                );

                components.push(hierarchyContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (raid.status !== 'ready') {
                const components = [];

                const notReadyContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                notReadyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏳ Raid Not Ready for Execution\n## PARTY ASSEMBLY INCOMPLETE\n\n> The **${raid.dungeonName}** raid cannot be executed yet!\n> **Current Status:** \`${raid.status.toUpperCase()}\``)
                );

                components.push(notReadyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const requirementsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const dungeonData = RAID_DUNGEONS[raid.dungeonType];
                const currentMemberClasses = raid.members.map(m => m.class);
                const missingClasses = dungeonData.requiredClasses.filter(role => !currentMemberClasses.includes(role));

                requirementsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📋 **EXECUTION REQUIREMENTS**')
                );

                requirementsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**👥 Party Status:** \`${raid.members.length}/${raid.requiredMembers} members recruited\`\n**⚔️ Dungeon:** \`${raid.dungeonName}\`\n**📊 Required Party Size:** \`${raid.requiredMembers} adventurers\``)
                );

                if (missingClasses.length > 0) {
                    requirementsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🔍 Missing Classes:** \`${missingClasses.join(', ')}\`\n\n**⚡ Next Steps:**\n> • Recruit adventurers for missing classes\n> • Share the raid ID with potential party members\n> • Use recruitment channels to find talent\n> • Wait for full party assembly before execution`)
                    );
                } else {
                    requirementsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✅ All Classes Filled:** Party complete!\n**⚠️ Status Issue:** Check raid coordination\n\n**💡 Troubleshooting:**\n> • Verify all members are confirmed\n> • Check if planning phase is complete\n> • Contact support if issues persist`)
                    );
                }

                components.push(requirementsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const dungeonData = RAID_DUNGEONS[raid.dungeonType];
            
          
            const components = [];

            const executionContainer = new ContainerBuilder()
                .setAccentColor(0xFF0000);

            executionContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ RAID EXECUTION INITIATED\n## ${raid.dungeonName.toUpperCase()} EXPEDITION\n\n> The raid expedition is now beginning...\n> All party members are moving into position...\n\n**⏳ PHASE 1:** Party deployment in progress...`)
            );

            components.push(executionContainer);

            const executionMsg = await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
          
            setTimeout(async () => {
                const phase2Components = [];

                const phase2Container = new ContainerBuilder()
                    .setAccentColor(0xFF3D00);

                phase2Container.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ RAID IN PROGRESS\n## ${raid.dungeonName.toUpperCase()} EXPEDITION\n\n> The expedition is proceeding according to plan...\n\n**✅ PHASE 1:** Party successfully deployed\n**⏳ PHASE 2:** Navigating the dungeon...\n**⚔️ STATUS:** Encountering minions...`)
                );

                phase2Components.push(phase2Container);

                await executionMsg.edit({
                    components: phase2Components,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 3000);
            
         
            setTimeout(async () => {
                const phase3Components = [];

                const phase3Container = new ContainerBuilder()
                    .setAccentColor(0xFF6D00);

                phase3Container.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ RAID IN PROGRESS\n## ${raid.dungeonName.toUpperCase()} EXPEDITION\n\n> Critical phase - confronting the final boss...\n\n**✅ PHASE 1:** Party deployed successfully\n**✅ PHASE 2:** Minions defeated\n**⏳ PHASE 3:** Engaging the dungeon boss...\n**🎯 STATUS:** Final battle in progress...`)
                );

                phase3Components.push(phase3Container);

                await executionMsg.edit({
                    components: phase3Components,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 6000);
            
            
            setTimeout(async () => {
                raid.status = 'in_progress';
                await raid.save();
                
                const result = await EconomyManager.executeRaid(raidId);
                const resultComponents = [];
                
                if (result.success) {
                  
                    const successContainer = new ContainerBuilder()
                        .setAccentColor(0x4CAF50);

                    successContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🎉 RAID SUCCESSFUL!\n## ${result.raid.dungeonName.toUpperCase()} COMPLETELY CONQUERED\n\n> **EXPEDITION COMPLETE:** Your party has executed the perfect raid!\n> The dungeon has been successfully cleared and the treasure secured!`)
                    );

                    resultComponents.push(successContainer);

                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                  
                    const financialContainer = new ContainerBuilder()
                        .setAccentColor(0x27AE60);

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 💰 **FINANCIAL RESULTS**')
                    );

                    const memberPayouts = result.raid.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const classMultiplier = {
                            leader: 1.5,
                            mage: 1.3,
                            warrior: 1.2,
                            ranger: 1.1,
                            cleric: 1.0,
                            paladin: 1.0,
                            thief: 1.0
                        }[member.class] || 1.0;
                        
                        const basePayout = Math.floor(result.raid.actual_reward / result.raid.members.length);
                        const finalPayout = Math.floor(basePayout * classMultiplier);
                        
                        return `**${member.username}** (${member.class})\n> **Base Share:** \`${basePayout.toLocaleString()} Embers\`\n> **Class Bonus:** \`${((classMultiplier - 1) * 100).toFixed(0)}%\`\n> **Final Reward:** \`${finalPayout.toLocaleString()} Embers\``;
                    }).join('\n\n');

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🏆 Total Raid Treasure:** \`${result.raid.actual_reward.toLocaleString()} Embers\`\n**📊 Success Probability:** \`${Math.floor(await EconomyManager.calculateRaidSuccess(result.raid, result.memberProfiles))}%\`\n**👥 Party Size:** \`${result.raid.members.length} adventurers\``)
                    );

                    financialContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💎 PARTY REWARDS:**\n\n${memberPayouts}`)
                    );

                    resultComponents.push(financialContainer);

               
                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const consequencesContainer = new ContainerBuilder()
                        .setAccentColor(0xFF9800);

                    consequencesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ⚠️ **EXPEDITION CONSEQUENCES**\n\n**🔥 Threat Level Impact:** All party members\' threat levels have increased\n**🏰 Realm Security:** Heightened monster activity in the area\n**⏰ Laying Low:** Recommended to avoid high-threat dungeons\n**📈 Adventurer Reputation:** Your party\'s notoriety has grown\n\n**💡 Strategic Advice:** Use your earnings wisely and plan your next adventures carefully!`)
                    );

                    resultComponents.push(consequencesContainer);

                } else {
                  
                    const failureContainer = new ContainerBuilder()
                        .setAccentColor(0xF44336);

                    failureContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🚨 RAID FAILED!\n## ${result.raid.dungeonName.toUpperCase()} EXPEDITION COMPROMISED\n\n> **EXPEDITION FAILED:** Your party has been defeated!\n> The dungeon\'s monsters proved too powerful and your party was overwhelmed!`)
                    );

                    resultComponents.push(failureContainer);

                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                   
                    const penaltiesContainer = new ContainerBuilder()
                        .setAccentColor(0xD32F2F);

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 🤕 **ADVENTURER PENALTIES**')
                    );

                    const memberPenalties = result.raid.members.map(member => {
                        const profile = result.memberProfiles.find(p => p.userId === member.userId);
                        const recoveryHours = dungeonData.difficulty * 6;
                        const fine = Math.floor(profile.wallet * 0.2);
                        
                        return `**${member.username}** (${member.class})\n> **Recovery Time:** \`${recoveryHours} hours\`\n> **Penalty:** \`${fine.toLocaleString()} Embers\`\n> **Status:** Recovering`;
                    }).join('\n\n');

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💸 Total Financial Loss:** No reward - all supplies lost\n**⏰ Average Recovery Time:** \`${dungeonData.difficulty * 6} hours\`\n**📊 Failure Probability:** \`${100 - Math.floor(await EconomyManager.calculateRaidSuccess(result.raid, result.memberProfiles))}%\``)
                    );

                    penaltiesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🤕 PARTY PENALTIES:**\n\n${memberPenalties}`)
                    );

                    resultComponents.push(penaltiesContainer);

              
                    resultComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const severeContainer = new ContainerBuilder()
                        .setAccentColor(0xB71C1C);

                    severeContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚨 **SEVERE CONSEQUENCES**\n\n**🔥 Threat Levels:** Massively increased for all party members\n**🏰 Monster Infestation:** The realm is now more dangerous\n**📜 Record of Failure:** Failure recorded in the adventurer\'s chronicle\n**⏰ Recovery Time:** Extended period required before next major expedition\n\n**💔 Learn From Failure:** Study what went wrong to improve future raid planning!`)
                    );

                    resultComponents.push(severeContainer);
                }

                await executionMsg.edit({
                    components: resultComponents,
                    flags: MessageFlags.IsComponentsV2
                });
                
             
                for (const member of result.raid.members) {
                    const profile = await EconomyManager.getProfile(member.userId, result.raid.guildId);
                    profile.activeRaids = profile.activeRaids.filter(id => id !== raidId);
                    await profile.save();
                }
                
            }, 9000);

        } catch (error) {
            console.error('Error in executeraid command:', error);

          
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID EXECUTION ERROR**\n\nSomething went wrong during raid execution. The expedition has been aborted for safety.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};