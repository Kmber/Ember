const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager, Raid } = require('../../models/economy/economy');
const { RAID_DUNGEONS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'joinraid',
    aliases: ['raid-join'],
    description: 'Join a planned raid with v2 components',
    usage: '!joinraid <raid_id> <class>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤝 Join Raid Party\n## MISSING REQUIRED INFORMATION\n\n> Please specify the raid ID and your desired class!\n> **Usage:** \`!joinraid <raid_id> <class>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const classesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                classesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚔️ **AVAILABLE ADVENTURER CLASSES**')
                );

                classesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🛡️ \`warrior\`** - Front-line combatant, high defense\n**🧙 \`mage\`** - Powerful elemental spellcaster\n**🏹 \`ranger\`** - Ranged combat expert and survivalist\n**⛪ \`cleric\`** - Healer and support spellcaster\n**⚔️ \`paladin\`** - Holy warrior with defensive and offensive capabilities`)
                );

                classesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Examples:**\n> \`!joinraid ABC123 warrior\`\n> \`!joinraid DEF456 mage\`\n\n**💡 Tip:** Choose a class that matches your skills and the raid requirements!`)
                );

                components.push(classesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const raidId = args[0];
            const playerClass = args[1]?.toLowerCase();
            
            if (!playerClass || !['warrior', 'mage', 'thief', 'cleric', 'paladin', 'ranger', 'dragon_slayer', 'archmage', 'master_thief', 'high_cleric'].includes(playerClass)) {
                const components = [];

                const invalidClassContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidClassContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Adventurer Class\n## UNRECOGNIZED SPECIALIZATION\n\n> **\`${playerClass || 'none'}\`** is not a valid adventurer class!\n> Each party member must have a specific specialization.`)
                );

                components.push(invalidClassContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validClassesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validClassesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **VALID ADVENTURER CLASSES**\n\n**🛡️ \`warrior\`** - Melee combat specialist\n**🧙 \`mage\`** - Master of arcane arts\n**🏹 \`ranger\`** - Expert tracker and archer\n**⛪ \`cleric\`** - Divine healer and protector\n**⚔️ \`paladin\`** - Holy knight of justice\n**🔪 \`thief\`** - Stealth and lockpicking expert\n\n**💡 Try:** \`!joinraid ${raidId} warrior\``)
                );

                components.push(validClassesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const raid = await Raid.findOne({ raidId, guildId: message.guild.id });
            if (!raid) {
                const components = [];

                const notFoundContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                notFoundContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Not Found\n## INVALID RAID IDENTIFIER\n\n> Raid ID **\`${raidId}\`** doesn\'t exist or has been completed!\n> Double-check the raid ID and try again.`)
                );

                components.push(notFoundContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🔍 **FIND ACTIVE RAIDS**\n\n**Check Available Raids:** Use \`!raid\` to see your active expeditions\n**Browse All Raids:** Look for raids in recruiting status\n**Plan New Raid:** Use \`!planraid\` to start your own expedition\n\n**💡 Tip:** Raid IDs are case-sensitive - copy them exactly!`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (raid.status !== 'recruiting') {
                const components = [];

                const notRecruitingContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                notRecruitingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Raid Not Recruiting\n## PARTY ASSEMBLY CLOSED\n\n> The **${raid.dungeonName}** raid is not currently recruiting new members!\n> **Current Status:** \`${raid.status.toUpperCase()}\``)
                );

                components.push(notRecruitingContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                let statusMessage = '';
                switch (raid.status) {
                    case 'planning':
                        statusMessage = '**Planning Phase:** The raid is still being organized\n**Wait:** Check back later when recruitment opens';
                        break;
                    case 'ready':
                        statusMessage = '**Ready to Embark:** The party is complete and preparing\n**Too Late:** No more slots available';
                        break;
                    case 'in_progress':
                        statusMessage = '**In Progress:** The raid is currently being executed\n**Missed Opportunity:** Wait for the next raid';
                        break;
                    case 'completed':
                        statusMessage = '**Completed:** This raid has been successfully finished\n**New Opportunities:** Look for other active raids';
                        break;
                    case 'failed':
                        statusMessage = '**Failed:** This raid expedition has failed\n**Learn:** Study what went wrong for future planning';
                        break;
                    default:
                        statusMessage = '**Unknown Status:** Contact a moderator for assistance';
                }

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📊 **RAID STATUS DETAILS**\n\n${statusMessage}\n\n**💡 Alternative:** Use \`!planraid\` to organize your own adventuring party!`)
                );

                components.push(statusContainer);

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
                        .setContent(`# 🤕 Currently Recovering\n## REST AND RECUPERATE\n\n> You\'re currently recovering and cannot participate in new adventures!\n> **Time Remaining:** \`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}\``)
                );

                components.push(recoveryContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const waitContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                waitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⏰ **RECOVERY INFORMATION**\n\n**Expected Recovery:** \`${profile.recoveryTime.toLocaleString()}\`\n**Current Time:** \`${new Date().toLocaleString()}\`\n\n**💡 While You Wait:**\n> • Plan your next adventure strategy\n> • Study successful raid techniques\n> • Network with other adventurers\n> • Prepare for your return to the dungeons`)
                );

                components.push(waitContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
     
            if (raid.members.some(m => m.userId === message.author.id)) {
                const components = [];

                const alreadyMemberContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                const currentClass = raid.members.find(m => m.userId === message.author.id)?.class;

                alreadyMemberContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤝 Already Party Member\n## DUPLICATE MEMBERSHIP\n\n> You\'re already part of the **${raid.dungeonName}** raid party!\n> **Your Current Class:** \`${currentClass}\``)
                );

                components.push(alreadyMemberContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statusContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                statusContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **YOUR RAID STATUS**\n\n**Dungeon:** \`${raid.dungeonName}\`\n**Class:** \`${currentClass}\`\n**Party Status:** \`${raid.members.length}/${raid.requiredMembers} members\`\n**Expected Share:** \`$${Math.floor(raid.potential_reward / raid.requiredMembers).toLocaleString()}\`\n\n**💡 Next Steps:** Use \`!raid\` to check when the expedition is ready to begin!`)
                );

                components.push(statusContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
          
            if (raid.members.some(m => m.class === playerClass)) {
                const components = [];

                const classTakenContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                const existingMember = raid.members.find(m => m.class === playerClass);
                classTakenContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🛡️ Class Already Assigned\n## POSITION OCCUPIED\n\n> The **${playerClass}** class is already taken by another party member!\n> **Current ${playerClass.charAt(0).toUpperCase() + playerClass.slice(1)}:** \`${existingMember?.username || 'Unknown'}\``)
                );

                components.push(classTakenContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const availableClassesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const dungeonData = RAID_DUNGEONS[raid.dungeonType];
                const takenClasses = raid.members.map(m => m.class);
                const availableClasses = dungeonData.requiredClasses.filter(r => !takenClasses.includes(r));

                if (availableClasses.length > 0) {
                    availableClassesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## ⚔️ **AVAILABLE CLASSES**\n\n${availableClasses.map(r => `**${r.charAt(0).toUpperCase() + r.slice(1)}** - \`!joinraid ${raidId} ${r}\``).join('\n')}\n\n**💡 Quick Join:** Choose an available class to secure your spot!`)
                    );
                } else {
                    availableClassesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚫 **NO CLASSES AVAILABLE**\n\nAll required classes for this raid have been filled.\n**Party Status:** \`${raid.members.length}/${raid.requiredMembers} members\`\n\n**💡 Alternative:** Look for other raids that are recruiting or plan your own expedition!`)
                    );
                }

                components.push(availableClassesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const dungeonData = RAID_DUNGEONS[raid.dungeonType];
            
          
            if (!dungeonData.requiredClasses.includes(playerClass)) {
                const components = [];

                const classNotRequiredContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                classNotRequiredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Class Not Required\n## SPECIALIZATION NOT NEEDED\n\n> The **${raid.dungeonName}** raid doesn\'t require a **${playerClass}**!\n> This dungeon has different challenges.`)
                );

                components.push(classNotRequiredContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const requiredClassesContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                const takenClasses = raid.members.map(m => m.class);
                const requiredClassesList = dungeonData.requiredClasses.map(r => {
                    const status = takenClasses.includes(r) ? '✅ Filled' : '🔓 Available';
                    return `**${r.charAt(0).toUpperCase() + r.slice(1)}:** ${status}`;
                }).join('\n');

                requiredClassesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **REQUIRED CLASSES FOR ${raid.dungeonName.toUpperCase()}**\n\n${requiredClassesList}\n\n**💡 Choose Available:** Join with a class this raid actually needs!`)
                );

                components.push(requiredClassesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
         
            if (raid.members.length >= raid.requiredMembers) {
                const components = [];

                const fullPartyContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                fullPartyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Raid Party Full\n## MAXIMUM PARTY SIZE REACHED\n\n> The **${raid.dungeonName}** raid party is already at maximum capacity!\n> **Party Status:** \`${raid.members.length}/${raid.requiredMembers} members\``)
                );

                components.push(fullPartyContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const partyRosterContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                const currentParty = raid.members.map((member, index) => 
                    `**${index + 1}.** ${member.username} (${member.class})`
                ).join('\n');

                partyRosterContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛡️ **CURRENT PARTY ROSTER**\n\n${currentParty}\n\n**💡 Alternatives:**\n> • Look for other raids that are recruiting\n> • Use \`!planraid\` to organize your own expedition\n> • Wait for new raids to be planned`)
                );

                components.push(partyRosterContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
      
            raid.members.push({
                userId: message.author.id,
                username: message.author.username,
                class: playerClass,
                confirmed: true,
                gear: [],
                joinedAt: new Date()
            });
            
        
            const wasReady = raid.status === 'ready';
            if (raid.members.length === raid.requiredMembers) {
                raid.status = 'ready';
            }
            
            await raid.save();
            
       
            profile.activeRaids.push(raidId);
            await profile.save();
            
          
            const components = [];

          
            const successContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                        .setContent(`# 🤝 Successfully Joined Raid Party!\n## WELCOME TO THE ADVENTURE\n\n> Congratulations! You\'ve successfully joined the **${raid.dungeonName}** raid as the **${playerClass}**!\n> Your skills are now part of this dangerous expedition.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const classContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            classContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **YOUR ASSIGNMENT**')
            );

            const individualReward = Math.floor(raid.potential_reward / raid.requiredMembers);
            classContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**⚔️ Dungeon:** \`${raid.dungeonName}\`\n**🛡️ Your Class:** \`${playerClass.charAt(0).toUpperCase() + playerClass.slice(1)}\`\n**👥 Party Status:** \`${raid.members.length}/${raid.requiredMembers} members\`\n**💰 Your Share:** \`$${individualReward.toLocaleString()}\`\n**🆔 Raid ID:** \`${raidId}\``)
            );

            classContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📅 Joined:** \`${new Date().toLocaleString()}\`\n**📊 Dungeon Difficulty:** \`${dungeonData.difficulty}/5\`\n**🎯 Success Rate:** \`${dungeonData.successChance}%\` (base)`)
            );

            components.push(classContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const partyContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            partyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👥 **CURRENT PARTY ROSTER**')
            );

            const partyList = raid.members.map((member, index) => 
                `**${index + 1}.** ${member.username} (${member.class})`
            ).join('\n');

            partyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(partyList)
            );

            if (raid.members.length < raid.requiredMembers) {
                const stillNeeded = dungeonData.requiredClasses.filter(r => 
                    !raid.members.some(m => m.class === r)
                );
                partyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Still Needed:** ${stillNeeded.join(', ')}\n\n> Waiting for more adventurers to complete the party...`)
                );
            }

            components.push(partyContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextStepsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            if (raid.status === 'ready' && !wasReady) {
                nextStepsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚨 **PARTY COMPLETE - READY FOR ADVENTURE!**\n\n**⚔️ Mission Status:** READY TO EMBARK\n**⚡ Next Step:** Use \`!executeraid ${raidId}\` to begin the expedition\n**⏰ Timing:** Strike when the omens are good\n**🎲 Success Depends On:** Party coordination and skill\n\n> **ALERT:** Your party is assembled and ready for the dungeon! `)
                );
            } else {
                nextStepsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **WHAT HAPPENS NEXT?**\n\n**⏳ Wait for Full Party:** ${raid.requiredMembers - raid.members.length} more adventurer${raid.requiredMembers - raid.members.length !== 1 ? 's' : ''} needed\n**📊 Check Status:** Use \`!raid\` to monitor progress\n**⚔️ Prepare:** Review your class abilities\n**💬 Coordinate:** Discuss strategy with your party\n\n> Patience is key - wait for the right moment to strike!`)
                );
            }

            components.push(nextStepsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
            
        
            if (raid.status === 'ready' && !wasReady) {
                setTimeout(() => {
                    const notificationComponents = [];

                    const readyNotificationContainer = new ContainerBuilder()
                        .setAccentColor(0xFF5722);

                    readyNotificationContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⚔️ RAID PARTY READY!\n## ${raid.dungeonName.toUpperCase()} PARTY ASSEMBLED\n\n> The raid party is now complete and ready for adventure!\n> **Execute Command:** \`!executeraid ${raidId}\`\n\n**⚠️ ATTENTION ALL PARTY MEMBERS:** The expedition can now begin!`)
                    );

                    notificationComponents.push(readyNotificationContainer);

                    message.channel.send({
                        components: notificationComponents,
                        flags: MessageFlags.IsComponentsV2
                    });
                }, 1000);
            }

        } catch (error) {
            console.error('Error in joinraid command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **RAID JOINING ERROR**\n\nSomething went wrong while joining the raid party. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
