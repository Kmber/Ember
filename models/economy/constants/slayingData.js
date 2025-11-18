const SLAYING_MONSTERS = {
    // Haunted Lands Tier 1-2 (Basic Monsters)
    goblin: {
        name: 'Goblin',
        tier: 1,
        health: 25,
        damage: 5,
        agility: 80,
        baseValue: 50,
        rarity: 'common',
        requiredHauntedLandsTier: 1,
        manaConsumption: { min: 1, max: 2 },
        staminaConsumption: 5,
        lootTable: {
            flesh: { chance: 90, value: 25 },
            hide: { chance: 60, value: 35 },
            chest: { chance: 5, value: 100 }
        }
    },
    orc: {
        name: 'Orc',
        tier: 1,
        health: 60,
        damage: 15,
        agility: 70,
        baseValue: 150,
        rarity: 'common',
        requiredHauntedLandsTier: 1,
        manaConsumption: { min: 2, max: 4 }, 
        staminaConsumption: 8,
        lootTable: {
            flesh: { chance: 95, value: 75 },
            hide: { chance: 80, value: 100 },
            trophy: { chance: 20, value: 200 }
        }
    },
    ogre: {
        name: 'Ogre',
        tier: 2,
        health: 120,
        damage: 35,
        agility: 50,
        baseValue: 300,
        rarity: 'uncommon',
        requiredHauntedLandsTier: 2,
        manaConsumption: { min: 3, max: 6 }, 
        staminaConsumption: 12,
        lootTable: {
            flesh: { chance: 90, value: 150 },
            hide: { chance: 70, value: 120 },
            trophy: { chance: 30, value: 250 }
        }
    },
    minotaur: {
        name: 'Minotaur',
        tier: 3,
        health: 250,
        damage: 60,
        agility: 40,
        baseValue: 800,
        rarity: 'rare',
        requiredHauntedLandsTier: 3,
        manaConsumption: { min: 5, max: 10 }, 
        staminaConsumption: 18,
        lootTable: {
            flesh: { chance: 85, value: 300 },
            hide: { chance: 90, value: 400 },
            trophy: { chance: 50, value: 600 },
            rare_essence: { chance: 15, value: 1000 }
        }
    },
    griffin: {
        name: 'Griffin',
        tier: 4,
        health: 180,
        damage: 85,
        agility: 90,
        baseValue: 1200,
        rarity: 'rare',
        requiredHauntedLandsTier: 4,
        manaConsumption: { min: 4, max: 8 }, 
        staminaConsumption: 22,
        lootTable: {
            flesh: { chance: 80, value: 250 },
            hide: { chance: 95, value: 800 },
            trophy: { chance: 60, value: 1000 },
            rare_essence: { chance: 25, value: 1500 }
        }
    },
    chimera: {
        name: 'Chimera',
        tier: 5,
        health: 400,
        damage: 120,
        agility: 35,
        baseValue: 2500,
        rarity: 'epic',
        requiredHauntedLandsTier: 6,
        manaConsumption: { min: 8, max: 15 }, 
        staminaConsumption: 35,
        lootTable: {
            flesh: { chance: 90, value: 800 },
            hide: { chance: 95, value: 1500 },
            trophy: { chance: 80, value: 2000 },
            rare_essence: { chance: 40, value: 3000 }
        }
    },
    hydra: {
        name: 'Hydra',
        tier: 6,
        health: 320,
        damage: 150,
        agility: 85,
        baseValue: 5000,
        rarity: 'legendary',
        requiredHauntedLandsTier: 7,
        manaConsumption: { min: 10, max: 20 }, 
        staminaConsumption: 45,
        lootTable: {
            flesh: { chance: 70, value: 1000 },
            hide: { chance: 100, value: 4000 },
            trophy: { chance: 90, value: 5000 },
            rare_essence: { chance: 60, value: 6000 },
            relic: { chance: 10, value: 15000 }
        }
    },
    lich_king: {
        name: 'Lich King',
        tier: 10,
        health: 1000,
        damage: 300,
        agility: 60,
        baseValue: 50000,
        rarity: 'mythic',
        requiredHauntedLandsTier: 10,
        manaConsumption: { min: 20, max: 40 }, 
        staminaConsumption: 75,
        lootTable: {
            flesh: { chance: 100, value: 10000 },
            hide: { chance: 100, value: 25000 },
            trophy: { chance: 100, value: 40000 },
            rare_essence: { chance: 100, value: 30000 },
            relic: { chance: 50, value: 100000 }
        }
    }
};

