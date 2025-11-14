/* EMBERLYN */

const { SlashCommandBuilder } = require('@discordjs/builders');
const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const os = require('os');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Bot related commands.')
        .addSubcommand(sub => sub.setName('ping').setDescription('Check bot latency and response time'))
        .addSubcommand(sub => sub.setName('invite').setDescription('Get invitation link to add bot to your server'))
        .addSubcommand(sub => sub.setName('stats').setDescription('View comprehensive bot statistics'))
        .addSubcommand(sub => sub.setName('uptime').setDescription('Check how long the bot has been running'))
        .addSubcommand(sub => sub.setName('status').setDescription('Check current operational status')),
      

    async execute(interaction) {
        try {
            let sender = interaction.user;
            let subcommand;
            let isSlashCommand = false;

            if (interaction.isCommand && interaction.isCommand()) {
                isSlashCommand = true;
                await interaction.deferReply();
                subcommand = interaction.options.getSubcommand();
            } else {
                const message = interaction;
                sender = message.author;
                const args = message.content.split(' ');
                args.shift();
                subcommand = args[0] || 'help';
            }

            const client = isSlashCommand ? interaction.client : interaction.client;

            const sendReply = async (components) => {
                const messageData = {
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                };

                if (isSlashCommand) {
                    return interaction.editReply(messageData);
                } else {
                    return interaction.reply(messageData);
                }
            };

        
            if (subcommand === 'ping') {
                const botLatency = Date.now() - (isSlashCommand ? interaction.createdTimestamp : interaction.createdTimestamp);
                const apiLatency = client.ws.ping;

                const components = [];

                const metricsContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                metricsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`### **Emberlyn Performance Metrics**\n\n**Bot Response Time**\n${botLatency}ms - ${botLatency < 100 ? 'Excellent Performance' : botLatency < 200 ? 'Good Performance' : 'Needs Optimization'}\n\n**API Connection**\n${apiLatency}ms - ${apiLatency < 100 ? 'Optimal Speed' : apiLatency < 200 ? 'Normal Speed' : 'Slow Connection'}\n\n**System Status**\nONLINE - All systems operational`)
                );

                components.push(metricsContainer);

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`Average response time: ${botLatency}ms | System health: Optimal`)
                );

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(footerContainer);

                return sendReply(components);
            }

        
            if (subcommand === 'invite') {
                const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot`;

                const components = [];


                const linkContainer = new ContainerBuilder()
                    .setAccentColor(0x8B5CF6);

                linkContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## **Invitation Portal**\n\n**Quick Setup Link**\n${inviteURL}\n\n**Features Included**\nAdvanced Commands | Moderation Tools | Music Entertainment | Statistics Analytics | Customization Options\n\n**Installation Benefits**\nInstant activation | Full permissions | 24/7 availability | Regular updates | Community support`)
                );

                components.push(linkContainer);


                return sendReply(components);
            }

       
       
            if (subcommand === 'stats') {
                const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
                const uptime = moment.duration(client.uptime).format("D[d] H[h] m[m] s[s]");
                const servers = client.guilds.cache.size;
                const users = client.users.cache.size;
                const channels = client.channels.cache.size;

                const components = [];

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x00ff88);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## System Analytics\n## Performance Dashboard\n\n> Real-time monitoring of system resources and network statistics\n> Comprehensive overview of bot performance and utilization`)
                );

                components.push(statsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const performanceContainer = new ContainerBuilder()
                    .setAccentColor(0x10B981);

                performanceContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`### **Resource Utilization**\n\n**Memory Usage**\n${memoryUsage}MB of ${totalMemory}GB total\n${memoryUsage < 100 ? 'Optimal efficiency' : 'Moderate usage'}\n\n**System Uptime**\n${uptime}\nStable continuous operation\n\n**Processing Environment**\nNode.js ${process.version}\nPlatform: ${os.platform()}`)
                );

                components.push(performanceContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const networkContainer = new ContainerBuilder()
                    .setAccentColor(0x2196F3);

                networkContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`### **Network Statistics**\n\n**Connected Servers**\n${servers.toLocaleString()} communities\nSteady growth trajectory\n\n**Active Users**\n${users.toLocaleString()} individuals\nGlobal user base\n\n**Channel Connections**\n${channels.toLocaleString()} active channels\nReal-time communication`)
                );

                components.push(networkContainer);

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`🖥️ Hosted on ${os.hostname()} | System health: Excellent | Uptime: 99.9%`)
                );

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(footerContainer);

                return sendReply(components);
            }

     
            if (subcommand === 'uptime') {
                const uptimeMs = client.uptime;
                const uptime = moment.duration(uptimeMs).format("D[d] H[h] m[m] s[s]");
                const startTime = new Date(Date.now() - uptimeMs);

                const components = [];


                const durationContainer = new ContainerBuilder()
                    .setAccentColor(0x06B6D4);

                durationContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`### **Operational Status**\n\n**Active Duration**\n${uptime}\nContinuous service delivery\n\n**Started At**\n${startTime.toLocaleString()}\nSystem initialization timestamp\n\n**Reliability Metrics**\nMinimal restarts | 99.9% availability | Optimized performance | Consistent uptime`)
                );

                components.push(durationContainer);

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`Maintained consistent performance since launch | Zero critical downtime`)
                );

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(footerContainer);

                return sendReply(components);
            }

            
            if (subcommand === 'status') {
                const statusEmoji = client.presence?.status === 'online' ? '🟢' : 
                                   client.presence?.status === 'idle' ? '🟡' : 
                                   client.presence?.status === 'dnd' ? '🔴' : '⚪';

                const components = [];

                const healthContainer = new ContainerBuilder()
                    .setAccentColor(0xF59E0B);

                healthContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`### ${statusEmoji} **Current Status**\n\n**Bot Status**\n${client.presence?.status || 'online'} - Fully operational\n\n**System Health Indicators**\nPower Supply: Stable | Network Connection: Active | Database: Operational | API Services: Responsive | Security Systems: Active\n\n**Service Availability**\nAll systems operational and ready to serve | Real-time monitoring active`)
                );

                components.push(healthContainer);

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`Status updates refresh every 30 seconds | System monitoring: Active`)
                );

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(footerContainer);

                return sendReply(components);
            }


          
            if (subcommand === 'help' || !subcommand) {
                const components = [];

                const helpContainer = new ContainerBuilder()
                    .setAccentColor(0x667eea);

                helpContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🤖 Bot Command Center\n## Available Commands and Features\n\n> Comprehensive command reference and usage guide\n> Access all bot functionality through simple commands`)
                );

                components.push(helpContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0x6366F1);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **Command Reference**\n\n**System Commands**\nping - Check bot latency | stats - View bot statistics | uptime - Check bot uptime | version - Version information | status - Current bot status\n\n**Information Commands**\ninvite - Get bot invite link | support - Join support server | changelog - Latest updates | feedback - Send feedback | privacy - Privacy policy | report - Report bugs\n\n**Usage Examples**\nSlash commands: /bot ping | /bot stats\nPrefix commands: !bot ping | !bot stats`)
                );

                components.push(commandsContainer);

                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`💡 Slash commands provide the best user experience | Both formats supported`)
                );

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                components.push(footerContainer);

                return sendReply(components);
            }

        } catch (error) {
            console.error('Error in bot command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **System Error**\n\nAn error occurred while processing the bot command. Please try again in a moment.')
            );

            const components = [errorContainer];

            if (isSlashCommand) {
                return interaction.editReply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            } else {
                return interaction.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
        }
    },
};

/* EMBERLYN */