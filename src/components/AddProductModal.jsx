import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";

const AddProductModal = ({ categories, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sku: "",
    category: "",
    stock: true,
    isActive: true,
    specifications: [{ key: "", value: "" }],
    colors: [
      {
        colorName: "",
        hexCode: "#000000",
        images: [],
        isDefault: true,
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSkus, setExistingSkus] = useState([]);

  // Fetch existing SKUs on component mount
  useEffect(() => {
    const fetchExistingSkus = async () => {
      try {
        const response = await axiosInstance.get('/products/skus');
        if (response.data && Array.isArray(response.data.skus)) {
          setExistingSkus(response.data.skus);
        }
      } catch (error) {
        console.error("Error fetching existing SKUs:", error);
      }
    };
    
    fetchExistingSkus();
  }, []);

  // Function to generate a random 3-digit number
  const generateRandomNumber = () => {
    // Generate a random number between 100 and 999
    return Math.floor(Math.random() * 900) + 100;
  };

  // Generate SKU when title changes
  useEffect(() => {
    if (formData.title) {
      generateSkuFromTitle(formData.title);
    }
  }, [formData.title]);

  // Function to generate SKU from title
  const generateSkuFromTitle = (title) => {
    const skuPrefix = "SKU";
    
    // Remove spaces and take first 3 letters
    const titlePart = title
      .replace(/\s+/g, '') // Remove all whitespace
      .substring(0, 3)     // Take first 3 letters
      .toUpperCase();      // Convert to uppercase
    
    // Generate random number for SKU suffix (100-999)
    const randomNum = generateRandomNumber();
    
    const generatedSku = `${skuPrefix}${titlePart}${randomNum}`;
    
    setFormData(prevData => ({
      ...prevData,
      sku: generatedSku
    }));
  };

  // Regenerate SKU if needed (can be called manually)
  const regenerateSku = () => {
    if (formData.title) {
      generateSkuFromTitle(formData.title);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.title || !formData.sku || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const loadingToast = toast.loading("Adding product...");
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();

      // Add basic product information
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("sku", formData.sku);
      formPayload.append("category", formData.category);
      formPayload.append("stock", formData.stock.toString());
      formPayload.append("isActive", formData.isActive.toString());
      formPayload.append("isDefault", "true");

      // Add color data
      const color = formData.colors[0];
      formPayload.append("colorName", color.colorName || "Default");
      formPayload.append("hexCode", color.hexCode || "#000000");

      // Add specifications
      const validSpecs = formData.specifications.filter(
        (spec) => spec.key && spec.value
      );
      formPayload.append("specifications", JSON.stringify(validSpecs));

      // Add images
      if (color.images && color.images.length > 0) {
        color.images.forEach((imgObj) => {
          formPayload.append("image", imgObj.file);
        });
      }

      console.log("Sending product data to server...");

      const response = await axiosInstance.post("/products", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      toast.dismiss(loadingToast);
      toast.success("Product added successfully!");
      setTimeout(() => {
        onProductAdded();
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error adding product:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Server error occurred";
          
        // If the error is due to duplicate SKU, regenerate it
        if (error.response.status === 409 || 
            errorMessage.toLowerCase().includes("duplicate") || 
            errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("sku")) {
          toast.error("SKU already exists. Generating a new one...");
          regenerateSku();
        } else {
          toast.error(`Failed to add product: ${errorMessage}`);
        }
      } else if (error.request) {
        toast.error("No response from server. Check your network connection.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (files) => {
    if (!files || files.length === 0) return;

    const newColors = [...formData.colors];
    const uploadedImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    newColors[0].images = [
      ...newColors[0].images,
      ...uploadedImages,
    ];
    setFormData({ ...formData, colors: newColors });
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

  const handleColorChange = (field, value) => {
    const newColors = [...formData.colors];
    newColors[0][field] = value;
    setFormData({ ...formData, colors: newColors });
  };

  const removeImage = (imageIndex) => {
    const newColors = [...formData.colors];
    const imageToRemove = newColors[0].images[imageIndex];
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    newColors[0].images.splice(imageIndex, 1);
    setFormData({ ...formData, colors: newColors });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              type="button"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex">
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full p-2 border rounded-l"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={regenerateSku}
                    className="bg-blue-500 text-white px-3 rounded-r hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSubmitting || !formData.title}
                    title="Generate new SKU"
                  >
                    🔄
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: SKU[FIRST3LETTERS][RANDOM]. Click 🔄 to generate a new random number.
                </p>
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

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Color & Images</h3>
              <div className="mb-6 p-4 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Color Name
                    </label>
                    <input
                      type="text"
                      value={formData.colors[0].colorName}
                      onChange={(e) =>
                        handleColorChange("colorName", e.target.value)
                      }
                      className="w-full p-2 border rounded"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hex Code
                    </label>
                    <input
                      type="color"
                      value={formData.colors[0].hexCode}
                      onChange={(e) =>
                        handleColorChange("hexCode", e.target.value)
                      }
                      className="w-full h-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleImageUpload(e.target.files)
                    }
                    className="mb-4"
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-wrap gap-4">
                    {formData.colors[0].images.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative">
                        <img
                          src={image.preview}
                          alt={`Preview ${imageIndex}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(imageIndex)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                          disabled={isSubmitting}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;