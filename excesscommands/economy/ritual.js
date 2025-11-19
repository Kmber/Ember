const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

// Thematic outcomes for the ritual
const RITUAL_OUTCOMES = {
    SUCCESS: [
        { message: 'The dark ritual was a success! Your followers return with forbidden knowledge, increasing their allegiance.', allegianceGain: 10 },
        { message: 'The celestial alignment was perfect. The ritual strengthens the bonds of your congregation.', allegianceGain: 12 },
        { message: 'Your followers communed with an ancient entity, returning with renewed purpose and loyalty.', allegianceGain: 15 },
    ],
    FAILURE: [
        { message: 'The ritual failed! A follower was driven mad by the cosmic horrors they witnessed, sowing discord.', allegianceLoss: 10 },
        { message: 'The incantations were flawed. The ritual backfired, weakening the allegiance of your followers.', allegianceLoss: 8 },
        { message: 'An unforeseen celestial event disrupted the ritual, leaving your followers shaken.', allegianceLoss: 5 },
    ]
};

module.exports = {
    name: 'ritual',
    aliases: ['darkritual'],
    description: 'Send your followers to perform a dark ritual to increase their allegiance.',
    cooldown: 86400, // 24 hours
    async execute(message) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            // Check cooldown for 'ritual'
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'ritual');
            if (cooldownCheck.onCooldown) {
                const { hours, minutes } = cooldownCheck.timeLeft;
                const components = [];

                const cooldownContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ⏳ Ritual Cooldown Active\n## THE VEIL IS THINNING\n\n> Your followers must rest and study the forbidden texts before the next dark ritual.`)
                );
                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const timeContainer = new ContainerBuilder().setAccentColor(0xE67E22);
                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ⏱️ **TIME REMAINING**\n\n**Cooldown:** \`${hours}h ${minutes}m remaining\`\n**Next Ritual Available:** \`${new Date(Date.now() + cooldownCheck.totalMs).toLocaleTimeString()}\`\n\n> Prepare your sacrifices and incantations for when the stars align again.`)
                );
                components.push(timeContainer);

                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            // Check if user has followers
            if (profile.followers.length === 0) {
                const components = [
                    new ContainerBuilder().setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ⛪ No Congregation\n## A RITUAL REQUIRES FOLLOWERS\n\n> You have no followers to perform the dark ritual!\n\n**💡 Tip:** Use \`!addfollower\` to recruit cultists to your cause.`))
                ];
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            // Define and check for the cost of the ritual
            const ritualCost = 250 * profile.followers.length;
            if (profile.wallet < ritualCost) {
                const components = [
                    new ContainerBuilder().setAccentColor(0xE74C3C)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 💸 Insufficient Offerings\n## THE OLD ONES DEMAND A PRICE\n\n> You need **\`${ritualCost.toLocaleString()} Embers\`** for the ritual components!\n> **Current Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n> **Shortage:** \`${(ritualCost - profile.wallet).toLocaleString()} Embers\`\`)),
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),

                    new ContainerBuilder().setAccentColor(0xF39C12)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 💰 **RITUAL COST BREAKDOWN**\n\n**Followers:** \`${profile.followers.length}\`\n**Cost per Follower:** \`250 Embers\`\n**Total Ritual Cost:** \`${ritualCost.toLocaleString()} Embers\`\n\n> Scrounge for more ember. The ritual cannot wait forever.`)),
                ];
                return message.reply({ components, flags: MessageFlags.IsComponentsV2 });
            }

            // Deduct cost and set cooldown
            profile.wallet -= ritualCost;
            profile.cooldowns.ritual = new Date();

            // Determine outcome
            const isSuccess = Math.random() < 0.75; // 75% success chance
            const outcome = isSuccess
                ? RITUAL_OUTCOMES.SUCCESS[Math.floor(Math.random() * RITUAL_OUTCOMES.SUCCESS.length)]
                : RITUAL_OUTCOMES.FAILURE[Math.floor(Math.random() * RITUAL_OUTCOMES.FAILURE.length)];
            
            // Update each follower
            profile.followers.forEach(follower => {
                const change = isSuccess ? outcome.allegianceGain : -outcome.allegianceLoss;
                follower.allegiance = Math.max(0, Math.min(100, follower.allegiance + change));
                follower.totalRituals = (follower.totalRituals || 0) + 1;
                follower.lastRitual = new Date();
            });

            // Update overall profile stats
            const avgAllegiance = profile.followers.reduce((sum, f) => sum + f.allegiance, 0) / profile.followers.length;
            profile.followerAllegiance = Math.floor(avgAllegiance);

            await profile.save();

            // Build the response message
            const components = [];
            const headerContainer = new ContainerBuilder().setAccentColor(isSuccess ? 0x7C4DFF : 0xFF5252);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${isSuccess ? '🌙 Ritual Complete' : '🔥 Ritual Failed!'}\n## ${isSuccess ? 'THE WHISPERS HAVE BEEN HEEDED' : 'THE VOID STARES BACK'}\n\n> ${outcome.message}`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            
            const resultsContainer = new ContainerBuilder().setAccentColor(isSuccess ? 0x581AC4 : 0xC41A1A);
            resultsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📊 **RITUAL RESULTS**'));
            
            const allegianceChangeText = isSuccess ? `+${outcome.allegianceGain}%` : `-${outcome.allegianceLoss}%`;
            resultsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**💰 Ritual Cost:** \`${ritualCost.toLocaleString()} Embers\`\n**🖤 Allegiance Change:** \`${allegianceChangeText}\` per follower\n**🙏 New Avg. Allegiance:** \`${profile.followerAllegiance}%\`\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\``)
            );
            components.push(resultsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const nextRitualContainer = new ContainerBuilder().setAccentColor(0x9B59B6);
            nextRitualContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 🗓️ **NEXT RITUAL**\n\n**Next Ritual Available:** \`${new Date(Date.now() + 86400000).toLocaleDateString()} at ${new Date(Date.now() + 86400000).toLocaleTimeString()}\`\n**Cooldown:** \`24 hours\`\n\n> Continued rituals are the key to absolute devotion and unlocking greater power.`)
            );
            components.push(nextRitualContainer);

            await message.reply({ components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in ritual command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **RITUAL ERROR**\n\nSomething went wrong while conducting the ritual. The spirits are displeased. Please try again later.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};