import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

if (process.platform === 'win32') {
  dns.setDefaultResultOrder('ipv4first');
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (err) {
    console.warn('Warning: Could not set custom DNS servers:', err.message);
  }
}

dotenv.config();

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  categoryLabel: String
});

const Product = mongoose.model('Product', productSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');
  const products = await Product.find({});
  console.log('Total products:', products.length);
  const categories = await Product.distinct('category');
  console.log('Categories in DB:', categories);
  products.forEach(p => {
    console.log(`- ${p.name} (${p.category}) [${p.categoryLabel}]`);
  });
  process.exit(0);
}

run().catch(console.error);
