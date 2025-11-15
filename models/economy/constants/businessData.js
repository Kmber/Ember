// constants/businessData.js
const GUILD_TYPES = {
    'alchemists_guild': {
        name: 'Alchemists Guild',
        description: 'Brew potions and transmute materials for daily profit.',
        baseCost: 50000,
        dailyIncome: [200, 800],
        maxLevel: 10,
        apprenticeCost: 150,
        maxApprentices: 20,
        upgradeCostMultiplier: 1.5,
        categories: ['potion_mastery', 'transmutation', 'ingredient_sourcing', 'market_stall'],
        specialBonuses: {
            philosophers_stone: 'Achieve perfect transmutation (+50% income for 30 days).',
            guild_monopoly: 'Control the local market (+25% base income).',
            elixir_of_life: 'Brew a legendary elixir (massive one-time profit event).'
        }
    },
    'arcane_academy': {
        name: 'Arcane Academy',
        description: 'Train mages and sell enchanted items for high profits.',
        baseCost: 100000,
        dailyIncome: [100, 1500],
        maxLevel: 10,
        apprenticeCost: 300,
        maxApprentices: 15,
        upgradeCostMultiplier: 2.0,
        categories: ['spell_research', 'enchantment', 'student_tuition', 'reputation'],
        specialBonuses: {
            archmage_tower: 'Construct a tower of power (1000x daily income for 7 days, then +100% forever).',
            forbidden_knowledge: 'Discover a powerful new spell (+200% income for 14 days).',
            royal_charter: 'Become the official magic supplier for the kingdom (+75% income, very stable).'
        }
    },
    'mercenary_guild': {
        name: 'Mercenary Guild',
        description: 'Earn coin by taking on dangerous contracts.',
        baseCost: 75000,
        dailyIncome: [300, 600],
        maxLevel: 10,
        apprenticeCost: 200,
        maxApprentices: 12,
        upgradeCostMultiplier: 1.3,
        categories: ['contract_negotiation', 'guild_reputation', 'weaponry', 'network'],
        specialBonuses: {
            dragonslayers: 'Specialize in slaying dragons (+100% income).',
            spymaster: 'Gain access to secret contracts (predict market trends).',
            war_for_hire: 'Participate in a major war (massive profit events).'
        }
    },
    'beast_masters_guild': {
        name: 'Beast Masters Guild',
        description: 'Tame and sell exotic mounts.',
        baseCost: 200000,
        dailyIncome: [400, 1000],
        maxLevel: 10,
        apprenticeCost: 250,
        maxApprentices: 10,
        upgradeCostMultiplier: 1.4,
        categories: ['taming', 'breeding', 'stables', 'reputation'],
        specialBonuses: {
            legendary_beasts: 'Tame and sell legendary creatures (+150% profit margins).',
            arena_champions: 'Sponsor a champion in the arena (marketing boost).',
            trade_routes: 'Establish trade routes with other kingdoms (extra revenue stream).'
        }
    },
    'royal_guard': {
        name: 'Royal Guard',
        description: 'Provide elite protection services to nobles.',
        baseCost: 150000,
        dailyIncome: [250, 700],
        maxLevel: 10,
        apprenticeCost: 280,
        maxApprentices: 25,
        upgradeCostMultiplier: 1.6,
        categories: ['equipment', 'training', 'royal_contracts', 'reputation'],
        specialBonuses: {
            protect_the_king: 'Become the personal guard of the king (+200% income).',
            artifact_retrieval: 'Can participate in dungeon raids.',
            noble_favor: 'Gain favor with the noble houses (+50% steady income).'
        }
    },
    'shadow_syndicate': {
        name: 'Shadow Syndicate',
        description: 'A dark fantasy-themed high-risk, high-reward business.',
        baseCost: 500000,
        dailyIncome: [0, 3000],
        maxLevel: 10,
        apprenticeCost: 400,
        maxApprentices: 30,
        upgradeCostMultiplier: 1.8,
        categories: ['information_network', 'underworld_contacts', 'security', 'influence'],
        specialBonuses: {
            assassins_guild: 'Attract powerful clients (+300% income spikes).',
            thieves_guild: 'Host heists and split the loot (huge profit events).',
            dark_rituals: 'Perform forbidden rituals for immense power (+100% income, +50% heat).'
        }
    }
};

