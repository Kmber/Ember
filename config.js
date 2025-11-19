const { ActivityType } = require('discord.js');

module.exports = {
  ownerId: process.env.OWNER_ID,
  status: {
    rotateDefault: [
      { name: 'Netflix', type: ActivityType.Watching },
      { name: 'GTA VI', type: ActivityType.Playing },
      { name: 'on YouTube', type: ActivityType.Streaming, url: 'https://www.twitch.tv/sanctyr' },
      { name: 'Spotify', type: ActivityType.Custom },
    ],
    songStatus: true
  },
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
}
