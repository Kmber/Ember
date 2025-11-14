/* EMBERLYN */
const { SlashCommandBuilder } = require('discord.js');
const {
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const Track = require('../../models/track/schema');

// Drop old single-field index if it exists to avoid conflicts
Track.collection.dropIndex('guildId_1').catch(err => {
    if (err.code !== 27) { // 27 is index not found
        console.log('Failed to drop old index:', err.message);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Server uptime tracking and monitoring')

        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Configure server tracking')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Unique name for this tracker (e.g., "main-api", "backup-server")')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('urls')
                    .setDescription('Server URLs to ping (comma-separated, e.g., https://app1.com,https://app2.com)')
                    .setRequired(true))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Channel for failure notifications')
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('Role to mention on failures')
                    .setRequired(true)))

        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('View all tracking configurations'))

        .addSubcommand(sub => sub
            .setName('start')
            .setDescription('Start a specific tracker')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Name of the tracker to start')
                    .setRequired(true)))

        .addSubcommand(sub => sub
            .setName('stop')
            .setDescription('Stop a specific tracker')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Name of the tracker to stop')
                    .setRequired(true)))

        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edit an existing tracker')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Name of the tracker to edit')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('urls')
                    .setDescription('New server URLs (comma-separated)')
                    .setRequired(false))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('New notification channel')
                    .setRequired(false))
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('New mention role')
                    .setRequired(false)))

        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Delete a tracker')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Name of the tracker to delete')
                    .setRequired(true)))

        .addSubcommand(sub => sub
            .setName('clean')
            .setDescription('Delete all trackers for this guild')
            .addStringOption(option =>
                option.setName('confirm')
                    .setDescription('Type "CONFIRM" to proceed with deleting all trackers')
                    .setRequired(true))),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup':
                await handleSetup(interaction);
                break;
            case 'view':
                await handleView(interaction);
                break;
            case 'start':
                await handleStart(interaction);
                break;
            case 'stop':
                await handleStop(interaction);
                break;
            case 'edit':
                await handleEdit(interaction);
                break;
            case 'delete':
                await handleDelete(interaction);
                break;
            case 'clean':
                await handleClean(interaction);
                break;
        }
    }
};

