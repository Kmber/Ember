const { EconomyManager } = require('./economy');
const { 
    MONSTERS, 
    CONVEYANCES, 
    HUNTING_WEAPONS, 
    ALLIES, 
    TROVES,
    TREASURE_CHESTS,
    ESSENCE_TYPES,
    CHARGE_TYPES,
    REINFORCEMENT_KITS
} = require('./constants/huntingData');

class HuntingManager {
    // Generate random monster based on dungeon depth and conveyance capability
    static generateRandomMonster(dungeonDepth, huntingSkill = 0) {
        const availableMonsters = Object.entries(MONSTERS).filter(([key, monster]) => 
            monster.requiredDungeonDepth <= dungeonDepth
        );

        if (availableMonsters.length === 0) {
            return MONSTERS.forest_sprite;
        }

        // Higher skill increases chance of finding rare monsters
        const skillBonus = huntingSkill * 0.01;
        const rarityWeights = {
            common: 50 - (skillBonus * 10),
            uncommon: 30,
            rare: 15 + (skillBonus * 5),
            epic: 4 + (skillBonus * 3),
            legendary: 1 + (skillBonus * 2),
            mythic: 0.1 + skillBonus
        };

        const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + Math.max(0, weight), 0);
        let random = Math.random() * totalWeight;

        for (const [key, monster] of availableMonsters) {
            const weight = rarityWeights[monster.rarity] || 1;
            random -= Math.max(0, weight);
            if (random <= 0) {
                return { key, ...monster };
            }
        }

