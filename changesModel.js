const mongoose = require('mongoose');

const modelChangeSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  modelId: { type: mongoose.Types.ObjectId, required: true },
  source: { type: String, required: true },
  field: { type: String, required: true },
  oldValue: { type: String }, // Added field to store the old value
  newValue: { type: String }, // Added field to store the new value
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ModelChange', modelChangeSchema);
