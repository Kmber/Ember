
const MONSTERS = {
    // Tier 1-2 (Forest of Whispers)
    forest_sprite: {
        name: 'Forest Sprite',
        tier: 1,
        health: 25,
        damage: 5,
        agility: 80,
        baseValue: 50,
        rarity: 'common',
        requiredDungeonDepth: 1,
        ammoConsumption: { min: 1, max: 2 },
        fuelConsumption: 5,
        lootTable: {
            essence: { chance: 90, value: 25 },
            core: { chance: 60, value: 35 },
            treasure_chest: { chance: 5, value: 100 }
        }
    },
    shadow_wisp: {
        name: 'Shadow Wisp',
        tier: 1,
        health: 60,
        damage: 15,
        agility: 70,
        baseValue: 150,
        rarity: 'common',
        requiredDungeonDepth: 1,
        ammoConsumption: { min: 2, max: 4 },
        fuelConsumption: 8,
        lootTable: {
            essence: { chance: 95, value: 75 },
            core: { chance: 80, value: 100 },
            trophy: { chance: 20, value: 200 }
        }
    },
    dire_wolf: {
        name: 'Dire Wolf',
        tier: 2,
        health: 120,
        damage: 35,
        agility: 50,
        baseValue: 300,
        rarity: 'uncommon',
        requiredDungeonDepth: 2,
        ammoConsumption: { min: 3, max: 6 },
        fuelConsumption: 12,
        lootTable: {
            essence: { chance: 90, value: 150 },
            core: { chance: 70, value: 120 },
            trophy: { chance: 30, value: 250 }
        }
    },
    // Tier 3-5 (Cursed Mountains)
    cave_troll: {
        name: 'Cave Troll',
        tier: 3,
        health: 250,
        damage: 60,
        agility: 40,
        baseValue: 800,
        rarity: 'rare',
        requiredDungeonDepth: 3,
        ammoConsumption: { min: 5, max: 10 },
        fuelConsumption: 18,
        lootTable: {
            essence: { chance: 85, value: 300 },
            core: { chance: 90, value: 400 },
            trophy: { chance: 50, value: 600 },
            ectoplasm: { chance: 15, value: 1000 }
        }
    },
    manticore: {
        name: 'Manticore',
        tier: 4,
        health: 180,
        damage: 85,
        agility: 90,
        baseValue: 1200,
        rarity: 'rare',
        requiredDungeonDepth: 4,
        ammoConsumption: { min: 4, max: 8 },
        fuelConsumption: 22,
        lootTable: {
            essence: { chance: 80, value: 250 },
            core: { chance: 95, value: 800 },
            trophy: { chance: 60, value: 1000 },
            ectoplasm: { chance: 25, value: 1500 }
        }
    },
    stone_golem: {
        name: 'Stone Golem',
        tier: 5,
        health: 400,
        damage: 120,
        agility: 35,
        baseValue: 2500,
        rarity: 'epic',
        requiredDungeonDepth: 6,
        ammoConsumption: { min: 8, max: 15 },
        fuelConsumption: 35,
        lootTable: {
            essence: { chance: 90, value: 800 },
            core: { chance: 95, value: 1500 },
            trophy: { chance: 80, value: 2000 },
            ectoplasm: { chance: 40, value: 3000 }
        }
    },
    // Tier 6-10 (The Abyss)
    chimera: {
        name: 'Chimera',
        tier: 6,
        health: 320,
        damage: 150,
        agility: 85,
        baseValue: 5000,
        rarity: 'legendary',
        requiredDungeonDepth: 7,
        ammoConsumption: { min: 10, max: 20 },
        fuelConsumption: 45,
        lootTable: {
            essence: { chance: 70, value: 1000 },
            core: { chance: 100, value: 4000 },
            trophy: { chance: 90, value: 5000 },
            ectoplasm: { chance: 60, value: 6000 },
            soulstone: { chance: 10, value: 15000 }
        }
    },
    nether_drake: {
        name: 'Nether Drake',
        tier: 10,
        health: 1000,
        damage: 300,
        agility: 60,
        baseValue: 50000,
        rarity: 'mythic',
        requiredDungeonDepth: 10,
        ammoConsumption: { min: 20, max: 40 },
        fuelConsumption: 75,
        lootTable: {
            essence: { chance: 100, value: 10000 },
            core: { chance: 100, value: 25000 },
            trophy: { chance: 100, value: 40000 },
            ectoplasm: { chance: 100, value: 30000 },
            soulstone: { chance: 50, value: 100000 }
        }
    }
};

