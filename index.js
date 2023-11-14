const { connect, closeDatabase } = require('./connect');

const Product = require('./productModel');
const ModelChange = require('./changesModel');


const logData = (data) => {
  console.table(JSON.parse(JSON.stringify(data)));
}

const main = async () => {
  await connect();

  await Product.insertMany([
    {
      name: "Boots A",
      price: 10,
      description: "A nice product"
    },
    {
      name: "Shirt B",
      price: 99.9,
      description: "A good product"
    },
    {
      name: "Pants Z",
      price: 140.24,
      description: "A ugly product"
    },
  ]);

  // Show products before
  console.log('Before using pre-save middleware:');

  logData(await Product.find());
  logData(await ModelChange.find());

  console.log('After using pre-save middleware:');

  // Update products
  let product = await Product.findOne({ name: "Boots A" });
  
  product.price = 20;
  
  await product.save({ source: "user" });

  await Product.updateOne({ name: "Pants Z" }, { price: 200, name: "Boots A" }, { source: "admin" });

  await Product.updateMany({ name: "Pants Z" }, { price: 250 }, { source: "sync" });

  await Product.updateOne({ name: "Boots A" }, { price: 150 }, { source: "second test"});

  await product.updateOne({ price: 300, name: "New name", description: null }, { source: "third test" });
  
  logData(await Product.find());
  logData(await ModelChange.find());

  // now try to update model with it's current data
  product = await Product.findById(product._id);

  await product.updateOne(product.toObject(), { source: "none"});

  // All changes for a specific product
  console.log(`All changes for product id=${product._id}:`);
  logData(await ModelChange.find({ modelName: 'Product', modelId: product._id }));

  // Now try to change every price
  await Product.updateMany({}, { price: 999.99 }, { source: "black-friday"});

  logData(await Product.find());
  logData(await ModelChange.find());

  // Now try to change every price without a source
  await Product.updateMany({}, { price: 9999.99 });

  product.price = 0;

  await product.save();
  
  logData(await Product.find());
  logData(await ModelChange.find());
};

main().catch(console.error).finally(() => closeDatabase());
