const axios = require('axios');
const Track = require('../models/track/schema');

class TrackHandler {
    constructor(client) {
        this.client = client;
        this.intervals = new Map(); // guildId -> intervalId
        this.PING_INTERVAL = 10000; // 10 seconds
        this.TIMEOUT = 5000; // 5 second timeout
    }

    async initialize() {
        console.log('[TRACK] Initializing server tracking...');

        // Load all enabled tracking configurations
        const enabledTracks = await Track.find({ enabled: true });

        for (const track of enabledTracks) {
            this.startTracking(track.guildId);
        }

        console.log(`[TRACK] Initialized tracking for ${enabledTracks.length} guilds`);
    }

    startTracking(guildId) {
        if (this.intervals.has(guildId)) {
            console.log(`[TRACK] Tracking already active for guild ${guildId}`);
            return;
        }

        const intervalId = setInterval(async () => {
            await this.pingServer(guildId);
        }, this.PING_INTERVAL);

        this.intervals.set(guildId, intervalId);
        console.log(`[TRACK] Started tracking for guild ${guildId}`);
    }

    stopTracking(guildId) {
        const intervalId = this.intervals.get(guildId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(guildId);
            console.log(`[TRACK] Stopped tracking for guild ${guildId}`);
        }
    }

    async pingServer(guildId) {
        const trackConfigs = await Track.find({ guildId, enabled: true });

        if (!trackConfigs || trackConfigs.length === 0) {
            this.stopTracking(guildId);
            return;
        }

        for (const trackConfig of trackConfigs) {
            await this.pingTracker(trackConfig);
        }
    }

    async pingTracker(trackConfig) {

        let allSuccessful = true;
        const failedUrls = [];

        for (const url of trackConfig.serverUrls) {
            try {
                const response = await axios.get(url, {
                    timeout: this.TIMEOUT,
                    headers: {
                        'User-Agent': 'Discord-Bot-Monitor/1.0'
                    }
                });

                console.log(`[TRACK] ✅ Ping successful for ${url}`);

            } catch (error) {
                console.log(`[TRACK] ❌ Ping failed for ${url}: ${error.message}`);
                allSuccessful = false;
                failedUrls.push(url);
            }
        }

        if (allSuccessful) {
            // All pings successful
            await Track.findOneAndUpdate(
                { guildId: trackConfig.guildId, name: trackConfig.name },
                {
                    lastPing: new Date(),
                    failureCount: 0 // Reset failure count on success
                }
            );
        } else {
            // Some pings failed
            await Track.findOneAndUpdate(
                { guildId: trackConfig.guildId, name: trackConfig.name },
                {
                    lastFailure: new Date(),
                    $inc: { failureCount: 1 }
                }
            );

            // Send notifications for failed URLs
            for (const failedUrl of failedUrls) {
                await this.sendFailureNotification(trackConfig, failedUrl);
            }
        }
    }

    async sendFailureNotification(trackConfig, failedUrl) {
        try {
            const guild = this.client.guilds.cache.get(trackConfig.guildId);
            if (!guild) {
                console.log(`[TRACK] Guild ${trackConfig.guildId} not found`);
                return;
            }

            const channel = guild.channels.cache.get(trackConfig.notificationChannelId);
            if (!channel) {
                console.log(`[TRACK] Notification channel ${trackConfig.notificationChannelId} not found`);
                return;
            }

            const role = guild.roles.cache.get(trackConfig.mentionRoleId);
            const roleMention = role ? `<@&${role.id}>` : '@everyone';

            const embed = {
                color: 0xff4757,
                title: '🚨 Server Down Alert',
                description: `${roleMention} The monitored server is currently unreachable!`,
                fields: [
                    {
                        name: '🌐 Server URL',
                        value: failedUrl,
                        inline: true
                    },
                    {
                        name: '⏱️ Last Successful Ping',
                        value: trackConfig.lastPing ? `<t:${Math.floor(trackConfig.lastPing.getTime() / 1000)}:R>` : 'Never',
                        inline: true
                    },
                    {
                        name: '📊 Failure Count',
                        value: `${trackConfig.failureCount}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Server Monitoring System'
                }
            };

            await channel.send({ embeds: [embed] });
            console.log(`[TRACK] Sent failure notification for ${failedUrl} to ${channel.name} in ${guild.name}`);

        } catch (error) {
            console.error(`[TRACK] Failed to send notification: ${error.message}`);
        }
    }

    // Cleanup method for graceful shutdown
    cleanup() {
        for (const [guildId, intervalId] of this.intervals) {
            clearInterval(intervalId);
            console.log(`[TRACK] Cleaned up tracking for guild ${guildId}`);
        }
        this.intervals.clear();
    }
}

module.exports = TrackHandler;