const ESSENCE_TYPES = {
    lesser_soul_essence: {
        name: 'Lesser Soul Essence',
        type: 'lesser',
        efficiency: 1.0,
        price: 10,
        description: 'Standard essence for basic dungeon crawling.',
        fuelValue: 10
    },
    common_soul_essence: {
        name: 'Common Soul Essence',
        type: 'common',
        efficiency: 0.8,
        price: 18,
        description: 'More refined essence for longer journeys.',
        fuelValue: 15
    },
    greater_soul_essence: {
        name: 'Greater Soul Essence',
        type: 'greater',
        efficiency: 0.6,
        price: 35,
        description: 'Potent essence for the most dangerous expeditions.',
        fuelValue: 20
    },
    tainted_soul_essence: {
        name: 'Tainted Soul Essence',
        type: 'tainted',
        efficiency: 1.2,
        price: 7,
        description: 'Corrupted essence that is cheap but inefficient.',
        fuelValue: 8
    }
};

const CHARGE_TYPES = {
    silver_bolts: {
        name: 'Silver Bolts',
        compatibleWeapons: ['bow'],
        damage: 1.0,
        accuracy: 1.0,
        price: 5,
        description: 'Standard bolts effective against magical creatures.',
        ammoValue: 20
    },
    consecrated_bolts: {
        name: 'Consecrated Bolts',
        compatibleWeapons: ['bow'],
        damage: 1.3,
        accuracy: 1.1,
        price: 12,
        description: 'Bolts blessed to deal holy damage.',
        ammoValue: 15
    },
    runic_bolts: {
        name: 'Runic Bolts',
        compatibleWeapons: ['crossbow'],
        damage: 1.0,
        accuracy: 1.0,
        price: 8,
        description: 'Standard bolts with minor enchantments.',
        ammoValue: 15
    },
    exploding_bolts: {
        name: 'Exploding Bolts',
        compatibleWeapons: ['crossbow'],
        damage: 1.5,
        accuracy: 1.2,
        price: 20,
        description: 'Bolts that explode on impact.',
        ammoValue: 12
    },
    fire_orbs: {
        name: 'Fire Orbs',
        compatibleWeapons: ['staff'],
        damage: 1.0,
        accuracy: 1.0,
        price: 15,
        description: 'Orbs that unleash a burst of flame.',
        ammoValue: 30
    },
    frost_shards: {
        name: 'Frost Shards',
        compatibleWeapons: ['staff'],
        damage: 1.4,
        accuracy: 0.9,
        price: 25,
        description: 'Shards of ice that freeze targets.',
        ammoValue: 25
    },
    lightning_charges: {
        name: 'Lightning Charges',
        compatibleWeapons: ['lance'],
        damage: 1.0,
        accuracy: 1.0,
        price: 50,
        description: 'Charges that call down a bolt of lightning.',
        ammoValue: 10
    },
    void_crystals: {
        name: 'Void Crystals',
        compatibleWeapons: ['lance'],
        damage: 1.6,
        accuracy: 1.3,
        price: 85,
        description: 'Crystals that channel the power of the void.',
        ammoValue: 8
    },
    soul_trap_gems: {
        name: 'Soul Trap Gems',
        compatibleWeapons: ['soul-trapper'],
        damage: 0.1,
        accuracy: 1.0,
        price: 30,
        description: 'Gems that capture the soul of a monster.',
        ammoValue: 15,
        special: 'capture'
    },
    binding_chains: {
        name: 'Binding Chains',
        compatibleWeapons: ['chain-caster'],
        damage: 0.0,
        accuracy: 0.8,
        price: 45,
        description: 'Chains that magically bind a monster.',
        ammoValue: 10,
        special: 'capture'
    }
};

