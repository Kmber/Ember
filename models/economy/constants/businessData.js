// constants/businessData.js
const BUSINESS_TYPES = {
    'restaurant': {
        name: 'Restaurant Chain',
        description: 'Serve customers and earn daily profits',
        baseCost: 50000,
        dailyIncome: [200, 800], // min, max per level
        maxLevel: 10,
        employeeCost: 150, // per employee per day
        maxEmployees: 20,
        upgradeCostMultiplier: 1.5,
        categories: ['food_quality', 'service', 'location', 'marketing'],
        specialBonuses: {
            family_discount: 'Family members eat free (saves $50/day per member)',
            celebrity_chef: 'Hire famous chef (+50% income for 30 days)',
            franchise: 'Expand to multiple locations (+25% base income)'
        }
    },
    'tech_startup': {
        name: 'Tech Startup',
        description: 'Develop apps and software for high profits',
        baseCost: 100000,
        dailyIncome: [100, 1500], // very volatile
        maxLevel: 10,
        employeeCost: 300, // expensive developers
        maxEmployees: 15,
        upgradeCostMultiplier: 2.0,
        categories: ['innovation', 'marketing', 'user_base', 'funding'],
        specialBonuses: {
            ipo: 'Go public (1000x daily income for 7 days, then +100% forever)',
            viral_app: 'Create viral app (+200% income for 14 days)',
            government_contract: 'Secure government deal (+75% income, very stable)'
        }
    },
    'real_estate': {
        name: 'Real Estate Agency',
        description: 'Earn commissions from property sales',
        baseCost: 75000,
        dailyIncome: [300, 600], // stable income
        maxLevel: 10,
        employeeCost: 200,
        maxEmployees: 12,
        upgradeCostMultiplier: 1.3,
        categories: ['market_knowledge', 'network', 'reputation', 'listings'],
        specialBonuses: {
            luxury_specialist: 'Specialize in luxury properties (+100% income)',
            market_insider: 'Get insider info (predict market trends)',
            property_flip: 'Buy and flip properties (massive profit events)'
        }
    },
    'car_dealership': {
        name: 'Car Dealership',
        description: 'Sell cars to players and NPCs',
        baseCost: 200000,
        dailyIncome: [400, 1000],
        maxLevel: 10,
        employeeCost: 250,
        maxEmployees: 10,
        upgradeCostMultiplier: 1.4,
        categories: ['inventory', 'sales_team', 'service_center', 'reputation'],
        specialBonuses: {
            exotic_cars: 'Sell hypercars (+150% profit margins)',
            racing_team: 'Sponsor racing team (marketing boost)',
            trade_ins: 'Accept player car trade-ins (extra revenue stream)'
        }
    },
    'security_company': {
        name: 'Security Company',
        description: 'Provide protection services to players',
        baseCost: 150000,
        dailyIncome: [250, 700],
        maxLevel: 10,
        employeeCost: 280,
        maxEmployees: 25,
        upgradeCostMultiplier: 1.6,
        categories: ['equipment', 'training', 'contracts', 'reputation'],
        specialBonuses: {
            government_contract: 'Protect government buildings (+200% income)',
            private_military: 'Become PMC (can participate in heists)',
            insurance_partner: 'Partner with insurance companies (+50% steady income)'
        }
    },
    'casino': {
        name: 'Private Casino',
        description: 'Ultimate high-risk, high-reward business',
        baseCost: 500000,
        dailyIncome: [0, 3000], // very volatile
        maxLevel: 10,
        employeeCost: 400,
        maxEmployees: 30,
        upgradeCostMultiplier: 1.8,
        categories: ['games', 'security', 'vip_services', 'entertainment'],
        specialBonuses: {
            high_roller_suite: 'Attract whales (+300% income spikes)',
            tournament_host: 'Host poker tournaments (huge profit events)',
            money_laundering: 'Illegal but profitable (+100% income, +50% heat)'
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

module.exports = { BUSINESS_TYPES, RAID_DUNGEONS, RAID_GEAR };
