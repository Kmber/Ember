const BEASTS = {
    'shadow_panther': {
        name: 'Shadow Panther',
        type: 'terrestrial',
        price: 15000,
        speed: 50,
        acceleration: 45,
        handling: 55,
        upkeepCost: 200
    },
    'river_serpent': {
        name: 'River Serpent',
        type: 'aquatic',
        price: 45000,
        speed: 70,
        acceleration: 75,
        handling: 65,
        upkeepCost: 600
    },
    'ironhide_boar': {
        name: 'Ironhide Boar',
        type: 'terrestrial',
        price: 80000,
        speed: 60,
        acceleration: 55,
        handling: 80,
        upkeepCost: 1000
    },
    'gryphon': {
        name: 'Gryphon',
        type: 'aerial',
        price: 200000,
        speed: 95,
        acceleration: 90,
        handling: 85,
        upkeepCost: 2500
    },
    'nether_drake': {
        name: 'Nether Drake',
        type: 'aerial',
        price: 500000,
        speed: 100,
        acceleration: 100,
        handling: 95,
        upkeepCost: 5000
    }
};

const MINIONS = {
    'shadow_imp': {
        name: 'Shadow Imp',
        type: 'imp',
        price: 750,
        powerLevel: 15,
        breed: 'Underworld'
    },
    'hellhound': {
        name: 'Hellhound',
        type: 'hellhound',
        price: 2500,
        powerLevel: 45,
        breed: 'Volcanic'
    },
    'gargoyle': {
        name: 'Gargoyle',
        type: 'gargoyle',
        price: 4000,
        powerLevel: 60,
        breed: 'Stone'
    },
    'abyssal_watcher': {
        name: 'Abyssal Watcher',
        type: 'watcher',
        price: 6000,
        powerLevel: 80,
        breed: 'Abyssal'
    },
    'spectral_raven': {
        name: 'Spectral Raven',
        type: 'raven',
        price: 3500,
        powerLevel: 40,
        breed: 'Ethereal'
    }
};

const CITADELS = {
    'outpost': {
        name: 'Secluded Manor',
        type: 'outpost',
        price: 80000,
        maxFollowers: 3,
        securityLevel: 3,
        vaultCapacity: 20000,
        lairCapacity: 1,
        monthlyUpkeep: 1300
    },
    'fortress': {
        name: 'Valiant Keep',
        type: 'fortress',
        price: 160000,
        maxFollowers: 5,
        securityLevel: 5,
        vaultCapacity: 40000,
        lairCapacity: 2,
        monthlyUpkeep: 2200
    },
    'sanctuary': {
        name: 'Grand Citadel',
        type: 'sanctuary',
        price: 380000,
        maxFollowers: 7,
        securityLevel: 7,
        vaultCapacity: 90000,
        lairCapacity: 3,
        monthlyUpkeep: 3500
    },
    'castle': {
        name: 'Imperial Stronghold',
        type: 'castle',
        price: 950000,
        maxFollowers: 12,
        securityLevel: 9,
        vaultCapacity: 280000,
        lairCapacity: 6,
        monthlyUpkeep: 6000
    },
    'palace': {
        name: 'Celestial Palace',
        type: 'palace',
        price: 2800000,
        maxFollowers: 18,
        securityLevel: 10,
        vaultCapacity: 700000,
        lairCapacity: 12,
        monthlyUpkeep: 14000
    }
};

const ROLES = {
    'vip': {
        name: 'VIP Member',
        price: 50000,
        duration: 30,
        benefits: {
            workMultiplier: 1.5,
            racingBonus: 1000,
            robberyProtection: 20,
            followerBonus: 0.2
        }
    },
    'premium': {
        name: 'Premium Member',
        price: 100000,
        duration: 30,
        benefits: {
            workMultiplier: 2.0,
            racingBonus: 2500,
            robberyProtection: 40,
            followerBonus: 0.5
        }
    },
    'diamond': {
        name: 'Diamond Elite',
        price: 250000,
        duration: 30,
        benefits: {
            workMultiplier: 3.0,
            racingBonus: 5000,
            robberyProtection: 60,
            followerBonus: 1.0
        }
    }
};

// NEW ENHANCED SHOP ITEMS
const SHOP_ITEMS = {
    'minion_sustenance': {
        name: 'Minion Sustenance',
        price: 250,
        description: 'Instantly restores 40 energy and 10 constitution to all minions',
        category: 'minion_care',
        cooldown: 0
    },
    'beast_healing': {
        name: 'Beast Healing Potion',
        price: 1500,
        description: 'Restores 30 durability to your active beast',
        category: 'beast',
        cooldown: 0
    },
    'security_upgrade': {
        name: 'Home Security System',
        price: 5000,
        description: 'Permanently increases your property security by 2 levels',
        category: 'security',
        cooldown: 0
    },
    'follower_morale_booster': {
        name: 'Follower Morale Booster',
        price: 3000,
        description: 'Increases all follower allegiance by 15%',
        category: 'follower',
        cooldown: 0
    },
    'lucky_charm': {
        name: 'Lucky Charm',
        price: 10000,
        description: 'Increases work earnings by 50% for 7 days',
        category: 'boost',
        cooldown: 0,
        effect: {
            type: 'work_boost',
            multiplier: 1.5,
            duration: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
    },
    // NEW ITEMS
    'gambling_luck': {
        name: 'Rabbit\'s Foot',
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
    'robbery_protection': {
        name: 'Security Guard',
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
    'vault_expansion': {
        name: 'Vault Expansion Kit',
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
    'bank_upgrade': {
        name: 'Premium Banking',
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

module.exports = { BEASTS, MINIONS, CITADELS, ROLES, SHOP_ITEMS };