const REINFORCEMENT_KITS = {
    armor_patch_kit: {
        name: 'Armor Patch Kit',
        type: 'repair',
        price: 150,
        description: 'Repairs conveyance and weapon durability.',
        repairAmount: 25,
        uses: 5
    },
    weapon_sharpening_stone: {
        name: 'Weapon Sharpening Stone',
        type: 'weapon_maintenance',
        price: 75,
        description: 'Prevents weapon degradation for 5 hunts.',
        effect: 'durability_protection',
        duration: 5
    },
    conveyance_repair_kit: {
        name: 'Conveyance Repair Kit',
        type: 'conveyance_maintenance',
        price: 200,
        description: 'Emergency conveyance repairs in the field.',
        repairAmount: 40,
        uses: 3
    }
};

const CONVEYANCES = {
    spectral_steed: {
        name: 'Spectral Steed',
        type: 'steed',
        tier: 1,
        maxDurability: 100,
        fuelCapacity: 50,
        capacity: 3,
        dungeonDepth: 2,
        price: 5000,
        maintenanceCost: 100,
        description: 'A ghostly steed for basic dungeon crawling.'
    },
    war_chariot: {
        name: 'War Chariot',
        type: 'chariot',
        tier: 2,
        maxDurability: 150,
        fuelCapacity: 80,
        capacity: 5,
        dungeonDepth: 4,
        price: 15000,
        maintenanceCost: 200,
        description: 'A sturdy chariot for deeper dungeon exploration.'
    },
    ironclad_wagon: {
        name: 'Ironclad Wagon',
        type: 'wagon',
        tier: 3,
        maxDurability: 200,
        fuelCapacity: 120,
        capacity: 8,
        dungeonDepth: 6,
        price: 40000,
        maintenanceCost: 400,
        description: 'A heavy-duty wagon for serious expeditions.'
    },
    griffon_airship: {
        name: 'Griffon Airship',
        type: 'airship',
        tier: 4,
        maxDurability: 180,
        fuelCapacity: 200,
        capacity: 6,
        dungeonDepth: 8,
        price: 100000,
        maintenanceCost: 1000,
        description: 'An advanced airship for reaching remote dungeons.'
    },
    siege_golem: {
        name: 'Siege Golem',
        type: 'golem',
        tier: 5,
        maxDurability: 300,
        fuelCapacity: 150,
        capacity: 10,
        dungeonDepth: 10,
        price: 250000,
        maintenanceCost: 2000,
        description: 'The ultimate conveyance for the most dangerous dungeons.'
    }
};

const HUNTING_WEAPONS = {
    elven_longbow: {
        name: 'Elven Longbow',
        type: 'bow',
        tier: 1,
        damage: 50,
        accuracy: 70,
        maxDurability: 100,
        ammoCapacity: 20,
        criticalChance: 15,
        price: 800,
        description: 'A traditional bow for silent monster hunting.'
    },
    rune_crossbow: {
        name: 'Rune Crossbow',
        type: 'crossbow',
        tier: 2,
        damage: 80,
        accuracy: 85,
        maxDurability: 120,
        ammoCapacity: 15,
        criticalChance: 20,
        price: 2500,
        description: 'A powerful crossbow with enchanted precision.'
    },
    fireball_staff: {
        name: 'Fireball Staff',
        type: 'staff',
        tier: 3,
        damage: 150,
        accuracy: 90,
        maxDurability: 150,
        ammoCapacity: 10,
        criticalChance: 25,
        price: 8000,
        description: 'A magical staff for medium-sized monsters.'
    },
    lightning_lance: {
        name: 'Lightning Lance',
        type: 'lance',
        tier: 4,
        damage: 250,
        accuracy: 95,
        maxDurability: 180,
        ammoCapacity: 5,
        criticalChance: 40,
        price: 25000,
        description: 'A long-range lance for large monsters.'
    },
    void_cannon: {
        name: 'Void Cannon',
        type: 'cannon',
        tier: 5,
        damage: 500,
        accuracy: 85,
        maxDurability: 200,
        ammoCapacity: 3,
        criticalChance: 50,
        price: 100000,
        description: 'A legendary weapon capable of taking down mythical beasts.'
    }
};

