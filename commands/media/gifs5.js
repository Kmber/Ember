/* EMBERLYN */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { gifs } = require('mediacord');
const cmdIcons = require('../../UI/icons/commandicons');

const special = {
    cute: { func: gifs.sfw.cute, requiresTarget: false },
    destroy: { func: gifs.sfw.destroy, requiresTarget: true },
    die: { func: gifs.sfw.die, requiresTarget: false },
    eevee: { func: gifs.sfw.eevee, requiresTarget: false },
    fbi: { func: gifs.sfw.fbi, requiresTarget: false },
    kill: { func: gifs.sfw.kill, requiresTarget: true },
    neko: { func: gifs.sfw.neko, requiresTarget: false },
    party: { func: gifs.sfw.party, requiresTarget: false },
    puke: { func: gifs.sfw.puke, requiresTarget: false },
    pusheen: { func: gifs.sfw.pusheen, requiresTarget: false },
    random: { func: gifs.sfw.random, requiresTarget: false },
    stomp: { func: gifs.sfw.stomp, requiresTarget: false },
    tail: { func: gifs.sfw.tail, requiresTarget: false },
    trap: { func: gifs.sfw.trap, requiresTarget: false },
    uwu: { func: gifs.sfw.uwu, requiresTarget: false },
    wasted: { func: gifs.sfw.wasted, requiresTarget: true },
    wiggle: { func: gifs.sfw.wiggle, requiresTarget: false },
    yay: { func: gifs.sfw.yay, requiresTarget: false },
    yeet: { func: gifs.sfw.yeet, requiresTarget: true },
    yes: { func: gifs.sfw.yes, requiresTarget: false }
};