const POTION_TYPES = {
    minor_healing_potion: {
        name: 'Minor Healing Potion',
        type: 'potion',
        efficiency: 1.0,
        price: 10,
        description: 'A basic potion to restore some stamina',
        staminaValue: 10
    },
    greater_healing_potion: {
        name: 'Greater Healing Potion',
        type: 'potion',
        efficiency: 0.8,
        price: 18,
        description: 'A quality potion for extended quests',
        staminaValue: 15
    },
    superior_healing_potion: {
        name: 'Superior Healing Potion',
        type: 'potion',
        efficiency: 0.6,
        price: 35,
        description: 'A superior potion for the most arduous quests',
        staminaValue: 20
    },
    weak_healing_potion: {
        name: 'Weak Healing Potion',
        type: 'potion',
        efficiency: 1.2,
        price: 7,
        description: 'A cheap but less effective potion',
        staminaValue: 8
    }
};

const WEAPON_OILS = {
    sharpening_oil: {
        name: 'Sharpening Oil',
        type: 'oil',
        compatibleWeapons: ['sword', 'axe', 'mace', 'greatsword'],
        damage: 1.0,
        accuracy: 1.0,
        price: 5,
        description: 'Standard oil for weapon maintenance',
        manaValue: 20
    },
    poison_oil: {
        name: 'Poison Oil',
        type: 'oil',
        compatibleWeapons: ['sword', 'axe', 'mace', 'greatsword'],
        damage: 1.3,
        accuracy: 1.1,
        price: 12,
        description: 'A venomous oil that enhances damage',
        manaValue: 15
    },
    fire_oil: {
        name: 'Fire Oil',
        type: 'oil',
        compatibleWeapons: ['sword', 'axe', 'mace', 'greatsword'],
        damage: 1.0,
        accuracy: 1.0,
        price: 8,
        description: 'An oil that imbues your weapon with fire',
        manaValue: 15
    },
    frost_oil: {
        name: 'Frost Oil',
        type: 'oil',
        compatibleWeapons: ['sword', 'axe', 'mace', 'greatsword'],
        damage: 1.5,
        accuracy: 1.2,
        price: 20,
        description: 'An oil that imbues your weapon with frost',
        manaValue: 12
    },
    lightning_oil: {
        name: 'Lightning Oil',
        type: 'oil',
        compatibleWeapons: ['staff', 'wand'],
        damage: 1.0,
        accuracy: 1.0,
        price: 15,
        description: 'An oil that imbues your weapon with lightning',
        manaValue: 30
    },
    shadow_oil: {
        name: 'Shadow Oil',
        type: 'oil',
        compatibleWeapons: ['staff', 'wand'],
        damage: 1.4,
        accuracy: 0.9,
        price: 25,
        description: 'An oil that imbues your weapon with dark energy',
        manaValue: 25
    },
    holy_oil: {
        name: 'Holy Oil',
        type: 'oil',
        compatibleWeapons: ['staff', 'wand'],
        damage: 1.0,
        accuracy: 1.0,
        price: 50,
        description: 'An oil that imbues your weapon with holy energy',
        manaValue: 10
    },
    dragons_breath_oil: {
        name: 'Dragons Breath Oil',
        type: 'oil',
        compatibleWeapons: ['staff', 'wand'],
        damage: 1.6,
        accuracy: 1.3,
        price: 85,
        description: 'A mythical oil that imbues your weapon with the power of a dragon',
        manaValue: 8
    },
    soul_trap_oil: {
        name: 'Soul-Trap Oil',
        type: 'oil',
        compatibleWeapons: ['any'],
        damage: 0.1,
        accuracy: 1.0,
        price: 30,
        description: 'An oil for capturing the essence of a monster',
        manaValue: 15,
        special: 'capture'
    },
    binding_oil: {
        name: 'Binding Oil',
        type: 'oil',
        compatibleWeapons: ['any'],
        damage: 0.0,
        accuracy: 0.8,
        price: 45,
        description: 'An oil for binding a monster',
        manaValue: 10,
        special: 'capture'
    }
};

