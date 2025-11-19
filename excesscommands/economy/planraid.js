const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Raid } = require('../../models/economy/economy');
const { RAID_DUNGEONS, RAID_GEAR } = require('../../models/economy/constants/guildData');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'planraid',
    aliases: ['raid-plan', 'newraid'],
    description: 'Plan a raid and recruit party members .',
    usage: 'planraid <dungeon>',
    async execute(message, args) {
        try {
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;

            if (!args[0]) {
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Available Dungeons to Raid\n## ADVENTURES AWAIT\n\n> Choose your dungeon carefully! Each raid has different requirements, risks, and rewards.\n> Plan strategically to maximize your chances of success and minimize the threat.`)
                );

                components.push(headerContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const dungeonsByDifficulty = {};
                Object.entries(RAID_DUNGEONS).forEach(([id, dungeon]) => {
                    const difficulty = dungeon.difficulty;
                    if (!dungeonsByDifficulty[difficulty]) {
                        dungeonsByDifficulty[difficulty] = [];
                    }
                    dungeonsByDifficulty[difficulty].push([id, dungeon]);
                });

             
                Object.entries(dungeonsByDifficulty).sort(([a], [b]) => a - b).forEach(([difficulty, dungeons]) => {
                    const difficultyContainer = new ContainerBuilder()
                        .setAccentColor(getDifficultyColor(parseInt(difficulty)));

                    const difficultyEmoji = getDifficultyEmoji(parseInt(difficulty));
                    difficultyContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ${difficultyEmoji} **DIFFICULTY ${difficulty}/5 DUNGEONS**`)
                    );

                    dungeons.forEach(([id, dungeon]) => {
                        const payoutRange = `${dungeon.payout[0].toLocaleString()} Embers-${dungeon.payout[1].toLocaleString()} Embers`;
                        const dungeonText = `**\`${id}\`** - ${dungeon.name}\n` +
                            `> **💰 Reward Range:** \`${payoutRange}\`\n` +
                            `> **👥 Party Size:** \`${dungeon.requiredMembers} adventurers\`\n` +
                            `> **📊 Base Success:** \`${dungeon.successChance}%\`\n` +
                            `> **⏰ Planning Time:** \`${dungeon.planningTime} hours\`\n` +
                            `> **⚔️ Required Classes:** ${dungeon.requiredClasses.join(', ')}`;

                        difficultyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(dungeonText)
                        );
                    });

                    components.push(difficultyContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                });

            
                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **HOW TO PLAN A RAID**\n\n**Command:** \`${prefix}planraid <dungeon_id>\`\n**Example:** \`${prefix}planraid goblin_cave\`\n\n**💡 Planning Tips:**\n> • Start with lower difficulty dungeons to build experience\n> • Ensure you have enough funds for gear\n> • Check your threat level requirements\n> • Plan when you have time to recruit a full party\n> • Higher difficulty = higher rewards but more risk`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const dungeonType = args[0].toLowerCase();
            const dungeonData = RAID_DUNGEONS[dungeonType];
            
            if (!dungeonData) {
                const components = [];

                const invalidDungeonContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidDungeonContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Dungeon\n## UNRECOGNIZED DUNGEON\n\n> **\`${dungeonType}\`** is not a valid dungeon!\n> Choose from the available dungeons below.`)
                );

                components.push(invalidDungeonContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validDungeonsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const dungeonsList = Object.entries(RAID_DUNGEONS).map(([id, dungeon]) => 
                    `**\`${id}\`** - ${dungeon.name} (Difficulty ${dungeon.difficulty}/5)`
                ).join('\n');

                validDungeonsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **VALID DUNGEONS**\n\n${dungeonsList}\n\n**💡 Try:** \`${prefix}planraid ${Object.keys(RAID_DUNGEONS)[0]}\``)
                );

                components.push(validDungeonsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            
            if (profile.recoveryTime && profile.recoveryTime > new Date()) {
                const hoursLeft = Math.ceil((profile.recoveryTime - new Date()) / (1000 * 60 * 60));
                const components = [];

                const recoveryContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                recoveryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤕 Currently Recovering\n## RAID PLANNING RESTRICTED\n\n> You cannot plan raids while recovering!\n> **Remaining Recovery Time:** \`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}\``)
                );

                components.push(recoveryContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const releaseContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                releaseContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏰ **RECOVERY INFORMATION**\n\n**Expected Recovery Finish:** \`${profile.recoveryTime.toLocaleString()}\`\n**Dungeon of Interest:** \`${dungeonData.name}\`\n\n**💡 Use This Time:**\n> • Study dungeon layouts and monster weaknesses\n> • Network with potential party members\n> • Plan your post-recovery adventuring activities\n> • Build anticipation for your return to adventuring`)
                );

                components.push(releaseContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        
            if (profile.threatLevel < dungeonData.minThreatLevel) {
                const components = [];

                const threatRequirementContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                threatRequirementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🔥 Insufficient Adventurer Reputation\n## THREAT LEVEL TOO LOW\n\n> You need **${dungeonData.minThreatLevel}%** threat level to attempt **${dungeonData.name}**!\n> **Your Current Threat:** \`${profile.threatLevel}%\`\n> **Required Threat:** \`${dungeonData.minThreatLevel}%\``)
                );

                components.push(threatRequirementContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const buildThreatContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                buildThreatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **BUILD YOUR ADVENTURER REPUTATION**\n\n**💡 Ways to Increase Threat:**\n> • Complete smaller raids successfully\n> • Participate in adventuring activities\n> • Build your reputation in the realm\n> • Take risks with smaller dungeons first\n\n**⚔️ Alternative Dungeons:**\n> Look for raids with lower threat requirements\n> Build up gradually to major expeditions`)
                );

                components.push(buildThreatContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            const existingRaid = await Raid.findOne({
                plannerUserId: message.author.id,
                guildId: message.guild.id,
                status: { $in: ['planning', 'recruiting', 'ready'] }
            });
            
            if (existingRaid) {
                const components = [];

                const alreadyPlanningContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                alreadyPlanningContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Already Planning Expedition\n## EXISTING RAID IN PROGRESS\n\n> You\'re already leading the **${existingRaid.dungeonName}** raid!\n> **Current Status:** \`${existingRaid.status.toUpperCase()}\`\n> **Party Size:** \`${existingRaid.members.length}/${existingRaid.requiredMembers}\``)
                );

                components.push(alreadyPlanningContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const currentRaidContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                currentRaidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **CURRENT EXPEDITION STATUS**\n\n**⚔️ Dungeon:** \`${existingRaid.dungeonName}\`\n**🆔 Raid ID:** \`${existingRaid.raidId}\`\n**👥 Party Status:** \`${existingRaid.members.length}/${existingRaid.requiredMembers} adventurers\`\n**💰 Potential Reward:** \`${existingRaid.potential_reward.toLocaleString()} Embers\`\n\n**💡 Next Steps:**\n> • Use \`${prefix}raid\` to check detailed status\n> • Complete current expedition before planning new ones\n> • Focus on recruiting remaining party members`)
                );

                components.push(currentRaidContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
          
            const gearCost = dungeonData.gear.reduce((sum, item) => 
                sum + RAID_GEAR[item].cost, 0
            );
            
            if (profile.wallet < gearCost) {
                const components = [];

                const insufficientFundsContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientFundsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds for Gear\n## CANNOT AFFORD EXPEDITION COSTS\n\n> You need **\`${gearCost.toLocaleString()} Embers\`** for the required gear!\n> **Your Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n> **Shortage:** \`${(gearCost - profile.wallet).toLocaleString()} Embers\``)
                );

                components.push(insufficientFundsContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const gearBreakdownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                gearBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🛡️ **REQUIRED GEAR BREAKDOWN**')
                );

                const gearList = dungeonData.gear.map(item => {
                    const gear = RAID_GEAR[item];
                    return `**${gear.name}** - \`${gear.cost.toLocaleString()} Embers\`\n> ${gear.description}`;
                }).join('\n\n');

                gearBreakdownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${gearList}\n\n**💰 Total Cost:** \`${gearCost.toLocaleString()} Embers\`\n\n**💡 Earning Tips:** Work, complete dailies, or run guilds to raise funds for your expedition!`)
                );

                components.push(gearBreakdownContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            const raidId = `raid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const raid = new Raid({
                raidId,
                guildId: message.guild.id,
                plannerUserId: message.author.id,
                dungeonType,
                dungeonName: dungeonData.name,
                difficulty: dungeonData.difficulty,
                requiredMembers: dungeonData.requiredMembers,
                members: [{
                    userId: message.author.id,
                    username: message.author.username,
                    class: 'war lord',
                    confirmed: true,
                    gear: [],
                    joinedAt: new Date()
                }],
                plannedDate: new Date(Date.now() + dungeonData.planningTime * 60 * 60 * 1000),
                status: 'recruiting',
                potential_reward: Math.floor((dungeonData.payout[0] + dungeonData.payout[1]) / 2),
                success_chance: dungeonData.successChance,
                threat_level: profile.threatLevel,
                preparation_time: 0,
                gear_cost: gearCost,
                dateCreated: new Date()
            });
            
            await raid.save();
            
          
            profile.wallet -= gearCost;
            
        
            profile.activeRaids.push(raidId);
            
         
            profile.transactions.push({
                type: 'expense',
                amount: gearCost,
                description: `Raid gear for ${dungeonData.name}`,
                category: 'raid_planning'
            });
            
            await profile.save();
            
          
            const components = [];

          
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF5722);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ Raid Successfully Planned!\n## ${dungeonData.name.toUpperCase()} EXPEDITION INITIATED\n\n> Congratulations, leader! Your **${dungeonData.name}** raid is now recruiting adventurers.\n> The realm awaits your leadership in this daring expedition!`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📋 **EXPEDITION SPECIFICATIONS**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚔️ Dungeon:** \`${dungeonData.name}\`\n**🆔 Expedition ID:** \`${raidId}\`\n**⚡ Difficulty Level:** \`${dungeonData.difficulty}/5\`\n**💰 Potential Reward:** \`${raid.potential_reward.toLocaleString()} Embers\`\n**📊 Base Success Rate:** \`${dungeonData.successChance}%\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Required Party Size:** \`${dungeonData.requiredMembers} adventurers\`\n**⏰ Planning Duration:** \`${dungeonData.planningTime} hours\`\n**📅 Ready Date:** \`${raid.plannedDate.toLocaleString()}\`\n**💸 Gear Investment:** \`${gearCost.toLocaleString()} Embers\``)
            );

            components.push(detailsContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const teamContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👥 **PARTY RECRUITMENT STATUS**')
            );

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👑 Leader:** \`${message.author.username}\` (You)\n**⚔️ Required Classes:** ${dungeonData.requiredClasses.join(', ')}\n**👥 Current Party:** \`1/${dungeonData.requiredMembers} recruited\`\n**🎯 Still Needed:** \`${dungeonData.requiredMembers - 1} adventurers\``)
            );

            teamContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📢 Recruitment Command:** \`${prefix}joinraid ${raidId} <class>\`\n**💡 Share With Party:** Give potential members the raid ID\n**⏰ Recruitment Window:** Open until party is complete`)
            );

            components.push(teamContainer);

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const preparationContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            preparationContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **GEAR & PREPARATION**')
            );

            const gearList = dungeonData.gear.map(item => {
                const gear = RAID_GEAR[item];
                return `**${gear.name}** (\`${gear.cost.toLocaleString()} Embers\`)`;
            }).join(' • ');

            preparationContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**✅ Gear Acquired:** ${gearList}\n**💰 Total Investment:** \`${gearCost.toLocaleString()} Embers\`\n**📦 Gear Status:** Secured and ready for the expedition\n**🎯 Preparation Level:** Professional grade adventuring gear`)
            );

            components.push(preparationContainer);

            
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0x607D8B);

            nextStepsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⚔️ **NEXT STEPS FOR SUCCESS**\n\n**1. Recruit Your Party:** Share raid ID \`${raidId}\` with trusted adventurers\n**2. Assign Classes:** Ensure each required class is filled by capable adventurers\n**3. Plan Coordination:** Discuss strategy and timing with your party\n**4. Execute Expedition:** Use \`${prefix}executeraid ${raidId}\` when ready\n**💡 Leader Tips:**\n> • Choose party members with relevant skills\n> • Coordinate timing for maximum success\n> • Higher skilled party = better success chances\n> • Communication is key to raid success`)
            );

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        
            setTimeout(() => {
                const recruitmentComponents = [];

                const recruitmentContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                recruitmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📢 RAID RECRUITMENT OPEN\n## ${dungeonData.name.toUpperCase()} EXPEDITION\n\n> **Leader:** \`${message.author.username}\`\n> **Dungeon:** \`${dungeonData.name}\`\n> **Potential Reward:** \`${raid.potential_reward.toLocaleString()} Embers\`\n> **Difficulty:** \`${dungeonData.difficulty}/5\`\n\n**👥 SEEKING:** ${dungeonData.requiredMembers - 1} skilled adventurers\n**⚔️ CLASSES NEEDED:** ${dungeonData.requiredClasses.filter(role => role !== 'leader').join(', ')}\n\n**⚡ JOIN NOW:** \`${prefix}joinraid ${raidId} <your_class>\``)
                );

                recruitmentComponents.push(recruitmentContainer);

                message.channel.send({
                    components: recruitmentComponents,
                    flags: MessageFlags.IsComponentsV2
                });
            }, 2000);

        } catch (error) {
            console.error('Error in planraid command:', error);

           
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID PLANNING ERROR**\n\nSomething went wrong while planning your raid expedition. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};


function getDifficultyColor(difficulty) {
    const colors = {
        1: 0x4CAF50, 
        2: 0x8BC34A,  
        3: 0xFF9800, 
        4: 0xFF5722, 
        5: 0xF44336  
    };
    return colors[difficulty] || 0x95A5A6;
}

function getDifficultyEmoji(difficulty) {
    const emojis = {
        1: '🟢',
        2: '🟡',
        3: '🟠',
        4: '🔴',
        5: '⚫'
    };
    return emojis[difficulty] || '⚪';
}