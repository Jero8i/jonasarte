const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const dataFile = path.join(__dirname, 'products.json');
const categoriesFile = path.join(__dirname, 'categories.json');
const profileFile = path.join(__dirname, 'profile.json');

// Initialize categories file if it doesn't exist
if (!fs.existsSync(categoriesFile)) {
  const initialCategories = [
    { id: 1, name: 'Vidrio Artístico' },
    { id: 2, name: 'Decoración' }
  ];
  fs.writeFileSync(categoriesFile, JSON.stringify(initialCategories, null, 2));
}

// Initialize profile file if it doesn't exist
if (!fs.existsSync(profileFile)) {
  const initialProfile = {
    greeting: 'Hola',
    subtitle: '¿QUÉ TAL?',
    description1: 'Soy Jonás, tengo 14 años y hago arte en vidrio desde los 8.',
    description2: 'Me inspira transformar luces y colores en piezas únicas. Cada obra está hecha a mano, con paciencia y mucha curiosidad.',
    whatsapp: '',
    instagram: '',
    image: '/uploads/jonas-profile.jpg'
  };
  fs.writeFileSync(profileFile, JSON.stringify(initialProfile, null, 2));
}

const getProducts = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const saveProducts = (products) => fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
const getCategories = () => JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
const saveCategories = (categories) => fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
const getProfile = () => JSON.parse(fs.readFileSync(profileFile, 'utf8'));
const saveProfile = (profile) => fs.writeFileSync(profileFile, JSON.stringify(profile, null, 2));

// Get all products
app.get('/api/products', (req, res) => {
  res.json(getProducts());
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create product
app.post('/api/products', (req, res) => {
  const products = getProducts();
  const newProduct = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    ...req.body
  };
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products[index] = { ...products[index], ...req.body };
  saveProducts(products);
  res.json(products[index]);
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const imageUrl = `https://jonasarteapi.holmesbooking.com/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products.splice(index, 1);
  saveProducts(products);
  res.status(204).send();
});

// Category endpoints
app.get('/api/categories', (req, res) => {
  res.json(getCategories());
});

app.post('/api/categories', (req, res) => {
  const categories = getCategories();
  const newCategory = {
    id: Math.max(...categories.map(c => c.id), 0) + 1,
    name: req.body.name
  };
  categories.push(newCategory);
  saveCategories(categories);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  
  categories[index] = { ...categories[index], name: req.body.name };
  saveCategories(categories);
  res.json(categories[index]);
});

app.delete('/api/categories/:id', (req, res) => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  
  categories.splice(index, 1);
  saveCategories(categories);
  res.status(204).send();
});

// Profile endpoints
app.get('/api/profile', (req, res) => {
  res.json(getProfile());
});

app.put('/api/profile', (req, res) => {
  const profile = req.body;
  saveProfile(profile);
  res.json(profile);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});