        return { key: availableMonsters[0][0], ...availableMonsters[0][1] };
    }

    // Calculate combat damage with weapon and ally bonuses
    static calculateDamage(weapon, allies, criticalHit = false) {
        let baseDamage = weapon.damage;
        
        const upgradeBonus = weapon.upgradeLevel * 0.1;
        baseDamage *= (1 + upgradeBonus);

        allies.forEach(ally => {
            if (ally.specialAbility === 'damage_boost' && ally.health > 50) {
                baseDamage *= 1.2;
            }
        });

        if (criticalHit) {
            baseDamage *= 2;
        }

        const variance = 0.8 + (Math.random() * 0.4);
        return Math.floor(baseDamage * variance);
    }

    // Calculate fuel consumption
    static calculateFuelConsumption(conveyance, monster, dungeonDepth) {
        let baseFuelCost = monster.fuelConsumption || 10;
        
        const conveyanceEfficiency = {
            'steed': 1.2,
            'chariot': 1.0,
            'wagon': 1.5,
            'airship': 2.0,
            'golem': 2.5
        };
        
        const depthMultiplier = 1 + (dungeonDepth * 0.3);
        
        const finalFuelCost = Math.ceil(
            baseFuelCost * 
            (conveyanceEfficiency[conveyance.type] || 1.0) * 
            depthMultiplier
        );
        
        return Math.max(5, finalFuelCost);
    }
    
    // Calculate ammo consumption  
    static calculateAmmoConsumption(weapon, monster, huntResult) {
        const baseAmmoRange = monster.ammoConsumption || { min: 1, max: 3 };
        
        let ammoUsed = Math.floor(Math.random() * (baseAmmoRange.max - baseAmmoRange.min + 1)) + baseAmmoRange.min;
        
        const weaponEfficiency = {
            'bow': 1.0,
            'crossbow': 0.8,
            'staff': 0.6,
            'lance': 0.4,
            'cannon': 1.2
        };
        
        const agilityFactor = 1 + (monster.agility / 200);
        const successFactor = huntResult.success ? 1.0 : 1.8;
        const accuracyFactor = Math.max(0.5, 1.0 - (weapon.accuracy / 200));
        
        ammoUsed = Math.ceil(
            ammoUsed * 
            (weaponEfficiency[weapon.type] || 1.0) * 
            agilityFactor * 
            successFactor * 
            accuracyFactor
        );
        
        return Math.max(1, Math.min(ammoUsed, weapon.currentAmmo));
    }

    // Execute hunting expedition
    static async executeHunt(profile) {
        const results = {
            success: false,
            monster: null,
            damageDealt: 0,
            damageTaken: 0,
            loot: [],
            allyInjuries: [],
            experience: 0,
            skillGain: 0,
            costs: {
                fuel: 0,
                ammo: 0,
                healing: 0,
                repairs: 0
            },
            consumption: {
                fuelUsed: 0,
                ammoUsed: 0
            }
        };

        const conveyance = profile.conveyances.find(v => v.conveyanceId === profile.activeConveyance);
        const weapon = profile.huntingWeapons.find(w => w.weaponId === profile.activeWeapon);
        const allies = profile.allies.filter(c => 
            profile.activeAllies.includes(c.allyId) && c.health > 0
        );

        if (!conveyance || !weapon) {
            throw new Error('No active conveyance or weapon equipped!');
        }

        if (conveyance.currentFuel < 5) {
            throw new Error('Not enough fuel for expedition! Need at least 5 fuel units.');
        }
        if (weapon.currentAmmo < 1) {
            throw new Error('Weapon needs ammunition! Use !huntshop ammo to buy ammo.');
        }

        const monster = this.generateRandomMonster(conveyance.dungeonDepth, profile.huntingSkill);
        results.monster = monster;

        const fuelNeeded = this.calculateFuelConsumption(conveyance, monster, conveyance.dungeonDepth);
        if (conveyance.currentFuel < fuelNeeded) {
            throw new Error(`Not enough fuel! Need ${fuelNeeded} fuel units, have ${conveyance.currentFuel}.`);
        }
        
        conveyance.currentFuel = Math.max(0, conveyance.currentFuel - fuelNeeded);
        results.consumption.fuelUsed = fuelNeeded;

        // Combat simulation
        let monsterHealth = monster.health;
        let hunterHealth = profile.currentHealth;
        let roundCount = 0;
        const maxRounds = 10;
        let totalAmmoUsed = 0;

        while (monsterHealth > 0 && hunterHealth > 0 && roundCount < maxRounds && weapon.currentAmmo > 0) {
            roundCount++;

            if (weapon.currentAmmo > 0) {
                const ammoPerShot = Math.min(
                    Math.floor(Math.random() * 2) + 1,
                    weapon.currentAmmo
                );
                weapon.currentAmmo -= ammoPerShot;
                totalAmmoUsed += ammoPerShot;
                
                let hitChance = weapon.accuracy;
                
                allies.forEach(ally => {
                    if (ally.specialAbility === 'tracking' && ally.health > 30) {
                        hitChance += 10;
                    }
                });

                hitChance -= (monster.agility * 0.3);
                hitChance = Math.max(20, Math.min(95, hitChance));

                if (Math.random() * 100 < hitChance) {
                    const criticalHit = Math.random() * 100 < weapon.criticalChance;
                    const damage = this.calculateDamage(weapon, allies, criticalHit);
                    
                    monsterHealth -= damage;
                    results.damageDealt += damage;
                    
                    weapon.durability = Math.max(0, weapon.durability - 1);
                }
            } else {
                break;
            }

            if (monsterHealth > 0) {
                let monsterDamage = monster.damage;
                
                let protectionReduction = 0;
                allies.forEach(ally => {
                    if (ally.health > 50) {
                        protectionReduction += 10;
                        
                        if (Math.random() * 100 < 20) {
                            const injury = Math.floor(15 + Math.random() * 20);
                            ally.health = Math.max(0, ally.health - injury);
                            ally.injured = ally.health < 30;
                            
                            if (ally.injured) {
                                ally.injuryTime = new Date();
                                ally.healingCost = Math.floor(500 + (injury * 50));
                                results.allyInjuries.push({
                                    name: ally.name,
                                    injury: injury,
                                    healingCost: ally.healingCost
                                });
                            }
                            protectionReduction += 20;
                        }
                    }
                });

                monsterDamage = Math.max(5, monsterDamage - protectionReduction);
                hunterHealth -= monsterDamage;
                results.damageTaken += monsterDamage;
            }
        }

        results.consumption.ammoUsed = totalAmmoUsed;

        if (monsterHealth <= 0) {
            results.success = true;
            results.loot = this.generateLoot(monster, profile.huntingSkill);
            results.experience = Math.floor(50 + (monster.tier * 25));
            results.skillGain = Math.floor(1 + (monster.tier * 0.5));
            
            const lootBoxChance = 10 + (profile.huntingSkill * 0.2);
            if (Math.random() * 100 < lootBoxChance) {
                const lootBox = this.generateLootBox();
                results.loot.push(lootBox);
            }
        } else {
            results.success = false;
            const healingCost = Math.floor(500 + (results.damageTaken * 20));
            results.costs.healing = healingCost;
            results.experience = 10;
        }

        profile.currentHealth = Math.max(0, hunterHealth);
        
        if (conveyance.durability < 50) {
            const repairCost = Math.floor((100 - conveyance.durability) * 50);
            results.costs.repairs = repairCost;
        }

        return results;
    }

    // Generate loot from successful hunt
    static generateLoot(monster, huntingSkill = 0) {
        const loot = [];
        const skillBonus = huntingSkill * 0.01;

        Object.entries(monster.lootTable).forEach(([itemType, itemData]) => {
            const chance = itemData.chance + (skillBonus * 10);
            
            if (Math.random() * 100 < chance) {
                let value = itemData.value;
                const qualityMultiplier = 0.7 + (Math.random() * 0.6);
                value = Math.floor(value * qualityMultiplier);
                
                loot.push({
                    itemId: `${itemType}_${Date.now()}_${Math.random()}`,
                    name: `${monster.name} ${itemType.replace('_', ' ')}`,
                    type: itemType,
                    rarity: monster.rarity,
                    baseValue: itemData.value,
                    currentValue: value,
                    weight: 1,
                    quantity: 1,
                    huntDate: new Date(),
                    description: `High-quality ${itemType} from ${monster.name}`
                });
            }
        });

        return loot;
    }

    // Generate random loot box
    static generateLootBox() {
        const boxTypes = Object.keys(TREASURE_CHESTS);
        const randomType = boxTypes[Math.floor(Math.random() * boxTypes.length)];
        const boxData = TREASURE_CHESTS[randomType];

        return {
            itemId: `lootbox_${Date.now()}_${Math.random()}`,
            name: boxData.name,
            type: 'loot_box',
            rarity: boxData.rarity,
            baseValue: 500,
            currentValue: 500,
            weight: 2,
            quantity: 1,
            huntDate: new Date(),
            description: 'Mysterious container found during expedition',
            contents: boxData.contents
        };
    }

    // Open loot box
    static openLootBox(lootBox) {
        const rewards = [];
        const contents = lootBox.contents;

        Object.entries(contents).forEach(([rewardType, rewardData]) => {
            if (Math.random() * 100 < rewardData.chance) {
                let amount = rewardData.value;
                
                if (rewardData.min && rewardData.max) {
                    amount = Math.floor(Math.random() * (rewardData.max - rewardData.min + 1)) + rewardData.min;
                }

                rewards.push({
                    type: rewardType,
                    amount: amount,
                    description: `${rewardType.replace('_', ' ')} from ${lootBox.name}`
                });
            }
        });

        return rewards;
    }

    // Calculate total storage capacity
    static calculateStorageCapacity(profile) {
        return profile.troves.reduce((total, trove) => total + trove.capacity, 0);
    }

    // Calculate total inventory weight
    static calculateInventoryWeight(profile) {
        return profile.inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
    }

    // Sell hunting items
    static async sellHuntingItems(profile, itemIds) {
        let totalValue = 0;
        const soldItems = [];

        itemIds.forEach(itemId => {
            const itemIndex = profile.inventory.findIndex(item => item.itemId === itemId);
            if (itemIndex !== -1) {
                const item = profile.inventory[itemIndex];
                
                let sellValue = item.currentValue;
                const trove = profile.troves.find(w => item.location === w.troveId);
                if (trove) {
                    sellValue = Math.floor(sellValue * trove.bonusMultiplier);
                }

                totalValue += sellValue * item.quantity;
                soldItems.push({
                    name: item.name,
                    value: sellValue,
                    quantity: item.quantity,
                    rarity: item.rarity
                });

                profile.inventory.splice(itemIndex, 1);
            }
        });

        if (totalValue > 0) {
            profile.souls += totalValue;
            
            profile.transactions.push({
                type: 'income',
                amount: totalValue,
                description: `Sold hunting loot (${soldItems.length} items)`,
                category: 'hunting'
            });

            profile.huntingStats.totalEarnings += totalValue;
        }

        return { totalValue, soldItems };
    }

    // Heal injured allies
    static async healAllies(profile, allyIds) {
        let totalCost = 0;
        const healedAllies = [];

        allyIds.forEach(allyId => {
            const ally = profile.allies.find(c => c.allyId === allyId);
            if (ally && ally.injured) {
                totalCost += ally.healingCost;
                ally.health = ally.maxHealth;
                ally.injured = false;
                ally.injuryTime = null;
                
                healedAllies.push({
                    name: ally.name,
                    cost: ally.healingCost
                });
                
                ally.healingCost = 0;
            }
        });

        if (totalCost > 0) {
            if (profile.souls < totalCost) {
                throw new Error(`Not enough souls to heal allies! Need ${totalCost.toLocaleString()} souls`);
            }

            profile.souls -= totalCost;
            
            profile.transactions.push({
                type: 'expense',
                amount: totalCost,
                description: 'Healed injured allies',
                category: 'hunting'
            });
        }

        return { totalCost, healedAllies };
    }

    // Upgrade weapon
    static async upgradeWeapon(profile, weaponId) {
        const weapon = profile.huntingWeapons.find(w => w.weaponId === weaponId);
        if (!weapon) {
            throw new Error('Weapon not found!');
        }

        if (weapon.upgradeLevel >= 10) {
            throw new Error('Weapon is already at maximum upgrade level!');
        }

        const upgradeCost = Math.floor(weapon.price * 0.3 * (weapon.upgradeLevel + 1));
        
        if (profile.souls < upgradeCost) {
            throw new Error(`Not enough souls! Upgrade costs ${upgradeCost.toLocaleString()} souls`);
        }

        // Store old stats
        const oldDamage = weapon.damage;
        const oldAccuracy = weapon.accuracy;
        const oldCritChance = weapon.criticalChance;

        // Apply upgrades
        profile.souls -= upgradeCost;
        weapon.upgradeLevel += 1;
        weapon.damage = Math.floor(weapon.damage * 1.1);
        weapon.accuracy = Math.min(100, weapon.accuracy + 2);
        weapon.criticalChance = Math.min(50, weapon.criticalChance + 1);
        
        profile.transactions.push({
            type: 'expense',
            amount: upgradeCost,
            description: `Upgraded ${weapon.name} to level ${weapon.upgradeLevel}`,
            category: 'hunting'
        });

        return {
            upgradeCost,
            newLevel: weapon.upgradeLevel,
            improvements: {
                damage: weapon.damage - oldDamage,
                accuracy: weapon.accuracy - oldAccuracy,
                criticalChance: weapon.criticalChance - oldCritChance
            },
            newStats: {
                damage: weapon.damage,
                accuracy: weapon.accuracy,
                criticalChance: weapon.criticalChance
            }
        };
    }

    // Upgrade conveyance
    static async upgradeConveyance(profile, conveyanceId) {
        const conveyance = profile.conveyances.find(v => v.conveyanceId === conveyanceId);
        if (!conveyance) {
            throw new Error('Conveyance not found!');
        }

        if (conveyance.tier >= 5) {
            throw new Error('Conveyance is already at maximum tier!');
        }

        const upgradeCost = Math.floor(conveyance.price * 0.4 * conveyance.tier);
        
        if (profile.souls < upgradeCost) {
            throw new Error(`Not enough souls! Upgrade costs ${upgradeCost.toLocaleString()} souls`);
        }

        const oldCapacity = conveyance.capacity;
        const oldFuelCapacity = conveyance.fuelCapacity;
        const oldDungeonDepth = conveyance.dungeonDepth;

        profile.souls -= upgradeCost;
        conveyance.tier += 1;
        conveyance.capacity = Math.floor(conveyance.capacity * 1.2);
        conveyance.fuelCapacity = Math.floor(conveyance.fuelCapacity * 1.15);
        conveyance.dungeonDepth = Math.min(10, conveyance.dungeonDepth + 1);
        conveyance.maxDurability = Math.min(120, conveyance.maxDurability + 10);
        conveyance.durability = conveyance.maxDurability;

        profile.transactions.push({
            type: 'expense',
            amount: upgradeCost,
            description: `Upgraded ${conveyance.name} to tier ${conveyance.tier}`,
            category: 'hunting'
        });

        return {
            upgradeCost,
            newTier: conveyance.tier,
            improvements: {
                capacity: conveyance.capacity - oldCapacity,
                fuelCapacity: conveyance.fuelCapacity - oldFuelCapacity,
                dungeonDepth: conveyance.dungeonDepth - oldDungeonDepth
            }
        };
    }

    // Refuel conveyance
    static async refuelConveyance(profile, conveyanceId, fuelType, quantity) {
        const conveyance = profile.conveyances.find(v => v.conveyanceId === conveyanceId);
        if (!conveyance) {
            throw new Error('Conveyance not found!');
        }

        const fuel = ESSENCE_TYPES[fuelType];
        if (!fuel) {
            throw new Error('Invalid fuel type!');
        }

        const totalCost = fuel.price * quantity;
        if (profile.souls < totalCost) {
            throw new Error(`Not enough souls! Need ${totalCost.toLocaleString()} souls`);
        }

        const fuelToAdd = fuel.fuelValue * quantity;
        const newFuelLevel = Math.min(conveyance.fuelCapacity, conveyance.currentFuel + fuelToAdd);
        const actualFuelAdded = newFuelLevel - conveyance.currentFuel;

        conveyance.currentFuel = newFuelLevel;
        profile.souls -= totalCost;

        profile.transactions.push({
            type: 'expense',
            amount: totalCost,
            description: `Refueled ${conveyance.name} with ${quantity}x ${fuel.name}`,
            category: 'hunting'
        });

        return {
            fuelAdded: actualFuelAdded,
            newFuelLevel: newFuelLevel,
            cost: totalCost
        };
    }

    // Reload weapon
    static async reloadWeapon(profile, weaponId, ammoType, quantity) {
        const weapon = profile.huntingWeapons.find(w => w.weaponId === weaponId);
        if (!weapon) {
            throw new Error('Weapon not found!');
        }

        const ammo = CHARGE_TYPES[ammoType];
        if (!ammo) {
            throw new Error('Invalid ammo type!');
        }

        if (!ammo.compatibleWeapons.includes(weapon.type)) {
            throw new Error(`${ammo.name} is not compatible with ${weapon.name}!`);
        }

        const totalCost = ammo.price * quantity;
        if (profile.souls < totalCost) {
            throw new Error(`Not enough souls! Need ${totalCost.toLocaleString()} souls`);
        }

        const ammoToAdd = ammo.ammoValue * quantity;
        const newAmmoLevel = Math.min(weapon.ammoCapacity, weapon.currentAmmo + ammoToAdd);
        const actualAmmoAdded = newAmmoLevel - weapon.currentAmmo;

        weapon.currentAmmo = newAmmoLevel;
        profile.souls -= totalCost;

        profile.transactions.push({
            type: 'expense',
            amount: totalCost,
            description: `Reloaded ${weapon.name} with ${quantity}x ${ammo.name}`,
            category: 'hunting'
        });

        return {
            ammoAdded: actualAmmoAdded,
            newAmmoLevel: newAmmoLevel,
            cost: totalCost
        };
    }
}

module.exports = { HuntingManager };
