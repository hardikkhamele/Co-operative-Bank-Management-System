import axiosInstance from './axiosConfig';

export const productService = {
  // 1. Get Products list with search
  getProducts: async (params = {}) => {
    const endpoints = [
      '/v1/society/products',
      '/v1/super-admin/products',
      '/v1/employee/products',
      '/v1/super-admin/products/dropdown'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axiosInstance.get(endpoint, { params });
        if (response?.data?.success && response.data.data) {
          return response.data;
        }
      } catch (err) {
        // Try next endpoint
      }
    }
    return { success: false, data: [] };
  },

  // 2. Get Product Details by ID
  getById: async (id) => {
    if (!id) return { success: false, data: null };
    const endpoints = [
      `/v1/society/products/${id}`,
      `/v1/super-admin/products/${id}`,
      `/v1/employee/products/${id}`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axiosInstance.get(endpoint);
        if (response?.data?.success && response.data.data) {
          return response.data;
        }
      } catch (err) {
        // Try next endpoint
      }
    }
    return { success: false, data: null };
  },

  // 3. Find Product & its Backend Variant / Product Image by Product Name
  getByProductName: async (productName, variantName = '') => {
    if (!productName || typeof productName !== 'string') return null;
    const cleanName = productName.trim().toLowerCase();
    const cleanVariant = variantName ? variantName.trim().toLowerCase() : '';

    try {
      const res = await productService.getProducts({ search: productName });
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.products || []);
      
      if (list.length > 0) {
        // Find exact match or closest match
        const exact = list.find(p => p.name && p.name.trim().toLowerCase() === cleanName);
        const match = exact || list.find(p => p.name && p.name.toLowerCase().includes(cleanName)) || list[0];
        
        // Check if there is a variant image matching the variant name
        if (cleanVariant && Array.isArray(match?.variants) && match.variants.length > 0) {
          const matchedVariant = match.variants.find(v => 
            (v.name && cleanVariant.includes(v.name.toLowerCase())) ||
            (v.color && cleanVariant.includes(v.color.toLowerCase())) ||
            (v.storage && cleanVariant.includes(v.storage.toLowerCase())) ||
            (v.variantName && cleanVariant.includes(v.variantName.toLowerCase()))
          );
          if (matchedVariant) {
            const vImg = matchedVariant.variantImage || matchedVariant.image || matchedVariant.imageUrl;
            if (vImg) return productService.getImageUrl(vImg);
          }
        }

        const rawImg = 
          match?.variantImage || 
          match?.variantImageUrl || 
          match?.variants?.[0]?.variantImage || 
          match?.variants?.[0]?.image || 
          match?.image || 
          match?.imageUrl || 
          match?.productImage || 
          match?.img || 
          match?.thumbnail;

        if (rawImg) {
          return productService.getImageUrl(rawImg);
        }
      }
    } catch (err) {
      console.warn('Backend product search by name:', err.message);
    }
    return null;
  },

  // 4. Robust extraction of variantImage / product image from any lead or loan object
  extractProductOrVariantImage: (obj) => {
    if (!obj || typeof obj !== 'object') return null;

    const candidate = 
      obj.variantImage ||
      obj.variantImageUrl ||
      obj.loanInformation?.variantImage ||
      obj.loanInformation?.variantImageUrl ||
      obj.variant?.image ||
      obj.variant?.variantImage ||
      obj.variant?.imageUrl ||
      obj.loanInformation?.productImageUrl ||
      obj.loanInformation?.productImage ||
      obj.loanInformation?.imageUrl ||
      obj.loanInformation?.image ||
      obj.documents?.variantImage ||
      obj.documents?.variantImageUrl ||
      obj.documents?.productImageUrl ||
      obj.documents?.productImage ||
      obj.productImageUrl ||
      obj.productImage ||
      obj.image ||
      obj.imageUrl ||
      obj.product?.variantImage ||
      obj.product?.variantImageUrl ||
      obj.product?.image ||
      obj.product?.imageUrl ||
      obj.product?.productImage;

    if (candidate) {
      return productService.getImageUrl(candidate);
    }
    return null;
  },

  // 5. Helper to resolve full backend image URL (handles Cloudinary, S3, relative backend URLs)
  getImageUrl: (url) => {
    if (!url || typeof url !== 'string' || !url.trim()) return '';
    const trimmed = url.trim();
    
    // Absolute URLs (Cloudinary, S3, Base64 data, etc.)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    // Backend relative path
    const backendBase = (axiosInstance.defaults.baseURL || 'http://devapi.advitacredit.com')
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/api\/?$/, '')
      .replace(/\/+$/, '');

    return `${backendBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }
};

export default productService;
