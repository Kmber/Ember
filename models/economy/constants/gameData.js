const MOUNTS = {
    'war_horse': {
        name: 'War Horse',
        type: 'ground',
        price: 15000,
        capacity: 10,
        stamina: 100,
        wildernessDepth: 3,
        durability: 100
    },
    'shadow_panther': {
        name: 'Shadow Panther',
        type: 'predator',
        price: 45000,
        capacity: 15,
        stamina: 120,
        wildernessDepth: 5,
        durability: 100
    },
    'gryphon': {
        name: 'Gryphon',
        type: 'flying',
        price: 80000,
        capacity: 20,
        stamina: 150,
        wildernessDepth: 7,
        durability: 100
    },
    'drake': {
        name: 'Drake',
        type: 'dragonkin',
        price: 200000,
        capacity: 30,
        stamina: 200,
        wildernessDepth: 9,
        durability: 100
    },
    'wyvern': {
        name: 'Wyvern',
        type: 'dragon',
        price: 500000,
        capacity: 50,
        stamina: 250,
        wildernessDepth: 10,
        durability: 100
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
    'studio_apartment': {
        name: 'Studio Apartment',
        price: 50000,
        monthlyCost: 950,
        familyCapacity: 1,
        vaultCapacity: 10000,
        securityLevel: 1,
        garageSize: 0
    },
    'two_bedroom_apartment': {
        name: '2BR Apartment',
        price: 120000,
        monthlyCost: 1750,
        familyCapacity: 3,
        vaultCapacity: 25000,
        securityLevel: 2,
        garageSize: 1
    },
    'family_house': {
        name: 'Family House',
        price: 300000,
        monthlyCost: 2900,
        familyCapacity: 5,
        vaultCapacity: 75000,
        securityLevel: 4,
        garageSize: 2
    },
    'luxury_mansion': {
        name: 'Luxury Mansion',
        price: 800000,
        monthlyCost: 5800,
        familyCapacity: 8,
        vaultCapacity: 200000,
        securityLevel: 7,
        garageSize: 5
    },
    'private_estate': {
        name: 'Private Estate',
        price: 2000000,
        monthlyCost: 11500,
        familyCapacity: 12,
        vaultCapacity: 500000,
        securityLevel: 10,
        garageSize: 10
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
    'family_vacation': {
        name: 'Family Vacation Package',
        price: 3000,
        description: 'Increases all family member bonds by 15%',
        category: 'family',
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
    'shadow_wisp': {
        name: 'Shadow Wisp',
        type: 'wisp',
        tier: 1,
        maxHealth: 50,
        skill: 20,
        specialAbility: 'scouting',
        price: 1000,
        description: 'A mysterious wisp that can scout ahead.'
    }
};

module.exports = { MOUNTS, WEAPONS, STRONGHOLDS, ROLES, SHOP_ITEMS, FAMILIARS };