module.exports = {
    name: 'gif-special',
    aliases: ['gif-special', 'special', 'gif5','emb'],
    data: new SlashCommandBuilder()
        .setName('gif-special')
        .setDescription('Special anime gifs for unique situations!')
        .addSubcommand(sub =>
            sub
                .setName('cute')
                .setDescription('Show something cute!')
        )
        .addSubcommand(sub =>
            sub
                .setName('destroy')
                .setDescription('Destroy something or someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to destroy')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('die')
                .setDescription('Dramatically die!')
        )
        .addSubcommand(sub =>
            sub
                .setName('eevee')
                .setDescription('Show an Eevee gif!')
        )
        .addSubcommand(sub =>
            sub
                .setName('fbi')
                .setDescription('FBI open up!')
        )
        .addSubcommand(sub =>
            sub
                .setName('kill')
                .setDescription('Kill someone (in anime)!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to kill')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('neko')
                .setDescription('Show a neko (cat girl) gif!')
        )
        .addSubcommand(sub =>
            sub
                .setName('party')
                .setDescription('Start partying!')
        )
        .addSubcommand(sub =>
            sub
                .setName('puke')
                .setDescription('Puke reaction!')
        )
        .addSubcommand(sub =>
            sub
                .setName('pusheen')
                .setDescription('Show a Pusheen gif!')
        )
        .addSubcommand(sub =>
            sub
                .setName('random')
                .setDescription('Show a random anime gif!')
        )
        .addSubcommand(sub =>
            sub
                .setName('stomp')
                .setDescription('Stomp angrily!')
        )
        .addSubcommand(sub =>
            sub
                .setName('tail')
                .setDescription('Wag your tail!')
        )
        .addSubcommand(sub =>
            sub
                .setName('trap')
                .setDescription('It\'s a trap!')
        )
        .addSubcommand(sub =>
            sub
                .setName('uwu')
                .setDescription('UwU face!')
        )
        .addSubcommand(sub =>
            sub
                .setName('wasted')
                .setDescription('Show someone as wasted!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user who is wasted')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('wiggle')
                .setDescription('Wiggle around!')
        )
        .addSubcommand(sub =>
            sub
                .setName('yay')
                .setDescription('Express excitement!')
        )
        .addSubcommand(sub =>
            sub
                .setName('yeet')
                .setDescription('Yeet someone!')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to yeet')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('yes')
                .setDescription('Say yes!')
        ),

    async execute(interactionOrMessage, args, client) {
        const isSlash = interactionOrMessage.isCommand && interactionOrMessage.isCommand();

        let subcommand, sender, target, replyFunc;

        if (isSlash) {
            await interactionOrMessage.deferReply();
            subcommand = interactionOrMessage.options.getSubcommand();
            sender = interactionOrMessage.user;
            target = interactionOrMessage.options.getUser('user');
            replyFunc = (content) => interactionOrMessage.editReply(content);
        } else {
            const message = interactionOrMessage;
            subcommand = args[0]?.toLowerCase();
            sender = message.author;
            // Parse target from mention or user ID
            const targetMention = args[1];
            if (targetMention) {
                target = message.mentions.users.first() ||
                         message.guild.members.cache.get(targetMention.replace(/[<@!>]/g, ''))?.user ||
                         await client.users.fetch(targetMention.replace(/[<@!>]/g, '')).catch(() => null);
            }
            replyFunc = (content) => message.reply(content);
        }

        if (!subcommand || !special[subcommand]) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/sanctyr"
                })
                .setDescription(`- Invalid subcommand!\n- Available: ${Object.keys(special).join(', ')}\n- Usage: ${isSlash ? '/gif-special <subcommand> [user]' : '!gif-special <subcommand> [@user]'}`)
                .setTimestamp();

            return replyFunc({ embeds: [embed] });
        }

        const action = special[subcommand];

        if (action.requiresTarget && !target) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/sanctyr"
                })
                .setDescription(`- This subcommand requires a target user!\n- Usage: ${isSlash ? '/gif-special ' + subcommand + ' <user>' : '!gif-special ' + subcommand + ' <@user>'}`)
                .setTimestamp();

            return replyFunc({ embeds: [embed] });
        }

        try {
            const gif = await action.func();

            let description;
            if (target) {
                if (subcommand === 'destroy') {
                    description = `${sender} destroys ${target}!`;
                } else if (subcommand === 'kill') {
                    description = `${sender} kills ${target}!`;
                } else if (subcommand === 'wasted') {
                    description = `${target} is wasted!`;
                } else if (subcommand === 'yeet') {
                    description = `${sender} yeets ${target}!`;
                } else {
                    description = `${sender} ${subcommand}s ${target}!`;
                }
            } else {
                if (subcommand === 'die') {
                    description = `${sender} dies dramatically!`;
                } else if (subcommand === 'eevee') {
                    description = `${sender} shows an Eevee!`;
                } else if (subcommand === 'fbi') {
                    description = `${sender} calls the FBI!`;
                } else if (subcommand === 'neko') {
                    description = `${sender} shows a neko!`;
                } else if (subcommand === 'party') {
                    description = `${sender} starts a party!`;
                } else if (subcommand === 'puke') {
                    description = `${sender} pukes!`;
                } else if (subcommand === 'pusheen') {
                    description = `${sender} shows Pusheen!`;
                } else if (subcommand === 'random') {
                    description = `${sender} shows a random gif!`;
                } else if (subcommand === 'tail') {
                    description = `${sender} wags their tail!`;
                } else if (subcommand === 'trap') {
                    description = `${sender} says it's a trap!`;
                } else if (subcommand === 'uwu') {
                    description = `${sender} says UwU!`;
                } else if (subcommand === 'wiggle') {
                    description = `${sender} wiggles!`;
                } else if (subcommand === 'yay') {
                    description = `${sender} says yay!`;
                } else if (subcommand === 'yes') {
                    description = `${sender} says yes!`;
                } else {
                    description = `${sender} ${subcommand}s!`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#D580FF')
                .setDescription(description)
                .setImage(gif)
                .setTimestamp();

            await replyFunc({ embeds: [embed] });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('Something went wrong while showing the special gif.')
                .setTimestamp();

            await replyFunc({ embeds: [errorEmbed] });
        }
    }
};
/* EMBERLYN */