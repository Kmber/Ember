const FOLLOWER_TEMPLATES = {
    cultist: {
        relationships: ['cultist'],
        professions: ['Scribe', 'Acolyte', 'Zealot', 'Neophyte', 'Initiate'],
        salaryRange: [100, 300]
    },
    acolyte: {
        relationships: ['acolyte'],
        professions: ['Ritualist', 'Summoner', 'Diviner'],
        salaryRange: [200, 500]
    },
    zealot: {
        relationships: ['zealot'],
        professions: ['Inquisitor', 'Executioner', 'Crusader'],
        salaryRange: [300, 700]
    },
    neophyte: {
        relationships: ['neophyte'],
        professions: ['Scout', 'Spy', 'Thief', 'Assassin'],
        salaryRange: [150, 400]
    }
};

module.exports = { FOLLOWER_TEMPLATES };