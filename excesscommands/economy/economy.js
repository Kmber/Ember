const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');

module.exports = {
    name: 'economy',
    aliases: ['dark-economy', 'deco', 'dark-guide'],
    description: 'Complete guide to the dark fantasy economy system.',
    async execute(message) {
        try {
            const serverPrefix = message.prefix || '!';
            let currentPage = 0;
            const totalPages = 9;

            const createPage = (pageNum) => {
                const components = [];

                switch (pageNum) {
                    case 0: // Page 1: Command Overview
                        const headerContainer = new ContainerBuilder()
                            .setAccentColor(0x8B0000);

                        headerContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🌑 DARK FANTASY ECONOMY\n## FORGE YOUR EMPIRE IN SHADOW\n\n> **Page 1 of 9** | Complete mastery guide for total domination\n> Use navigation buttons to explore all advanced systems and strategies`)
                        );

                        components.push(headerContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Basic Economy Commands
                        const basicContainer = new ContainerBuilder()
                            .setAccentColor(0x4B0082);

                        basicContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 💰 **CORE COMMANDS** (5 Commands)')
                        );

                        basicContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`${serverPrefix}balance\`** (*bal*, *embers*) - Check your Soul Embers & active effects\n**\`${serverPrefix}daily\`** - Claim daily Soul Embers with streak bonuses\n**\`${serverPrefix}weekly\`** (*week*) - Claim weekly mega Soul Ember rewards\n**\`${serverPrefix}work\`** - Toil for Soul Embers (1 hour cooldown)\n**\`${serverPrefix}beg\`** (*ask*, *plead*) - Plead for Soul Embers (10 min cooldown)`)
                        );

                        components.push(basicContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Banking & Trading
                        const bankingContainer = new ContainerBuilder()
                            .setAccentColor(0x800080);

                        bankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏦 **VAULT & TRADE** (5 Commands)')
                        );

                        bankingContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`${serverPrefix}deposit\`** (*dep*) - Store Soul Embers safely in the vault\n**\`${serverPrefix}withdraw\`** (*with*) - Take Soul Embers from the vault\n**\`${serverPrefix}donate\`** (*give*, *transfer*) - Bestow your Embers to another soul\n**\`${serverPrefix}gamble\`** (*bet*) - Risk Soul Embers for twisted fortunes\n**\`${serverPrefix}rob\`** - Attempt to plunder another soul's Embers`)
                        );

                        components.push(bankingContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Citadel System
                        const propertyContainer = new ContainerBuilder()
                            .setAccentColor(0x9A2A2A);

                        propertyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏰 **CITADEL SYSTEM** (3 Commands)')
                        );

                        propertyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`${serverPrefix}acquirecitadel\`** (*citadel-buy*) - Acquire a citadel for your followers\n**\`${serverPrefix}mycitadel\`** (*citadel-info*) - View your citadel and its inhabitants\n**\`${serverPrefix}addfollower\`** (*follower-add*) - Bind a follower to your citadel`)
                        );

                        components.push(propertyContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Beast System
                        const vehicleContainer = new ContainerBuilder()
                            .setAccentColor(0x556B2F);

                        vehicleContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 👹 **BEAST SYSTEM** (3 Commands)')
                        );

                        vehicleContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**\`${serverPrefix}summon\`** (*beast-summon*) - Summon beasts for races and combat\n**\`${serverPrefix}bestiary\`** (*beasts*) - Manage your collection of beasts\n**\`${serverPrefix}beastrace\`** - Race your beasts for Ember prizes`)
                        );

                        components.push(vehicleContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Advanced Systems Preview
                        const advancedContainer = new ContainerBuilder()
                            .setAccentColor(0x696969);

                        advancedContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 🚀 **ADVANCED SYSTEMS PREVIEW**\n\n**👥 Follower System** - Build a loyal retinue for passive income\n**👾 Minion System** - Command dark creatures for protection\n**🛡️ Guild Empire** - Forge alliances for passive income generation\n**🎯 Raid System** - Team-based assaults on dark fortresses\n**🛒 Black Market** - Acquire forbidden roles and powerful artifacts\n**📊 Leaderboards** - Ascend the ranks of power\n\n> Navigate through all 9 pages to master every aspect of this dark economy!`)
                        );

                        components.push(advancedContainer);
                        break;

                    case 1: // Page 2: Basic Economy System
                        const basicEconHeader = new ContainerBuilder()
                            .setAccentColor(0x4B0082);

                        basicEconHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 💰 BASIC ECONOMY SYSTEM\n## HOW SOUL EMBERS FUEL THIS DARK WORLD\n\n> **Page 2 of 9** | Master the fundamentals\n> Understanding these basics is essential for building your shadow empire`)
                        );

                        components.push(basicEconHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Income Sources
                        const incomeContainer = new ContainerBuilder()
                            .setAccentColor(0x2E8B57);

                        incomeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🔄 **SOURCES OF SOUL EMBERS**')
                        );

                        incomeContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Daily Tithe:** \`500-2,000+ Embers\` (streak bonuses)\n**Dark Labor:** \`200-800 Embers\` base + follower bonus\n**Guild Tribute:** \`500-15,000+ Embers\` daily passive income\n**Raid Spoils:** \`50,000-5,000,000 Embers\` (high risk/reward)\n**Gambling Wins:** 45-75% chance with forbidden luck\n**Beast Race Victories:** Depends on beast's might\n**Follower Offerings:** Passive income from your loyal subjects`)
                        );

                        components.push(incomeContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Expenses
                        const expensesContainer = new ContainerBuilder()
                            .setAccentColor(0xA52A2A);

                        expensesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 💸 **COSTS & SACRIFICES**')
                        );

                        expensesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Citadel Upkeep:** Monthly maintenance tribute\n**Guild Tithes:** Acolyte wages + upkeep\n**Raid Preparations:** \`5,000-75,000 Embers\` per assault\n**Minion Sustenance:** Offerings, rituals, and care\n**Beast Maintenance:** Mending, feeding, and enhancements\n**Black Market Purchases:** Artifacts and forbidden knowledge\n**Penance:** Fines for failed raids and transgressions`)
                        );

                        components.push(expensesContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Ember Strategy
                        const strategyContainer = new ContainerBuilder()
                            .setAccentColor(0x800000);

                        strategyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💡 **ADVANCED SOUL EMBER STRATEGY**\n\n**🏰 Citadel Vault:** 50% (protected from plunder) (Embers)\n**🛡️ Guild Investments:** 30% (passive tribute)\n**💀 Wallet:** 15% (for daily rituals & raids) (Embers)\n**🏦 Shadow Bank:** 5% (emergency reserves) (Embers)\n\n**Why This Path Leads to Power:**\n> • Guilds generate passive tribute 24/7\n> • Citadel Vaults protect against plunder\n> • A full wallet funds opportunities and finances raids`)
                        );

                        components.push(strategyContainer);
                        break;

                    case 2: // Page 3: Citadel System
                        const propertyHeader = new ContainerBuilder()
                            .setAccentColor(0x9A2A2A);

                        propertyHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🏰 CITADEL SYSTEM - YOUR STRONGHOLD\n## CITADELS ARE POWER - YOUR DOMINION DEPENDS ON IT\n\n> **Page 3 of 9** | Master citadel investment\n> Your citadel determines follower capacity, vault size, and security`)
                        );

                        components.push(propertyHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Starter Properties
                        const starterContainer = new ContainerBuilder()
                            .setAccentColor(0x8FBC8F);

                        starterContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏘️ **FLEDGLING STRONGHOLDS**')
                        );

                        starterContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**CRYPT** - \`50,000 Embers\`\n> • Follower Slots: 1 follower\n> • Vault Capacity: 10,000 Embers\n> • Security Level: 1\n> • Beast Lair: None\n> • Monthly Upkeep: 950 Embers\n\n**FORTIFIED MANOR** - \`120,000 Embers\`\n> • Follower Slots: 3 followers\n> • Vault Capacity: 25,000 Embers\n> • Security Level: 2\n> • Beast Lair: 1 beast\n> • Monthly Upkeep: 1,750 Embers`)
                        );

                        components.push(starterContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Mid-Tier Properties
                        const midTierContainer = new ContainerBuilder()
                            .setAccentColor(0x663399);

                        midTierContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🏰 **GROWING DOMINIONS**')
                        );

                        midTierContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**SHADOW KEEP** - \`300,000 Embers\`\n> • Follower Slots: 5 followers\n> • Vault Capacity: 75,000 Embers\n> • Security Level: 4\n> • Beast Lair: 2 beasts\n> • Monthly Upkeep: 2,900 Embers\n\n**DREADFORT** - \`800,000 Embers\`\n> • Follower Slots: 8 followers\n> • Vault Capacity: 200,000 Embers\n> • Security Level: 7\n> • Beast Lair: 5 beasts\n> • Monthly Upkeep: 5,800 Embers`)
                        );

                        components.push(midTierContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Elite Property
                        const eliteContainer = new ContainerBuilder()
                            .setAccentColor(0x483D8B);

                        eliteContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 👑 **SOVEREIGN CITADEL**\n\n**OBSIDIAN SPIRE** - \`2,000,000 Embers\`\n> • Follower Slots: 12 followers\n> • Vault Capacity: 500,000 Embers\n> • Security Level: 10\n> • Beast Lair: 10 beasts\n> • Monthly Upkeep: 11,500 Embers\n\n**🎯 End Game Goal:** A Spire with 12 loyal followers + multiple guilds generating 50,000+ Embers daily!`)
                        );

                        components.push(eliteContainer);
                        break;

                    case 3: // Page 4: Follower & Minion System
                        const familyHeader = new ContainerBuilder()
                            .setAccentColor(0x9932CC);

                        familyHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 👥 FOLLOWERS & 👾 MINIONS\n## YOUR LEGION OF SHADOW + VAULT GUARDIANS\n\n> **Page 4 of 9** | Build your legion and protect it\n> Followers generate passive income and minions provide security`)
                        );

                        components.push(familyHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Follower Hierarchy
                        const hierarchyContainer = new ContainerBuilder()
                            .setAccentColor(0x8A2BE2);

                        hierarchyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 💀 **FOLLOWER HIERARCHY**')
                        );

                        hierarchyContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**🥇 ACOLYTE** (Priority #1)\n> • Tribute Range: 300-800 Embers per task\n> • Roles: Scribe, Alchemist, Spymaster\n> • Best ROI and affects other follower loyalty\n\n**🥈 MERCENARY** (Priority #2)\n> • Tribute Range: 400-900 Embers per task\n> • Roles: Sellsword, Bodyguard\n> • Stable high income\n\n**🥉 THRALL** (Fill remaining slots)\n> • Tribute Range: 250-600 Embers per task\n> • Roles: Laborer, Miner, Forager\n\n**🏅 INITIATE** (Last resort)\n> • Tribute Range: 50-200 Embers per task\n> • Roles: Aspirant, Neophyte\n> • Lowest income but fills capacity`)
                        );

                        components.push(hierarchyContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Loyalty Mechanics
                        const bondContainer = new ContainerBuilder()
                            .setAccentColor(0xDC143C);

                        bondContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## ❤️ **FOLLOWER LOYALTY MECHANICS**\n\n**Loyalty Levels & Income Impact:**\n> • **0-25% Loyalty:** 0.25x tribute (Fearful)\n> • **26-50% Loyalty:** 0.50x tribute (Indifferent)\n> • **51-75% Loyalty:** 0.75x tribute (Obedient)\n> • **76-90% Loyalty:** 0.90x tribute (Devoted)\n> • **91-100% Loyalty:** 1.00x tribute (Fanatical)\n\n**Improving Loyalty:**\n> • Dark Gifts: +5-15% loyalty per gift\n> • Rite of Binding artifact: +15% to ALL followers\n> • Loyalty decays 1-2% weekly without attention`)
                        );

                        components.push(bondContainer);
                        break;

                    case 4: // Page 5: Black Market & Effects
                        const shopHeader = new ContainerBuilder()
                            .setAccentColor(0x483D8B);

                        shopHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ⚡ DARK ARTS & 🛒 BLACK MARKET\n## ARTIFACTS, CURSES & STRATEGIC ACQUISITIONS\n\n> **Page 5 of 9** | Master the forbidden arts\n> Strategic black market purchases can multiply your power and success rates`)
                        );

                        components.push(shopHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Gambling Luck System
                        const luckContainer = new ContainerBuilder()
                            .setAccentColor(0x008080);

                        luckContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🍀 **FORBIDDEN LUCK SYSTEM**')
                        );

                        luckContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Hand of Glory** - \`5,000 Embers each\`\n> • Effect: +20% gambling win chance\n> • Duration: 4 hours per use\n> • **Stackable up to 5 times!**\n> • Max boost: 100% extra win chance\n\n**Strategy:** Stack 5x before a high-stakes gamble\n**Math:** 45% base + 100% luck = 75% win rate!\n**Best Use:** When you have 50,000+ Embers to risk`)
                        );

                        components.push(luckContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Income Boosters
                        const boostersContainer = new ContainerBuilder()
                            .setAccentColor(0xDAA520);

                        boostersContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💼 **TRIBUTE BOOSTERS**\n\n**Chalice of Greed** - \`10,000 Embers\`\n> • Effect: +50% work income for 7 days\n> • Stacks with follower bonuses\n> • Example: 2,000 Embers from toil becomes 3,000 Embers\n\n**Rite of Binding** - \`3,000 Embers\`\n> • Effect: +15% loyalty to ALL followers\n> • Instant effect, no cooldown\n> • Cheaper than bestowing multiple gifts\n> • Best when loyalty is below 80%`)
                        );

                        components.push(boostersContainer);
                        break;

                    case 5: // Page 6: Beasts & Minions
                        const vehiclesHeader = new ContainerBuilder()
                            .setAccentColor(0x556B2F);

                        vehiclesHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 👹 BEASTS & 👾 MINION MANAGEMENT\n## BUILD YOUR MENAGERIE & SHADOW ARMY\n\n> **Page 6 of 9** | Dominate races and protect your domain\n> Beasts provide racing income while minions offer security`)
                        );

                        components.push(vehiclesHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Beast Performance Tiers
                        const carsContainer = new ContainerBuilder()
                            .setAccentColor(0x808000);

                        carsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 👹 **BEAST POWER TIERS**')
                        );

                        carsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**DIRE WOLF** - \`15,000 Embers\`\n> • Stats: 45 Speed, 40 Cunning, 50 Agility\n> • Win Rate: ~30% • Winnings: 1,000-3,000 Embers\n\n**GRIFFIN** - \`45,000 Embers\`\n> • Stats: 70 Speed, 75 Cunning, 65 Agility\n> • Win Rate: ~55% • Winnings: 2,000-5,000 Embers\n\n**MANTICORE** - \`200,000 Embers\`\n> • Stats: 95 Speed, 90 Cunning, 85 Agility\n> • Win Rate: ~80% • Winnings: 4,000-8,000 Embers\n\n**WYVERN** - \`500,000 Embers\`\n> • Stats: 100 Speed, 100 Cunning, 95 Agility\n> • Win Rate: ~95% • Winnings: 6,000-12,000 Embers`)
                        );

                        components.push(carsContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Minion Security Force
                        const petsContainer = new ContainerBuilder()
                            .setAccentColor(0x2F4F4F);

                        petsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 👾 **MINION SECURITY FORCE**\n\n**IMP** - \`500 Embers\`\n> • Security: 10 points • Low sustenance\n> • Good for: Basic warding\n\n**GARGOYLE** - \`2,000 Embers\`\n> • Security: 40 points • Medium sustenance\n> • Good for: Standard citadel defense\n\n**HELL HOUND** - \`5,000 Embers\`\n> • Security: 70 points • High sustenance\n> • Good for: Maximum vault protection\n\n**SPECTRAL SENTINEL** - \`3,000 Embers\`\n> • Security: 35 points • Medium sustenance\n> • Good for: Balanced ethereal security`)
                        );

                        components.push(petsContainer);
                        break;

                    case 6: // Page 7: Guild System
                        const businessHeader = new ContainerBuilder()
                            .setAccentColor(0x2E8B57);

                        businessHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🛡️ GUILD EMPIRE SYSTEM\n## BUILD YOUR PASSIVE TRIBUTE EMPIRE\n\n> **Page 7 of 9** | Master guild domination\n> Guilds generate tribute 24/7 even while you slumber`)
                        );

                        components.push(businessHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Guild Types
                        const businessTypesContainer = new ContainerBuilder()
                            .setAccentColor(0xDAA520);

                        businessTypesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🛡️ **GUILD TYPES & PROFITABILITY**')
                        );

                        businessTypesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**THIEVES GUILD** - \`50,000 Embers\`\n> • Daily Tribute: 200-800 Embers per level\n> • Max Level: 10 • Acolytes: 20\n> • Stable income, follower discounts\n\n**ASSASSINS GUILD** - \`100,000 Embers\`\n> • Daily Tribute: 100-1,500 Embers per level (volatile)\n> • Max Level: 10 • Acolytes: 15\n> • High risk/reward, potential for great contracts\n\n**MERCHANTS GUILD** - \`75,000 Embers\`\n> • Daily Tribute: 300-600 Embers per level\n> • Max Level: 10 • Acolytes: 12\n> • Steady income, market manipulation bonuses`)
                        );

                        components.push(businessTypesContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Premium Guilds
                        const premiumContainer = new ContainerBuilder()
                            .setAccentColor(0x483D8B);

                        premiumContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 💎 **ELITE GUILDS**\n\n**NECROMANCER COVEN** - \`200,000 Embers\`\n> • Daily Tribute: 400-1,000 Embers per level\n> • Max Level: 10 • Acolytes: 10\n> • Sell minions to players, undead bonuses\n\n**DARK WARRIORS CLAN** - \`150,000 Embers\`\n> • Daily Tribute: 250-700 Embers per level\n> • Max Level: 10 • Acolytes: 25\n> • Lucrative contracts, mercenary services\n\n**ILLUMINATI CABAL** - \`500,000 Embers\`\n> • Daily Tribute: 0-3,000 Embers per level (very volatile)\n> • Max Level: 10 • Acolytes: 30\n> • Ultimate high-risk guild, Ember laundering`)
                        );

                        components.push(premiumContainer);
                        break;

                    case 7: // Page 8: Raid System
                        const heistHeader = new ContainerBuilder()
                            .setAccentColor(0xA52A2A);

                        heistHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 🎯 RAID SYSTEM - TEAM-BASED ASSAULTS\n## PLAN & EXECUTE RAIDS ON DARK FORTRESSES\n\n> **Page 8 of 9** | Master the art of the raid\n> High risk operations with massive spoils - requires teamwork`)
                        );

                        components.push(heistHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Raid Targets
                        const targetsContainer = new ContainerBuilder()
                            .setAccentColor(0xDC143C);

                        targetsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🎯 **RAID TARGETS & SPOILS**')
                        );

                        targetsContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**GOBLIN ENCAMPMENT** - Easy (75% success)\n> • Spoils: 50,000-150,000 Embers • Members: 3\n> • Gear: Weapons, getaway beasts\n\n**HAUNTED CRYPT** - Medium (60% success)\n> • Spoils: 100,000-400,000 Embers • Members: 3\n> • Gear: Warding charms, lockpicks, beasts\n\n**DRAGON'S LAIR** - Hard (25% success)\n> • Spoils: 800,000-2,000,000 Embers • Members: 5\n> • Gear: Dragonfire wards, climbing tools\n\n**LICH'S SANCTUM** - Ultimate (15% success)\n> • Spoils: 2,000,000-5,000,000 Embers • Members: 6\n> • Gear: Soul-forged weapons, EMP, explosives`)
                        );

                        components.push(targetsContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Raid Roles
                        const rolesContainer = new ContainerBuilder()
                            .setAccentColor(0x483D8B);

                        rolesContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`## 👥 **RAID ROLES & RESPONSIBILITIES**\n\n**WARLORD** (Required)\n> • Plans the raid, gets 1.5x spoil share\n> • Must own gear and recruit warband\n\n**SORCERER** (Magic raids)\n> • Bypasses magical wards, 1.3x spoils\n> • Requires high raid skill level\n\n**ROGUE** (Vault raids)\n> • Opens locks and chests, 1.2x spoils\n> • Specialized role for sanctums\n\n**BERSERKER/RANGER/SENTINEL** (Support)\n> • Essential support roles, 1.0x spoils\n> • Lower skill requirements`)
                        );

                        components.push(rolesContainer);
                        break;

                    case 8: // Page 9: Pro Strategies
                        const proHeader = new ContainerBuilder()
                            .setAccentColor(0xFFD700);

                        proHeader.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# 💡 DARK LORD STRATEGIES & MASTER TIPS\n## ELITE STRATEGIES FOR TOTAL ECONOMIC DOMINATION\n\n> **Page 9 of 9** | Become the server's most powerful soul\n> Master these strategies to build an unstoppable shadow empire`)
                        );

                        components.push(proHeader);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                        // Early Game Mastery
                        const earlyGameContainer = new ContainerBuilder()
                            .setAccentColor(0x2E8B57);

                        earlyGameContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 🚀 **EARLY GAME MASTERY** (Levels 1-10)')
                        );

                        earlyGameContainer.addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`**Week 1: Foundation**\n1. Claim daily tithes religiously (build streaks)\n2. Toil every hour possible\n3. Save 50,000 Embers for a Crypt + Thieves Guild\n4. Immediately bind an Acolyte (highest income)\n5. Summon an Imp for basic warding (500 Embers)\n\n**Week 2-3: Guild Scaling**\n6. Upgrade Thieves Guild to level 3-4\n7. Hire 5-10 acolytes for the guild\n8. Save for Fortified Manor upgrade\n9. Add a Mercenary as 2nd follower\n10. Collect guild tribute daily`)
                        );

                        components.push(earlyGameContainer);
                        components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                                             // Mid Game Tactics
                                             const midGameContainer = new ContainerBuilder()
                                             .setAccentColor(0xDAA520);
                 
                                         midGameContainer.addTextDisplayComponents(
                                             new TextDisplayBuilder()
                                                 .setContent(`## 💎 **MID GAME TACTICS** (Levels 10-25)\n\n**Month 2: Empire Expansion**\n1. Own a Thieves Guild + Assassins Guild\n2. Save 300,000 Embers for a Shadow Keep\n3. Fill all 5 follower slots\n4. Bestow Dark Gifts to boost loyalty to 80%+\n5. Plan first Goblin Encampment raid (easy Embers)\n\n**Tribute Targets Per Week:**\n> • Guild Tribute: 20,000-40,000 Embers\n> • Toil + Followers: 15,000-25,000 Embers\n> • Raid Spoils: 50,000-200,000 Embers\n> • **Total: 85,000-265,000 Embers weekly tribute**`)
                                         );
                 
                                         components.push(midGameContainer);
                                         components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                 
                                         // The 12 Dark Oaths
                                         const commandmentsContainer = new ContainerBuilder()
                                             .setAccentColor(0xDC143C);
                 
                                         commandmentsContainer.addTextDisplayComponents(
                                             new TextDisplayBuilder()
                                                 .setContent(`## ⚠️ **THE 12 DARK OATHS OF POWER**\n\n1. **NEVER** attempt raids without full gear\n2. **ALWAYS** inspect your warband's raid skills\n3. **NEVER** plan raids during high alert periods\n4. **ALWAYS** collect guild tribute daily\n5. **NEVER** gamble without forbidden luck\n6. **ALWAYS** tend to your minions every 2-3 days\n7. **NEVER** keep more than 25% of your Embers in your wallet\n8. **ALWAYS** upgrade guilds before acquiring new ones\n9. **NEVER** race with beasts below 70% health\n10. **ALWAYS** recruit experienced raid members\n11. **NEVER** attempt a Lich's Sanctum with <80 raid skill\n12. **ALWAYS** diversify tribute: guilds + followers + raids`)
                                         );
                 
                                         components.push(commandmentsContainer);
                                         break;
                 
                                     default:
                                         components.push(new ContainerBuilder().setAccentColor(0xFF0000)
                                             .addTextDisplayComponents(new TextDisplayBuilder().setContent('Page not found')));
                                 }
                 
                                 return components;
                             };
                 
                             const createNavigationButtons = () => {
                                 const navContainer = new ContainerBuilder()
                                     .setAccentColor(0x696969);
                 
                                 const navText = `## 📖 **NAVIGATION**\n\n**Current Page:** ${currentPage + 1} of ${totalPages}\n\n**📚 Guide Sections:**\n> 1. Command Overview • 2. Basic Economy • 3. Citadel System\n> 4. Followers & Minions • 5. Black Market & Effects • 6. Beasts & Minions\n> 7. Guild Empire • 8. Raid System • 9. Dark Lord Strategies\n\n**⏰ This guide expires in 10 minutes**`;
                 
                                 if (currentPage > 0) {
                                     navContainer.addTextDisplayComponents(
                                         new TextDisplayBuilder().setContent(\`${navText}\n\n**◀️ Previous:** Page ${currentPage}\`)
                                     );
                                 } else if (currentPage < totalPages - 1) {
                                     navContainer.addTextDisplayComponents(
                                         new TextDisplayBuilder().setContent(\`${navText}\n\n**▶️ Next:** Page ${currentPage + 2}\`)
                                     );
                                 } else {
                                     navContainer.addTextDisplayComponents(
                                         new TextDisplayBuilder().setContent(navText)
                                     );
                                 }
                 
                                 return navContainer;
                             };
                 
                             const sendPage = async (isEdit = false) => {
                                 const components = createPage(currentPage);
                                 components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                                 components.push(createNavigationButtons());
                 
                                 const messageData = {
                                     components: components,
                                     flags: MessageFlags.IsComponentsV2
                                 };
                 
                                 if (isEdit) {
                                     return msg.edit(messageData);
                                 } else {
                                     return message.reply(messageData);
                                 }
                             };
                 
                 
                             const msg = await sendPage();
                 
                 
                             await msg.react('◀️');
                             await msg.react('▶️');
                             await msg.react('❌');
                 
                             const reactionCollector = msg.createReactionCollector({
                                 filter: (reaction, user) => {
                                     return ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                                 },
                                 time: 600000
                             });
                 
                             reactionCollector.on('collect', async (reaction, user) => {
                                 await reaction.users.remove(user.id);
                 
                                 switch (reaction.emoji.name) {
                                     case '◀️':
                                         if (currentPage > 0) {
                                             currentPage--;
                                             await sendPage(true);
                                         }
                                         break;
                                     case '▶️':
                                         if (currentPage < totalPages - 1) {
                                             currentPage++;
                                             await sendPage(true);
                                         }
                                         break;
                                     case '❌':
                                         const closedComponents = [];
                                         const closedContainer = new ContainerBuilder()
                                             .setAccentColor(0x696969);
                 
                                         closedContainer.addTextDisplayComponents(
                                             new TextDisplayBuilder()
                                                 .setContent(\`# 📚 Dark Fantasy Economy Guide Closed\n## MAY YOUR EMBERS NEVER FADE\n\n> The guide has been closed. Use \`${serverPrefix}economy\` to reopen it.\`)
                                         );
                 
                                         closedComponents.push(closedContainer);
                 
                                         await msg.edit({
                                             components: closedComponents,
                                             flags: MessageFlags.IsComponentsV2
                                         });
                                         reactionCollector.stop();
                                         break;
                                 }
                             });
                 
                             reactionCollector.on('end', () => {
                                 msg.reactions.removeAll().catch(() => {});
                             });
                 
                         } catch (error) {
                             console.error('Error in economy command:', error);
                 
                             const errorContainer = new ContainerBuilder()
                                 .setAccentColor(0xFF0000);
                 
                             errorContainer.addTextDisplayComponents(
                                 new TextDisplayBuilder()
                                     .setContent('## ❌ **ECONOMY GUIDE ERROR**\n\nSomething went wrong while loading the economy guide. Please try again in a moment.')
                             );
                 
                             return message.reply({
                                 components: [errorContainer],
                                 flags: MessageFlags.IsComponentsV2
                             });
                         }
                     }
                 };
                 