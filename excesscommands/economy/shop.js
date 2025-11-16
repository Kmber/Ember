const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { SHOP_ITEMS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'market',
    aliases: ['emporium', 'bazaar'],
    description: 'Browse and buy mystical items and artifacts from the Arcane Emporium.',
    usage: '!market [buy <item_id>]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            const cooldownCheck = EconomyManager.checkCooldown(profile, 'market');
            if (cooldownCheck.onCooldown) {
                const components = [];
                const cooldownContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                cooldownContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ⏳ Purchase Cooldown\n## MAGICAL INTERFERENCE\n\n> You've recently made a pact and must wait for the energies to settle!\n> This prevents catastrophic magical overlaps.`)
                );
                components.push(cooldownContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const timeContainer = new ContainerBuilder().setAccentColor(0xE67E22);
                timeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ⏱️ **COOLDOWN INFO**\n\n**Time Remaining:** \`${cooldownCheck.timeLeft.seconds}s\`\n**Cooldown Duration:** \`10 seconds\`\n\n> Peruse the Emporium's wares while the magical currents subside!`)
                );
                components.push(timeContainer);
                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (!args[0]) {
                const categories = {
                    'familiar_care': '🐾 Familiar Care',
                    'mount_gear': '🐎 Mount Gear', 
                    'warding_runes': '🛡️ Warding Runes',
                    'follower_boons': '👥 Follower Boons',
                    'arcane_boosts': '⚡ Arcane Boosts',
                    'storage_solutions': '📦 Storage Solutions'
                };
                
                const components = [];

                const headerContainer = new ContainerBuilder().setAccentColor(0x9C27B0);
                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🏰 Arcane Emporium\n## MYSTICAL ITEMS & ARTIFACTS\n\n> Welcome to the Arcane Emporium! Acquire powerful items to aid your journey.\n> Your Ember Sachel: **${profile.embers.toLocaleString()} Embers**`)
                );
                components.push(headerContainer);

                Object.entries(categories).forEach(([category, emoji]) => {
                    const items = Object.entries(SHOP_ITEMS).filter(([id, item]) => item.category === category);
                    if (items.length > 0) {
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                        const categoryContainer = new ContainerBuilder().setAccentColor(getCategoryColor(category));
                        categoryContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emoji}`));
                        
                        const itemsPerGroup = 3;
                        for (let i = 0; i < items.length; i += itemsPerGroup) {
                            const itemGroup = items.slice(i, i + itemsPerGroup);
                            const itemText = itemGroup.map(([id, item]) => 
                                `**\`${id}\`** - ${item.name}\n> **Price:** ${item.price.toLocaleString()} Embers\n> **Effect:** ${item.description}`
                            ).join('\n\n');
                            categoryContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(itemText));
                        }
                        components.push(categoryContainer);
                    }
                });

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const instructionsContainer = new ContainerBuilder().setAccentColor(0x607D8B);
                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 💡 **HOW TO PURCHASE**\n\n**Command:** \`!market buy <item_id>\`\n**Example:** \`!market buy mana_crystal\`\n**Cooldown:** \`10 seconds between purchases\`\n\n> Choose your artifacts wisely! Each has a strategic purpose in your quest for power.`)
                );
                components.push(instructionsContainer);
                
                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }
            
            if (args[0] === 'buy' && args[1]) {
                const itemId = args[1].toLowerCase();
                const item = SHOP_ITEMS[itemId];
                
                if (!item) {
                    const components = [];
                    const invalidItemContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                    invalidItemContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ❌ Unknown Artifact ID\n## ARTIFACT NOT FOUND\n\n> **\`${itemId}\`** is not a valid artifact ID!\n> Use \`!market\` to see all available wares with their correct IDs.`)
                    );
                    components.push(invalidItemContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }
                
                if (profile.embers < item.price) {
                    const components = [];
                    const insufficientContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD ARTIFACT\n\n> You lack the Embers to acquire **${item.name}**!`)
                    );
                    components.push(insufficientContainer);
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                    const priceContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                    priceContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## 💰 **PRICE BREAKDOWN**\n\n**Artifact:** \`${item.name}\`\n**Price:** ${item.price.toLocaleString()} Embers\n**Your Ember Sachel:** ${profile.embers.toLocaleString()} Embers\n**Shortfall:** ${(item.price - profile.embers).toLocaleString()} Embers\n\n> Undertake quests, complete daily tasks, or sell treasures to earn more Embers!`)
                    );
                    components.push(priceContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }
                
                profile.embers -= item.price;
                profile.cooldowns.market = new Date();
                
                let effectDescription = '';
                
                switch (itemId) {
                    case 'mana_crystal':
                        if (profile.familiars.length === 0) {
                            profile.embers += item.price;
                            // Refund message for no familiars
                            return message.reply({ content: 'You have no familiars to feed!', flags: MessageFlags.IsComponentsV2 });
                        }
                        profile.familiars.forEach(fam => {
                            fam.vitality = Math.min(100, fam.vitality + 40);
                            fam.loyalty = Math.min(100, fam.loyalty + 10);
                        });
                        effectDescription = `Nourished all ${profile.familiars.length} familiars! (+40 vitality, +10 loyalty each)`;
                        break;
                        
                    case 'mount_salve':
                        const mount = profile.mounts.find(m => m.mountId === profile.activeMount);
                        if (!mount) {
                            profile.embers += item.price;
                            // Refund message for no active mount
                            return message.reply({ content: 'You have no active mount to heal!', flags: MessageFlags.IsComponentsV2 });
                        }
                        mount.durability = Math.min(100, mount.durability + 30);
                        effectDescription = `Healed ${mount.name}! (+30 durability, now ${mount.durability}%)`;
                        break;
                        
                    case 'warding_rune':
                        const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
                        if (!primaryStronghold) {
                            profile.embers += item.price;
                             // Refund message for no primary stronghold
                            return message.reply({ content: 'You have no stronghold to ward!', flags: MessageFlags.IsComponentsV2 });
                        }
                        primaryStronghold.securityLevel = Math.min(10, primaryStronghold.securityLevel + 2);
                        effectDescription = `Reinforced wards on ${primaryStronghold.name}! (Ward Level ${primaryStronghold.securityLevel})`;
                        break;
                        
                    case 'follower_feast':
                        if (profile.followers.length === 0) {
                            profile.embers += item.price;
                            // Refund message for no followers
                             return message.reply({ content: 'You have no followers to feast!', flags: MessageFlags.IsComponentsV2 });
                        }
                        profile.followers.forEach(follower => {
                            follower.loyalty = Math.min(100, follower.loyalty + 15);
                        });
                        const newFollowerLoyalty = Math.floor(profile.followers.reduce((sum, f) => sum + f.loyalty, 0) / profile.followers.length);
                        profile.followerLoyalty = newFollowerLoyalty;
                        effectDescription = `All followers gained +15% loyalty! (Overall loyalty: ${profile.followerLoyalty}%)`;
                        break;
                        
                    case 'luck_trinket':
                    case 'gamblers_charm':
                    case 'ward_of_protection':
                    case 'dimensional_satchel':
                    case 'royal_seal':
                        const effect = item.effect;
                        const duration = effect.duration;
                        const stacks = effect.stackable ? 1 : 1;
                        
                        await EconomyManager.addActiveEffect(
                            message.author.id, 
                            message.guild.id, 
                            effect.type, 
                            effect.multiplier, 
                            duration, 
                            stacks
                        );
                        
                        const hours = Math.floor(duration / (60 * 60 * 1000));
                        effectDescription = `${item.name} activated for ${hours} hours!`;
                        
                        if (effect.stackable) {
                            effectDescription += ` (Can stack up to 5 times)`;
                        }
                        break;
                }
                
                profile.transactions.push({
                    type: 'expense',
                    amount: item.price,
                    description: `Market: ${item.name}`,
                    category: 'market'
                });
                
                await profile.save();
                
                const components = [];
                const successContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# 🛍️ Purchase Successful!\n## ARTIFACT ACQUIRED\n\n> You have successfully acquired **${item.name}** for **${item.price.toLocaleString()} Embers**!\n> Your new artifact is ready to aid you in your journey.`)
                );
                components.push(successContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                
                const effectContainer = new ContainerBuilder().setAccentColor(0x27AE60);
                effectContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ✨ **ARTIFACT EFFECT**\n\n**Effect Applied:** ${effectDescription}\n**Artifact Description:** ${item.description}`)
                );
                effectContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🪙 Remaining Embers:** ${profile.embers.toLocaleString()}\n**📊 Transaction Recorded:** Purchase logged in your chronicle.`)
                );
                components.push(effectContainer);
                
                await message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

        } catch (error) {
            console.error('Error in market command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **EMPORIUM ERROR**\n\nSomething went wrong while processing your market request. The arcane energies are unstable. Please try again in a moment.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};

function getCategoryColor(category) {
    const colors = {
        'familiar_care': 0xFF9800,   
        'mount_gear': 0x2196F3,     
        'warding_runes': 0x4CAF50,   
        'follower_boons': 0x9C27B0,    
        'arcane_boosts': 0xE91E63,      
        'storage_solutions': 0x607D8B      
    };
    return colors[category] || 0x9C27B0;
}
