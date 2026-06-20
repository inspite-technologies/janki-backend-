import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Set DNS resolution order to IPv4 first to avoid Node.js querySrv ECONNREFUSED issue on some Windows networks
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Mongoose Enquiry Schema
const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  category: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Mongoose Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  category: { type: String, required: true }, // 'bridal', 'ethnic', 'contemporary', 'kids'
  categoryLabel: { type: String, required: true }, // 'Bridal Couture', 'Ethnic Luxe', 'Contemporary Fusion'
  image: { type: String, required: true },
  tag: { type: String, default: '' }, // e.g., 'New Arrival', 'Exclusive'
  description: { type: String, required: true },
  sizes: { type: String, default: 'S, M, L, XL' },
  stockQuantity: { type: Number, default: 50 },
  isNewArrival: { type: Boolean, default: false },
  displayPriority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Janki Designs backend API is up and running!',
    timestamp: new Date()
  });
});

// GET Route to fetch products (with server-side search, filtering, sorting, and pagination)
app.get('/api/products', async (req, res) => {
  try {
    let { page, limit, category, search, isNewArrival, sort, order, brand } = req.query;

    const query = {};

    // Brand filter
    if (brand === 'janki') {
      query.category = { $in: ['bridal', 'ethnic', 'contemporary'] };
    } else if (brand === 'memora') {
      query.category = { $in: ['maternity', 'newborn'] };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // New Arrival status filter
    if (isNewArrival) {
      query.isNewArrival = isNewArrival === 'true';
    }

    // Sort setup
    let sortObj = {};
    if (sort) {
      const sortField = sort;
      const sortOrder = order === 'asc' ? 1 : -1;
      sortObj[sortField] = sortOrder;
    } else {
      // Default sort: displayPriority desc, then createdAt desc
      sortObj = { displayPriority: -1, createdAt: -1 };
    }

    // Server-side pagination
    if (page || limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skipNum = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortObj)
        .skip(skipNum)
        .limit(limitNum);

      res.status(200).json({
        status: 'success',
        data: products,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      });
    } else {
      // No pagination: fetch all matching
      const products = await Product.find(query).sort(sortObj);
      res.status(200).json({
        status: 'success',
        data: products,
        pagination: {
          total: products.length,
          page: 1,
          pages: 1,
          limit: products.length
        }
      });
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products.'
    });
  }
});

// POST Route for Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required.'
    });
  }
  
  if (email === 'admin@gmail.com' && password === 'jankiadmin') {
    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token: 'mock-jwt-token-admin'
    });
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password.'
    });
  }
});

// POST Route to add a product (Admin Access)
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, originalPrice, category, categoryLabel, image, tag, description, sizes, stockQuantity, isNewArrival, displayPriority } = req.body;
    
    if (!name || !price || !category || !categoryLabel || !image || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, price, category, categoryLabel, image, and description are required fields.'
      });
    }

    const newProduct = new Product({
      name,
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      category,
      categoryLabel,
      image,
      tag: tag || '',
      description,
      sizes: sizes || 'S, M, L, XL',
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 50,
      isNewArrival: isNewArrival === true || isNewArrival === 'true',
      displayPriority: Number(displayPriority) || 0
    });

    await newProduct.save();
    console.log('New product added successfully:', newProduct._id);

    res.status(201).json({
      status: 'success',
      message: 'Product added successfully!',
      data: newProduct
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add product due to a server error.'
    });
  }
});

// PUT Route to update a product (Admin Access)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, price, originalPrice, category, categoryLabel, image, tag, description, sizes, stockQuantity, isNewArrival, displayPriority } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (category !== undefined) updateData.category = category;
    if (categoryLabel !== undefined) updateData.categoryLabel = categoryLabel;
    if (image !== undefined) updateData.image = image;
    if (tag !== undefined) updateData.tag = tag;
    if (description !== undefined) updateData.description = description;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity);
    if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival === true || isNewArrival === 'true';
    if (displayPriority !== undefined) updateData.displayPriority = Number(displayPriority);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully!',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product.'
    });
  }
});

// GET Route to fetch distinct categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    // Map category values to display names
    const categoryLabels = {
      bridal: 'Bridal Couture',
      ethnic: 'Ethnic Luxe',
      contemporary: 'Contemporary Fusion',
      kids: 'Little Janki (Maternity & Kids)',
      maternity: 'Maternity Collection',
      newborn: 'Newborn Collection'
    };

    const formattedCategories = categories.map(cat => ({
      value: cat,
      label: categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
    }));

    res.status(200).json({
      status: 'success',
      data: formattedCategories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories.'
    });
  }
});

// DELETE Route to delete a product (Admin Access)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product.'
    });
  }
});

// Post Route to submit customer enquiries
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;
    
    if (!name || !email || !phone || !category || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields (name, email, phone, category, message) are required.'
      });
    }

    const newEnquiry = new Enquiry({
      name,
      email,
      phone,
      category,
      message
    });

    await newEnquiry.save();
    console.log('New customer enquiry saved successfully:', newEnquiry._id);

    res.status(201).json({
      status: 'success',
      message: 'Your enquiry has been submitted successfully! We will get back to you soon.',
      data: newEnquiry
    });
  } catch (err) {
    console.error('Error saving enquiry to database:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit your enquiry due to a server error.'
    });
  }
});

// GET Route to fetch all enquiries (Admin Access) with pagination and brand filter
app.get('/api/enquiries', async (req, res) => {
  try {
    let { page, limit, brand } = req.query;
    const query = {};

    if (brand === 'janki') {
      query.category = { $nin: ['Maternity Wear Customization', 'Newborn Layette set', 'Baby Shower Frocks', 'Newborn Layette Set', 'General Consultation'] };
    } else if (brand === 'memora') {
      query.category = { $in: ['Maternity Wear Customization', 'Newborn Layette set', 'Baby Shower Frocks', 'Newborn Layette Set', 'General Consultation'] };
    }

    if (page || limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skipNum = (pageNum - 1) * limitNum;

      const total = await Enquiry.countDocuments(query);
      const enquiries = await Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum);

      res.status(200).json({
        status: 'success',
        data: enquiries,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum
        }
      });
    } else {
      const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
      res.status(200).json({
        status: 'success',
        data: enquiries,
        pagination: {
          total: enquiries.length,
          page: 1,
          pages: 1,
          limit: enquiries.length
        }
      });
    }
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch enquiries.'
    });
  }
});

// PUT Route to update enquiry status (Admin Access)
app.put('/api/enquiries/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedEnquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Enquiry not found.'
      });
    }
    res.status(200).json({
      status: 'success',
      message: `Enquiry status updated to ${status}.`,
      data: updatedEnquiry
    });
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update enquiry status.'
    });
  }
});

// DELETE Route to delete an enquiry (Admin Access)
app.delete('/api/enquiries/:id', async (req, res) => {
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deletedEnquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Enquiry not found.'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Enquiry deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete enquiry.'
    });
  }
});

// Database connection
if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

console.log('Connecting to MongoDB Atlas...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
