// constants/guildData.js
const GUILDS = {
    'alchemist_guild': {
        name: 'Alchemist Guild',
        description: 'Brew potions and elixirs for adventurers and nobles',
        baseCost: 50000,
        dailyIncome: [200, 800], // min, max per level
        maxLevel: 10,
        apprenticeCost: 150, // per apprentice per day
        maxApprentices: 20,
        upgradeCostMultiplier: 1.5,
        categories: ['potion_quality', 'arcane_knowledge', 'herb_supply', 'reputation'],
        specialBonuses: {
            family_discount: 'Family members receive free potions (saves 50 embers/day per member)',
            master_alchemist: 'Hire legendary alchemist (+50% income for 30 days)',
            guild_franchise: 'Open satellite apothecaries (+25% base income)'
        }
    },
    'arcane_academy': {
        name: 'Arcane Academy',
        description: 'Train mages and sell magical artifacts',
        baseCost: 100000,
        dailyIncome: [100, 1500], // very volatile
        maxLevel: 10,
        apprenticeCost: 300, // expensive arcane tutors
        maxApprentices: 15,
        upgradeCostMultiplier: 2.0,
        categories: ['arcane_research', 'student_recruitment', 'artifact_creation', 'funding'],
        specialBonuses: {
            grand_graduation: 'Host graduation ceremony (1000x daily income for 7 days, then +100% forever)',
            viral_spell: 'Create viral enchantment (+200% income for 14 days)',
            royal_patronage: 'Secure royal funding (+75% income, very stable)'
        }
    },
    'merchants_guild': {
        name: 'Merchants Guild',
        description: 'Trade rare goods and earn commissions',
        baseCost: 75000,
        dailyIncome: [300, 600], // stable income
        maxLevel: 10,
        apprenticeCost: 200,
        maxApprentices: 12,
        upgradeCostMultiplier: 1.3,
        categories: ['trade_routes', 'merchant_network', 'reputation', 'warehouses'],
        specialBonuses: {
            luxury_specialist: 'Specialize in rare artifacts (+100% income)',
            market_oracle: 'Divine market trends (predict profitable trades)',
            caravan_raids: 'Intercept rival caravans (massive profit events)'
        }
    },
    'beast_traders': {
        name: 'Beast Traders Guild',
        description: 'Breed and sell magical mounts to adventurers',
        baseCost: 200000,
        dailyIncome: [400, 1000],
        maxLevel: 10,
        apprenticeCost: 250,
        maxApprentices: 10,
        upgradeCostMultiplier: 1.4,
        categories: ['beast_stock', 'training_facility', 'stables', 'reputation'],
        specialBonuses: {
            legendary_mounts: 'Breed elder dragons (+150% profit margins)',
            arena_champion: 'Sponsor beast arenas (marketing boost)',
            trade_ins: 'Accept adventurer mount trade-ins (extra revenue stream)'
        }
    },
    'mercenary_company': {
        name: 'Mercenary Company',
        description: 'Provide protection and combat services',
        baseCost: 150000,
        dailyIncome: [250, 700],
        maxLevel: 10,
        apprenticeCost: 280,
        maxApprentices: 25,
        upgradeCostMultiplier: 1.6,
        categories: ['weapons_training', 'combat_skills', 'contracts', 'reputation'],
        specialBonuses: {
            royal_guard: 'Protect the crown (+200% income)',
            elite_warriors: 'Become legendary company (can lead dungeon raids)',
            insurance_broker: 'Partner with arcane insurers (+50% steady income)'
        }
    },
    'shadow_casino': {
        name: 'Shadow Casino',
        description: 'Ultimate high-risk, high-reward establishment',
        baseCost: 500000,
        dailyIncome: [0, 3000], // very volatile
        maxLevel: 10,
        apprenticeCost: 400,
        maxApprentices: 30,
        upgradeCostMultiplier: 1.8,
        categories: ['gambling_games', 'warding_magic', 'vip_lounges', 'entertainment'],
        specialBonuses: {
            high_roller_den: 'Attract noble gamblers (+300% income spikes)',
            tournament_host: 'Host legendary tournaments (huge profit events)',
            shadow_deals: 'Illegal but profitable (+100% income, +50% wanted level)'
        }
    }
};

