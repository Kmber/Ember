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
    name: 'slaying',
    aliases: ['slayer', 'slaystats', 'spf'],
    description: 'View your complete slaying profile and statistics',
    usage: 'slaying',
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            
            if (profile.slayingVaults.length === 0 && profile.slayingInventory.length > 0) {
                profile.slayingInventory = [];
                await profile.save();
            }
            
            const components = [];

     
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x8E44AD);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💀 ${message.author.username}'s Slaying Profile\\n## MONSTER SLAYER\\n\\n> Your complete slaying quest overview`)
            );

            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const statsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎯 **SLAYER STATISTICS**`)
            );

            const successRate = profile.slayingStats.totalSlays > 0 ? 
                Math.floor((profile.slayingStats.successfulSlays / profile.slayingStats.totalSlays) * 100) : 0;

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏹 Slayer Level:** ${profile.slayingProfile.slayerLevel}\\n**⭐ Experience:** ${profile.slayingProfile.slayerExperience.toLocaleString()} XP\\n**❤️ Health:** ${profile.slayingProfile.currentHealth}/100`)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Slaying Skill:** ${profile.slayingStats.slayingSkill}%\\n**🛡️ Survival Skill:** ${profile.slayingStats.survivalSkill}%\\n**⭐ Success Rate:** ${successRate}%`)
            );

            components.push(statsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

      
            const historyContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📊 **QUEST HISTORY**`)
            );

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Total Quests:** ${profile.slayingStats.totalSlays}\\n**✅ Successful:** ${profile.slayingStats.successfulSlays}\\n**❌ Failed:** ${profile.slayingStats.failedSlays}`)
            );

            historyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💀 Monsters Slain:** ${profile.slayingStats.monstersSlain}\\n**💰 Total Earnings:** ${profile.slayingStats.totalEarnings.toLocaleString()} Embers\\n**📦 Chests Found:** ${profile.slayingStats.chestsFound}`)
            );

            components.push(historyContainer);

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const equipmentContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 🎒 **GEAR OVERVIEW**`)
            );

            const activeMount = profile.slayingMounts.find(v => v.mountId === profile.activeMount);
            const activeWeapon = profile.slayingWeapons.find(w => w.weaponId === profile.activeWeapon);
            const activeAllyCount = profile.activeAllies.length;

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐎 Active Mount:** ${activeMount ? activeMount.name : 'None'}\\n**⚔️ Active Weapon:** ${activeWeapon ? activeWeapon.name : 'None'}\\n**👥 Active Allies:** ${activeAllyCount}/${profile.maxAllies}`)
            );

            equipmentContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🐎 Total Mounts:** ${profile.slayingMounts.length}\\n**⚔️ Total Weapons:** ${profile.slayingWeapons.length}\\n**👥 Total Allies:** ${profile.slayingAllies.length}`)
            );

            components.push(equipmentContainer);

          
            const storageUsed = SlayingManager.calculateInventoryWeight(profile);
            const storageCapacity = SlayingManager.calculateStorageCapacity(profile);

            if (profile.slayingVaults.length > 0 || profile.slayingInventory.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const storageContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🏰 **TROPHIES & LOOT**`)
                );

                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📦 Inventory Items:** ${profile.slayingInventory.length}\\n**⚖️ Storage Used:** ${storageUsed}/${storageCapacity} capacity\\n**🏰 Vaults:** ${profile.slayingVaults.length}`)
                );

                const totalInventoryValue = profile.slayingInventory.reduce((sum, item) => sum + (item.currentValue * item.quantity), 0);
                
                storageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Inventory Value:** ${totalInventoryValue.toLocaleString()} Embers\\n**💡 Commands:**\\n> **\`${prefix}inventory\`** - View your full inventory\\n> **\`${prefix}openchest <id>\`** - Open a found chest\\n> **\`${prefix}sell <id>\`** - Sell an item for Embers`)
                );

                components.push(storageContainer);
            }

          
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const commandsContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            commandsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📋 **QUICK COMMANDS**\\n\\n**\`${prefix}slay\`** - Go on a quest\\n**\`${prefix}heal\`** - Restore health or allies\\n**\`${prefix}equip <id>\`** - Manage your loadout\\n**\`${prefix}use <id>\`** - Use a consumable item\\n**\`${prefix}slayershop\`** - Buy new gear\\n**\`${prefix}upgrade\`** - Upgrade your weapons`)
            );

            components.push(commandsContainer);

            return message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in slaying command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ❌ **PROFILE ERROR**\\n\\nCouldn't load your slaying profile. Please try again.`)
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};