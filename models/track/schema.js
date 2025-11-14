const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  guildId: { type: String, required: true },
  name: { type: String, required: true }, // Unique name for each tracker
  serverUrls: [{ type: String, required: true }],
  notificationChannelId: { type: String, required: true },
  mentionRoleId: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  lastPing: { type: Date, default: null },
  lastFailure: { type: Date, default: null },
  failureCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique tracker names per guild
TrackSchema.index({ guildId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Track', TrackSchema);
