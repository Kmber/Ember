const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'pillage',
    description: 'Attempt to pillage another player for Embers (risky!)',
    usage: '!pillage @user',
    cooldown: 1800,
    async execute(message, args) {
        try {
            let pillagerProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (!pillagerProfile) {
                const components = [];

                const profileErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                profileErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Profile Access Error\n## ACCOUNT INITIALIZATION REQUIRED\n\n> Unable to access your pillager profile!\n> Please use \`!balance\` first to initialize your account before attempting to pillage.`)
                );

                components.push(profileErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (typeof pillagerProfile.embers !== 'number') {
                pillagerProfile.embers = Number(pillagerProfile.embers) || 0;
                await pillagerProfile.save();
            }

            if (!pillagerProfile.cooldowns || typeof pillagerProfile.cooldowns !== 'object') {
                pillagerProfile.cooldowns = {};
                await pillagerProfile.save();
            }

            const cooldownCheck = EconomyManager.checkCooldown(pillagerProfile, 'pillage');
            if (cooldownCheck.onCooldown) {
                const { minutes, seconds } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Pillage Cooldown Active\n## RAIdING ACTIVITY RESTRICTED\n\n> You must wait before attempting another pillage!\n> **Time Remaining:** \`${minutes}m ${seconds}s\``)
                );

                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const patienceContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                patienceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **USE THIS TIME WISELY**\n\n**🎯 Plan Your Next Target:** Scout potential victims\n**📈 Build Power:** Complete quests to increase your level for better success rates\n**🛡️ Study Defenses:** Learn about target warding methods\n**💰 Manage Resources:** Ensure you can handle potential fines\n\n> Patience and planning lead to successful raids!`)
                );

                components.push(patienceContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const target = message.mentions.users.first();
            if (!target) {
                const components = [];

                const noTargetContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 No Target Specified\n## PILLAGE TARGET REQUIRED\n\n> You need to mention someone to pillage!\n> **Usage:** \`!pillage @username\``)
                );

                components.push(noTargetContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **HOW TO PILLAGE**\n\n**Command:** \`!pillage @target\`\n**Example:** \`!pillage @JohnDoe\`\n\n**💡 Pillage Tips:**\n> • Target users with lower warding levels\n> • Higher level pillagers have better success rates\n> • Victims need at least 500 Embers to be worth pillaging\n> • Failed pillages result in fines and reputation loss\n> • Successful pillages give XP and stolen Embers`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (target.id === message.author.id) {
                const components = [];

                const selfPillageContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                selfPillageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🪞 Cannot Pillage Yourself\n## LOGICAL IMPOSSIBILITY\n\n> You cannot pillage yourself! That's not how raiding works.\n> Find another target to attempt your pillage on.`)
                );

                components.push(selfPillageContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const alternativeContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                alternativeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💰 **ALTERNATIVE EMBER GATHERING**\n\n**⚔️ Quest:** Use \`!quest\` for legitimate income\n**🎲 Gamble:** Try \`!gamble\` for risky gains\n**🏰 Stronghold:** Manage your stronghold for passive income\n**🎁 Daily:** Claim \`!daily\` rewards regularly\n\n> Why pillage yourself when you can pillage others? 😏`)
                );

                components.push(alternativeContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (target.bot) {
                const components = [];

                const botPillageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                botPillageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 Cannot Pillage Bots\n## INVALID TARGET TYPE\n\n> Bots don't have Embers to steal and don't participate in the economy!\n> Choose a human player as your pillage target.`)
                );

                components.push(botPillageContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const humanTargetContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                humanTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **FIND HUMAN TARGETS**\n\n**🎯 Look For:** Active server members who participate in the economy\n**💰 Target Rich:** Players with high Ember balances\n**🛡️ Avoid Strong:** Users with high warding levels (familiars/strongholds)\n**⏰ Time It Right:** Pillage when targets are likely offline\n\n> Focus on human players for successful pillages!`)
                );

                components.push(humanTargetContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            let victimProfile = await EconomyManager.getProfile(target.id, message.guild.id);
            
            if (!victimProfile) {
                const components = [];

                const victimErrorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                victimErrorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Target Profile Error\n## VICTIM ACCOUNT INACCESSIBLE\n\n> Unable to access **${target.username}**'s profile!\n> They may need to use \`!balance\` first to initialize their account.`)
                );

                components.push(victimErrorContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (typeof victimProfile.embers !== 'number') {
                victimProfile.embers = Number(victimProfile.embers) || 1000;
                await victimProfile.save();
            }

            if (!Array.isArray(victimProfile.familiars)) {
                victimProfile.familiars = [];
                await victimProfile.save();
            }

            if (victimProfile.embers < 500) {
                const components = [];

                const poorTargetContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                poorTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Target Too Poor\n## INSUFFICIENT PILLAGE VALUE\n\n> **${target.username}** only has **\`${victimProfile.embers.toLocaleString()} Embers\`**!\n> Targets need at least **\`500 Embers\`** to be worth pillaging.`)
                );

                components.push(poorTargetContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const betterTargetContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                betterTargetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🎯 **FIND BETTER TARGETS**\n\n**💰 Look For:** Users with substantial Ember balances\n**📊 Check Activity:** Active players tend to have more Embers\n**🏆 Target Winners:** Look for successful gamblers or questers\n**⏰ Wait Strategy:** Check back when they might have earned more\n\n**💡 Pro Tip:** Use \`!leaderboard wealth\` to scout rich targets!`)
                );

                components.push(betterTargetContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const victimWarding = EconomyManager.calculateWardingLevel(victimProfile);
            const pillagerLevel = pillagerProfile.level || 1;
            
            const baseSuccessChance = 30;
            const levelBonus = Math.min(pillagerLevel * 2, 20);
            const wardingPenalty = victimWarding * 0.5;
            
            const successChance = Math.max(5, baseSuccessChance + levelBonus - wardingPenalty);
            const success = Math.random() * 100 < successChance;
            
            pillagerProfile.cooldowns.pillage = new Date();
            
            if (success) {
                const maxSteal = Math.min(victimProfile.embers * 0.3, 5000);
                const stolenAmount = Math.floor(Math.random() * maxSteal) + 100;
                
                pillagerProfile.embers += stolenAmount;
                victimProfile.embers = Math.max(0, victimProfile.embers - stolenAmount);
                
                pillagerProfile.experience = (pillagerProfile.experience || 0) + 20;
                pillagerProfile.reputation = Math.max((pillagerProfile.reputation || 0) - 10, -100);
                pillagerProfile.successfulPillages = (pillagerProfile.successfulPillages || 0) + 1;
                
                if (victimProfile.familiars && victimProfile.familiars.length > 0) {
                    victimProfile.familiars.forEach(familiar => {
                        if (Math.random() < 0.5) {
                            familiar.health = Math.max(10, (familiar.health || 100) - Math.floor(Math.random() * 15));
                            familiar.bond = Math.max(0, (familiar.bond || 50) - Math.floor(Math.random() * 20));
                        }
                    });
                }
                
                if (!Array.isArray(pillagerProfile.transactions)) pillagerProfile.transactions = [];
                if (!Array.isArray(victimProfile.transactions)) victimProfile.transactions = [];

                pillagerProfile.transactions.push({
                    type: 'income',
                    amount: stolenAmount,
                    description: `Pillaged ${target.username}`,
                    category: 'pillage',
                    timestamp: new Date()
                });
                
                victimProfile.transactions.push({
                    type: 'expense',
                    amount: stolenAmount,
                    description: `Pillaged by ${message.author.username}`,
                    category: 'pillage',
                    timestamp: new Date()
                });
                
                await pillagerProfile.save();
                await victimProfile.save();
                
                const components = [];

                const successContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Pillage Successful!\n## RAID OPERATION COMPLETE\n\n> Congratulations! You successfully pillaged **${target.username}** and got away with the loot!\n> Your raiding skills have proven effective in this daring attack.`)
                );

                components.push(successContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💎 **THE LOOT**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Target:** \`${target.username}\`\n**💰 Amount Stolen:** \`${stolenAmount.toLocaleString()} Embers\`\n**📊 Success Rate:** \`${successChance.toFixed(1)}%\`\n**🛡️ Target Warding:** \`${victimWarding}%\`\n**⭐ Experience Gained:** \`+20 XP\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Your New Coin Purse:** \`${pillagerProfile.embers.toLocaleString()} Embers\`\n**💸 Victim's Remaining:** \`${victimProfile.embers.toLocaleString()} Embers\`\n**📈 Your Level:** \`${pillagerProfile.level || 1}\`\n**🏆 Successful Pillages:** \`${pillagerProfile.successfulPillages}\``)
                );

                components.push(detailsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const consequencesContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                consequencesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚠️ **PILLAGE CONSEQUENCES**\n\n**📉 Reputation Impact:** \`-10 reputation points\`\n**🐾 Familiar Harm:** Some of the victim's familiars may have been harmed during the raid\n**⏰ Cooldown Applied:** \`30 minutes\` before your next pillage attempt\n**🔍 Increased Infamy:** Your notoriety has grown\n\n**💡 Advice:** Lay low and avoid suspicious activities for a while!`)
                );

                components.push(consequencesContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
                
                try {
                    const victimComponents = [];

                    const victimNotificationContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    victimNotificationContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🚨 You've Been Pillaged!\n## RAID IN ${message.guild.name.toUpperCase()}\n\n> **${message.author.username}** has successfully pillaged you!\n> Your warding was insufficient to prevent this attack.`)
                    );

                    victimComponents.push(victimNotificationContainer);
                    victimComponents.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const lossDetailsContainer = new ContainerBuilder()
                        .setAccentColor(0xDC3545);

                    lossDetailsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💸 **LOSS DETAILS**\n\n**💰 Amount Lost:** \`${stolenAmount.toLocaleString()} Embers\`\n**🛡️ Your Warding Level:** \`${victimWarding}%\`\n**💳 Remaining Coin Purse:** \`${victimProfile.embers.toLocaleString()} Embers\`\n**🏰 Server:** \`${message.guild.name}\`\n\n**💡 Warding Tip:** Attune familiars and acquire strongholds to increase your protection against future pillages!`)
                    );

                    victimComponents.push(lossDetailsContainer);
                        
                    await target.send({
                        components: victimComponents,
                        flags: MessageFlags.IsComponentsV2
                    });
                } catch (error) {
                    console.log(`Could not notify pillage victim: ${target.tag}`);
                }
                
            } else {
                const penalty = Math.floor(Math.random() * 2000) + 500;
                pillagerProfile.embers = Math.max(0, pillagerProfile.embers - penalty);
                pillagerProfile.reputation = Math.max((pillagerProfile.reputation || 0) - 5, -100);
                pillagerProfile.pillageAttempts = (pillagerProfile.pillageAttempts || 0) + 1;
                
                if (!Array.isArray(pillagerProfile.transactions)) {
                    pillagerProfile.transactions = [];
                }

                pillagerProfile.transactions.push({
                    type: 'expense',
                    amount: penalty,
                    description: `Failed pillage fine`,
                    category: 'pillage',
                    timestamp: new Date()
                });
                
                await pillagerProfile.save();
                
                const components = [];

                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚨 Pillage Failed!\n## RAID OPERATION COMPROMISED\n\n> You were caught attempting to pillage **${target.username}**!\n> The local guard responded quickly and you face serious consequences.`)
                );

                components.push(failureContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const penaltyContainer = new ContainerBuilder()
                    .setAccentColor(0xDC3545);

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚖️ **LEGAL CONSEQUENCES**')
                );

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💸 Fine Imposed:** \`${penalty.toLocaleString()} Embers\`\n**📊 Failure Chance:** \`${(100 - successChance).toFixed(1)}%\`\n**📉 Reputation Lost:** \`-5 reputation points\`\n**🛡️ Target Warding:** \`${victimWarding}%\` (too strong!)\n**📈 Your Level:** \`${pillagerProfile.level || 1}\` (need improvement)`)
                );

                penaltyContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Remaining Coin Purse:** \`${pillagerProfile.embers.toLocaleString()} Embers\`\n**🎯 Total Pillage Attempts:** \`${pillagerProfile.pillageAttempts}\`\n**⏰ Cooldown Applied:** \`30 minutes\` before next attempt`)
                );

                components.push(penaltyContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const improvementContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                improvementContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **IMPROVE YOUR SUCCESS RATE**\n\n**📈 Level Up:** Complete quests to increase your level (current: ${pillagerProfile.level || 1})\n**🎯 Choose Easier Targets:** Look for users with lower warding levels\n**🕵️ Scout First:** Research target warding before attempting to pillage\n**⏰ Timing:** Try pillaging when targets are likely offline\n**💰 Build Funds:** Ensure you can afford potential failure fines\n\n**🎓 Remember:** Each level gives +2% success rate bonus!`)
                );

                components.push(improvementContainer);

                await message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
        } catch (error) {
            console.error('Error in pillage command:', error);
            
            const components = [];

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ **PILLAGE SYSTEM ERROR**\n## OPERATION ABORTED\n\n> Something went wrong during the pillage attempt!\n> **Error:** \`${error.message}\``)
            );

            components.push(errorContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const troubleshootContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            troubleshootContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🛠️ **TROUBLESHOOTING STEPS**\n\n**1.** Both users should try \`!balance\` first to initialize accounts\n**2.** Wait 30 seconds and try the pillage again\n**3.** Ensure the target user is a valid server member\n**4.** Contact an admin if the issue persists\n\n**💡 Note:** System errors don't trigger cooldowns or penalties.`)
            );

            components.push(troubleshootContainer);
                
            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};