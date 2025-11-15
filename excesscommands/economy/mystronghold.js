const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'mystronghold',
    aliases: ['stronghold', 'citadel'],
    description: 'View your current stronghold and follower status.',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.strongholds.length === 0) {
                const components = [];

                const noStrongholdContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noStrongholdContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 No Stronghold Acquired\n## FORGE YOUR DOMINION\n\n> You do not yet possess a stronghold! A stronghold is essential for building your dominion.\n> Strongholds provide housing for your followers, a secure treasury, and a bestiary for your tamed beasts.`)
                );

                components.push(noStrongholdContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const startContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                startContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **ACQUIRE YOUR FIRST STRONGHOLD**\n\n**Step 1:** Use \`!buystronghold\` to browse available strongholds\n**Step 2:** Choose a stronghold that fits your ambitions and budget\n**Step 3:** Set it as your primary seat of power\n**Step 4:** Start gathering followers and taming beasts!\n\n**💡 Stronghold Benefits:**\n> • House followers for quest bonuses\n> • Secure your treasury\n> • Bestiary space for your beast collection\n> • Enhanced warding against pillaging\n> • Your dominion will grow in power and influence`)
                );

                components.push(startContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold) || profile.strongholds[0];
            const wardingLevel = EconomyManager.calculateWardingLevel(profile);
            const treasuryCapacity = EconomyManager.getTreasuryCapacity(profile);
            const monthlyUpkeep = primaryStronghold.upkeep;

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            const conditionEmojis = {
                ruined: '🔴 Ruined',
                damaged: '🟡 Damaged', 
                fortified: '🟢 Fortified',
                impenetrable: '⭐ Impenetrable'
            };

            const conditionDisplay = conditionEmojis[primaryStronghold.condition] || '🟢 Fortified';
            const ownershipDays = Math.floor((new Date() - new Date(primaryStronghold.dateAcquired)) / (1000 * 60 * 60 * 24));

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 ${primaryStronghold.name}\n## YOUR SEAT OF POWER & DOMAIN\n\n> Welcome to your mighty stronghold! This is your domain's heart and the center of your power.\n> **Stronghold Type:** ${primaryStronghold.type.toUpperCase()} • **Condition:** ${conditionDisplay}`)
            );

            components.push(headerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x27AE60);

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ⚔️ **STRONGHOLD SPECIFICATIONS**')
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Stronghold:** \`${primaryStronghold.name}\`\n**🏷️ Type:** \`${primaryStronghold.type}\`\n**🛡️ Base Warding:** \`Level ${primaryStronghold.wardingLevel}\`\n**💰 Current Value:** \`${primaryStronghold.currentValue.toLocaleString()} Embers\`\n**💸 Acquisition Price:** \`${primaryStronghold.purchasePrice.toLocaleString()} Embers\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔥 Monthly Upkeep:** \`${monthlyUpkeep.toLocaleString()} Embers\`\n**📅 Acquired Since:** \`${new Date(primaryStronghold.dateAcquired).toLocaleDateString()}\` (${ownershipDays} days)\n**📈 Value Increase:** \`${(primaryStronghold.currentValue - primaryStronghold.purchasePrice).toLocaleString()} Embers\``)
            );

            components.push(detailsContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const followerContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            followerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👨‍👩‍👧‍👦 **LOYAL FOLLOWERS**')
            );

            if (profile.followers.length > 0) {
                followerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Follower Count:** \`${profile.followers.length}/${primaryStronghold.maxFollowers} followers\`\n**Average Loyalty:** \`${profile.followerLoyalty}%\`\n**Follower Quest Income:** \`${EconomyManager.calculateFollowerIncome(profile).toLocaleString()} Embers/quest\``)
                );

                const followerList = profile.followers.slice(0, 5).map(follower => 
                    `**${follower.name}** (${follower.role})\n> **Class:** \`${follower.class}\` • **Loyalty:** \`${follower.loyalty}%\` • **Tribute:** \`${follower.tribute} Embers/quest\``
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
                        .setContent(`**🏰 Empty Stronghold:** Your stronghold is ready for followers!\n**Capacity:** \`0/${primaryStronghold.maxFollowers} followers\`\n\n**💡 Recruit Followers:** Use follower management commands to recruit loyal subjects\n**🎯 Benefits:** Followers provide quest bonuses and tribute\n**❤️ Loyalty:** Build loyalty through quests and boons`)
                );
            }

            components.push(followerContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const bestiaryContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            bestiaryContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🐾 **TAMED BEASTS**')
            );

            if (primaryStronghold.hasBestiary) {
                bestiaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Bestiary Capacity:** \`${profile.beasts.length}/${primaryStronghold.bestiaryCapacity} beasts\`\n**Total Menagerie Value:** \`${profile.beasts.reduce((sum, beast) => sum + (beast.currentValue || beast.purchasePrice), 0).toLocaleString()} Embers\``)
                );

                if (profile.beasts.length > 0) {
                    const beastList = profile.beasts.slice(0, 4).map(beast => {
                        const activeIndicator = beast.beastId === profile.activeBeast ? '🐾 **ACTIVE**' : 'Resting';
                        const vitality = beast.vitality > 80 ? '🟢' : beast.vitality > 50 ? '🟡' : '🔴';
                        return `**${beast.name}** ${activeIndicator}\n> **Vitality:** ${vitality} \`${beast.vitality}%\` • **Value:** \`${(beast.currentValue || beast.purchasePrice).toLocaleString()} Embers\``;
                    }).join('\n\n');

                    bestiaryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(beastList)
                    );

                    if (profile.beasts.length > 4) {
                        bestiaryContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.beasts.length - 4} more beasts in your bestiary*`)
                        );
                    }
                } else {
                    bestiaryContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🐾 Empty Bestiary:** Your bestiary is ready for beasts!\n\n**💡 Get Started:** Use \`!tamebeast\` to tame your first beast\n**🎯 Benefits:** Beasts enable arena combat and expeditions`)
                );
                }
            } else {
                bestiaryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🚫 No Bestiary Available**\n\n**🏰 Stronghold Limitation:** This stronghold does not include a bestiary\n**💡 Upgrade Option:** Consider acquiring a stronghold with a bestiary\n**🐾 Beast Housing:** You will need a bestiary to house your tamed beasts`)
                );
            }

            components.push(bestiaryContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const wardingContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            wardingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🛡️ **WARDING & TREASURY**')
            );

            const treasuryUsage = ((profile.stronghold_treasury / treasuryCapacity) * 100).toFixed(1);
            wardingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔒 Total Warding Level:** \`${wardingLevel}%\`\n**🏰 Stronghold Base Warding:** \`${primaryStronghold.wardingLevel}\`\n**🐾 Familiar Warding Bonus:** \`+${wardingLevel - primaryStronghold.wardingLevel}\`\n**🛡️ Pillaging Protection:** Enhanced based on total warding`)
            );

            wardingContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Stronghold Treasury:** \`${profile.stronghold_treasury.toLocaleString()} Embers\`\n**📊 Treasury Capacity:** \`${treasuryCapacity.toLocaleString()} Embers\`\n**💾 Storage Used:** \`${treasuryUsage}%\`\n**🔐 Treasury Security:** Protected by stronghold and familiar warding`)
            );

            components.push(wardingContainer);

            if (profile.maxFamiliars > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const familiarContainer = new ContainerBuilder()
                    .setAccentColor(0xFF69B4);

                familiarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🦇 **FAMILIARS**')
                );

                familiarContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Familiar Capacity:** \`${profile.familiars.length}/${profile.maxFamiliars} familiars\`\n**Warding Contribution:** \`+${wardingLevel - primaryStronghold.wardingLevel}\` from familiars\n**Familiar Care Status:** ${profile.familiars.filter(f => (f.bond + f.health + f.mana) / 3 > 70).length} well-cared for familiars`)
                );

                if (profile.familiars.length > 0) {
                    const familiarList = profile.familiars.slice(0, 3).map(familiar => {
                        const condition = ((familiar.bond + familiar.health + familiar.mana) / 3);
                        const conditionIcon = condition > 80 ? '🟢' : condition > 50 ? '🟡' : '🔴';
                        return `**${familiar.name}** (${familiar.species}) ${conditionIcon}\n> **Warding:** \`${familiar.wardingLevel}\` • **Condition:** \`${condition.toFixed(0)}%\``;
                    }).join('\n\n');

                    familiarContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(familiarList)
                    );

                    if (profile.familiars.length > 3) {
                        familiarContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${profile.familiars.length - 3} more mystical companions*`)
                        );
                    }
                } else {
                    familiarContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🦇 No Familiars Yet:** Your stronghold can house up to ${profile.maxFamiliars} familiars\n\n**💡 Attune Today:** Use \`!attunefamiliar\` to bond with mystical companions\n**🛡️ Warding Boost:** Familiars enhance your stronghold's protection`)
                    );
                }

                components.push(familiarContainer);
            }

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const managementContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            managementContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **STRONGHOLD MANAGEMENT**\n\n**🏦 Treasury Management:** Use \`!treasury\` to manage your stronghold's secure savings\n**👨‍👩‍👧‍👦 Follower Recruitment:** Recruit more followers if space allows\n**🐾 Beast Taming:** Expand your bestiary with more tamed beasts for the arena\n**🦇 Familiar Attunement:** Attune with familiars to increase warding and power\n**🔧 Stronghold Maintenance:** Keep your stronghold fortified and in excellent condition\n**📈 Dominion Growth:** Monitor your stronghold's value and influence\n\n> Your stronghold is the foundation of your dominion!`)
            );

            components.push(managementContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in mystronghold command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **STRONGHOLD INFORMATION ERROR**\n\nSomething went wrong while retrieving your stronghold details. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
