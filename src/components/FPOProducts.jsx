import React, { useState, useEffect } from 'react';
import { fpoAPI } from '../api/apiService';

const FPOProducts = ({ fpoId }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadShops();
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

  const loadShops = async () => {
    try {
      const res = await fpoAPI.getFPOInputShops(fpoId);
      const data = res?.data || res || [];
      setShops(Array.isArray(data) ? data : []);
    } catch (e) {
      setShops([]);
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
      <div className="products-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {products.length === 0 ? (
          <div className="no-data">No products found</div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card item-card">
              <h4 style={{ marginTop: 0 }}>{product.productName}{product.categoryName ? ` (${product.categoryName})` : ''}</h4>
              <p style={{ margin: '8px 0 0 0' }}>Shop: {product.brand || product.supplier || product.shopName || product.shop || '—'}</p>
              <p style={{ margin: '8px 0 0 0' }}>Sold: {(() => {
                const qty = product.quantitySold ?? product.stockQuantity;
                if (qty == null) return '—';
                const unit = product.unit || 'MT';
                return `${Number(qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
              })()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FPOProducts;
