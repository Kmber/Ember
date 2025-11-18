const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'mycitadel',
    aliases: ['citadel-info'],
    description: 'View your current citadel and follower status.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.citadels.length === 0) {
                const components = [];

                const noCitadelContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noCitadelContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# 🏰 No Citadel Acquired\n## START YOUR CONQUEST\n\n> You don\'t own any citadels yet! Citadel ownership is essential for building your kingdom.\n> Citadels provide follower housing, secure storage, and lair space for your beasts.')
                );

                components.push(noCitadelContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const startContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                startContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏘️ **GET YOUR FIRST CITADEL**\n\n**Step 1:** Use \`!acquirecitadel\` to browse available citadels\n**Step 2:** Choose a citadel that fits your budget and needs\n**Step 3:** Set it as your primary stronghold\n**Step 4:** Start building your congregation with followers and pets!\n\n**💡 Citadel Benefits:**\n> • House followers for work bonuses\n> • Secure tithe storage\n> • Lair space for beast collection\n> • Enhanced security against raids\n> • Investment appreciation over time`)
                );

                components.push(startContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const primaryCitadel = profile.citadels.find(c => c.propertyId === profile.primaryCitadel) || profile.citadels[0];
            const securityLevel = EconomyManager.calculateSecurityLevel(profile);
            const vaultCapacity = EconomyManager.getVaultCapacity(profile);

            const components = [];

          
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            const conditionEmojis = {
                decrepit: '🔴 Decrepit',
                worn: '🟡 Worn', 
                pristine: '🟢 Pristine',
                legendary: '⭐ Legendary'
            };

            const conditionDisplay = conditionEmojis[primaryCitadel.condition] || '🟢 Pristine';
            const ownershipDays = Math.floor((new Date() - new Date(primaryCitadel.dateAcquired)) / (1000 * 60 * 60 * 24));

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 ${primaryCitadel.name}\n## YOUR GRAND CITADEL & STRONGHOLD\n\n> Welcome to your grand citadel! This is your stronghold and the center of your kingdom.\n> **Citadel Type:** ${primaryCitadel.type.toUpperCase()} • **Condition:** ${conditionDisplay}`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏘️ **CITADEL SPECIFICATIONS**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Citadel:** \`${primaryCitadel.name}\`\n**🏷️ Type:** \`${primaryCitadel.type}\`\n**🛡️ Base Security:** \`Level ${primaryCitadel.securityLevel}\`\n**💰 Current Value:** \`$${primaryCitadel.currentValue.toLocaleString()}\`\n**💸 Acquisition Price:** \`$${primaryCitadel.purchasePrice.toLocaleString()}\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Monthly Upkeep:** \`$${primaryCitadel.monthlyUpkeep.toLocaleString()}\`\n**📅 Acquired Since:** \`${new Date(primaryCitadel.dateAcquired).toLocaleDateString()}\` (${ownershipDays} days)\n**📈 Value Appreciation:** \`$${(primaryCitadel.currentValue - primaryCitadel.purchasePrice).toLocaleString()}\``)
            );

            components.push(detailsContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const followerContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            followerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⛪ **CONGREGATION**')
            );

            if (profile.followers.length > 0) {
                const totalFollowerIncome = profile.followers.reduce((sum, member) => {
                    return sum + (member.salary * member.workEfficiency * (member.allegiance / 100));
                }, 0);

                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Follower Count:** \`${profile.followers.length}/${primaryCitadel.maxFollowers} followers\`\n**Average Allegiance:** \`${profile.followerAllegiance}%\`\n**Follower Work Tithe:** \`$${Math.floor(totalFollowerIncome).toLocaleString()}/work\``)
                );

                const followerList = profile.followers.slice(0, 5).map(member => 
                    `**${member.name}** (${member.relationship})\n> **Profession:** \`${member.profession}\` • **Allegiance:** \`${member.allegiance}%\` • **Follower Tithe:** \`$${member.salary}/work\``
                ).join('\n\n');

                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(followerList)
                );

                if (profile.followers.length > 5) {
                    followerContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${profile.followers.length - 5} more followers residing here*`)
                    );
                }
            } else {
                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏰 Empty Citadel:** Your citadel is ready for followers!\n**Capacity:** \`0/${primaryCitadel.maxFollowers} followers\`\n\n**💡 Recruit Followers:** Use \`!addfollower\` to add loyal subjects\n**🎯 Benefits:** Followers provide work bonuses and allegiance\n**❤️ Relationships:** Build allegiance through rituals and activities`)
                );
            }

            components.push(followerContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const lairContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            lairContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👹 **LAIR**')
            );

            if (primaryCitadel.lairCapacity > 0) {
                lairContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Lair Capacity:** \`${profile.beasts.length}/${primaryCitadel.lairCapacity} beasts\`\n**Total Bestiary Value:** \`$${profile.beasts.reduce((sum, beast) => sum + (beast.currentValue || beast.purchasePrice), 0).toLocaleString()}\``)
                );

                if (profile.beasts.length > 0) {
                    const beastList = profile.beasts.slice(0, 4).map(beast => {
                        const activeIndicator = beast.beastId === profile.activeBeast ? '👹 **ACTIVE**' : '🐾 Stabled';
                        const condition = beast.durability > 80 ? '🟢' : beast.durability > 50 ? '🟡' : '🔴';
                        return `**${beast.name}** ${activeIndicator}\n> **Condition:** ${condition} \`${beast.durability}%\` • **Value:** \`$${(beast.currentValue || beast.purchasePrice).toLocaleString()}\``;
                    }).join('\n\n');

                    lairContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(beastList)
                    );

                    if (profile.beasts.length > 4) {
                        lairContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.beasts.length - 4} more beasts in your lair*`)
                        );
                    }
                } else {
                    lairContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**👹 Empty Lair:** Your lair is ready for beasts!\n\n**💡 Get Started:** Use \`!summon\` to acquire your first beast\n**🎯 Benefits:** Beasts enable racing and other activities`)
                    );
                }
            } else {
                lairContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚫 No Lair Available**\n\n**🏠 Citadel Limitation:** This citadel doesn\'t include lair space\n**💡 Upgrade Option:** Consider moving to a citadel with lair facilities\n**👹 Beast Storage:** You\'ll need lair space to house beasts safely`)
                );
            }

            components.push(lairContainer);

    
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const securityContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **SECURITY & STORAGE**')
            );

            const vaultUsage = ((profile.followerTithe / vaultCapacity) * 100).toFixed(1);
            const petSecurityBonus = profile.pets.reduce((total, pet) => total + pet.securityLevel, 0);

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔒 Total Security Level:** \`${securityLevel}%\`\n**🏰 Citadel Base Security:** \`${primaryCitadel.securityLevel * 10}%\`\n**🐾 Pet Security Bonus:** \`+${petSecurityBonus}%\`\n**🛡️ Raid Protection:** Enhanced based on total security`)
            );

            securityContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Follower Tithe:** \`$${profile.followerTithe.toLocaleString()}\`\n**📊 Tithe Capacity:** \`$${vaultCapacity.toLocaleString()}\`\n**💾 Storage Used:** \`${vaultUsage}%\`\n**🔐 Tithe Security:** Protected by citadel and pet security`)
            );

            components.push(securityContainer);

        
            if (profile.maxPets > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const petContainer = new ContainerBuilder()
                    .setAccentColor(0xFF69B4);

                petContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🐾 **PETS**')
                );

                petContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Pet Capacity:** \`${profile.pets.length}/${profile.maxPets} pets\`\n**Security Contribution:** \`+${petSecurityBonus}%\` from pets\n**Pet Care Status:** ${profile.pets.filter(p => (p.happiness + p.health + p.cleanliness) / 3 > 70).length} well-cared pets`)
                );

                if (profile.pets.length > 0) {
                    const petList = profile.pets.slice(0, 3).map(pet => {
                        const condition = ((pet.happiness + pet.health + pet.cleanliness) / 3);
                        const conditionIcon = condition > 80 ? '🟢' : condition > 50 ? '🟡' : '🔴';
                        return `**${pet.name}** (${pet.breed}) ${conditionIcon}\n> **Security:** \`${pet.securityLevel}%\` • **Condition:** \`${condition.toFixed(0)}%\``;
                    }).join('\n\n');

                    petContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(petList)
                    );

                    if (profile.pets.length > 3) {
                        petContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.pets.length - 3} more pets*`)
                        );
                    }
                } else {
                    petContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🐾 No Pets Yet:** Your citadel can house up to ${profile.maxPets} pets\n\n**💡 Adopt Today:** Use \`!buypet\` to add loyal companions\n**🛡️ Security Boost:** Pets enhance your citadel protection`)
                    );
                }

                components.push(petContainer);
            }

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **CITADEL MANAGEMENT**\n\n**💰 Tithe Management:** Use \`!tithe\` to manage your secure savings\n**⛪ Follower Growth:** Recruit more followers if space allows\n**👹 Beast Collection:** Expand your lair with more beasts for racing\n**🐾 Pet Adoption:** Adopt pets to increase security and companionship\n**🔧 Citadel Maintenance:** Keep your citadel in excellent condition\n**📈 Investment Tracking:** Monitor your citadel value appreciation\n\n> Your citadel is the foundation of your kingdom!`)
            );

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in mycitadel command:', error);

     
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **CITADEL INFORMATION ERROR**\n\nSomething went wrong while retrieving your citadel details. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};