const DUNGEON_RAIDS = {
    'ancient_dragon_hoard': {
        name: 'Ancient Dragon Hoard',
        difficulty: 5,
        requiredMembers: 4,
        minWantedLevel: 80,
        payout: [2000000, 5000000],
        successChance: 15,
        planningTime: 72, // hours
        requiredRoles: ['guild_master', 'arcane_trickster', 'lockbreaker', 'beast_rider', 'warrior', 'scout'],
        equipment: ['dragonfire_torch', 'arcane_disruptor', 'swift_mounts', 'explosive_runes', 'illusion_scrolls'],
        description: 'The ultimate raid - legendary dragon lair with impenetrable wards'
    },
    'elven_treasury': {
        name: 'Elven Treasury Vault',
        difficulty: 4,
        requiredMembers: 4,
        minWantedLevel: 60,
        payout: [800000, 2000000],
        successChance: 25,
        planningTime: 48,
        requiredRoles: ['guild_master', 'arcane_trickster', 'lockbreaker', 'beast_rider', 'warrior'],
        equipment: ['rune_cloner', 'swift_mounts', 'illusion_masks', 'enchanted_weapons'],
        description: 'Infiltrate the ancient elven vaults hidden in the forest'
    },
    'noble_citadel': {
        name: 'Noble Citadel',
        difficulty: 3,
        requiredMembers: 4,
        minWantedLevel: 40,
        payout: [300000, 800000],
        successChance: 40,
        planningTime: 24,
        requiredRoles: ['guild_master', 'arcane_trickster', 'beast_rider', 'warrior'],
        equipment: ['thieves_tools', 'swift_mounts', 'illusion_masks'],
        description: 'Raid a powerful noble\'s heavily warded citadel'
    },
    'artifact_chamber': {
        name: 'Artifact Chamber',
        difficulty: 2,
        requiredMembers: 3,
        minWantedLevel: 20,
        payout: [100000, 400000],
        successChance: 60,
        planningTime: 12,
        requiredRoles: ['guild_master', 'beast_rider', 'warrior'],
        equipment: ['crystal_cutter', 'swift_mounts', 'illusion_masks'],
        description: 'Quick strike on a mage tower\'s artifact collection'
    },
    'merchant_caravan': {
        name: 'Merchant Caravan',
        difficulty: 1,
        requiredMembers: 3,
        minWantedLevel: 0,
        payout: [50000, 150000],
        successChance: 75,
        planningTime: 6,
        requiredRoles: ['guild_master', 'beast_rider', 'warrior'],
        equipment: ['enchanted_weapons', 'swift_mounts'],
        description: 'Ambush a wealthy merchant caravan on the trade roads'
    }
};

const RAID_EQUIPMENT = {
    'dragonfire_torch': { name: 'Dragonfire Torch', cost: 50000, description: 'Melts through enchanted barriers' },
    'arcane_disruptor': { name: 'Arcane Disruptor', cost: 75000, description: 'Disables magical wards and runes' },
    'illusion_scrolls': { name: 'Illusion Scrolls', cost: 25000, description: 'Create convincing magical disguises' },
    'explosive_runes': { name: 'Explosive Runes', cost: 40000, description: 'Blast through stone and metal' },
    'swift_mounts': { name: 'Swift Mounts', cost: 30000, description: 'Fast magical beasts for escape' },
    'rune_cloner': { name: 'Rune Cloner', cost: 15000, description: 'Copy protective runes' },
    'thieves_tools': { name: 'Thieves Tools', cost: 5000, description: 'Silent entry through magical locks' },
    'crystal_cutter': { name: 'Crystal Cutter', cost: 3000, description: 'Cut through crystal display cases' },
    'illusion_masks': { name: 'Illusion Masks', cost: 2000, description: 'Hide identities with magic' },
    'enchanted_weapons': { name: 'Enchanted Weapons', cost: 20000, description: 'Magically enhanced blades and bows' }
};

module.exports = { GUILDS, DUNGEON_RAIDS, RAID_EQUIPMENT };
