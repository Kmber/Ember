const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { SlayingManager } = require('../../models/economy/slayingManager');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'slay',
    aliases: ['sly', 'hunt'],
    description: 'Go on a slaying quest in the haunted lands',
    usage: 'slay',
    cooldown: 300, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'slay');
            if (cooldownCheck.onCooldown) {
                const { minutes, seconds } = cooldownCheck.timeLeft;
                
                const cooldownContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⏰ Slaying Cooldown\n## RECOVERY TIME\n\n> You need to rest between slaying quests!\n> **Time Remaining:** ${minutes}m ${seconds}s`)
                );

                return message.reply({
                    components: [cooldownContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            if (profile.slayingMounts.length === 0 || profile.slayingWeapons.length === 0) {
                const components = [];

                const noEquipmentContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noEquipmentContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Missing Gear\n## QUEST CANCELLED\n\n> You need both a mount and weapon to go slaying!`)
                );

                components.push(noEquipmentContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🛒 **GET STARTED**\n\n**Command:** \`${prefix}slayershop\`\n**Buy:** Mounts, weapons, and allies\n**Starting Budget:** You have ${profile.wallet.toLocaleString()} Embers available`)
                );

                components.push(helpContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            
            if (profile.slayingProfile.currentHealth < 20) {
                const components = [];

                const injuredContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🩸 Too Wounded to Slay\n## REQUIRES HEALING\n\n> Your health is too low (${profile.slayingProfile.currentHealth}/100)!\n> **Minimum Required:** 20 HP`)
                );

                const healingCost = Math.floor((100 - profile.slayingProfile.currentHealth) * 50);
                
                injuredContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Healing Cost:** ${healingCost.toLocaleString()} Embers\n**💡 Command:** \`${prefix}heal self\``)
                );

                components.push(injuredContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            const slayResult = await SlayingManager.executeSlay(profile);
            
     
            profile.slayingStats.totalSlays += 1;
            profile.slayingProfile.questCount += 1;
            profile.slayingProfile.lastSlay = new Date();
            
            if (slayResult.success) {
                profile.slayingStats.successfulSlays += 1;
                profile.slayingStats.monstersSlain += 1;
            } else {
                profile.slayingStats.failedSlays += 1;
            }

          
            profile.slayingStats.totalDamageDealt += slayResult.damageDealt;
            profile.slayingStats.totalDamageTaken += slayResult.damageTaken;
            profile.slayingProfile.slayerExperience += slayResult.experience;
            profile.slayingStats.slayingSkill = Math.min(100, profile.slayingStats.slayingSkill + slayResult.skillGain);

        
            const totalCosts = Object.values(slayResult.costs).reduce((sum, cost) => sum + cost, 0);
            if (totalCosts > 0) {
                profile.wallet = Math.max(0, profile.wallet - totalCosts);
                
                profile.transactions.push({
                    type: 'expense',
                    amount: totalCosts,
                    description: 'Slaying quest costs',
                    category: 'slaying'
                });
            }

          
            profile.cooldowns.slay = new Date();
            await profile.save();

       
            const components = [];

            if (slayResult.success) {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🎯 Victorious Slaying!\n## ${slayResult.monster.name.toUpperCase()} SLAIN\n\n> You successfully slew a **${slayResult.monster.name}** (Tier ${slayResult.monster.tier})!`)
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
                        .setContent(`**💥 Damage Dealt:** ${slayResult.damageDealt}\n**🩸 Damage Taken:** ${slayResult.damageTaken}\n**❤️ Health Remaining:** ${profile.slayingProfile.currentHealth}/100`)
                );

                combatContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Earned:** +${slayResult.experience} XP\n**📈 Skill Gained:** +${slayResult.skillGain}%\n**🎯 Slaying Skill:** ${profile.slayingStats.slayingSkill}%`)
                );

                components.push(combatContainer);

              
                if (slayResult.loot.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const lootContainer = new ContainerBuilder()
                        .setAccentColor(0xFFB02E);

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 💎 **TREASURE ACQUIRED**`)
                    );

                    const lootText = slayResult.loot.slice(0, 5).map(item => 
                        `**${item.name}** (${item.rarity})\n> **Value:** ${item.currentValue.toLocaleString()} Embers • **Type:** ${item.type}`
                    ).join('\n\n');

                    lootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(lootText)
                    );

                    if (slayResult.loot.length > 5) {
                        lootContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${slayResult.loot.length - 5} more items*`)
                        );
                    }

                    components.push(lootContainer);
                }

                if (slayResult.discardedLoot.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                    const discardedLootContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    discardedLootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📦 **INVENTORY FULL**`)
                    );

                    const discardedLootText = slayResult.discardedLoot.slice(0, 5).map(item =>
                        `**${item.name}** (${item.rarity}) - Discarded`
                    ).join('\n');

                    discardedLootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`You found loot, but your inventory is full! The following items were discarded:\n\n${discardedLootText}`)
                    );

                    if (slayResult.discardedLoot.length > 5) {
                        discardedLootContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`*...and ${slayResult.discardedLoot.length - 5} more items were discarded.*`)
                        );
                    }

                    discardedLootContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`\n**💡 Tip:** Sell items or buy a vault to increase your storage capacity!`)
                    );

                    components.push(discardedLootContainer);
                }

            } else {
              
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💥 Slaying Failed!\n## ${slayResult.monster.name.toUpperCase()} FLED\n\n> The **${slayResult.monster.name}** was too formidable and fled!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const failureContainer = new ContainerBuilder()
                    .setAccentColor(0xC0392B);

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚑 **WOUNDS**`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💥 Damage Dealt:** ${slayResult.damageDealt}\n**🩸 Damage Taken:** ${slayResult.damageTaken}\n**❤️ Health Remaining:** ${profile.slayingProfile.currentHealth}/100`)
                );

                failureContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏥 Healing Costs:** ${slayResult.costs.healing.toLocaleString()} Embers\n**⭐ Experience:** +${slayResult.experience} XP (participation)\n**💡 Tip:** Upgrade your gear or bring more allies!`)
                );

                components.push(failureContainer);
            }

         
            if (slayResult.allyInjuries.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const injuryContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🩹 **ALLY WOUNDS**`)
                );

                const injuryText = slayResult.allyInjuries.map(injury =>
                    `**${injury.name}** - Wounded!\n> **Healing Cost:** ${injury.healingCost.toLocaleString()} Embers`
                ).join('\n\n');

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(injuryText)
                );

                injuryContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💡 Command:** \`${prefix}heal allies\` to restore them`)
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

                const costBreakdown = Object.entries(slayResult.costs)
                    .filter(([key, value]) => value > 0)
                    .map(([key, value]) => `**${key.replace('_', ' ').toUpperCase()}:** ${value.toLocaleString()} Embers`)
                    .join('\n');

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(costBreakdown)
                );

                costsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💳 Total Cost:** ${totalCosts.toLocaleString()} Embers\n**💰 Remaining Balance:** ${profile.wallet.toLocaleString()} Embers`)
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
                    .setContent(`## ❌ **SLAYING ERROR**\n\n${error.message || 'Something went wrong during your slaying quest.'}`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};