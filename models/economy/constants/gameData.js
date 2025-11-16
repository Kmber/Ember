const MOUNTS = {
    'war_horse': {
        name: 'War Horse',
        type: 'ground',
        price: 15000,
        capacity: 10,
        stamina: 100,
        wildernessDepth: 3,
        durability: 100,
        prowess: 40,
        ferocity: 35,
        cunning: 30
    },
    'shadow_panther': {
        name: 'Shadow Panther',
        type: 'predator',
        price: 45000,
        capacity: 15,
        stamina: 120,
        wildernessDepth: 5,
        durability: 100,
        prowess: 55,
        ferocity: 60,
        cunning: 45
    },
    'gryphon': {
        name: 'Gryphon',
        type: 'flying',
        price: 80000,
        capacity: 20,
        stamina: 150,
        wildernessDepth: 7,
        durability: 100,
        prowess: 70,
        ferocity: 65,
        cunning: 60
    },
    'drake': {
        name: 'Drake',
        type: 'dragonkin',
        price: 200000,
        capacity: 30,
        stamina: 200,
        wildernessDepth: 9,
        durability: 100,
        prowess: 80,
        ferocity: 75,
        cunning: 70
    },
    'wyvern': {
        name: 'Wyvern',
        type: 'dragon',
        price: 500000,
        capacity: 50,
        stamina: 250,
        wildernessDepth: 10,
        durability: 100,
        prowess: 85,
        ferocity: 90,
        cunning: 75
    }
};

const WEAPONS = {
    'wooden_bow': {
        name: 'Wooden Bow',
        price: 500,
        damage: 10,
        accuracy: 70,
        criticalChance: 5,
        durability: 100
    },
    'iron_spear': {
        name: 'Iron Spear',
        price: 2000,
        damage: 25,
        accuracy: 75,
        criticalChance: 10,
        durability: 100
    },
    'steel_crossbow': {
        name: 'Steel Crossbow',
        price: 5000,
        damage: 40,
        accuracy: 85,
        criticalChance: 15,
        durability: 100
    },
    'elven_longbow': {
        name: 'Elven Longbow',
        price: 15000,
        damage: 60,
        accuracy: 95,
        criticalChance: 20,
        durability: 100
    },
    'dragonbone_greatbow': {
        name: 'Dragonbone Greatbow',
        price: 50000,
        damage: 100,
        accuracy: 90,
        criticalChance: 25,
        durability: 100
    }
};

const STRONGHOLDS = {
    'outpost': {
        name: 'Frontier Outpost',
        type: 'outpost',
        price: 50000,
        maxFollowers: 5,
        wardingLevel: 2,
        treasuryCapacity: 10000,
        hasBestiary: false,
        bestiaryCapacity: 0,
        upkeep: 500
    },
    'watchtower': {
        name: 'Watchtower',
        type: 'tower',
        price: 120000,
        maxFollowers: 8,
        wardingLevel: 4,
        treasuryCapacity: 25000,
        hasBestiary: false,
        bestiaryCapacity: 0,
        upkeep: 1200
    },
    'fortress': {
        name: 'Stone Fortress',
        type: 'fortress',
        price: 300000,
        maxFollowers: 15,
        wardingLevel: 6,
        treasuryCapacity: 75000,
        hasBestiary: true,
        bestiaryCapacity: 3,
        upkeep: 3000
    },
    'citadel': {
        name: 'Iron Citadel',
        type: 'citadel',
        price: 800000,
        maxFollowers: 25,
        wardingLevel: 8,
        treasuryCapacity: 200000,
        hasBestiary: true,
        bestiaryCapacity: 5,
        upkeep: 8000
    },
    'castle': {
        name: 'Royal Castle',
        type: 'castle',
        price: 2000000,
        maxFollowers: 40,
        wardingLevel: 10,
        treasuryCapacity: 500000,
        hasBestiary: true,
        bestiaryCapacity: 10,
        upkeep: 20000
    },
    'palace': {
        name: 'Arcane Palace',
        type: 'palace',
        price: 5000000,
        maxFollowers: 60,
        wardingLevel: 12,
        treasuryCapacity: 1000000,
        hasBestiary: true,
        bestiaryCapacity: 20,
        upkeep: 50000
    }
};

