import axiosInstance from '../axios/axiosInstance';

// Get Categories
export const getCategories = () => {
    return axiosInstance.get('/categories');
};

// Add Category
export const addCategory = (categoryData) => {
    return axiosInstance.post('/categories', categoryData);
};

// Update Category
export const updateCategory = (categoryId, categoryData) => {
    return axiosInstance.put(`/categories/${categoryId}`, categoryData);
};

// Delete Category
export const deleteCategory = (categoryId) => {
    return axiosInstance.delete(`/categories/${categoryId}`);
};

// Get All Products
export const getAllProducts = () => {
    return axiosInstance.get('/products');
};

// Add Products
export const addProduct = () => {
    return axiosInstance.post('/products');
};


// Delete Product
export const deleteProduct = (productId) => axiosInstance.delete(`/products/${productId}`);

// Remove Image from Color
export const removeImageFromColor = (productId, colorId, imageUrl) => {
    return axiosInstance.delete(`/products/${productId}/colors/${colorId}/image`, {
        data: { imageUrl }, // Pass the image URL in the request body
    });
};