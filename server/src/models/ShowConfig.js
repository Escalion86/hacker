const mongoose = require('mongoose');

const showConfigSchema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    version: { type: String, required: true },
    templateId: { type: String, required: true, index: true },
    profile: {
      id: { type: String, required: true },
      displayName: { type: String, default: '' },
    },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

showConfigSchema.index({ templateId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('ShowConfig', showConfigSchema);
