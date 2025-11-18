// constants/guildData.js
const GUILD_TYPES = {
    'alchemists_guild': {
        name: 'Alchemist\'s Guild',
        description: 'Brew potions and transmute metals for profit.',
        baseCost: 50000,
        dailyIncome: [200, 800],
        maxLevel: 10,
        acolyteCost: 150,
        maxAcolytes: 20,
        upgradeCostMultiplier: 1.5,
        categories: ['potion_brewing', 'transmutation', 'reputation', 'patronage'],
        specialBonuses: {
            philosophers_stone: 'Achieve mastery of transmutation (major income boost)',
            elixir_of_life: 'Create the legendary elixir (+100% income for 30 days)',
            exclusive_patronage: 'Secure a contract with a noble house (+50% base income)'
        }
    },
    'scriveners_guild': {
        name: 'Scrivener\'s Guild',
        description: 'Create scrolls and illuminated manuscripts.',
        baseCost: 100000,
        dailyIncome: [100, 1500],
        maxLevel: 10,
        acolyteCost: 300,
        maxAcolytes: 15,
        upgradeCostMultiplier: 2.0,
        categories: ['calligraphy', 'illumination', 'book_binding', 'clientele'],
        specialBonuses: {
            forbidden_knowledge: 'Transcribe a forbidden text (high risk, high reward event)',
            royal_charter: 'Become the official scribes of the monarchy (+75% income)',
            mass_production: 'Discover a method for rapid copying (+200% income for 14 days)'
        }
    },
    'masons_guild': {
        name: 'Masons\' Guild',
        description: 'Construct buildings and fortifications.',
        baseCost: 75000,
        dailyIncome: [300, 600],
        maxLevel: 10,
        acolyteCost: 200,
        maxAcolytes: 12,
        upgradeCostMultiplier: 1.3,
        categories: ['stoneworking', 'architecture', 'contracts', 'reputation'],
        specialBonuses: {
            cathedral_contract: 'Win the bid to construct a grand cathedral (massive income)',
            master_architect: 'Hire a legendary architect (+100% income)',
            quarry_ownership: 'Gain control of a stone quarry (reduced material costs)'
        }
    },
    'mercenary_guild': {
        name: 'Mercenary Guild',
        description: 'Fulfill contracts for coin and glory.',
        baseCost: 200000,
        dailyIncome: [400, 1000],
        maxLevel: 10,
        acolyteCost: 250,
        maxAcolytes: 10,
        upgradeCostMultiplier: 1.4,
        categories: ['combat_prowess', 'reputation', 'equipment', 'contracts'],
        specialBonuses: {
            war_for_hire: 'Participate in a major conflict (huge income, high risk)',
            elite_squad: 'Train a squad of elite mercenaries (+150% profit margins)',
            bodyguard_contract: 'Protect a high-profile individual (steady, high income)'
        }
    },
    'thieves_guild': {
        name: 'Thieves\' Guild',
        description: 'Operate in the shadows, liberating wealth.',
        baseCost: 150000,
        dailyIncome: [250, 700],
        maxLevel: 10,
        acolyteCost: 280,
        maxAcolytes: 25,
        upgradeCostMultiplier: 1.6,
        categories: ['stealth', 'infiltration', 'network', 'reputation'],
        specialBonuses: {
            the_big_heist: 'Pull off a legendary heist (massive one-time payout)',
            syndicate_ties: 'Forge alliances with other criminal organizations (+50% income)',
            master_of_disguise: 'Gain access to high-society events (unlocks new opportunities)'
        }
    },
    'arcane_syndicate': {
        name: 'Arcane Syndicate',
        description: 'A clandestine organization dealing in forbidden magic.',
        baseCost: 500000,
        dailyIncome: [0, 3000],
        maxLevel: 10,
        acolyteCost: 400,
        maxAcolytes: 30,
        upgradeCostMultiplier: 1.8,
        categories: ['spellcraft', 'enchanting', 'rituals', 'secrecy'],
        specialBonuses: {
            demon_binding: 'Summon and bind a powerful demon (high risk, immense power)',
            lichdom_pact: 'Make a pact with a lich for forbidden knowledge (+300% income spikes)',
            shadow_market: 'Dominate the black market for magical artifacts (+100% income, +50% heat)'
        }
    }
};

