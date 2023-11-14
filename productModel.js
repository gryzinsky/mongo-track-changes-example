const mongoose = require('mongoose');
const { preSaveMiddleware, preUpdateMiddleware } = require('./middleware');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

productSchema.pre('save', preSaveMiddleware);
productSchema.pre('updateOne', preUpdateMiddleware);
productSchema.pre('updateMany', preUpdateMiddleware);

// productSchema.pre('', function (...args) {
//   console.log('here');

//   next();
// }, { document: true, query: false });
// productSchema.pre('updateMany', { document: true, query: false }, preSaveMiddleware);

module.exports = mongoose.model('Product', productSchema);
