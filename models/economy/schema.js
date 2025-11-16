const mongoose = require('mongoose');

// Conveyance Schema
const conveyanceSchema = new mongoose.Schema({
    conveyanceId: String,
    name: String,
    type: { type: String, enum: ['steed', 'chariot', 'wagon', 'airship', 'golem'] },
    tier: { type: Number, min: 1, max: 5 },
    durability: { type: Number, min: 0, max: 300, default: 100 },
    maxDurability: { type: Number, default: 100 },
    fuelCapacity: { type: Number, default: 100 },
    currentFuel: { type: Number, default: 100 },
    capacity: { type: Number, default: 5 },
    dungeonDepth: { type: Number, min: 1, max: 10 },
    purchasePrice: Number,
    maintenanceCost: { type: Number, default: 100 },
    dateAcquired: { type: Date, default: Date.now }
});

// Weapon Schema
const weaponSchema = new mongoose.Schema({
    weaponId: String,
    name: String,
    type: { type: String, enum: ['bow', 'crossbow', 'staff', 'lance', 'cannon', 'soul-trapper', 'chain-caster'] },
    tier: { type: Number, min: 1, max: 5 },
    damage: { type: Number, min: 10, max: 500 },
    accuracy: { type: Number, min: 50, max: 100 },
    durability: { type: Number, min: 0, max: 200, default: 100 },
    maxDurability: { type: Number, default: 100 },
    ammoCapacity: { type: Number, default: 30 },
    currentAmmo: { type: Number, default: 30 },
    criticalChance: { type: Number, min: 5, max: 50, default: 10 },
    purchasePrice: Number,
    upgradeLevel: { type: Number, default: 0, max: 10 },
    dateAcquired: { type: Date, default: Date.now }
});

// Ally Schema
const allySchema = new mongoose.Schema({
    allyId: String,
    name: String,
    type: { type: String, enum: ['wolf', 'raven', 'scout', 'cleric', 'knight'] },
    tier: { type: Number, min: 1, max: 5 },
    health: { type: Number, min: 0, max: 150, default: 100 },
    maxHealth: { type: Number, default: 100 },
    stamina: { type: Number, min: 0, max: 100, default: 100 },
    skill: { type: Number, min: 1, max: 100, default: 50 },
    experience: { type: Number, default: 0 },
    level: { type: Number, default: 1, max: 20 },
    injured: { type: Boolean, default: false },
    injuryTime: Date,
    healingCost: { type: Number, default: 0 },
    specialAbility: String,
    purchasePrice: Number,
    dateAcquired: { type: Date, default: Date.now }
});

// Trove Schema
const troveSchema = new mongoose.Schema({
    troveId: String,
    name: String,
    type: { type: String, enum: ['pack', 'chest', 'vault', 'menagerie', 'pocket_dimension'] },
    tier: { type: Number, min: 1, max: 5 },
    capacity: { type: Number, default: 20 },
    preservation: { type: Number, min: 1, max: 60, default: 5 },
    bonusMultiplier: { type: Number, default: 1.0 },
    currentItems: { type: Number, default: 0 },
    maintenanceCost: { type: Number, default: 500 },
    location: String,
    purchasePrice: Number,
    dateAcquired: { type: Date, default: Date.now }
});

// Loot Schema
const lootSchema = new mongoose.Schema({
    lootId: String,
    name: String,
    type: { type: String, enum: ['monster_part', 'core', 'essence', 'trophy', 'ectoplasm', 'treasure_chest', 'soulstone'] },
    rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] },
    baseValue: Number,
    currentValue: Number,
    weight: { type: Number, default: 1 },
    quantity: { type: Number, default: 1 },
    expiryDate: Date,
    location: String,
    huntDate: { type: Date, default: Date.now },
    description: String
});