async function handleSetup(interaction) {
    const trackerName = interaction.options.getString('name');
    const urlsString = interaction.options.getString('urls');
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');

    // Parse and validate URLs
    const urls = urlsString.split(',').map(url => url.trim()).filter(url => url.length > 0);
    if (urls.length === 0) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Invalid URLs\n\n> Please provide at least one valid URL\n**Example:** `https://app1.com,https://app2.com`')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    const invalidUrls = [];
    for (const url of urls) {
        try {
            new URL(url);
        } catch (error) {
            invalidUrls.push(url);
        }
    }

    if (invalidUrls.length > 0) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ❌ Invalid URLs\n\n> The following URLs are invalid:\n${invalidUrls.map(url => `• ${url}`).join('\n')}\n\n**Example:** \`https://your-app.onrender.com\``)
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // Check if channel is text-based
    if (channel.type !== 0) { // TEXT CHANNEL
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Invalid Channel\n\n> Please select a text channel for notifications')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    // Check permissions
    const botPermissions = channel.permissionsFor(interaction.guild.members.me);
    if (!botPermissions.has('SendMessages') || !botPermissions.has('MentionEveryone')) {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Missing Permissions\n\n> Bot needs Send Messages and Mention Everyone permissions in the notification channel')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        await Track.findOneAndUpdate(
            { guildId: interaction.guild.id, name: trackerName },
            {
                name: trackerName,
                serverUrls: urls,
                notificationChannelId: channel.id,
                mentionRoleId: role.id,
                enabled: false, // Setup doesn't auto-enable
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        const setupContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ✅ Tracking Setup Complete\n\n> Server tracking has been configured\n> Use `/track start` to begin monitoring')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**🌐 Server URLs:** ${urls.length} configured`,
                                urls.map((url, index) => `• ${url}`).join('\n'),
                                `**📢 Notification Channel:** <#${channel.id}>`,
                                `**👥 Mention Role:** <@&${role.id}>`,
                                `**⚡ Status:** Configured (not started)`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s setup`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Setup completed • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [setupContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track setup error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Setup Failed\n\n> An error occurred while saving configuration\n> Please try again')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

async function handleView(interaction) {
    const trackConfigs = await Track.find({ guildId: interaction.guild.id });

    if (!trackConfigs || trackConfigs.length === 0) {
        const noConfigContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ⚠️ No Configurations Found\n\n> No server trackers are configured\n> Use `/track setup` to get started')
            );
        return interaction.editReply({
            components: [noConfigContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    const trackerSummaries = trackConfigs.map(config => {
        const statusEmoji = config.enabled ? '🟢' : '🔴';
        const statusText = config.enabled ? 'Active' : 'Inactive';
        return `**${config.name}** - ${statusEmoji} ${statusText} (${config.serverUrls.length} URLs)`;
    }).join('\n');

    const viewContainer = new ContainerBuilder()
        .setAccentColor(0x00ff88)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 📊 Server Tracking Overview\n\n> ${trackConfigs.length} tracker(s) configured`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(trackerSummaries)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(interaction.guild.iconURL({ dynamic: true, size: 128 }) || interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                        .setDescription(`${interaction.guild.name} tracking overview`)
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`*Overview viewed • ${new Date().toLocaleString()}*`)
        );

    await interaction.editReply({
        components: [viewContainer],
        flags: MessageFlags.IsComponentsV2
    });
}

async function handleStart(interaction) {
    const trackerName = interaction.options.getString('name');
    const trackConfig = await Track.findOne({ guildId: interaction.guild.id, name: trackerName });

    if (!trackConfig) {
        const noConfigContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Tracker Not Found\n\n> No tracker named "${trackerName}" found\n> Use \`/track setup\` to create it or \`/track view\` to see existing trackers`)
            );
        return interaction.editReply({
            components: [noConfigContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    if (trackConfig.enabled) {
        const alreadyActiveContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Already Active\n\n> Tracker "${trackerName}" is already running`)
            );
        return interaction.editReply({
            components: [alreadyActiveContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        await Track.findOneAndUpdate(
            { guildId: interaction.guild.id, name: trackerName },
            { enabled: true }
        );

        const startContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Tracking Started\n\n> Tracker "${trackerName}" is now active\n> Bot will ping every 10 seconds`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**🌐 Monitoring:** ${trackConfig.serverUrls.length} URLs`,
                                `**📢 Notifications:** <#${trackConfig.notificationChannelId}>`,
                                `**👥 Alerts:** <@&${trackConfig.mentionRoleId}>`,
                                `**⏱️ Interval:** Every 10 seconds`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Tracking started')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Tracking activated • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [startContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track start error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Start Failed\n\n> An error occurred while starting tracking\n> Please try again')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

async function handleStop(interaction) {
    const trackerName = interaction.options.getString('name');
    const trackConfig = await Track.findOne({ guildId: interaction.guild.id, name: trackerName });

    if (!trackConfig) {
        const noConfigContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Tracker Not Found\n\n> No tracker named "${trackerName}" found\n> Use \`/track setup\` to create it or \`/track view\` to see existing trackers`)
            );
        return interaction.editReply({
            components: [noConfigContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    if (!trackConfig.enabled) {
        const alreadyInactiveContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Already Stopped\n\n> Tracker "${trackerName}" is already stopped`)
            );
        return interaction.editReply({
            components: [alreadyInactiveContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        await Track.findOneAndUpdate(
            { guildId: interaction.guild.id, name: trackerName },
            { enabled: false }
        );

        const stopContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🛑 Tracking Stopped\n\n> Tracker "${trackerName}" has been deactivated`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**🌐 Servers:** ${trackConfig.serverUrls.length} URLs`,
                                `**⚡ Status:** Stopped`,
                                `**📊 Final Failure Count:** ${trackConfig.failureCount}`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Tracking stopped')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Tracking deactivated • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [stopContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track stop error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Stop Failed\n\n> An error occurred while stopping tracking\n> Please try again')
            );
        return interaction.editReply({
            components: [stopContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

async function handleEdit(interaction) {
    const trackerName = interaction.options.getString('name');
    const newUrlsString = interaction.options.getString('urls');
    const newChannel = interaction.options.getChannel('channel');
    const newRole = interaction.options.getRole('role');

    const trackConfig = await Track.findOne({ guildId: interaction.guild.id, name: trackerName });

    if (!trackConfig) {
        const noConfigContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Tracker Not Found\n\n> No tracker named "${trackerName}" found\n> Use \`/track setup\` to create it or \`/track view\` to see existing trackers`)
            );
        return interaction.editReply({
            components: [noConfigContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    const updateData = { updatedAt: new Date() };

    if (newUrlsString) {
        const urls = newUrlsString.split(',').map(url => url.trim()).filter(url => url.length > 0);
        if (urls.length === 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid URLs\n\n> Please provide at least one valid URL\n**Example:** `https://app1.com,https://app2.com`')
                );
            return interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const invalidUrls = [];
        for (const url of urls) {
            try {
                new URL(url);
            } catch (error) {
                invalidUrls.push(url);
            }
        }

        if (invalidUrls.length > 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid URLs\n\n> The following URLs are invalid:\n${invalidUrls.map(url => `• ${url}`).join('\n')}\n\n**Example:** \`https://your-app.onrender.com\``)
                );
            return interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        updateData.serverUrls = urls;
    }

    if (newChannel) {
        if (newChannel.type !== 0) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Invalid Channel\n\n> Please select a text channel for notifications')
                );
            return interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const botPermissions = newChannel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has('SendMessages') || !botPermissions.has('MentionEveryone')) {
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xff4757)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('# ❌ Missing Permissions\n\n> Bot needs Send Messages and Mention Everyone permissions in the notification channel')
                );
            return interaction.editReply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }

        updateData.notificationChannelId = newChannel.id;
    }

    if (newRole) {
        updateData.mentionRoleId = newRole.id;
    }

    try {
        await Track.findOneAndUpdate(
            { guildId: interaction.guild.id, name: trackerName },
            updateData
        );

        const editContainer = new ContainerBuilder()
            .setAccentColor(0x00ff88)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ✅ Tracker Updated\n\n> Tracker "${trackerName}" has been successfully updated`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                newUrlsString ? `**🌐 Server URLs:** ${updateData.serverUrls.length} configured` : `**🌐 Server URLs:** ${trackConfig.serverUrls.length} configured`,
                                newUrlsString ? updateData.serverUrls.map((url, index) => `• ${url}`).join('\n') : trackConfig.serverUrls.map((url, index) => `• ${url}`).join('\n'),
                                newChannel ? `**📢 Notification Channel:** <#${newChannel.id}>` : `**📢 Notification Channel:** <#${trackConfig.notificationChannelId}>`,
                                newRole ? `**👥 Mention Role:** <@&${newRole.id}>` : `**👥 Mention Role:** <@&${trackConfig.mentionRoleId}>`,
                                `**⚡ Status:** ${trackConfig.enabled ? 'Active' : 'Inactive'}`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription(`${interaction.user.username}'s edit`)
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Tracker updated • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [editContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track edit error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Edit Failed\n\n> An error occurred while updating the tracker\n> Please try again')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

async function handleDelete(interaction) {
    const trackerName = interaction.options.getString('name');
    const trackConfig = await Track.findOne({ guildId: interaction.guild.id, name: trackerName });

    if (!trackConfig) {
        const noConfigContainer = new ContainerBuilder()
            .setAccentColor(0xffcc00)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚠️ Tracker Not Found\n\n> No tracker named "${trackerName}" found\n> Use \`/track view\` to see existing trackers`)
            );
        return interaction.editReply({
            components: [noConfigContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        await Track.findOneAndDelete({ guildId: interaction.guild.id, name: trackerName });

        const deleteContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🗑️ Tracker Deleted\n\n> Tracker "${trackerName}" has been permanently deleted`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**🌐 Server URLs:** ${trackConfig.serverUrls.length} URLs were monitored`,
                                `**📢 Notification Channel:** <#${trackConfig.notificationChannelId}>`,
                                `**👥 Mention Role:** <@&${trackConfig.mentionRoleId}>`,
                                `**⚡ Final Status:** ${trackConfig.enabled ? 'Active' : 'Inactive'}`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('Tracker deleted')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*Tracker deleted • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [deleteContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track delete error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Delete Failed\n\n> An error occurred while deleting the tracker\n> Please try again')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}

async function handleClean(interaction) {
    const confirmText = interaction.options.getString('confirm');

    if (confirmText !== 'CONFIRM') {
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Confirmation Required\n\n> Please type "CONFIRM" to proceed with deleting all trackers')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }

    try {
        const deleteResult = await Track.deleteMany({ guildId: interaction.guild.id });

        const cleanContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🗑️ All Trackers Cleaned\n\n> ${deleteResult.deletedCount} tracker(s) have been permanently deleted from this guild`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent([
                                `**⚠️ Warning:** This action cannot be undone`,
                                `**📊 Trackers Removed:** ${deleteResult.deletedCount}`,
                                `**🏠 Guild:** ${interaction.guild.name}`
                            ].join('\n'))
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 128 }))
                            .setDescription('All trackers cleaned')
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`*All trackers cleaned • ${new Date().toLocaleString()}*`)
            );

        await interaction.editReply({
            components: [cleanContainer],
            flags: MessageFlags.IsComponentsV2
        });

    } catch (error) {
        console.error('Track clean error:', error);
        const errorContainer = new ContainerBuilder()
            .setAccentColor(0xff4757)
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('# ❌ Clean Failed\n\n> An error occurred while cleaning trackers\n> Please try again')
            );
        return interaction.editReply({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2
        });
    }
}
/* EMBERLYN */