const ENCHANTMENT_SUPPLIES = {
    weapon_enchantment_kit: {
        name: 'Weapon Enchantment Kit',
        type: 'enchantment',
        price: 150,
        description: 'Enchants your weapon with powerful magic',
        enchantmentAmount: 25, 
        uses: 5 
    },
    armor_fortification_kit: {
        name: 'Armor Fortification Kit',
        type: 'fortification',
        price: 75,
        description: 'Fortifies your armor for 5 quests',
        effect: 'durability_protection',
        duration: 5 
    },
    mount_rejuvenation_kit: {
        name: 'Mount Rejuvenation Kit',
        type: 'rejuvenation',
        price: 200,
        description: 'Emergency mount rejuvenation in the field',
        rejuvenationAmount: 40,
        uses: 3
    }
};

const SLAYING_MOUNTS = {
    war_horse: {
        name: 'War Horse',
        type: 'horse',
        tier: 1,
        maxDurability: 100,
        staminaCapacity: 50,
        capacity: 3,
        hauntedLandsTier: 2,
        price: 5000,
        maintenanceCost: 100,
        description: 'A reliable war horse for basic slaying quests'
    },
    griffon: {
        name: 'Griffon',
        type: 'griffon',
        tier: 2,
        maxDurability: 150,
        staminaCapacity: 80,
        capacity: 5,
        hauntedLandsTier: 4,
        price: 15000,
        maintenanceCost: 200,
        description: 'A majestic griffon for deeper quests into the haunted lands'
    },
    wyvern: {
        name: 'Wyvern',
        type: 'wyvern',
        tier: 3,
        maxDurability: 200,
        staminaCapacity: 120,
        capacity: 8,
        hauntedLandsTier: 6,
        price: 40000,
        maintenanceCost: 400,
        description: 'A powerful wyvern for serious slaying quests'
    },
    pegasus: {
        name: 'Pegasus',
        type: 'pegasus',
        tier: 4,
        maxDurability: 180,
        staminaCapacity: 200,
        capacity: 6,
        hauntedLandsTier: 8,
        price: 100000,
        maintenanceCost: 1000,
        description: 'A mythical pegasus for accessing remote haunted lands'
    },
    war_dragon: {
        name: 'War Dragon',
        type: 'dragon',
        tier: 5,
        maxDurability: 300,
        staminaCapacity: 150,
        capacity: 10,
        hauntedLandsTier: 10,
        price: 250000,
        maintenanceCost: 2000,
        description: 'The ultimate mount for the most dangerous quests'
    }
};

const SLAYING_WEAPONS = {
    short_sword: {
        name: 'Short Sword',
        type: 'sword',
        tier: 1,
        damage: 50,
        accuracy: 70,
        maxDurability: 100,
        manaCapacity: 20,
        criticalChance: 15,
        price: 800,
        description: 'A traditional short sword for close combat'
    },
    battle_axe: {
        name: 'Battle Axe',
        type: 'axe',
        tier: 2,
        damage: 80,
        accuracy: 85,
        maxDurability: 120,
        manaCapacity: 15,
        criticalChance: 20,
        price: 2500,
        description: 'A powerful battle axe with enhanced precision'
    },
    war_mace: {
        name: 'War Mace',
        type: 'mace',
        tier: 3,
        damage: 150,
        accuracy: 90,
        maxDurability: 150,
        manaCapacity: 10,
        criticalChance: 25,
        price: 8000,
        description: 'A high-powered mace for medium-sized monsters'
    },
    greatsword: {
        name: 'Greatsword',
        type: 'greatsword',
        tier: 4,
        damage: 250,
        accuracy: 95,
        maxDurability: 180,
        manaCapacity: 5,
        criticalChance: 40,
        price: 25000,
        description: 'A long-range precision weapon for large monsters'
    },
    staff_of_power: {
        name: 'Staff of Power',
        type: 'staff',
        tier: 5,
        damage: 500,
        accuracy: 85,
        maxDurability: 200,
        manaCapacity: 3,
        criticalChance: 50,
        price: 100000,
        description: 'A legendary staff capable of slaying mythical beasts'
    }
};