// Guild Schema
const guildSchema = new mongoose.Schema({
    guildId: String,
    name: String,
    type: { type: String, enum: ['alchemists_guild', 'arcane_academy', 'mercenary_guild', 'beast_masters_guild', 'royal_guard', 'shadow_syndicate'] },
    level: { type: Number, default: 1, max: 10 },
    apprentices: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    reputation: { type: Number, default: 50, min: 0, max: 100 },
    location: String,
    purchasePrice: Number,
    upgradeCost: Number,
    dailyIncome: { type: Number, default: 0 },
    lastCollection: Date,
    efficiency: { type: Number, default: 1.0 },
    specialBonus: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

// Raid Schema
const raidSchema = new mongoose.Schema({
    raidId: String,
    plannerUserId: String,
    targetType: { type: String, enum: ['ancient_dragon_hoard', 'elven_treasury', 'lich_phylactery', 'dwarven_gem_mine', 'kings_caravan'] },
    targetName: String,
    difficulty: { type: Number, min: 1, max: 5 },
    requiredMembers: { type: Number, min: 3, max: 6 },
    members: [{
        userId: String,
        username: String,
        role: { type: String, enum: ['warlord', 'arcanist', 'scout', 'vanguard', 'sentinel', 'berserker', 'rune_forger'] },
        confirmed: { type: Boolean, default: false },
        equipment: [String]
    }],
    plannedDate: Date,
    executionDate: Date,
    status: { type: String, enum: ['planning', 'recruiting', 'ready', 'in_progress', 'completed', 'failed', 'cancelled'], default: 'planning' },
    potential_payout: Number,
    actual_payout: Number,
    success_chance: { type: Number, default: 0 },
    notoriety_level: { type: Number, default: 0 },
    preparation_time: { type: Number, default: 0 },
    equipment_cost: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const raidCollectionSchema = new mongoose.Schema({
    raidId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    ...raidSchema.obj
});

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['income', 'expense', 'transfer', 'investment', 'trade', 'arena_battle', 'pillage', 'family_quest', 'mystic_gambling', 'market_purchase', 'dungeon_raid', 'monster_hunt'], required: true },
    amount: { type: Number, required: true },
    description: String,
    category: String,
    timestamp: { type: Date, default: Date.now }
});

// Mount Schema
const mountSchema = new mongoose.Schema({
    mountId: String,
    name: String,
    type: { type: String, enum: ['ground', 'predator', 'flying', 'dragonkin', 'dragon'] },
    speed: { type: Number, min: 1, max: 100 },
    acceleration: { type: Number, min: 1, max: 100 },
    handling: { type: Number, min: 1, max: 100 },
    durability: { type: Number, min: 1, max: 100, default: 100 },
    purchasePrice: Number,
    currentValue: Number,
    maintenanceCost: Number,
    battleWins: { type: Number, default: 0 },
    battleLosses: { type: Number, default: 0 },
    totalDistanceTraveled: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

// Familiar Schema
const familiarSchema = new mongoose.Schema({
    familiarId: String,
    name: String,
    type: { type: String, enum: ['wisp', 'arcane', 'elemental', 'fey', 'shadow', 'celestial'] },
    species: String,
    wardingLevel: { type: Number, min: 1, max: 100 },
    bond: { type: Number, min: 0, max: 100, default: 50 },
    health: { type: Number, min: 0, max: 100, default: 100 },
    maxHealth: { type: Number, min: 1, max: 100, default: 100 },
    mana: { type: Number, min: 0, max: 100, default: 50 },
    essence: { type: Number, min: 0, max: 100, default: 50 },
    attunementPrice: Number,
    lastFed: Date,
    lastGroomed: Date,
    lastPlayed: Date,
    dateAttuned: { type: Date, default: Date.now }
});

// Family Member Schema removed - replaced by Follower Schema

// Follower Schema
const followerSchema = new mongoose.Schema({
    followerId: String,
    name: String,
    role: { type: String, enum: ['squire', 'apprentice', 'acolyte', 'minion'] },
    age: Number,
    class: String,
    tribute: Number,
    loyalty: { type: Number, min: 0, max: 100, default: 50 },
    questEfficiency: { type: Number, min: 0.5, max: 2.0, default: 1.0 },
    totalQuests: { type: Number, default: 0 },
    dateJoined: { type: Date, default: Date.now },
    lastQuest: Date
});

// Stronghold Schema
const strongholdSchema = new mongoose.Schema({
    strongholdId: String,
    name: String,
    type: { type: String, enum: ['tower', 'spire', 'citadel', 'fortress', 'keep'] },
    purchasePrice: Number,
    currentValue: Number,
    monthlyRent: Number,
    utilities: Number,
    securityLevel: { type: Number, min: 1, max: 10, default: 1 },
    maxFollowers: Number,
    hasStable: { type: Boolean, default: false },
    stableCapacity: { type: Number, default: 0 },
    treasuryCapacity: { type: Number, default: 0 },
    condition: { type: String, enum: ['poor', 'fair', 'good', 'excellent'], default: 'good' },
    dateAcquired: Date
});

// Title Schema
const titleSchema = new mongoose.Schema({
    titleId: String,
    titleName: String,
    price: Number,
    benefits: {
        workMultiplier: { type: Number, default: 1.0 },
        arenaBonus: { type: Number, default: 0 },
        pillageProtection: { type: Number, default: 0 },
        familyBonus: { type: Number, default: 0 }
    },
    datePurchased: { type: Date, default: Date.now },
    expiryDate: Date
});

// Beast Schema
const beastSchema = new mongoose.Schema({
    beastId: String,
    name: String,
    type: { type: String, enum: ['ground', 'predator', 'flying', 'dragonkin', 'dragon'] },
    prowess: { type: Number, min: 1, max: 100 },
    ferocity: { type: Number, min: 1, max: 100 },
    cunning: { type: Number, min: 1, max: 100 },
    purchasePrice: Number,
    currentValue: Number,
    vitality: { type: Number, min: 0, max: 100, default: 100 },
    arenaWins: { type: Number, default: 0 },
    arenaLosses: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

// Active effects system
const activeEffectSchema = new mongoose.Schema({
    effectId: String,
    name: String,
    type: { type: String, enum: ['mystic_luck', 'quest_boost', 'pillage_protection', 'treasury_boost', 'royal_treasury_boost'] },
    multiplier: { type: Number, default: 1 },
    stacks: { type: Number, default: 1, max: 5 },
    startTime: { type: Date, default: Date.now },
    expiryTime: Date,
    description: String
});

// MAIN ECONOMY SCHEMA
const economySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    
    // Basic Economy
    embers: { type: Number, default: 1000, min: 0 },
    royal_treasury: { type: Number, default: 0, min: 0 },
    treasury_limit: { type: Number, default: 10000 },
    
    // Followers System (replaces Family System)
    followers_strongbox: { type: Number, default: 0, min: 0 },
    followers: [followerSchema],
    followersBond: { type: Number, min: 0, max: 100, default: 0 },
    
    // Mount System
    mounts: [mountSchema],
    activeMount: String,
    
    // Familiar System
    familiars: [familiarSchema],
    maxFamiliars: { type: Number, default: 1 },
    
    // Stronghold System
    strongholds: [strongholdSchema],
    primaryStronghold: String,

    // Beast System
    beasts: [beastSchema],
    activeBeast: String,

    // Guild System
    guilds: [guildSchema],
    maxGuilds: { type: Number, default: 1 },
    guildManagementSkill: { type: Number, default: 0, max: 100 },
    
    // Raid System
    activeRaids: [String],
    completedRaids: { type: Number, default: 0 },
    failedRaids: { type: Number, default: 0 },
    raidingSkill: { type: Number, default: 0, max: 100 },
    notoriety: { type: Number, default: 0, max: 100 },
    banishmentTime: Date,
    
    // MONSTER HUNTING SYSTEM
    conveyances: [conveyanceSchema],
    activeConveyance: String,
    weapons: [weaponSchema],
    activeWeapon: String,
    allies: [allySchema],
    activeAllies: [String],
    maxAllies: { type: Number, default: 2 },
    troves: [troveSchema],
    loot: [lootSchema],

    // Monster Hunting Stats
    huntingStats: {
        totalHunts: { type: Number, default: 0 },
        successfulHunts: { type: Number, default: 0 },
        failedHunts: { type: Number, default: 0 },
        monstersSlain: { type: Number, default: 0 },
        totalDamageDealt: { type: Number, default: 0 },
        totalDamageTaken: { type: Number, default: 0 },
        deepestDungeonLevel: { type: Number, default: 1 },
        rareMonstersFound: { type: Number, default: 0 },
        treasureChestsFound: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        monsterHuntingSkill: { type: Number, default: 0, max: 100 },
        survivalSkill: { type: Number, default: 0, max: 100 }
    },

    // Hunter Profile
    huntingProfile: {
        hunterLevel: { type: Number, default: 1 },
        hunterExperience: { type: Number, default: 0 },
        reputation: { type: Number, default: 0, min: -100, max: 100 },
        currentHealth: { type: Number, default: 100, min: 0, max: 100 },
        maxHealth: { type: Number, default: 100 },
        stamina: { type: Number, default: 100, min: 0, max: 100 },
        lastHunt: Date,
        expeditionCount: { type: Number, default: 0 },
        currentLocation: { type: String, default: 'sanctuary' },
        licenses: [String],
        achievements: [String]
    },
    
    // Title System
    acquiredTitles: [titleSchema],
    
    // Active Effects System
    activeEffects: [activeEffectSchema],
    
    // Stats and Progress
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    
    // Arena Stats
    arenaStats: {
        totalBattles: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        winStreak: { type: Number, default: 0 }
    },
    
    // Security & Pillage
    lastPillaged: Date,
    pillageAttempts: { type: Number, default: 0 },
    successfulPillages: { type: Number, default: 0 },
    
    // Enhanced Cooldowns
    cooldowns: {
        daily: Date,
        weekly: Date,
        quest: Date,
        arena_battle: Date,
        journey: Date,
        familiarCare: Date,
        pillage: Date,
        plead: Date,
        mystic_gambling: Date,
        market: Date,
        guild: Date,
        raid: Date,
        hunt: Date
    },
    
    dailyStreak: { type: Number, default: 0 },
    transactions: [transactionSchema],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add compound unique index
economySchema.index({ userId: 1, guildId: 1 }, { unique: true });

// Pre-save middleware to update timestamp and clean expired effects
economySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    this.activeEffects = this.activeEffects.filter(effect => 
        new Date(effect.expiryTime) > new Date()
    );
    
    next();
});

module.exports = {
    Economy: mongoose.model('Economy', economySchema),
    Raid: mongoose.model('Raid', raidCollectionSchema)
};