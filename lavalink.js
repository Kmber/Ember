
module.exports = {
    enabled: true,
    lavalink: {
      name: process.env.LAVALINK_NAME,
      password: process.env.LAVALINK_PASSWORD,
      host: process.env.LAVALINK_HOST,
      port: process.env.LAVALINK_PORT,
      secure: process.env.LAVALINK_SECURE === 'true'
    }
};
