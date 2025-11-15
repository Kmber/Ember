const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'pilgrimage',
    aliases: ['retinuetrip', 'journey'],
    description: 'Take your retinue on a sacred pilgrimage to strengthen their loyalty.',
    cooldown: 86400, 
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'pilgrimage');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];
                const cooldownContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ⏳ Pilgrimage Cooldown\n## THE PATH IS STILL TREACHEROUS\n\n> Your retinue requires time to reflect and recover from the last journey.`)
                );
                components.push(cooldownContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (profile.followers.length === 0) {
                const components = [];
                const noFollowersContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                noFollowersContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 👥 No Retinue\n## A LEADER NEEDS FOLLOWERS\n\n> You must have a retinue to embark on a pilgrimage!\n\n**💡 Tip:** Use the \`!recruitfollower\` command to gather followers.`)
                );
                components.push(noFollowersContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (!profile.activeMount) {
                const components = [];
                const noMountContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                noMountContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🐎 No Mount\n## A MOUNT IS REQUIRED\n\n> You need a mount to transport your retinue on this sacred pilgrimage.\n\n**💡 Tip:** Tame a beast and set it as your active mount.`)
                );
                components.push(noMountContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            const mount = profile.mounts.find(m => m.mountId === profile.activeMount);
            const pilgrimageCost = 300 * profile.followers.length;
            
            if (profile.embers < pilgrimageCost) {
                const components = [];
                const insufficientContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 💰 Insufficient Embers\n## CANNOT FUND THE PILGRIMAGE\n\n> You need **\`${pilgrimageCost.toLocaleString()} Embers\`** for the offering!\n> **Coin Purse:** \`${profile.embers.toLocaleString()}\``)
                );
                components.push(insufficientContainer);
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }
            
            profile.embers -= pilgrimageCost;
            profile.cooldowns.pilgrimage = new Date();
            
            const mountQuality = (mount.power + mount.speed + mount.endurance) / 300;
            const baseLoyaltyIncrease = 3 + Math.floor(mountQuality * 7);
            const randomBonus = Math.floor(Math.random() * 4);
            const totalLoyaltyIncrease = baseLoyaltyIncrease + randomBonus;
            
            profile.followers.forEach(follower => {
                follower.loyalty = Math.min(100, follower.loyalty + totalLoyaltyIncrease);
            });
            
            const avgLoyalty = profile.followers.reduce((sum, f) => sum + f.loyalty, 0) / profile.followers.length;
            profile.followerLoyalty = Math.floor(avgLoyalty);

            profile.deeds.push({
                type: 'expense',
                amount: pilgrimageCost,
                description: 'An offering for a sacred pilgrimage.',
                category: 'retinue'
            });
            
            await profile.save();
            
            const pilgrimageEvents = [
                'visited a forgotten shrine to the old gods.',
                'explored the moonlit ruins of a fallen kingdom.',
                'sought wisdom from a secluded hermit atop a treacherous mountain.',
                'meditated at the heart of an elemental confluence.'
            ];
            
            const randomEvent = pilgrimageEvents[Math.floor(Math.random() * pilgrimageEvents.length)];
            
            const components = [];
            const headerContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ✨ Sacred Pilgrimage Complete!\n## LOYALTY FORGED IN FAITH\n\n> Your retinue ${randomEvent}\n> The journey has fortified their loyalty to you.`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const resultsContainer = new ContainerBuilder().setAccentColor(0x2ECC71);
            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 📊 **PILGRIMAGE OUTCOME**\n\n**💰 Pilgrimage Offering:** \`${pilgrimageCost.toLocaleString()} Embers\`\n**❤️ Loyalty Forged:** \`+${totalLoyaltyIncrease}%\`\n**👥 New Retinue Loyalty:** \`${profile.followerLoyalty}%\``)
            );
            components.push(resultsContainer);

            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            
        } catch (error) {
            console.error('Error in pilgrimage command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **PILGRIMAGE FAILED**\n\nAn ill omen disrupted your plans. The pilgrimage could not be completed.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};