const RAID_TARGETS = {
    'ancient_dragon_hoard': {
        name: 'Ancient Dragon Hoard',
        difficulty: 5,
        requiredMembers: 4,
        minHeatLevel: 80,
        payout: [2000000, 5000000],
        successChance: 15,
        planningTime: 72, // hours
        requiredRoles: ['warlord', 'arcanist', 'berserker', 'vanguard', 'sentinel', 'scout'],
        equipment: ['dragonfire_torch', 'arcane_disruptor', 'escape_mounts', 'alchemical_charges', 'scrying_orbs'],
        description: 'The ultimate raid - a dragons lair filled with treasure.'
    },
    'elven_treasury': {
        name: 'Elven Treasury',
        difficulty: 4,
        requiredMembers: 4,
        minHeatLevel: 60,
        payout: [800000, 2000000],
        successChance: 25,
        planningTime: 48,
        requiredRoles: ['warlord', 'arcanist', 'scout', 'vanguard', 'sentinel'],
        equipment: ['glyph_replicator', 'escape_mounts', 'illusory_cloaks', 'enchanted_weaponry'],
        description: 'An elegant heist to liberate elven riches.'
    },
    'lich_phylactery': {
        name: 'Lich Phylactery',
        difficulty: 3,
        requiredMembers: 4,
        minHeatLevel: 40,
        payout: [300000, 800000],
        successChance: 40,
        planningTime: 24,
        requiredRoles: ['warlord', 'arcanist', 'vanguard', 'sentinel'],
        equipment: ['masterwork_lockpicks', 'escape_mounts', 'illusory_cloaks'],
        description: 'Steal the life force of a powerful lich.'
    },
    'dwarven_gem_mine': {
        name: 'Dwarven Gem Mine',
        difficulty: 2,
        requiredMembers: 3,
        minHeatLevel: 20,
        payout: [100000, 400000],
        successChance: 60,
        planningTime: 12,
        requiredRoles: ['warlord', 'vanguard', 'berserker'],
        equipment: ['crystal_shatterer', 'escape_mounts', 'illusory_cloaks'],
        description: 'A quick raid on a wealthy gem mine.'
    },
    'kings_caravan': {
        name: 'King Caravan',
        difficulty: 1,
        requiredMembers: 3,
        minHeatLevel: 0,
        payout: [50000, 150000],
        successChance: 75,
        planningTime: 6,
        requiredRoles: ['warlord', 'vanguard', 'scout'],
        equipment: ['enchanted_weaponry', 'escape_mounts'],
        description: 'Intercept a royal caravan carrying treasures.'
    }
};

const RAID_EQUIPMENT = {
    'dragonfire_torch': { name: 'Dragonfire Torch', cost: 50000, description: 'Cuts through enchanted vault doors.' },
    'arcane_disruptor': { name: 'Arcane Disruptor', cost: 75000, description: 'Disables magical wards and traps.' },
    'scrying_orbs': { name: 'Scrying Orbs', cost: 25000, description: 'Bypass magical surveillance.' },
    'alchemical_charges': { name: 'Alchemical Charges', cost: 40000, description: 'Blast through fortified walls.' },
    'escape_mounts': { name: 'Escape Mounts', cost: 30000, description: 'Swift mounts for a quick getaway.' },
    'glyph_replicator': { name: 'Glyph Replicator', cost: 15000, description: 'Copy magical keys and runes.' },
    'masterwork_lockpicks': { name: 'Masterwork Lockpicks', cost: 5000, description: 'Tools for silent entry.' },
    'crystal_shatterer': { name: 'Crystal Shatterer', cost: 3000, description: 'Shatters protective crystals.' },
    'illusory_cloaks': { name: 'Illusory Cloaks', cost: 2000, description: 'Conceal identities with magic.' },
    'enchanted_weaponry': { name: 'Enchanted Weaponry', cost: 20000, description: 'For intimidation and protection.' }
};

module.exports = { GUILD_TYPES, RAID_TARGETS, RAID_EQUIPMENT };
