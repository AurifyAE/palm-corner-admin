import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";
import { removeImageFromColor as removeImageAPI } from "../api/api";


const EditProductModal = ({
  productId,
  categories,
  onClose,
  onProductUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sku: "",
    category: "",
    stock: true,
    isActive: true,
    specifications: [],
    colors: [],
  });

  const [editingColor, setEditingColor] = useState(null);
  const [addingColor, setAddingColor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colorImages, setColorImages] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

console.log("editingColor", editingColor?._id);
console.log("productId", productId);

const removeImageFromColor = async (imgUrl) => {
  console.log("removeImageFromColor", imgUrl);

  const loadingToast = toast.loading("Removing image...");
  try {
    // Use the API function from api.js
    await removeImageAPI(productId, editingColor?._id, imgUrl);

    toast.dismiss(loadingToast);
    toast.success("Image removed successfully!");

    // Update the local state to reflect the change
    setEditingColor((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.url !== imgUrl),
    }));
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error("Error removing image:", error);
    toast.error(error.response?.data?.message || "Failed to remove image");
  }
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${productId}`);
        const product = response.data.data;

        setFormData({
          title: product.title,
          description: product.description,
          sku: product.sku,
          category: product.category?._id,
          stock: product.stock,
          isActive: product.isActive,
          specifications: product.specifications || [],
          colors: product.colors.map((color) => ({
            ...color,
            images: color.images.map((img) => ({ url: img.url })),
          })),
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product data");
      }
    };

    fetchProduct();
  }, [productId]);

  // 1. Endpoint: /products/:id - Update Product Details
  const updateProductDetails = async () => {
    const loadingToast = toast.loading("Updating product details...");
    try {
      const response = await axiosInstance.put(`/products/${productId}`, {
        title: formData.title,
        description: formData.description,
        sku: formData.sku,
        category: formData.category,
        stock: formData.stock,
        isActive: formData.isActive,
        specifications: formData.specifications,
      });

      toast.dismiss(loadingToast);
      toast.success("Product details updated successfully!");
      return true;
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error updating product details:", error);
      toast.error(error.response?.data?.message || "Failed to update product details");
      return false;
    }
  };

  // 2. Endpoint: /products/:id/colors - Add new Color and image
  const addNewColor = async (colorData) => {
    const loadingToast = toast.loading("Adding new color...");
    try {
      const formPayload = new FormData();
      formPayload.append("colorName", colorData.colorName);
      formPayload.append("hexCode", colorData.hexCode);

      // Append images
      colorImages.forEach((img) => {
        formPayload.append("image", img.file);
      });

      const response = await axiosInstance.post(
        `/products/${productId}/colors`,
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.dismiss(loadingToast);
      toast.success("Color added successfully!");
      setColorImages([]);
      return true;
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error adding color:", error);
      toast.error(error.response?.data?.message || "Failed to add color");
      return false;
    }
  };

  // 3. Endpoint: /products/:id/colors/:colorId - Edit a color
  const updateColor = async (colorData) => {
    const loadingToast = toast.loading("Updating color...");
    try {
      const formPayload = new FormData();
      formPayload.append("colorName", colorData.colorName);
      formPayload.append("hexCode", colorData.hexCode);
  
      // Append existing images
      colorData.images.forEach((img) => {
        formPayload.append("existingImages", JSON.stringify(img));
      });
  
      // Append new images
      colorImages.forEach((img) => {
        formPayload.append("image", img.file);
      });
  
      const response = await axiosInstance.put(
        `/products/${productId}/colors/${colorData._id}`,
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      toast.dismiss(loadingToast);
      toast.success("Color updated successfully!");
      setColorImages([]);
      return true;
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error updating color:", error);
      toast.error(error.response?.data?.message || "Failed to update color");
      return false;
    }
  };

  // 4. Endpoint: /products/:id/colors/:colorId - Delete a color
  const deleteColor = async (colorId) => {
    const loadingToast = toast.loading("Deleting color...");
    try {
      const response = await axiosInstance.delete(
        `/products/${productId}/colors/${colorId}`
      );

      toast.dismiss(loadingToast);
      toast.success("Color deleted successfully!");
      return true;
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting color:", error);
      toast.error(error.response?.data?.message || "Failed to delete color");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const success = await updateProductDetails();
    
    if (success) {
      onProductUpdated();
    }
    
    setIsSubmitting(false);
  };

  const handleColorSubmit = async (colorData) => {
    let success;
    
    if (addingColor) {
      success = await addNewColor(colorData);
    } else {
      success = await updateColor(colorData);
    }
    
    if (success) {
      setEditingColor(null);
      setAddingColor(false);
      onProductUpdated();
    }
  };

  // Image handling functions
  const handleImageUpload = (files) => {
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setColorImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const imageToRemove = colorImages[index];
    URL.revokeObjectURL(imageToRemove.preview);
    setColorImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: "", value: "" }],
    });
  };

  const removeSpec = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleColorDelete = async (colorId) => {
    const success = await deleteColor(colorId);
    if (success) {
      // Remove the color from the formData
      setFormData({
        ...formData,
        colors: formData.colors.filter((color) => color._id !== colorId),
      });
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.checked })
                    }
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  In Stock
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border rounded h-32"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, "key", e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                    disabled={isSubmitting}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, "value", e.target.value)
                    }
                    className="flex-1 p-2 border rounded"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="bg-red-500 text-white px-4 rounded hover:bg-red-600 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Add Specification
              </button>
            </div>

            {/* Colors Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {formData.colors.map((color) => (
                  <div key={color._id} className="border rounded p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span>{color.colorName}</span>
                      {color.isDefault && (
                        <span className="text-sm text-gray-500">(Default)</span>
                      )}
                    </div>
                    
                    {/* Display color images */}
                    {color.images && color.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 my-2">
                        {color.images.map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt={`${color.colorName} ${index}`}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColor(color);
                          setColorImages([]);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(color._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddingColor(true);
                  setEditingColor({
                    colorName: "",
                    hexCode: "#000000",
                    images: []
                  });
                  setColorImages([]);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Color
              </button>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Color Edit/Add Modal */}
          {(editingColor || addingColor) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">
                  {addingColor ? "Add New Color" : "Edit Color"}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleColorSubmit(editingColor);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Color Name</label>
                      <input
                        type="text"
                        value={editingColor?.colorName.toUpperCase() || ""}
                        onChange={(e) =>
                          setEditingColor({
                            ...editingColor,
                            colorName: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Hex Code</label>
                      <input
                        type="color"
                        value={editingColor?.hexCode || "#000000"}
                        onChange={(e) =>
                          setEditingColor({
                            ...editingColor,
                            hexCode: e.target.value,
                          })
                        }
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Upload Images</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="mb-2"
                        accept="image/*"
                      />
                      <div className="flex flex-wrap gap-2">
                        {/* Existing images */}
                        {!addingColor && editingColor?.images?.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.url}
                              alt={`Color preview ${index}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                             <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                              onClick={()=> removeImageFromColor(img.url)}
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {/* Newly uploaded images */}
                        {colorImages.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.preview}
                              alt={`Preview ${index}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColor(null);
                          setAddingColor(false);
                        }}
                        className="bg-gray-300 px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        {addingColor ? "Add Color" : "Update Color"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                <p className="mb-6">
                  Are you sure you want to delete this color? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleColorDelete(deleteConfirm)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;