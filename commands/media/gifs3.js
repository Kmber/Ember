/* EMBERLYN */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');
const cmdIcons = require('../../UI/icons/commandicons');

const gestures = {
    bleh: { func: gifs.sfw.bleh, requiresTarget: false },
    cheers: { func: gifs.sfw.cheers, requiresTarget: false },
    clap: { func: gifs.sfw.clap, requiresTarget: false },
    dance: { func: gifs.sfw.dance, requiresTarget: false },
    disappear: { func: gifs.sfw.disappear, requiresTarget: false },
    dodge: { func: gifs.sfw.dodge, requiresTarget: false },
    facedesk: { func: gifs.sfw.facedesk, requiresTarget: false },
    facepalm: { func: gifs.sfw.facepalm, requiresTarget: false },
    headbang: { func: gifs.sfw.headbang, requiresTarget: false },
    hide: { func: gifs.sfw.hide, requiresTarget: false },
    money: { func: gifs.sfw.money, requiresTarget: false },
    nom: { func: gifs.sfw.nom, requiresTarget: false },
    peek: { func: gifs.sfw.peek, requiresTarget: false },
    purr: { func: gifs.sfw.purr, requiresTarget: false },
    roll: { func: gifs.sfw.roll, requiresTarget: false },
    run: { func: gifs.sfw.run, requiresTarget: false },
    salute: { func: gifs.sfw.salute, requiresTarget: false },
    shrug: { func: gifs.sfw.shrug, requiresTarget: false },
    sigh: { func: gifs.sfw.sigh, requiresTarget: false },
    sip: { func: gifs.sfw.sip, requiresTarget: false },
    sit: { func: gifs.sfw.sit, requiresTarget: false },
    sleep: { func: gifs.sfw.sleep, requiresTarget: false },
    sleepy: { func: gifs.sfw.sleepy, requiresTarget: false },
    spin: { func: gifs.sfw.spin, requiresTarget: false },
    stare: { func: gifs.sfw.stare, requiresTarget: false }
};

module.exports = {
    name: 'gif-gestures',
    aliases: ['gif-gestures', 'gestures', 'gif3','gest'],
    data: new SlashCommandBuilder()
        .setName('gif-gestures')
        .setDescription('Make anime-style gestures and actions!')
        .addSubcommand(sub =>
            sub
                .setName('bleh')
                .setDescription('Make a bleh face!')
        )
        .addSubcommand(sub =>
            sub
                .setName('cheers')
                .setDescription('Cheers with a drink!')
        )
        .addSubcommand(sub =>
            sub
                .setName('clap')
                .setDescription('Clap your hands!')
        )
        .addSubcommand(sub =>
            sub
                .setName('dance')
                .setDescription('Dance happily!')
        )
        .addSubcommand(sub =>
            sub
                .setName('disappear')
                .setDescription('Disappear from sight!')
        )
        .addSubcommand(sub =>
            sub
                .setName('dodge')
                .setDescription('Dodge an attack!')
        )
        .addSubcommand(sub =>
            sub
                .setName('facedesk')
                .setDescription('Bang your head on the desk!')
        )
        .addSubcommand(sub =>
            sub
                .setName('facepalm')
                .setDescription('Facepalm at something stupid!')
        )
        .addSubcommand(sub =>
            sub
                .setName('headbang')
                .setDescription('Headbang to music!')
        )
        .addSubcommand(sub =>
            sub
                .setName('hide')
                .setDescription('Hide from view!')
        )
        .addSubcommand(sub =>
            sub
                .setName('money')
                .setDescription('Show off your money!')
        )
        .addSubcommand(sub =>
            sub
                .setName('nom')
                .setDescription('Eat something delicious!')
        )
        .addSubcommand(sub =>
            sub
                .setName('peek')
                .setDescription('Peek from hiding!')
        )
        .addSubcommand(sub =>
            sub
                .setName('purr')
                .setDescription('Purr like a cat!')
        )
        .addSubcommand(sub =>
            sub
                .setName('roll')
                .setDescription('Roll around!')
        )
        .addSubcommand(sub =>
            sub
                .setName('run')
                .setDescription('Run away quickly!')
        )
        .addSubcommand(sub =>
            sub
                .setName('salute')
                .setDescription('Give a salute!')
        )
        .addSubcommand(sub =>
            sub
                .setName('shrug')
                .setDescription('Shrug your shoulders!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sigh')
                .setDescription('Let out a sigh!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sip')
                .setDescription('Take a sip of your drink!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sit')
                .setDescription('Sit down!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sleep')
                .setDescription('Fall asleep!')
        )
        .addSubcommand(sub =>
            sub
                .setName('sleepy')
                .setDescription('Show that you are sleepy!')
        )
        .addSubcommand(sub =>
            sub
                .setName('spin')
                .setDescription('Spin around!')
        )
        .addSubcommand(sub =>
            sub
                .setName('stare')
                .setDescription('Stare intensely!')
        ),

    async execute(interactionOrMessage, args, client) {
        const isSlash = interactionOrMessage.isCommand && interactionOrMessage.isCommand();

        let subcommand, sender, replyFunc;

        if (isSlash) {
            await interactionOrMessage.deferReply();
            subcommand = interactionOrMessage.options.getSubcommand();
            sender = interactionOrMessage.user;
            replyFunc = (content) => interactionOrMessage.editReply(content);
        } else {
            const message = interactionOrMessage;
            subcommand = args[0]?.toLowerCase();
            sender = message.author;
            replyFunc = (content) => message.reply(content);
        }

        if (!subcommand || !gestures[subcommand]) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/sanctyr"
                })
                .setDescription(`- Invalid subcommand!\n- Available: ${Object.keys(gestures).join(', ')}\n- Usage: ${isSlash ? '/gif-gestures <subcommand>' : '!gif-gestures <subcommand>'}`)
                .setTimestamp();

            return replyFunc({ embeds: [embed] });
        }

        const action = gestures[subcommand];

        try {
            const gif = await action.func();

            let verbForm;
            if (subcommand === 'sleep') {
                verbForm = 'falls asleep';
            } else if (subcommand === 'run') {
                verbForm = 'runs away';
            } else if (subcommand === 'hide') {
                verbForm = 'hides';
            } else if (subcommand === 'sit') {
                verbForm = 'sits down';
            } else if (subcommand === 'disappear') {
                verbForm = 'disappears';
            } else if (subcommand === 'sigh') {
                verbForm = 'sighs';
            } else if (subcommand === 'stare') {
                verbForm = 'stares intensely';
            } else if (subcommand === 'purr') {
                verbForm = 'purrs';
            } else if (subcommand === 'peek') {
                verbForm = 'peeks';
            } else if (subcommand === 'nom') {
                verbForm = 'noms';
            } else if (subcommand === 'dodge') {
                verbForm = 'dodges';
            } else if (subcommand === 'dance') {
                verbForm = 'dances';
            } else if (subcommand.endsWith('p')) {
                verbForm = `${subcommand}s`;
            } else {
                verbForm = `${subcommand}s`;
            }

            const description = `${sender} ${verbForm}!`;

            const embed = new EmbedBuilder()
                .setColor('#92FF7E')
                .setDescription(description)
                .setImage(gif)
                .setTimestamp();

            await replyFunc({ embeds: [embed] });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('Something went wrong while performing the gesture.')
                .setTimestamp();

            await replyFunc({ embeds: [errorEmbed] });
        }
    }
};

/* EMBERLYN */