const mongoose = require('mongoose');

const accessCodeSchema = new mongoose.Schema(
  {
    codeHash: { type: String, required: true, unique: true, index: true },
    codeLast4: { type: String, default: '', index: true },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShowConfig',
      required: true,
      index: true,
    },
    validUntil: { type: Date, default: null, index: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('AccessCode', accessCodeSchema);