const ALLIES = {
    dire_wolf_pup: {
        name: 'Dire Wolf Pup',
        type: 'wolf',
        tier: 1,
        maxHealth: 80,
        skill: 40,
        specialAbility: 'tracking',
        price: 2000,
        description: 'A loyal companion that helps track monsters.'
    },
    shadow_raven: {
        name: 'Shadow Raven',
        type: 'raven',
        tier: 2,
        maxHealth: 60,
        skill: 60,
        specialAbility: 'aerial_scout',
        price: 5000,
        description: 'A sharp-eyed bird that scouts ahead.'
    },
    ranger_scout: {
        name: 'Ranger Scout',
        type: 'scout',
        tier: 3,
        maxHealth: 120,
        skill: 80,
        specialAbility: 'rare_monster_detection',
        price: 15000,
        description: 'An experienced scout who finds rare monsters.'
    },
    cleric_acolyte: {
        name: 'Cleric Acolyte',
        type: 'cleric',
        tier: 4,
        maxHealth: 100,
        skill: 70,
        specialAbility: 'healing',
        price: 20000,
        description: 'A medical expert who heals injuries during hunts.'
    },
    dragon_knight: {
        name: 'Dragon Knight',
        type: 'knight',
        tier: 5,
        maxHealth: 150,
        skill: 95,
        specialAbility: 'damage_boost',
        price: 50000,
        description: 'A legendary knight with decades of experience.'
    }
};

const TROVES = {
    adventurers_pack: {
        name: 'Adventurers Pack',
        type: 'pack',
        tier: 1,
        capacity: 20,
        preservation: 3,
        bonusMultiplier: 1.0,
        price: 10000,
        maintenanceCost: 200,
        description: 'A simple pack for storing monster loot.'
    },
    enchanted_chest: {
        name: 'Enchanted Chest',
        type: 'chest',
        tier: 2,
        capacity: 50,
        preservation: 7,
        bonusMultiplier: 1.1,
        price: 30000,
        maintenanceCost: 500,
        description: 'A magically preserved chest for better storage.'
    },
    guild_vault: {
        name: 'Guild Vault',
        type: 'vault',
        tier: 3,
        capacity: 100,
        preservation: 14,
        bonusMultiplier: 1.25,
        price: 75000,
        maintenanceCost: 1000,
        description: 'A high-security vault with extended preservation.'
    },
    menagerie_of_shadows: {
        name: 'Menagerie of Shadows',
        type: 'menagerie',
        tier: 4,
        capacity: 200,
        preservation: 30,
        bonusMultiplier: 1.5,
        price: 150000,
        maintenanceCost: 2000,
        description: 'A specialized facility for exotic specimens.'
    },
    dimensional_pocket: {
        name: 'Dimensional Pocket',
        type: 'pocket_dimension',
        tier: 5,
        capacity: 500,
        preservation: 60,
        bonusMultiplier: 2.0,
        price: 500000,
        maintenanceCost: 5000,
        description: 'An extra-dimensional space for mythical creatures.'
    }
};

const TREASURE_CHESTS = {
    wooden_chest: {
        name: 'Wooden Chest',
        rarity: 'common',
        contents: {
            embers: { min: 100, max: 500, chance: 80 },
            charges: { min: 5, max: 20, chance: 60 },
            healing_potion: { chance: 30, value: 200 },
            weapon_upgrade: { chance: 10, value: 1000 }
        }
    },
    iron_chest: {
        name: 'Iron Chest',
        rarity: 'rare',
        contents: {
            embers: { min: 1000, max: 5000, chance: 90 },
            rare_charges: { min: 10, max: 30, chance: 70 },
            ally_heal: { chance: 50, value: 500 },
            weapon_upgrade: { chance: 30, value: 2500 },
            conveyance_essence: { chance: 40, value: 300 }
        }
    },
    golden_reliquary: {
        name: 'Golden Reliquary',
        rarity: 'legendary',
        contents: {
            embers: { min: 10000, max: 50000, chance: 100 },
            premium_charges: { min: 20, max: 50, chance: 80 },
            legendary_material: { chance: 60, value: 15000 },
            weapon_blueprint: { chance: 25, value: 25000 },
            ally_upgrade: { chance: 40, value: 10000 }
        }
    }
};

module.exports = {
    MONSTERS,
    CONVEYANCES,
    HUNTING_WEAPONS,
    ALLIES,
    TROVES,
    TREASURE_CHESTS,
    ESSENCE_TYPES,
    CHARGE_TYPES,
    REINFORCEMENT_KITS
};
