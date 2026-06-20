import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Set DNS resolution order to IPv4 first to avoid querySrv ECONNREFUSED
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
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  category: { type: String, required: true },
  categoryLabel: { type: String, required: true },
  image: { type: String, required: true },
  tag: { type: String, default: '' },
  description: { type: String, required: true },
  sizes: { type: String, default: 'S, M, L, XL' },
  stockQuantity: { type: Number, default: 50 },
  isNewArrival: { type: Boolean, default: false },
  displayPriority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const productsToSeed = [
  {
    name: 'Misty Rose Banarasi Lehenga',
    price: 48000,
    originalPrice: 53000,
    category: 'bridal',
    categoryLabel: 'Bridal Couture',
    image: '/bridal_collection.png',
    tag: 'Exclusive',
    description: 'Intricately woven pure silk Banarasi lehenga in a romantic misty rose hue, featuring antique gold zari embroidery, handmade tassels, and a matching silk dupatta.',
    sizes: 'S, M, L, XL',
    stockQuantity: 15,
    isNewArrival: true,
    displayPriority: 5
  },
  {
    name: 'Classic Kasavu Saree with Zardozi',
    price: 18500,
    originalPrice: 23500,
    category: 'bridal',
    categoryLabel: 'Bridal Couture',
    image: '/janki_hero_banner.png',
    tag: 'Bridal Choice',
    description: 'Traditional Kerala Kasavu handloom saree accented with exquisite hand-crafted Zardozi stone and beadwork on the borders, complete with a matching custom-design blouse piece.',
    sizes: 'S, M, L, XL',
    stockQuantity: 25,
    isNewArrival: true,
    displayPriority: 2
  },
  {
    name: 'Emerald Silk Anarkali Suit',
    price: 12800,
    originalPrice: 17800,
    category: 'ethnic',
    categoryLabel: 'Ethnic Luxe',
    image: '/ethnic_collection.png',
    tag: 'Trending',
    description: 'Elegant emerald green raw silk Anarkali suit featuring gold thread embellishments, keyhole neck detail, and a sheer embroidered organza dupatta.',
    sizes: 'S, M, L, XL',
    stockQuantity: 30,
    isNewArrival: false,
    displayPriority: 0
  },
  {
    name: 'Midnight Blue Georgette Salwar Set',
    price: 9500,
    originalPrice: 14500,
    category: 'ethnic',
    categoryLabel: 'Ethnic Luxe',
    image: '/ethnic_collection.png',
    tag: '',
    description: 'Classic salwar suit in heavy georgette, showcasing delicate sequin hand-embroidery, scalloped borders, and a matching chiffon dupatta.',
    sizes: 'S, M, L, XL',
    stockQuantity: 40,
    isNewArrival: false,
    displayPriority: 0
  },
  {
    name: 'Indigo Fusion Dhoti Kurti',
    price: 6500,
    originalPrice: 11500,
    category: 'contemporary',
    categoryLabel: 'Contemporary Fusion',
    image: '/contemporary_collection.png',
    tag: 'New In',
    description: 'Stunning asymmetric indigo blue block print cotton kurti paired with comfortable dhoti pants, ideal for contemporary luxury style.',
    sizes: 'S, M, L, XL',
    stockQuantity: 50,
    isNewArrival: false,
    displayPriority: 0
  },
  {
    name: 'Peach Pastel Organza Gown',
    price: 14200,
    originalPrice: 19200,
    category: 'contemporary',
    categoryLabel: 'Contemporary Fusion',
    image: '/contemporary_collection.png',
    tag: '',
    description: 'Flowing peach pastel organza indowestern gown featuring delicate floral hand-embroidery and a modern sheer back design.',
    sizes: 'S, M, L, XL',
    stockQuantity: 20,
    isNewArrival: false,
    displayPriority: 0
  },
  {
    name: 'Maternity Luxe Silk Gown',
    price: 19500,
    originalPrice: 24500,
    category: 'kids',
    categoryLabel: 'Little Janki (Maternity & Kids)',
    image: '/maternity_couture.png',
    tag: 'New Collection',
    description: 'An elegant maternity shoot and baby shower gown in premium ivory and peach silk, featuring intricate hand lace and soft thread embroidery, designed for maximum comfort and premium style.',
    sizes: 'S, M, L, XL',
    stockQuantity: 12,
    isNewArrival: true,
    displayPriority: 10
  },
  {
    name: 'Little Prince Zari Kurta Set',
    price: 5200,
    originalPrice: 7200,
    category: 'kids',
    categoryLabel: 'Little Janki (Maternity & Kids)',
    image: '/kids_ethnic_couture.png',
    tag: 'Kids Festive',
    description: 'Traditional hand-crafted raw silk kurta in off-white ivory with antique gold zari borders, paired with custom-fit pajama pants, designed with soft organic lining for delicate skin.',
    sizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
    stockQuantity: 18,
    isNewArrival: false,
    displayPriority: 4
  },
  {
    name: 'Aura Matching Mother & Daughter Set',
    price: 24800,
    originalPrice: 29800,
    category: 'kids',
    categoryLabel: 'Little Janki (Maternity & Kids)',
    image: '/mother_child_matching.png',
    tag: 'Bestseller',
    description: 'Exquisite matching ethnic sets for mother and daughter, crafted in champagne gold Benarasi silk, showcasing delicate hand-embroidery on the collars and sleeves.',
    sizes: 'M + 3-4Y, L + 4-5Y, XL + 5-6Y',
    stockQuantity: 8,
    isNewArrival: true,
    displayPriority: 7
  },
  {
    name: 'Aria Silk Maternity Gown',
    price: 14500,
    originalPrice: 19500,
    category: 'maternity',
    categoryLabel: 'Maternity Collection',
    image: '/maternity_couture.png',
    tag: 'Best Seller',
    description: 'A breathtaking blush pink silk gown featuring a delicate wrap-around design, designed to offer supreme comfort and elegant draping for maternity photo shoots and baby showers.',
    sizes: 'S, M, L, XL',
    stockQuantity: 20,
    isNewArrival: true,
    displayPriority: 10
  },
  {
    name: 'Seraphina Lace Feeding Dress',
    price: 8900,
    originalPrice: 11900,
    category: 'maternity',
    categoryLabel: 'Maternity Collection',
    image: '/maternity_couture.png',
    tag: 'Premium Comfort',
    description: 'An elegant rose-gold midi dress in breathable organic cotton lace, featuring invisible dual feeding zippers for ultimate post-maternity functionality and grace.',
    sizes: 'S, M, L, XL',
    stockQuantity: 30,
    isNewArrival: false,
    displayPriority: 8
  },
  {
    name: 'Elowen Floral Maternity Wrap',
    price: 7200,
    originalPrice: 9500,
    category: 'maternity',
    categoryLabel: 'Maternity Collection',
    image: '/maternity_couture.png',
    tag: 'New Arrival',
    description: 'Soft cream white georgette wrap dress showcasing hand-painted pastel floral patterns, with an adjustable tie-up belt designed for every stage of pregnancy.',
    sizes: 'S, M, L, XL',
    stockQuantity: 25,
    isNewArrival: true,
    displayPriority: 5
  },
  {
    name: 'Celeste Satin Newborn Gown',
    price: 4200,
    originalPrice: 5800,
    category: 'newborn',
    categoryLabel: 'Newborn Collection',
    image: '/mother_child_matching.png',
    tag: 'Organic Softness',
    description: 'Luxuriously soft cream white organic cotton satin christening gown, complete with soft interior lining, custom hand-embroidered flower detailing, and a matching bonnet.',
    sizes: '0-3M, 3-6M, 6-12M',
    stockQuantity: 15,
    isNewArrival: true,
    displayPriority: 9
  },
  {
    name: 'Aurelia Rose Ruffled Dress',
    price: 4900,
    originalPrice: 6500,
    category: 'newborn',
    categoryLabel: 'Newborn Collection',
    image: '/kids_ethnic_couture.png',
    tag: 'Festive Pack',
    description: 'Adorable tiered rose gold tulle party dress with soft organic cotton underskirt, designed with skin-friendly materials to keep your little princess comfortable and smiling.',
    sizes: '0-3M, 3-6M, 6-12M, 12-18M',
    stockQuantity: 18,
    isNewArrival: false,
    displayPriority: 7
  },
  {
    name: 'Lumi Organza Baby Set',
    price: 5400,
    originalPrice: 7200,
    category: 'newborn',
    categoryLabel: 'Newborn Collection',
    image: '/mother_child_matching.png',
    tag: 'Luxury Gift',
    description: 'A premium baby shower set comprising an embroidered soft silk-organza baby frock, matching custom booties, and a headband, beautifully packed in a reusable cotton heirloom keepsake pouch.',
    sizes: '0-3M, 3-6M, 6-12M',
    stockQuantity: 12,
    isNewArrival: true,
    displayPriority: 6
  }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('No MONGODB_URI found.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Wiping existing products collection...');
  await Product.deleteMany({});
  console.log('Collection cleared. Inserting products with size options and stock counts...');
  await Product.insertMany(productsToSeed);
  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch(console.error);