const ROLES = {
    'premium_member': {
        name: 'Premium Member',
        price: 5000,
        duration: 7,
        benefits: {
            workMultiplier: 1.2,
            racingBonus: 500,
            robberyProtection: 10
        }
    },
    'vip_member': {
        name: 'VIP Member',
        price: 15000,
        duration: 14,
        benefits: {
            workMultiplier: 1.5,
            racingBonus: 1000,
            robberyProtection: 20
        }
    },
    'elite_member': {
        name: 'Elite Member',
        price: 30000,
        duration: 30,
        benefits: {
            workMultiplier: 2.0,
            racingBonus: 2500,
            robberyProtection: 30
        }
    },
    'ultimate_member': {
        name: 'Ultimate Member',
        price: 50000,
        duration: 30,
        benefits: {
            workMultiplier: 2.5,
            racingBonus: 5000,
            robberyProtection: 40
        }
    }
};

const SHOP_ITEMS = {
    'lucky_charm': {
        name: 'Lucky Charm',
        price: 10000,
        description: 'Increases work income by 50% for 7 days',
        category: 'boost',
        cooldown: 0,
        effect: {
            type: 'work_boost',
            multiplier: 1.5,
            duration: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
    },
    'rabbits_foot': {
        name: 'Rabbits Foot',
        price: 5000,
        description: 'Increases gambling luck by 20% for 4 hours (stacks up to 5 times)',
        category: 'boost',
        cooldown: 0,
        effect: {
            type: 'gambling_luck',
            multiplier: 1.2,
            duration: 4 * 60 * 60 * 1000, // 4 hours
            stackable: true
        }
    },
    'followers_vacation': {
        name: 'Followers Vacation Package',
        price: 3000,
        description: 'Increases all followers bonds by 15%',
        category: 'followers',
        cooldown: 0
    },
    'car_insurance': {
        name: 'Car Insurance',
        price: 1500,
        description: 'Restores 30 durability to your active car',
        category: 'vehicle',
        cooldown: 0
    },
    'home_security': {
        name: 'Home Security System',
        price: 5000,
        description: 'Permanently increases your property security by 2 levels',
        category: 'security',
        cooldown: 0
    },
    'business_manager': {
        name: 'Business Manager',
        price: 30000,
        description: 'Increases all business profits by 10% for 30 days',
        category: 'business',
        cooldown: 0,
        effect: {
            type: 'business_boost',
            multiplier: 1.1,
            duration: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
    },
    'personal_bodyguard': {
        name: 'Personal Bodyguard',
        price: 15000,
        description: 'Provides +30% robbery protection for 24 hours',
        category: 'security',
        cooldown: 0,
        effect: {
            type: 'robbery_protection',
            multiplier: 30,
            duration: 24 * 60 * 60 * 1000 // 24 hours
        }
    },
    'extended_vault': {
        name: 'Extended Vault',
        price: 25000,
        description: 'Doubles your vault capacity for 72 hours (resets on new property)',
        category: 'storage',
        cooldown: 0,
        effect: {
            type: 'vault_boost',
            multiplier: 2.0,
            duration: 72 * 60 * 60 * 1000 // 72 hours
        }
    },
    'offshore_account': {
        name: 'Offshore Account',
        price: 30000,
        description: 'Increases bank deposit limit by 50% for 48 hours',
        category: 'storage',
        cooldown: 0,
        effect: {
            type: 'bank_boost',
            multiplier: 1.5,
            duration: 48 * 60 * 60 * 1000 // 48 hours
        }
    }
};

const FAMILIARS = {
    // WISP COMPANIONS
    'shadow_wisp': {
        name: 'Shadow Wisp',
        species: 'Shadow Wisp',
        type: 'wisp',
        tier: 1,
        wardingLevel: 15,
        maxHealth: 50,
        skill: 20,
        specialAbility: 'scouting',
        price: 1000,
        description: 'A mysterious wisp that can scout ahead.'
    },
    'flame_wisp': {
        name: 'Flame Wisp',
        species: 'Flame Wisp',
        type: 'wisp',
        tier: 1,
        wardingLevel: 18,
        maxHealth: 45,
        skill: 25,
        specialAbility: 'fire_warding',
        price: 1200,
        description: 'A fiery wisp that wards against flame-based threats.'
    },
    'frost_wisp': {
        name: 'Frost Wisp',
        species: 'Frost Wisp',
        type: 'wisp',
        tier: 1,
        wardingLevel: 16,
        maxHealth: 48,
        skill: 22,
        specialAbility: 'ice_warding',
        price: 1100,
        description: 'An icy wisp that protects against cold intrusions.'
    },

    // ARCANE COMPANIONS
    'arcane_sprite': {
        name: 'Arcane Sprite',
        species: 'Arcane Sprite',
        type: 'arcane',
        tier: 2,
        wardingLevel: 25,
        maxHealth: 60,
        skill: 35,
        specialAbility: 'magic_detection',
        price: 2500,
        description: 'A magical sprite that detects arcane intrusions.'
    },
    'rune_imp': {
        name: 'Rune Imp',
        species: 'Rune Imp',
        type: 'arcane',
        tier: 2,
        wardingLevel: 28,
        maxHealth: 55,
        skill: 40,
        specialAbility: 'rune_enhancement',
        price: 2800,
        description: 'An imp that enhances protective runes.'
    },

    // ELEMENTAL COMPANIONS
    'earth_elemental': {
        name: 'Earth Elemental',
        species: 'Earth Elemental',
        type: 'elemental',
        tier: 3,
        wardingLevel: 35,
        maxHealth: 80,
        skill: 45,
        specialAbility: 'earth_barrier',
        price: 5000,
        description: 'A sturdy elemental that creates earth barriers.'
    },
    'water_spirit': {
        name: 'Water Spirit',
        species: 'Water Spirit',
        type: 'elemental',
        tier: 3,
        wardingLevel: 32,
        maxHealth: 70,
        skill: 42,
        specialAbility: 'healing_aura',
        price: 4800,
        description: 'A gentle spirit that provides healing wards.'
    },
    'wind_sylph': {
        name: 'Wind Sylph',
        species: 'Wind Sylph',
        type: 'elemental',
        tier: 3,
        wardingLevel: 30,
        maxHealth: 65,
        skill: 38,
        specialAbility: 'speed_boost',
        price: 4500,
        description: 'A swift sylph that enhances movement wards.'
    },

    // FEY COMPANIONS
    'forest_pixie': {
        name: 'Forest Pixie',
        species: 'Forest Pixie',
        type: 'fey',
        tier: 2,
        wardingLevel: 22,
        maxHealth: 55,
        skill: 30,
        specialAbility: 'nature_warding',
        price: 2000,
        description: 'A pixie that wards against natural threats.'
    },
    'mystic_faerie': {
        name: 'Mystic Faerie',
        species: 'Mystic Faerie',
        type: 'fey',
        tier: 3,
        wardingLevel: 38,
        maxHealth: 75,
        skill: 50,
        specialAbility: 'illusion_warding',
        price: 6000,
        description: 'A powerful faerie that creates illusionary wards.'
    },

    // SHADOW COMPANIONS
    'void_stalker': {
        name: 'Void Stalker',
        species: 'Void Stalker',
        type: 'shadow',
        tier: 4,
        wardingLevel: 50,
        maxHealth: 90,
        skill: 60,
        specialAbility: 'void_detection',
        price: 10000,
        description: 'A terrifying stalker that detects void intrusions.'
    },
    'nightmare_hound': {
        name: 'Nightmare Hound',
        species: 'Nightmare Hound',
        type: 'shadow',
        tier: 4,
        wardingLevel: 48,
        maxHealth: 85,
        skill: 55,
        specialAbility: 'fear_warding',
        price: 9500,
        description: 'A hound that wards against fear-based attacks.'
    },

    // CELESTIAL COMPANIONS
    'star_seraph': {
        name: 'Star Seraph',
        species: 'Star Seraph',
        type: 'celestial',
        tier: 5,
        wardingLevel: 65,
        maxHealth: 100,
        skill: 70,
        specialAbility: 'divine_protection',
        price: 25000,
        description: 'A celestial being that provides divine protection.'
    },
    'moon_guardian': {
        name: 'Moon Guardian',
        species: 'Moon Guardian',
        type: 'celestial',
        tier: 5,
        wardingLevel: 62,
        maxHealth: 95,
        skill: 68,
        specialAbility: 'lunar_warding',
        price: 23000,
        description: 'A guardian that wields lunar protective magic.'
    }
};

module.exports = { MOUNTS, WEAPONS, STRONGHOLDS, ROLES, SHOP_ITEMS, FAMILIARS };