const SLAYING_ALLIES = {
    squire: {
        name: 'Squire',
        type: 'squire',
        tier: 1,
        maxHealth: 80,
        skill: 40,
        specialAbility: 'tracking',
        price: 2000,
        description: 'A loyal squire that helps track monsters'
    },
    mystic: {
        name: 'Mystic',
        type: 'mystic',
        tier: 2,
        maxHealth: 60,
        skill: 60,
        specialAbility: 'aerial_scout',
        price: 5000,
        description: 'A sharp-eyed mystic that scouts ahead'
    },
    ranger: {
        name: 'Ranger',
        type: 'ranger',
        tier: 3,
        maxHealth: 120,
        skill: 80,
        specialAbility: 'rare_monster_detection',
        price: 15000,
        description: 'An experienced ranger who finds rare monsters'
    },
    cleric: {
        name: 'Cleric',
        type: 'cleric',
        tier: 4,
        maxHealth: 100,
        skill: 70,
        specialAbility: 'healing',
        price: 20000,
        description: 'A medical expert who heals injuries during quests'
    },
    paladin: {
        name: 'Paladin',
        type: 'paladin',
        tier: 5,
        maxHealth: 150,
        skill: 95,
        specialAbility: 'damage_boost',
        price: 50000,
        description: 'A legendary paladin with decades of experience'
    }
};

const SLAYING_VAULTS = {
    small_vault: {
        name: 'Small Vault',
        type: 'small_vault',
        tier: 1,
        capacity: 20,
        preservation: 3, // Days
        bonusMultiplier: 1.0,
        price: 10000,
        maintenanceCost: 200,
        description: 'A simple vault for storing slaying loot'
    },
    medium_vault: {
        name: 'Medium Vault',
        type: 'medium_vault',
        tier: 2,
        capacity: 50,
        preservation: 7,
        bonusMultiplier: 1.1,
        price: 30000,
        maintenanceCost: 500,
        description: 'A climate-controlled vault for better preservation'
    },
    large_vault: {
        name: 'Large Vault',
        type: 'large_vault',
        tier: 3,
        capacity: 100,
        preservation: 14,
        bonusMultiplier: 1.25,
        price: 75000,
        maintenanceCost: 1000,
        description: 'A high-security vault with extended preservation'
    },
    grand_vault: {
        name: 'Grand Vault',
        type: 'grand_vault',
        tier: 4,
        capacity: 200,
        preservation: 30,
        bonusMultiplier: 1.5,
        price: 150000,
        maintenanceCost: 2000,
        description: 'A specialized facility for exotic specimens'
    },
    mythic_vault: {
        name: 'Mythic Vault',
        type: 'mythic_vault',
        tier: 5,
        capacity: 500,
        preservation: 60,
        bonusMultiplier: 2.0,
        price: 500000,
        maintenanceCost: 5000,
        description: 'The ultimate storage facility for mythical treasures'
    }
};

const CHESTS = {
    common_chest: {
        name: 'Common Chest',
        rarity: 'common',
        contents: {
            money: { min: 100, max: 500, chance: 80 },
            oil: { min: 5, max: 20, chance: 60 },
            healing_potion: { chance: 30, value: 200 },
            weapon_enchantment: { chance: 10, value: 1000 }
        }
    },
    rare_chest: {
        name: 'Rare Chest',
        rarity: 'rare',
        contents: {
            money: { min: 1000, max: 5000, chance: 90 },
            rare_oil: { min: 10, max: 30, chance: 70 },
            ally_heal: { chance: 50, value: 500 },
            weapon_enchantment: { chance: 30, value: 2500 },
            mount_stamina: { chance: 40, value: 300 }
        }
    },
    legendary_chest: {
        name: 'Legendary Chest',
        rarity: 'legendary',
        contents: {
            money: { min: 10000, max: 50000, chance: 100 },
            premium_oil: { min: 20, max: 50, chance: 80 },
            legendary_essence: { chance: 60, value: 15000 },
            weapon_blueprint: { chance: 25, value: 25000 },
            ally_upgrade: { chance: 40, value: 10000 }
        }
    }
};

const items = {
    ...POTION_TYPES,
    ...WEAPON_OILS,
    ...ENCHANTMENT_SUPPLIES
};

module.exports = {
    SLAYING_MONSTERS,
    SLAYING_MOUNTS,
    SLAYING_WEAPONS,
    SLAYING_ALLIES,
    SLAYING_VAULTS,
    CHESTS,
    POTION_TYPES,
    WEAPON_OILS,
    ENCHANTMENT_SUPPLIES,
    items
};
