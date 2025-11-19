const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

const FOLLOWER_TEMPLATES = {
    cultist: {
        relationships: ['cultist'],
        professions: ['Scribe', 'Acolyte', 'Zealot', 'Neophyte', 'Initiate'],
        salaryRange: [100, 300]
    },
    acolyte: {
        relationships: ['acolyte'],
        professions: ['Ritualist', 'Summoner', 'Diviner'],
        salaryRange: [200, 500]
    },
    zealot: {
        relationships: ['zealot'],
        professions: ['Inquisitor', 'Executioner', 'Crusader'],
        salaryRange: [300, 700]
    },
    neophyte: {
        relationships: ['neophyte'],
        professions: ['Scout', 'Spy', 'Thief', 'Assassin'],
        salaryRange: [150, 400]
    }
};

module.exports = {
    name: 'addfollower',
    aliases: ['follower-add'],
    description: 'Recruit a follower to your congregation .',
    usage: '!addfollower <type> <name>',
    async execute(message, args) {
        try {
            if (args.length < 2) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⛪ Recruit Follower\n## MISSING REQUIRED INFORMATION\n\n> Please specify the follower type and their name!\n> **Usage:** \`!addfollower <type> <name>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const typesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const typesList = Object.entries(FOLLOWER_TEMPLATES).map(([type, template]) => {
                    const professions = template.professions.slice(0, 2).join(', ');
                    const salaryRange = `${template.salaryRange[0]} Embers-${template.salaryRange[1]} Embers`;
                    return `**\`${type}\`** - ${professions} (${salaryRange})`;
                }).join('\n');

                typesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **AVAILABLE FOLLOWER TYPES**\n\n${typesList}\n\n**Examples:**\n> \`!addfollower cultist Elara\`\n> \`!addfollower acolyte Kael\`\n> \`!addfollower zealot Morwen\``)
                );

                components.push(typesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const type = args[0].toLowerCase();
            const name = args.slice(1).join(' ');
            
            if (!FOLLOWER_TEMPLATES[type]) {
                const components = [];

                const invalidTypeContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidTypeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Follower Type\n## UNRECOGNIZED ROLE\n\n> **\`${type}\`** is not a valid follower type!\n> Choose from the available roles below.`)
                );

                components.push(invalidTypeContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validTypesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validTypesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **VALID FOLLOWER TYPES**\n\n**🙏 \`cultist\`** - Devoted follower of the dark arts\n**🔮 \`acolyte\`** - Student of forbidden knowledge\n**⚔️ \`zealot\`** - Fervent warrior for the cause\n**💀 \`neophyte\`** - New recruit, eager to prove their worth\n\n**💡 Try:** \`!addfollower cultist ${name}\``)
                );

                components.push(validTypesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.citadels.length === 0) {
                const components = [];

                const noCitadelContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noCitadelContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Citadel Required for Followers\n## NO SANCTUM FOR YOUR CONGREGATION\n\n> You need to own a Citadel before recruiting followers!\n> Followers need a dark and suitable place to dwell.`)
                );

                components.push(noCitadelContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **ESTABLISH A CITADEL FOR YOUR FOLLOWERS**\n\n**Step 1:** Use \`!acquirecitadel\` to browse available Citadels\n**Step 2:** Acquire a Citadel with follower capacity\n**Step 3:** Set it as your primary sanctum\n**Step 4:** Return here to recruit **${name}** as your ${type}!\n\n**💡 Follower Benefits:**\n> • Followers contribute to work income\n> • Build allegiance through dark rituals and activities\n> • Enhanced security and influence\n> • Larger congregations = more power`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            let primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel);
            if (!primaryCitadel && profile.citadels.length > 0) {
                profile.primaryCitadel = profile.citadels[0].propertyId;
                await profile.save();
                primaryCitadel = profile.citadels[0];
            }
            
            const activeCitadel = primaryCitadel;
            
            if (profile.followers.length >= activeCitadel.maxFollowers) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Follower Capacity Limit Reached\n## MAXIMUM CONGREGATION SIZE\n\n> Your **${activeCitadel.name}** can only house **${activeCitadel.maxFollowers}** followers!\n> You currently have **${profile.followers.length}** followers dwelling there.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **EXPAND YOUR CITADEL**\n\n**Current Congregation:** ${profile.followers.map(m => m.name).join(', ')}\n\n**💡 Solutions:**\n> • Upgrade to a larger Citadel with more follower capacity (\`!acquirecitadel\`)\n> • Acquire an additional Citadel for your expanding congregation\n> • Consider which followers are most loyal\n\n**🎯 Goal:** Find a Citadel that can house **${profile.followers.length + 1}+** followers`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (profile.followers.some(member => member.name.toLowerCase() === name.toLowerCase())) {
                const components = [];

                const duplicateNameContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateNameContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Duplicate Follower Name\n## NAME ALREADY IN USE\n\n> You already have a follower named **${name}**!\n> Each follower needs a unique name for identification.`)
                );

                components.push(duplicateNameContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const suggestionContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                const existingMember = profile.followers.find(m => m.name.toLowerCase() === name.toLowerCase());
                suggestionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **NAME SUGGESTIONS**\n\n**Existing Follower:** **${existingMember.name}** (${existingMember.relationship})\n\n**Try Different Names:**\n> \`!addfollower ${type} ${name}2\`\n> \`!addfollower ${type} ${name.split(' ')[0]} ${name.split(' ')[1] || 'the Devout'}\`\n> \`!addfollower ${type} [Choose a different name]\`\n\n**💡 Tip:** Use titles or epithets to make each follower unique!`)
                );

                components.push(suggestionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const template = FOLLOWER_TEMPLATES[type];
            const profession = template.professions[Math.floor(Math.random() * template.professions.length)];
            const salary = Math.floor(Math.random() * (template.salaryRange[1] - template.salaryRange[0] + 1)) + template.salaryRange[0];
            const age = Math.floor(Math.random() * 20) + 18;
            
            const follower = {
                memberId: `${type}_${Date.now()}`,
                name,
                relationship: type,
                age,
                profession,
                salary,
                allegiance: 50,
                workEfficiency: 1.0,
                totalRituals: 0,
                dateAdded: new Date(),
                lastRitual: null
            };
            
            profile.followers.push(follower);
          
            const avgAllegiance = profile.followers.reduce((sum, m) => sum + m.allegiance, 0) / profile.followers.length;
            profile.followerAllegiance = Math.floor(avgAllegiance);
            
         
            profile.maxMinions = Math.min(10, Math.floor(activeCitadel.maxFollowers / 2) + 1);
            
            await profile.save();
            
      
            const components = [];

         
            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⛪ Follower Recruited!\n## WELCOME TO THE CONGREGATION\n\n> **${name}** has officially joined your congregation as your ${type}!\n> Your congregation is growing stronger and your Citadel feels more complete.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
            const profileContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👤 **NEW FOLLOWER PROFILE**')
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👤 Name:** \`${name}\`\n**📜 Role:** \`${type}\`\n**🎂 Age:** \`${age} years old\`\n**💼 Profession:** \`${profession}\`\n**💰 Work Tithe:** \`${salary} Embers per work session\``)
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🖤 Initial Allegiance:** \`50%\` (room for growth!)\n**📈 Work Efficiency:** \`100%\` (optimal performance)\n**💀 Total Rituals:** \`0\` (ready for indoctrination!)\n**📅 Joined Congregation:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(profileContainer);

     
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const householdContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏠 **UPDATED CONGREGATION STATUS**')
            );

            const totalFollowerIncome = profile.followers.reduce((sum, member) => {
                return sum + (member.salary * member.workEfficiency * (member.allegiance / 100));
            }, 0);

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Total Followers:** \`${profile.followers.length}/${activeCitadel.maxFollowers}\`\n**🖤 Average Follower Allegiance:** \`${profile.followerAllegiance}%\`\n**💰 Combined Follower Tithe:** \`${Math.floor(totalFollowerIncome)} Embers/work\`\n**🏰 Citadel:** \`${activeCitadel.name}\``)
            );

            householdContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Minion Capacity:** \`${profile.maxMinions}\` (updated based on congregation size)\n**🎯 Congregation Goal:** Build allegiance through dark rituals\n**📈 Work Bonus:** Followers contribute to your earnings automatically`)
            );

            components.push(householdContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const bondingContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🖤 **FOLLOWER ALLEGIANCE GUIDE**')
            );

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💀 Perform Dark Rituals:** Use \`!ritual\` to build stronger allegiance\n**❤️ Build Allegiance:** Higher allegiance = better work efficiency and income\n**⛪ Expand Congregation:** Recruit more followers if you have space\n**🏰 Upgrade Citadel:** Larger Citadels house bigger congregations\n**🎯 Long-term Goal:** Reach 100% allegiance with all followers`)
            );

            bondingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 **${name}** is ready to:**\n> • Contribute to your work earnings automatically\n> • Join dark rituals to build stronger allegiance\n> • Help increase your congregation's overall influence\n> • Provide unwavering devotion and servitude\n\n> Welcome to your growing dark empire!`)
            );

            components.push(bondingContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in addfollower command:', error);

         
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FOLLOWER RECRUITMENT ERROR**\n\nSomething went wrong while recruiting your follower. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};