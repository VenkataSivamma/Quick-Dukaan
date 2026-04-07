const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const PORT = 3000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schemas
const customerSchema = new mongoose.Schema({
  name: String,
  city: String,
  email: String,
  password: String,
  mobile: String,
  gender: String
});

const adminSchema = new mongoose.Schema({
  name: String, // For compatibility with login
  adminName: String,
  shopName: String,
  city: String,
  email: String,
  password: String,
  mobile: String,
  category: String, // Shop category
  photo: { type: String, default: "" }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  pricePerQuantity: { type: Number },
  expiryDate: { type: Date },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
});

const orderSchema = new mongoose.Schema({
  customerName: String,
  productName: String,
  quantity: Number,
  unit: String,
  status: {
    type: String,
    enum: ['Pending', 'Ready to Pickup', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }
});

// ✅ Models
const Customer = mongoose.model("Customer", customerSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// 🌐 Root Route
app.get("/", (req, res) => {
  res.send("✅ Dukaan Backend is Running!");
});

// 🔐 Login Route
app.post("/login", async (req, res) => {
  const { userType, email, password } = req.body;
  try {
    if (userType === "customer") {
      const user = await Customer.findOne({ email, password });
      return user
        ? res.json({ success: true, userId: user._id, role: "customer" })
        : res.json({ success: false, message: "Invalid customer credentials" });
    }
    if (userType === "admin") {
      const admin = await Admin.findOne({ email, password });
      return admin
        ? res.json({ success: true, userId: admin._id, role: "admin" })
        : res.json({ success: false, message: "Invalid admin credentials" });
    }
    res.status(400).json({ success: false, message: "Invalid user type" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📝 Signup Route
app.post("/signup", async (req, res) => {
  const { userType } = req.body;
  try {
    if (userType === "customer") {
      const { name, city, email, password, mobile, gender } = req.body;
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.json({ success: false, message: "Customer already exists with this email" });
      }
      const newUser = new Customer({ name, city, email, password, mobile, gender });
      await newUser.save();
      return res.json({ success: true, message: "Customer registered successfully" });
    }
    if (userType === "admin") {
      const { adminName, shopName, city, email, password, mobile, photo, category } = req.body;
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.json({ success: false, message: "Shop already exists with this email" });
      }
      const newAdmin = new Admin({ 
        name: adminName, 
        adminName, 
        shopName, 
        city, 
        email, 
        password, 
        mobile, 
        photo, 
        category 
      });
      await newAdmin.save();
      return res.json({ success: true, message: "Admin registered successfully" });
    }
    res.status(400).json({ success: false, message: "Invalid user type" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Error during signup" });
  }
});

// ✅ Admin Profile
app.get("/api/admin/profile/:adminId", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({
      name: admin.adminName,
      shopName: admin.shopName,
      email: admin.email,
      city: admin.city,
      mobile: admin.mobile,
      photo: admin.photo
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching admin profile" });
  }
});

// ✅ Add Product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, unit, image, adminId, quantity, pricePerQuantity, expiryDate } = req.body;
    if (!name || !price || !unit || !image || !adminId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const productData = { name, price, unit, image, adminId, quantity };
    if (pricePerQuantity) productData.pricePerQuantity = pricePerQuantity;
    if (expiryDate) productData.expiryDate = new Date(expiryDate);
    
    const product = new Product(productData);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Error adding product" });
  }
});

// ✅ Get Products by Admin
app.get("/api/products/admin/:adminId", async (req, res) => {
  try {
    const products = await Product.find({ adminId: req.params.adminId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// ✅ Update Product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, price, unit, quantity, pricePerQuantity, expiryDate } = req.body;
    const updateData = { name, price, unit, quantity };
    if (pricePerQuantity) updateData.pricePerQuantity = pricePerQuantity;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Error updating product" });
  }
});


// ✅ Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

// ✅ Delete Order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting order" });
  }
});

// ✅ Admin Orders (Groupable by customerName)
app.get("/api/orders/admin/:adminId", async (req, res) => {
  try {
    const orders = await Order.find({ adminId: req.params.adminId }).populate('customerId', 'name email');
    const ordersWithCustomerName = orders.map(order => ({
      ...order.toObject(),
      customerName: order.customerId?.name || "Unknown",
      customerEmail: order.customerId?.email || "N/A"
    }));
    res.json(ordersWithCustomerName);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// ✅ Recent Orders
app.get("/api/orders/admin/:adminId/recent", async (req, res) => {
  try {
    const orders = await Order.find({ adminId: req.params.adminId })
      .sort({ _id: -1 })
      .limit(5)
      .populate('customerId', 'name');

    const recentOrders = orders.map(order => ({
      ...order.toObject(),
      customerName: order.customerId?.name || "Unknown"
    }));
    res.json(recentOrders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching recent orders" });
  }
});

// ✅ Update Order Status
app.put("/api/orders/:orderId", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating order status" });
  }
});

// ✅ Customer Profile
app.get("/api/customer/profile/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({
      name: customer.name,
      city: customer.city,
      email: customer.email,
      mobile: customer.mobile
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching customer profile" });
  }
});

// ✅ ✅ ✅ UPDATED: Customer Orders with Shop Name Included
app.get("/api/customer/orders/:customerId", async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId })
      .populate("adminId", "shopName city");

    const enrichedOrders = orders.map(order => ({
      _id: order._id,
      productName: order.productName,
      quantity: order.quantity,
      unit: order.unit,
      status: order.status,
      adminId: order.adminId?._id,
      shopName: order.adminId?.shopName || "Unknown Shop",
      city:order.adminId?.city || "Unknown City"}));

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// ✅ Place Order
app.post("/api/orders", async (req, res) => {
  const { customerId, productName, quantity, unit, adminId } = req.body;
  try {
    if (!customerId || !productName || !quantity || !unit || !adminId) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const newOrder = new Order({
      customerId,
      customerName: customer.name,
      productName,
      quantity,
      unit,
      adminId
    });
    await newOrder.save();
    res.json({ success: true, message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error placing order" });
  }
});

// ✅ Search Shops by City
app.get("/api/shops/search", async (req, res) => {
  const { city } = req.query;
  try {
    const shops = await Admin.find({ city: new RegExp(city, "i") });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Error searching shops" });
  }
});

// ✅ Get All Shops
app.get("/api/shops/all", async (req, res) => {
  try {
    const shops = await Admin.find();
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Error fetching shops" });
  }
});

// ✅ Recent Shops
app.get("/api/shops/recent", async (req, res) => {
  try {
    const shops = await Admin.find().sort({ _id: -1 }).limit(3);
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Error fetching recent shops" });
  }
});


// ✅ Search products by name and city
app.get("/api/products/search", async (req, res) => {
  const { product, city } = req.query;
  try {
    const admins = await Admin.find({ city: new RegExp(city, 'i') });
    const results = [];

    for (const admin of admins) {
      const products = await Product.find({
        adminId: admin._id,
        name: new RegExp(product, 'i')
      });

      if (products.length > 0) {
        results.push({
          shopName: admin.shopName,
          city: admin.city,
          adminId: admin._id,
          products
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product search" });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});