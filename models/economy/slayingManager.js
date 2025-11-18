const { EconomyManager } = require('./economy');
const { 
    SLAYING_MONSTERS, 
    SLAYING_MOUNTS, 
    SLAYING_WEAPONS, 
    SLAYING_ALLIES, 
    SLAYING_VAULTS,
    CHESTS,
    POTION_TYPES,
    WEAPON_OILS,
    ENCHANTMENT_SUPPLIES
} = require('./constants/slayingData');

class SlayingManager {
    // Generate random monster based on haunted lands tier and mount capability
    static generateRandomMonster(hauntedLandsTier, slayingSkill = 0) {
        const availableMonsters = Object.entries(SLAYING_MONSTERS).filter(([key, monster]) => 
            monster.requiredHauntedLandsTier <= hauntedLandsTier
        );

        if (availableMonsters.length === 0) {
            return SLAYING_MONSTERS.goblin;
        }

        // Higher skill increases chance of finding rare monsters
        const skillBonus = slayingSkill * 0.01;
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

    // Calculate stamina consumption
    static calculateStaminaConsumption(mount, monster, hauntedLandsTier) {
        let baseStaminaCost = monster.staminaConsumption || 10;
        
        const mountEfficiency = {
            'horse': 1.2,
            'griffin': 1.0,
            'wyvern': 1.5,
            'pegasus': 2.0,
            'dragon': 2.5
        };
        
        const tierMultiplier = 1 + (hauntedLandsTier * 0.3);
        
        const finalStaminaCost = Math.ceil(
            baseStaminaCost * 
            (mountEfficiency[mount.type] || 1.0) * 
            tierMultiplier
        );
        
        return Math.max(5, finalStaminaCost);
    }
    
    // Calculate mana consumption  
    static calculateManaConsumption(weapon, monster, slayResult) {
        const baseManaRange = monster.manaConsumption || { min: 1, max: 3 };
        
        let manaUsed = Math.floor(Math.random() * (baseManaRange.max - baseManaRange.min + 1)) + baseManaRange.min;
        
        const weaponEfficiency = {
            'sword': 1.0,
            'axe': 0.8,
            'mace': 0.6,
            'greatsword': 0.4,
            'staff': 1.2,
            'wand': 1.5
        };
        
        const agilityFactor = 1 + (monster.agility / 200);
        const successFactor = slayResult.success ? 1.0 : 1.8;
        const accuracyFactor = Math.max(0.5, 1.0 - (weapon.accuracy / 200));
        
        manaUsed = Math.ceil(
            manaUsed * 
            (weaponEfficiency[weapon.type] || 1.0) * 
            agilityFactor * 
            successFactor * 
            accuracyFactor
        );
        
        return Math.max(1, Math.min(manaUsed, weapon.currentMana));
    }

    // Execute slaying quest
    static async executeSlay(profile) {
        const results = {
            success: false,
            monster: null,
            damageDealt: 0,
            damageTaken: 0,
            loot: [],
            discardedLoot: [],
            allyInjuries: [],
            experience: 0,
            skillGain: 0,
            costs: {
                stamina: 0,
                mana: 0,
                healing: 0,
                repairs: 0
            },
            consumption: {
                staminaUsed: 0,
                manaUsed: 0
            }
        };

        const mount = profile.slayingMounts.find(v => v.mountId === profile.activeMount);
        const weapon = profile.slayingWeapons.find(w => w.weaponId === profile.activeWeapon);
        const allies = profile.slayingAllies.filter(c => 
            profile.activeAllies.includes(c.allyId) && c.health > 0
        );

        if (!mount || !weapon) {
            throw new Error('No active mount or weapon equipped!');
        }

        if (mount.currentStamina < 5) {
            throw new Error('Not enough stamina for quest! Your mount needs at least 5 stamina. Purchase stamina potions from the !slayershop to replenish.');
        }
        if (weapon.currentMana < 1) {
            throw new Error('Weapon needs mana! Use !slayershop oils to recharge mana.');
        }

        const monster = this.generateRandomMonster(mount.hauntedLandsTier, profile.slayingStats.slayingSkill);
        results.monster = monster;

        const staminaNeeded = this.calculateStaminaConsumption(mount, monster, mount.hauntedLandsTier);
        if (mount.currentStamina < staminaNeeded) {
            throw new Error(`Not enough stamina for this quest! Your ${mount.name} has ${mount.currentStamina}/${mount.staminaCapacity} stamina, but this quest requires ${staminaNeeded}. Purchase stamina potions from the !slayershop to replenish.`);
        }
        
        mount.currentStamina = Math.max(0, mount.currentStamina - staminaNeeded);
        results.consumption.staminaUsed = staminaNeeded;

        // Combat simulation
        let monsterHealth = monster.health;
        let slayerHealth = profile.slayingProfile.currentHealth;
        let roundCount = 0;
        const maxRounds = 10;
        let totalManaUsed = 0;

        while (monsterHealth > 0 && slayerHealth > 0 && roundCount < maxRounds && weapon.currentMana > 0) {
            roundCount++;

            if (weapon.currentMana > 0) {
                const manaPerShot = Math.min(
                    Math.floor(Math.random() * 2) + 1,
                    weapon.currentMana
                );
                weapon.currentMana -= manaPerShot;
                totalManaUsed += manaPerShot;
                
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
                slayerHealth -= monsterDamage;
                results.damageTaken += monsterDamage;
            }
        }

        results.consumption.manaUsed = totalManaUsed;

        if (monsterHealth <= 0) {
            results.success = true;
            const newLoot = this.generateLoot(monster, profile.slayingStats.slayingSkill);
            const lootWeight = newLoot.reduce((total, item) => total + item.weight, 0);
            const currentWeight = this.calculateInventoryWeight(profile);
            const capacity = this.calculateStorageCapacity(profile);

            if (currentWeight + lootWeight > capacity) {
                results.discardedLoot = newLoot;
            } else {
                results.loot = newLoot;
                profile.slayingInventory.push(...newLoot);
            }

            results.experience = Math.floor(50 + (monster.tier * 25));
            results.skillGain = Math.floor(1 + (monster.tier * 0.5));
            
            const chestChance = 10 + (profile.slayingStats.slayingSkill * 0.2);
            if (Math.random() * 100 < chestChance) {
                const chest = this.generateChest();
                if (this.calculateInventoryWeight(profile) + chest.weight <= this.calculateStorageCapacity(profile)) {
                    results.loot.push(chest);
                    profile.slayingInventory.push(chest);
                    profile.slayingStats.chestsFound = (profile.slayingStats.chestsFound || 0) + 1;
                } else {
                    results.discardedLoot.push(chest);
                }
            }
        } else {
            results.success = false;
            const healingCost = Math.floor(500 + (results.damageTaken * 20));
            results.costs.healing = healingCost;
            results.experience = 10;
        }

        profile.slayingProfile.currentHealth = Math.max(0, slayerHealth);
        
        if (mount.durability < 50) {
            const repairCost = Math.floor((100 - mount.durability) * 50);
            results.costs.repairs = repairCost;
        }

        return results;
    }

    // Generate loot from successful slay
    static generateLoot(monster, slayingSkill = 0) {
        const loot = [];
        const skillBonus = slayingSkill * 0.01;

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
                    slayDate: new Date(),
                    description: `High-quality ${itemType} from ${monster.name}`
                });
            }
        });

        return loot;
    }

    // Generate random chest
    static generateChest() {
        const chestTypes = Object.keys(CHESTS);
        const randomType = chestTypes[Math.floor(Math.random() * chestTypes.length)];
        const chestData = CHESTS[randomType];

        return {
            itemId: `chest_${Date.now()}_${Math.random()}`,
            name: chestData.name,
            type: 'chest',
            rarity: chestData.rarity,
            baseValue: 500,
            currentValue: 500,
            weight: 2,
            quantity: 1,
            slayDate: new Date(),
            description: 'Mysterious container found during quest',
            contents: chestData.contents
        };
    }

    // Open chest
    static openChest(chest) {
        const rewards = [];
        const contents = chest.contents;

        Object.entries(contents).forEach(([rewardType, rewardData]) => {
            if (Math.random() * 100 < rewardData.chance) {
                let amount = rewardData.value;
                
                if (rewardData.min && rewardData.max) {
                    amount = Math.floor(Math.random() * (rewardData.max - rewardData.min + 1)) + rewardData.min;
                }

                rewards.push({
                    type: rewardType,
                    amount: amount,
                    description: `${rewardType.replace('_', ' ')} from ${chest.name}`
                });
            }
        });

        return rewards;
    }

    // Calculate total storage capacity
    static calculateStorageCapacity(profile) {
        const baseCapacity = 5; // Base inventory capacity
        const vaultCapacity = profile.slayingVaults.reduce((total, vault) => total + vault.capacity, 0);
        return baseCapacity + vaultCapacity;
    }

    // Calculate total inventory weight
    static calculateInventoryWeight(profile) {
        return profile.slayingInventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
    }

    // Sell slaying items with vault bonuses
    static async sellSlayingItems(profile, itemIds) {
        let totalValue = 0;
        const soldItems = [];

        itemIds.forEach(itemId => {
            const itemIndex = profile.slayingInventory.findIndex(item => item.itemId === itemId);
            if (itemIndex !== -1) {
                const item = profile.slayingInventory[itemIndex];
                
                let sellValue = item.currentValue;
                const vault = profile.slayingVaults.find(w => item.location === w.vaultId);
                if (vault) {
                    sellValue = Math.floor(sellValue * vault.bonusMultiplier);
                }

                totalValue += sellValue * item.quantity;
                soldItems.push({
                    name: item.name,
                    value: sellValue,
                    quantity: item.quantity,
                    rarity: item.rarity
                });

                profile.slayingInventory.splice(itemIndex, 1);
            }
        });

        if (totalValue > 0) {
            profile.wallet += totalValue;
            
            profile.transactions.push({
                type: 'income',
                amount: totalValue,
                description: `Sold slaying loot (${soldItems.length} items)`,
                category: 'slaying'
            });

            profile.slayingStats.totalEarnings += totalValue;
        }

        return { totalValue, soldItems };
    }

    // Heal injured allies
    static async healAllies(profile, allyIds) {
        let totalCost = 0;
        const healedAllies = [];

        allyIds.forEach(allyId => {
            const ally = profile.slayingAllies.find(c => c.allyId === allyId);
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
            if (profile.wallet < totalCost) {
                throw new Error(`Not enough money to heal allies! Need ${totalCost.toLocaleString()} Embers`);
            }

            profile.wallet -= totalCost;
            
            profile.transactions.push({
                type: 'expense',
                amount: totalCost,
                description: 'Healed injured allies',
                category: 'slaying'
            });
        }

        return { totalCost, healedAllies };
    }

    // Upgrade weapon with detailed results
    static async upgradeWeapon(profile, weaponId) {
        const weapon = profile.slayingWeapons.find(w => w.weaponId === weaponId);
        if (!weapon) {
            throw new Error('Weapon not found!');
        }

        if (weapon.upgradeLevel >= 10) {
            throw new Error('Weapon is already at maximum upgrade level!');
        }

        const upgradeCost = Math.floor(weapon.purchasePrice * 0.3 * (weapon.upgradeLevel + 1));
        
        if (profile.wallet < upgradeCost) {
            throw new Error(`Not enough money! Upgrade costs ${upgradeCost.toLocaleString()} Embers`);
        }

        // Store old stats
        const oldDamage = weapon.damage;
        const oldAccuracy = weapon.accuracy;
        const oldCritChance = weapon.criticalChance;

        // Apply upgrades
        profile.wallet -= upgradeCost;
        weapon.upgradeLevel += 1;
        weapon.damage = Math.floor(weapon.damage * 1.1);
        weapon.accuracy = Math.min(100, weapon.accuracy + 2);
        weapon.criticalChance = Math.min(50, weapon.criticalChance + 1);
        
        profile.transactions.push({
            type: 'expense',
            amount: upgradeCost,
            description: `Upgraded ${weapon.name} to level ${weapon.upgradeLevel}`,
            category: 'slaying'
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

    // Upgrade mount
    static async upgradeMount(profile, mountId) {
        const mount = profile.slayingMounts.find(v => v.mountId === mountId);
        if (!mount) {
            throw new Error('Mount not found!');
        }

        if (mount.tier >= 5) {
            throw new Error('Mount is already at maximum tier!');
        }

        const upgradeCost = Math.floor(mount.purchasePrice * 0.4 * mount.tier);
        
        if (profile.wallet < upgradeCost) {
            throw new Error(`Not enough money! Upgrade costs ${upgradeCost.toLocaleString()} Embers`);
        }

        const oldCapacity = mount.capacity;
        const oldStaminaCapacity = mount.staminaCapacity;
        const oldHauntedLandsTier = mount.hauntedLandsTier;

        profile.wallet -= upgradeCost;
        mount.tier += 1;
        mount.capacity = Math.floor(mount.capacity * 1.2);
        mount.staminaCapacity = Math.floor(mount.staminaCapacity * 1.15);
        mount.hauntedLandsTier = Math.min(10, mount.hauntedLandsTier + 1);
        mount.maxDurability = Math.min(120, mount.maxDurability + 10);
        mount.durability = mount.maxDurability;

        profile.transactions.push({
            type: 'expense',
            amount: upgradeCost,
            description: `Upgraded ${mount.name} to tier ${mount.tier}`,
            category: 'slaying'
        });

        return {
            upgradeCost,
            newTier: mount.tier,
            improvements: {
                capacity: mount.capacity - oldCapacity,
                staminaCapacity: mount.staminaCapacity - oldStaminaCapacity,
                hauntedLandsTier: mount.hauntedLandsTier - oldHauntedLandsTier
            }
        };
    }

    // Replenish mount stamina
    static async replenishStamina(profile, mountId, potionType, quantity) {
        const mount = profile.slayingMounts.find(v => v.mountId === mountId);
        if (!mount) {
            throw new Error('Mount not found!');
        }

        const potion = POTION_TYPES[potionType];
        if (!potion) {
            throw new Error('Invalid potion type!');
        }

        const totalCost = potion.price * quantity;
        if (profile.wallet < totalCost) {
            throw new Error(`Not enough money! Need ${totalCost.toLocaleString()} Embers`);
        }

        const staminaToAdd = potion.staminaValue * quantity;
        const newStaminaLevel = Math.min(mount.staminaCapacity, mount.currentStamina + staminaToAdd);
        const actualStaminaAdded = newStaminaLevel - mount.currentStamina;

        mount.currentStamina = newStaminaLevel;
        profile.wallet -= totalCost;

        profile.transactions.push({
            type: 'expense',
            amount: totalCost,
            description: `Replenished ${mount.name} with ${quantity}x ${potion.name}`,
            category: 'slaying'
        });

        return {
            staminaAdded: actualStaminaAdded,
            newStaminaLevel: newStaminaLevel,
            cost: totalCost
        };
    }

    // Recharge weapon mana
    static async rechargeMana(profile, weaponId, oilType, quantity) {
        const weapon = profile.slayingWeapons.find(w => w.weaponId === weaponId);
        if (!weapon) {
            throw new Error('Weapon not found!');
        }

        const oil = WEAPON_OILS[oilType];
        if (!oil) {
            throw new Error('Invalid oil type!');
        }

        if (!oil.compatibleWeapons.includes(weapon.type)) {
            throw new Error(`${oil.name} is not compatible with ${weapon.name}!`);
        }

        const totalCost = oil.price * quantity;
        if (profile.wallet < totalCost) {
            throw new Error(`Not enough money! Need ${totalCost.toLocaleString()} Embers`);
        }

        const manaToAdd = oil.manaValue * quantity;
        const newManaLevel = Math.min(weapon.manaCapacity, weapon.currentMana + manaToAdd);
        const actualManaAdded = newManaLevel - weapon.currentMana;

        weapon.currentMana = newManaLevel;
        profile.wallet -= totalCost;

        profile.transactions.push({
            type: 'expense',
            amount: totalCost,
            description: `Recharged ${weapon.name} with ${quantity}x ${oil.name}`,
            category: 'slaying'
        });

        return {
            manaAdded: actualManaAdded,
            newManaLevel: newManaLevel,
            cost: totalCost
        };
    }
}

module.exports = { SlayingManager };
