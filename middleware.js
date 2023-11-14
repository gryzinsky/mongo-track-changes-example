const _ = require('lodash');

const ModelChange = require('./changesModel');

async function preSaveMiddleware(next, options) {
  console.log("WITHIN PRE-SAVE MIDDLEWARE");
  
  // Get the document's previous state
  const previousState = await this.constructor.findById(this._id);

  // Identify modified fields
  const modifiedFields = Object.keys(this.toObject()).filter(field => {
    return !_.isEqual(this[field], previousState[field]);
  });

  console.log("MODIFIED FIELDS: ", modifiedFields);

  // Create source records for modified fields
  for (const field of modifiedFields) {
    if (!options.source) continue; // Skip if no source provided (e.g. initial save

    const record = new ModelChange({
      modelName: this.constructor.modelName,
      modelId: this._id,
      source: options.source, // Use the provided source parameter
      field,
      oldValue: previousState[field],
      newValue: this[field],
      timestamp: Date.now(),
    });
    await record.save();
  }

  next();
};


async function preUpdateMiddleware(next) {
  console.log("WITHIN PRE-UPDATE MIDDLEWARE");
  
  // Get the document's previous state
  const records = await this.model.find(this.getQuery());

  // Identify modified fields
  const modifiedFields = Object.keys(this.getUpdate());
  // const modifiedFields = Object.keys(this.toObject()).filter(field => {
  // });

  const values = this.getUpdate();

  console.log("MODIFIED FIELDS: ", modifiedFields);

  const options = this.getOptions();

  // Create source records for modified fields
  for (const record of records) {
    for (const field of modifiedFields) {
      const oldValue = record[field];
      const newValue = values[field];

      if (_.isEqual(oldValue, newValue) || !options.source) continue;
      
      const change = new ModelChange({
        modelName: this.model.modelName,
        modelId: record._id,
        source: options.source,
        field,
        oldValue: record[field],
        newValue: values[field],
        timestamp: Date.now(),
      });
      await change.save({ source: options.source });
    }
  }

  next();
};

module.exports = {
  preSaveMiddleware,
  preUpdateMiddleware,
}