const RAID_DUNGEONS = {
    'goblin_cave': {
        name: 'Goblin Cave',
        difficulty: 1,
        requiredMembers: 3,
        minThreatLevel: 0,
        payout: [50000, 150000],
        successChance: 75,
        planningTime: 6, // hours
        requiredClasses: ['warrior', 'thief', 'healer'],
        gear: ['basic_weapons', 'adventurers_kit'],
        description: 'Clear out a nearby cave infested with goblins.'
    },
    'sunken_crypt': {
        name: 'The Sunken Crypt',
        difficulty: 2,
        requiredMembers: 3,
        minThreatLevel: 20,
        payout: [100000, 400000],
        successChance: 60,
        planningTime: 12,
        requiredClasses: ['warrior', 'cleric', 'mage'],
        gear: ['silver_weapons', 'scroll_of_warding', 'adventurers_kit'],
        description: 'Brave the undead horrors of a long-forgotten crypt.'
    },
    'cursed_citadel': {
        name: 'Cursed Citadel',
        difficulty: 3,
        requiredMembers: 4,
        minThreatLevel: 40,
        payout: [300000, 800000],
        successChance: 40,
        planningTime: 24,
        requiredClasses: ['paladin', 'mage', 'thief', 'ranger'],
        gear: ['enchanted_weapons', 'shadow_veil_cloak', 'scroll_of_unlocking'],
        description: 'Break the curse on a citadel haunted by powerful spirits.'
    },
    'shadowfen_lair': {
        name: 'Shadowfen Lair',
        difficulty: 4,
        requiredMembers: 4,
        minThreatLevel: 60,
        payout: [800000, 2000000],
        successChance: 25,
        planningTime: 48,
        requiredClasses: ['paladin', 'mage', 'ranger', 'cleric'],
        gear: ['masterwork_gear', 'potion_of_shadow_resistance', 'dragonfire_potion'],
        description: 'Venture into a swamp to slay a hydra.'
    },
    'dragons_peak': {
        name: "Dragon's Peak",
        difficulty: 5,
        requiredMembers: 4,
        minThreatLevel: 80,
        payout: [2000000, 5000000],
        successChance: 15,
        planningTime: 72, // hours
        requiredClasses: ['dragon_slayer', 'archmage', 'master_thief', 'high_cleric'],
        gear: ['dragonscale_shield', 'legendary_weapon', 'potion_of_fire_breath'],
        description: 'Ascend to the highest peak and face an ancient dragon.'
    }
};

const RAID_GEAR = {
    'adventurers_kit': { name: "Adventurer's Kit", cost: 2000, description: 'Basic supplies: ropes, torches, rations.' },
    'basic_weapons': { name: 'Basic Weapons', cost: 5000, description: 'A simple sword or bow.' },
    'silver_weapons': { name: 'Silver Weapons', cost: 15000, description: 'Effective against undead creatures.' },
    'scroll_of_warding': { name: 'Scroll of Warding', cost: 20000, description: 'Protects the party from minor curses.' },
    'enchanted_weapons': { name: 'Enchanted Weapons', cost: 40000, description: 'Weapons imbued with magical properties.' },
    'shadow_veil_cloak': { name: 'Shadow Veil Cloak', cost: 30000, description: 'Provides concealment in shadows.' },
    'scroll_of_unlocking': { name: 'Scroll of Unlocking', cost: 25000, description: 'Magically bypasses locks and wards.' },
    'masterwork_gear': { name: 'Masterwork Gear', cost: 75000, description: 'Expertly crafted armor and weapons.' },
    'potion_of_shadow_resistance': { name: 'Potion of Shadow Resistance', cost: 50000, description: 'Grants resistance to dark magic.' },
    'dragonfire_potion': { name: 'Dragonfire Potion', cost: 100000, description: 'A volatile potion that mimics dragon fire.' },
    'dragonscale_shield': { name: 'Dragonscale Shield', cost: 250000, description: 'Extremely resistant to fire and physical attacks.' },
    'legendary_weapon': { name: 'Legendary Weapon', cost: 500000, description: 'A weapon of immense power.' },
    'potion_of_fire_breath': { name: 'Potion of Fire Breath', cost: 150000, description: 'Temporarily grants the ability to breathe fire.' }
};

module.exports = { GUILD_TYPES, RAID_DUNGEONS, RAID_GEAR };
