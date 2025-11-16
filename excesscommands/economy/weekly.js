const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'weeklytithe',
    aliases: ['wtithe'],
    description: 'Claim your weekly tithe from the kingdom.',
    async execute(message) {
        try {
            const userId = message.author.id;
            const guildId = message.guild.id;
            const profile = await EconomyManager.getProfile(userId, guildId);

            const now = new Date();
            const cooldown = 7 * 24 * 60 * 60 * 1000; 

            if (profile.cooldowns.weeklytithe && now - profile.cooldowns.weeklytithe < cooldown) {
                const remaining = cooldown - (now - profile.cooldowns.weeklytithe);
                const remainingDays = Math.floor(remaining / (24 * 60 * 60 * 1000));
                const remainingHours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                
                const components = [];
                const cooldownContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ⏳ Weekly Tithe Cooldown\n## THE ROYAL VAULTS ARE SEALED\n\n> You have already collected your tithe for this week.`)
                );
                components.push(cooldownContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            const baseTithe = 2000;
            const levelBonus = (profile.level || 0) * 150;
            const followerBonus = Math.floor(((profile.followerLoyalty || 0) / 100) * 1200);

            let totalTithe = baseTithe + levelBonus + followerBonus;
            
            await EconomyManager.updateEmbers(userId, guildId, totalTithe);
            profile.cooldowns.weeklytithe = now;
            profile.experience += 120;
            
            profile.transactions.push({
                type: 'income',
                amount: totalTithe,
                description: 'Weekly tithe from the kingdom',
                category: 'reward'
            });

            await profile.save();

            const components = [];
            const headerContainer = new ContainerBuilder().setAccentColor(0x2ECC71);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 👑 Weekly Tithe Claimed!\n## THE KINGDOM REWARDS YOUR LOYALTY\n\n> You have received a tithe of **\`${totalTithe.toLocaleString()} Embers\`**.`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const breakdownContainer = new ContainerBuilder().setAccentColor(0x27AE60);
            breakdownContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 💰 **TITHE BREAKDOWN**\n\n**💎 Base Tithe:** \`${baseTithe.toLocaleString()} Embers\`\n**⭐ Renown Bonus:** \`${levelBonus.toLocaleString()} Embers\` (Level ${profile.level})\n**👥 Retinue Bonus:** \`${followerBonus.toLocaleString()} Embers\` (${profile.followerLoyalty}% loyalty)`)
            );
            components.push(breakdownContainer);

            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in weeklytithe command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **TITHE ERROR**\n\nA royal decree prevents the collection of tithes at this time.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    },
};