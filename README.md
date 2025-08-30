# Product Catalogue Website

A modern, responsive product catalogue with admin functionality for CRUD operations.

## Features

### Public Catalogue
- Clean, modern design with responsive grid layout
- Product cards with images, names, prices, and descriptions
- Click to view detailed product information in modal
- Mobile-friendly responsive design

### Admin Panel
- Toggle admin mode with a single button
- Create new products with form validation
- Edit existing products inline
- Delete products with confirmation
- Real-time updates without page refresh

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Express.js with JSON file storage
- **Styling**: Pure CSS with modern design principles

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Project Structure

```
product-catalogue/
├── backend/
│   ├── server.js          # Express API server
│   ├── products.json      # Product data storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── App.css        # Styling
│   └── package.json
└── package.json           # Root package with scripts
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Usage

1. **Browse Products**: View the product catalogue on the main page
2. **View Details**: Click any product card to see full details
3. **Admin Mode**: Click "Admin Mode" to enable CRUD operations
4. **Add Products**: Use "Add New Product" button in admin mode
5. **Edit/Delete**: Use the buttons on product cards in admin mode