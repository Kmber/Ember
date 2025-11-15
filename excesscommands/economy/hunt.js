const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { HuntingManager } = require('../../models/economy/huntingManager');

module.exports = {
    name: 'slay',
    aliases: ['monsterhunt', 'hunt'],
    description: 'Embark on a quest to slay a monster and claim its bounty.',
    usage: '!slay',
    cooldown: 300, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'hunt');
            if (cooldownCheck.onCooldown) {
                const { minutes, seconds } = cooldownCheck.timeLeft;
                
                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Quest Cooldown\n## RECOVERY TIME\n\n> You must recover your strength between monster hunts!\n> **Time Remaining:** ${minutes}m ${seconds}s`)
                );

                return message.reply({
                    components: [cooldownContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            if (profile.huntingMounts.length === 0 || profile.huntingWeapons.length === 0) {
                const components = [];

                const noEquipmentContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noEquipmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Unprepared for the Hunt\n## QUEST CANCELLED\n\n> You require a mount and a weapon to hunt monsters!`)
                );

                components.push(noEquipmentContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET STARTED**\n\n**Command:** \`!bestiary\`\n**Buy:** Mounts, weapons, and familiars\n**Starting Budget:** You have ${profile.embers.toLocaleString()} Embers available`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            if (profile.huntingProfile.currentHealth < 20) {
                const components = [];

                const injuredContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🩸 Too Wounded to Continue\n## MEDICAL ATTENTION NEEDED\n\n> Your vitality is too low (${profile.huntingProfile.currentHealth}/100)!\n> **Minimum Required:** 20 HP`)
                );

                const healingCost = Math.floor((100 - profile.huntingProfile.currentHealth) * 50);
                
                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Healing Cost:** ${healingCost.toLocaleString()} Embers\n**💡 Command:** \`!attunefamiliar\``)
                );

                components.push(injuredContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const huntResult = await HuntingManager.executeHunt(profile);
            
     
            profile.huntingStats.totalHunts += 1;
            profile.huntingProfile.expeditionCount += 1;
            profile.huntingProfile.lastHunt = new Date();
            
            if (huntResult.success) {
                profile.huntingStats.successfulHunts += 1;
                profile.huntingStats.beastsSlain += 1;
                
             
                huntResult.loot.forEach(item => {
                    profile.huntingInventory.push(item);
                });
                
            } else {
                profile.huntingStats.failedHunts += 1;
            }

          
            profile.huntingStats.totalDamageDealt += huntResult.damageDealt;
            profile.huntingStats.totalDamageTaken += huntResult.damageTaken;
            profile.huntingProfile.hunterExperience += huntResult.experience;
            profile.huntingStats.huntingSkill = Math.min(100, profile.huntingStats.huntingSkill + huntResult.skillGain);

        
            const totalCosts = Object.values(huntResult.costs).reduce((sum, cost) => sum + cost, 0);
            if (totalCosts > 0) {
                profile.embers = Math.max(0, profile.embers - totalCosts);
                
                profile.transactions.push({
                    type: 'expense',
                    amount: totalCosts,
                    description: 'Monster hunting quest costs',
                    category: 'hunting'
                });
            }

          
            profile.cooldowns.hunt = new Date();
            await profile.save();

       
            const components = [];

            if (huntResult.success) {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Monster Slain!\n## ${huntResult.beast.name.toUpperCase()} VANQUISHED\n\n> You have slain a **${huntResult.beast.name}** (Tier ${huntResult.beast.tier})!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const combatContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **BATTLE REPORT**`)
                );

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💥 Damage Dealt:** ${huntResult.damageDealt}\n**🩸 Damage Taken:** ${huntResult.damageTaken}\n**❤️ Health Remaining:** ${profile.huntingProfile.currentHealth}/100`)
                );

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** +${huntResult.experience} XP\n**📈 Skill Gained:** +${huntResult.skillGain}%\n**🎯 Hunting Skill:** ${profile.huntingStats.huntingSkill}%`)
                );

                components.push(combatContainer);

              
                if (huntResult.loot.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const lootContainer = new ContainerBuilder()
                        .setAccentColor(0xFFB02E);

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💎 **BOUNTY CLAIMED**`)
                    );

                    const lootText = huntResult.loot.slice(0, 5).map(item => 
                        `**${item.name}** (${item.rarity})\n> **Value:** ${item.currentValue.toLocaleString()} Embers • **Type:** ${item.type}`
                    ).join('\n\n');

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(lootText)
                    );

                    if (huntResult.loot.length > 5) {
                        lootContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${huntResult.loot.length - 5} more items*`)
                        );
                    }

                    components.push(lootContainer);
                }

            } else {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💥 The Beast Escaped!\n## ${huntResult.beast.name.toUpperCase()} FLED\n\n> The **${huntResult.beast.name}** proved too formidable and escaped!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚑 **WOUNDS AND LOSSES**`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💥 Damage Dealt:** ${huntResult.damageDealt}\n**🩸 Damage Taken:** ${huntResult.damageTaken}\n**❤️ Health Remaining:** ${profile.huntingProfile.currentHealth}/100`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Medical Costs:** ${huntResult.costs.healing.toLocaleString()} Embers\n**⭐ Experience:** +${huntResult.experience} XP (participation)\n**💡 Tip:** Enchant your equipment or bring more familiars!`)
                );

                components.push(failureContainer);
            }

         
            if (huntResult.companionInjuries.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const injuryContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🩹 **FAMILIAR INJURIES**`)
                );

                const injuryText = huntResult.companionInjuries.map(injury =>
                    `**${injury.name}** - Injured!\n> **Healing Cost:** ${injury.healingCost.toLocaleString()} Embers`
                ).join('\n\n');

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(injuryText)
                );

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Command:** \`!attunefamiliar all\` to restore them`)
                );

                components.push(injuryContainer);
            }

     
            if (totalCosts > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const costsContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💸 **QUEST EXPENSES**`)
                );

                const costBreakdown = Object.entries(huntResult.costs)
                    .filter(([key, value]) => value > 0)
                    .map(([key, value]) => `**${key.replace('_', ' ').toUpperCase()}:** ${value.toLocaleString()} Embers`)
                    .join('\n');

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(costBreakdown)
                );

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Total Cost:** ${totalCosts.toLocaleString()} Embers\n**💰 Remaining Embers:** ${profile.embers.toLocaleString()}`)
                );

                components.push(costsContainer);
            }

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in slay command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **HUNTING QUEST FAILED**\n\n${error.message || 'An unforeseen obstacle has thwarted your hunt.'}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};