import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOProducts = ({ fpoId }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [fpoId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fpoAPI.getFPOProducts(fpoId);
      setProducts(response);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fpoAPI.getFPOProductCategories(fpoId);
      setCategories(response);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="fpo-products">
      <div className="section-header">
        <h3>Products & Input Shop</h3>
        <div className="header-actions">
          <button className="btn btn-secondary">Manage Categories</button>
          <button className="btn btn-primary">Add Product</button>
        </div>
      </div>
      
      <div className="products-list">
        {products.length === 0 ? (
          <div className="no-data">No products found</div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-info">
                <h4>{product.productName}</h4>
                <p className="category">{product.categoryName}</p>
                <p className="brand">Brand: {product.brand}</p>
                <div className="product-details">
                  <div className="price">
                    <span className="label">Price:</span>
                    <span className="value">₹{product.price}</span>
                  </div>
                  <div className="stock">
                    <span className="label">Stock:</span>
                    <span className={`value ${product.stockQuantity <= product.minimumStock ? 'low-stock' : ''}`}>
                      {product.stockQuantity} {product.unit}
                    </span>
                  </div>
                  <div className="supplier">
                    <span className="label">Supplier:</span>
                    <span className="value">{product.supplier}</span>
                  </div>
                </div>
                <div className="product-status">
                  <span className={`status-badge ${product.status.toLowerCase().replace('_', '-')}`}>
                    {product.status.replace('_', ' ')}
                  </span>
                  {product.stockQuantity <= product.minimumStock && (
                    <span className="low-stock-warning">⚠️ Low Stock</span>
                  )}
                </div>
              </div>
              <div className="product-actions">
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-warning btn-sm">Update Stock</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOProducts;
