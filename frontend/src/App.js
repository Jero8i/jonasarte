import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [profile, setProfile] = useState({
    greeting: 'Hola',
    subtitle: '¿QUÉ TAL?',
    description1: 'Soy Jonás, tengo 14 años y hago arte en vidrio desde los 8.',
    description2: 'Me inspira transformar luces y colores en piezas únicas. Cada obra está hecha a mano, con paciencia y mucha curiosidad.',
    whatsapp: '',
    instagram: '',
    image: '/uploads/jonas-profile.jpg'
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProfile();
    
    // GSAP-style scroll transformations
    let ticking = false;
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const scrollState = {
      current: 0,
      target: 0,
      ease: 0.1
    };
    
    const handleScroll = () => {
      scrollState.target = window.pageYOffset;
      if (!ticking) {
        requestAnimationFrame(updateScrollAnimations);
        ticking = true;
      }
    };
    
    const updateScrollAnimations = () => {
      scrollState.current = lerp(scrollState.current, scrollState.target, scrollState.ease);
      
      const scrolled = scrollState.current;
      const windowHeight = window.innerHeight;
      const scrollProgress = Math.min(scrolled / windowHeight, 1);
      
      const profileSection = document.querySelector('.profile-section');
      const profileTitle = document.querySelector('.profile-brand h1');
      const profileImage = document.querySelector('.profile-image');
      const artElements = document.querySelector('.art-elements');
      
      if (profileSection) {
        const translateY = scrolled * -0.4;
        const scale = 1 + scrollProgress * 0.1;
        const opacity = Math.max(1 - scrollProgress * 0.8, 0.2);
        profileSection.style.transform = `translateY(${translateY}px) scale(${scale})`;
        profileSection.style.opacity = opacity;
      }
      
      if (profileTitle) {
        const translateY = scrolled * -0.6;
        const rotateZ = scrollProgress * 5;
        const scale = Math.max(1 - scrollProgress * 0.3, 0.7);
        profileTitle.style.transform = `translateY(${translateY}px) rotateZ(${rotateZ}deg) scale(${scale})`;
      }
      
      if (profileImage) {
        const translateY = scrolled * -0.2;
        const rotateY = scrollProgress * 15;
        const translateX = Math.sin(scrollProgress * Math.PI) * 20;
        profileImage.style.transform = `translateY(${translateY}px) translateX(${translateX}px) rotateY(${rotateY}deg)`;
      }
      
      if (artElements) {
        const translateY = scrolled * -0.05;
        const rotate = scrollProgress * 360;
        const scale = 1 + Math.sin(scrollProgress * Math.PI * 2) * 0.1;
        artElements.style.transform = `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`;
      }
      
      // Products section scroll effects
      const main = document.querySelector('.main');
      const productsTitle = document.querySelector('.products-title');
      const productCards = document.querySelectorAll('.product-card');
      
      if (main) {
        const mainRect = main.getBoundingClientRect();
        const mainProgress = Math.max(0, Math.min(1, (windowHeight - mainRect.top) / windowHeight));
        
        if (productsTitle) {
          const titleTranslateY = Math.sin(mainProgress * Math.PI) * 20;
          const titleScale = 1 + mainProgress * 0.1;
          productsTitle.style.transform = `translateY(${titleTranslateY}px) scale(${titleScale})`;
        }
        
        productCards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardProgress = Math.max(0, Math.min(1, (windowHeight - cardRect.top) / windowHeight));
          
          if (cardProgress > 0) {
            const rotateY = Math.sin(cardProgress * Math.PI + index * 0.5) * 5;
            const translateX = Math.sin(scrollProgress * Math.PI + index * 0.3) * 10;
            const scale = 1 + Math.sin(cardProgress * Math.PI) * 0.05;
            
            card.style.transform = `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`;
            card.style.filter = `hue-rotate(${cardProgress * 20}deg) brightness(${1 + cardProgress * 0.1})`;
          }
        });
      }
      
      // Continue animation if still scrolling
      if (Math.abs(scrollState.target - scrollState.current) > 0.1) {
        requestAnimationFrame(updateScrollAnimations);
      } else {
        ticking = false;
      }
    };
    
    // Intersection Observer for GSAP-style effects
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100); // Stagger animation
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    
    // Observe elements with different animations
    const observeElements = () => {
      document.querySelectorAll('.product-card').forEach((el, index) => {
        const animations = ['fade-in', 'bounce-in', 'elastic-in'];
        const randomAnimation = animations[index % animations.length];
        el.classList.add(randomAnimation);
        observer.observe(el);
      });
      
      document.querySelectorAll('.category-section').forEach((el, index) => {
        const animation = index % 2 === 0 ? 'slide-in-left' : 'slide-in-right';
        el.classList.add(animation);
        observer.observe(el);
      });
      
      document.querySelectorAll('.category-title').forEach(el => {
        el.classList.add('bounce-in');
        observer.observe(el);
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Delay to ensure DOM is ready
    setTimeout(observeElements, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      setProfile(profileData);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const allCategories = ['all', ...categories.map(c => c.name)];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSave = async (product) => {
    try {
      const method = product.id ? 'PUT' : 'POST';
      const url = product.id ? `${API_URL}/products/${product.id}` : `${API_URL}/products`;
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="app">
      <section className="profile-section">
        <div className="art-elements"></div>
        <div className="profile-content">
          <div className="profile-text">
            <div className="profile-brand">
              <h1>JONASARTE</h1>
              <div className="subtitle">Arte en vidrio</div>
            </div>
            <div className="profile-intro">
              <h2>{profile.greeting}</h2>
              <h3>{profile.subtitle}</h3>
              <p>{profile.description1}</p>
              <p>{profile.description2}</p>
              <div className="contact-info">
                {profile.whatsapp && (
                  <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
                    <img src="/WhatsApp_black.jpg" alt="WhatsApp" />
                  </a>
                )}
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="contact-link instagram">
                    <img src="/Instagram-Icon.png" alt="Instagram" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="profile-image">
            <img src={profile.image} alt="Jonás" />
            <button 
              className="admin-toggle"
              onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
            >
              ⚙️
            </button>
            {isAdmin && (
              <button 
                className="edit-profile-btn"
                onClick={() => setEditingProfile(true)}
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {editingProduct && (
        <ProductForm 
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {showCategoryManager && (
        <CategoryManager 
          categories={categories}
          onSave={fetchCategories}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {editingProfile && (
        <ProfileEditor 
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(false)}
        />
      )}

      {showLogin && (
        <AdminLogin 
          onLogin={() => { setIsAdmin(true); setShowLogin(false); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      <main className="main">
        <h2 className="products-title">MIS PRODUCTOS</h2>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
        
        {isAdmin && (
          <div className="admin-controls">
            <button 
              className="add-btn"
              onClick={() => setEditingProduct({})}
            >
              Agregar Producto
            </button>
            <button 
              className="category-btn"
              onClick={() => setShowCategoryManager(true)}
            >
              Gestionar Categorías
            </button>
          </div>
        )}

        {selectedCategory === 'all' && !searchTerm ? (
          <div className="categories-display">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.category === category.name);
              if (categoryProducts.length === 0) return null;
              return (
                <div key={category.id} className="category-section">
                  <h3 className="category-title">{category.name}</h3>
                  <div className="product-grid">
                    {categoryProducts.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        isAdmin={isAdmin}
                        onClick={() => handleProductClick(product)}
                        onEdit={() => setEditingProduct(product)}
                        onDelete={() => handleDelete(product.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                onClick={() => handleProductClick(product)}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, isAdmin, onClick, onEdit, onDelete }) {
  const mainImage = Array.isArray(product.images) ? product.images[0] : product.image;
  
  return (
    <div className="product-card" onClick={onClick}>
      <img src={mainImage} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.category && <span className="category-tag">{product.category}</span>}
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        {isAdmin && (
          <div className="admin-actions" onClick={e => e.stopPropagation()}>
            <button onClick={onEdit}>Editar</button>
            <button onClick={onDelete} className="delete-btn">Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetail({ product, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const images = Array.isArray(product.images) ? product.images : [product.image];
  
  useEffect(() => {
    if (images.length > 1 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isAutoPlaying]);
  
  const nextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const goToImage = (index) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="image-carousel">
          <img src={images[currentImageIndex]} alt={product.name} />
          {images.length > 1 && (
            <>
              <button className="carousel-btn prev" onClick={prevImage}>‹</button>
              <button className="carousel-btn next" onClick={nextImage}>›</button>
              <div className="carousel-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => goToImage(index)}
                  />
                ))}
              </div>
              <button 
                className="autoplay-toggle"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                title={isAutoPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isAutoPlaying ? '⏸️' : '▶️'}
              </button>
            </>
          )}
        </div>
        <div className="product-details">
          <h2>{product.name}</h2>
          <p className="price">${product.price}</p>
          <p className="description">{product.description}</p>
        </div>
      </div>
    </div>
  );
}

function ProductForm({ product, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    price: product.price || '',
    description: product.description || '',
    category: product.category || '',
    images: product.images || []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let imageUrls = formData.images;
    
    if (selectedFiles.length > 0) {
      setUploading(true);
      const uploadPromises = selectedFiles.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: uploadFormData
        });
        const data = await response.json();
        return data.imageUrl;
      });
      
      try {
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (error) {
        console.error('Error uploading images:', error);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    onSave({ 
      ...product, 
      ...formData, 
      images: imageUrls,
      image: imageUrls[0], // Keep backward compatibility
      price: parseFloat(formData.price) 
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({...formData, images: newImages});
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{product.id ? 'Editar Producto' : 'Agregar Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
            required
          />
          <select
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            required
          >
            <option value="">Seleccionar Categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Descripción"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />
          <div className="image-upload">
            <label>Imágenes del Producto:</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required={!product.id && formData.images.length === 0}
            />
            {formData.images.length > 0 && (
              <div className="current-images">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img} alt={`Preview ${index}`} />
                    <button type="button" onClick={() => removeImage(index)}>×</button>
                    {index === 0 && <span className="main-label">Principal</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Guardar'}
            </button>
            <button type="button" onClick={onCancel}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryManager({ categories, onSave, onClose }) {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      
      if (response.ok) {
        setNewCategory('');
        onSave();
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('¿Estás seguro? Esto eliminará la categoría de todos los productos.')) {
      try {
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        onSave();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEditCategory = async (category) => {
    try {
      await fetch(`${API_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: category.name })
      });
      setEditingCategory(null);
      onSave();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Gestionar Categorías</h2>
        
        <form onSubmit={handleAddCategory} className="category-form">
          <input
            type="text"
            placeholder="Nombre de nueva categoría"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
          />
          <button type="submit">Agregar Categoría</button>
        </form>
        
        <div className="category-list">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              {editingCategory?.id === category.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  onBlur={() => handleEditCategory(editingCategory)}
                  onKeyPress={e => e.key === 'Enter' && handleEditCategory(editingCategory)}
                  autoFocus
                />
              ) : (
                <span onClick={() => setEditingCategory(category)}>{category.name}</span>
              )}
              <button onClick={() => handleDeleteCategory(category.id)} className="delete-btn">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileEditor({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState({
    greeting: profile.greeting || '',
    subtitle: profile.subtitle || '',
    description1: profile.description1 || '',
    description2: profile.description2 || '',
    whatsapp: profile.whatsapp || '',
    instagram: profile.instagram || '',
    image: profile.image || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let imageUrl = formData.image;
    
    if (selectedFile) {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      
      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: uploadFormData
        });
        const data = await response.json();
        imageUrl = data.imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    onSave({ ...formData, image: imageUrl });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Saludo"
            value={formData.greeting}
            onChange={e => setFormData({...formData, greeting: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Subtítulo"
            value={formData.subtitle}
            onChange={e => setFormData({...formData, subtitle: e.target.value})}
            required
          />
          <textarea
            placeholder="Descripción 1"
            value={formData.description1}
            onChange={e => setFormData({...formData, description1: e.target.value})}
            required
          />
          <textarea
            placeholder="Descripción 2"
            value={formData.description2}
            onChange={e => setFormData({...formData, description2: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="WhatsApp (ej: 573001234567)"
            value={formData.whatsapp}
            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
          />
          <input
            type="text"
            placeholder="Instagram (ej: jonasarte)"
            value={formData.instagram}
            onChange={e => setFormData({...formData, instagram: e.target.value})}
          />
          <div className="image-upload">
            <label>Foto de Perfil:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.image && (
              <div className="current-image">
                <img src={formData.image} alt="Current" style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                <span>Imagen actual</span>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin, onClose }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Acceso Administrador</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={credentials.username}
            onChange={e => setCredentials({...credentials, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={e => setCredentials({...credentials, password: e.target.value})}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="submit">Ingresar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;