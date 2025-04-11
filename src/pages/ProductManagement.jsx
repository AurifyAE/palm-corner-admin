import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { getAllProducts, getCategories, deleteProduct } from "../api/api";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import ConfirmationModal from "../components/ConfirmationModal";

function ProductManagement() {
  const title = "Product Management";
  const description = "Add, Edit, Delete Your Products";
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async (page, limit) => {
    setIsLoading(true);
    try {
      const response = await getAllProducts({ page, limit });
      const productData = response.data.data || [];
      const totalItems = productData.length;

      console.log("API Response:", response);
      console.log(
        "Fetched Products:",
        productData.length,
        "Total:",
        totalItems
      );

      // Since API doesn't paginate, store all products and slice manually
      setAllProducts(productData);
      applySearchAndPagination(productData, searchTerm, page, limit);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
      setAllProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchAndPagination = (productData, search, page, limit) => {
    // Filter products based on search term
    const filteredProducts = search 
      ? productData.filter(product => 
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase()) ||
          (product.category && product.category.name && 
            product.category.name.toLowerCase().includes(search.toLowerCase()))
        )
      : productData;
    
    const totalFilteredItems = filteredProducts.length;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setTotalPages(Math.max(1, Math.ceil(totalFilteredItems / limit)));
    
    console.log(
      "Applied Search and Pagination:",
      "Search Term:", search,
      "Filtered Count:", totalFilteredItems,
      "Page Products:", paginatedProducts.length
    );
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Handle search term changes
  useEffect(() => {
    if (allProducts.length > 0) {
      // Reset to first page when searching
      applySearchAndPagination(allProducts, searchTerm, 1, itemsPerPage);
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleProductAdded = () => {
    fetchProducts(currentPage, itemsPerPage);
    setShowAddModal(false);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      fetchProducts(currentPage, itemsPerPage); // Refresh the list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-gradient-to-r from-[#E9FAFF] to-[#EEF3F9] min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: { background: "#10B981", color: "white" },
            duration: 3000,
          },
          error: {
            style: { background: "#EF4444", color: "white" },
            duration: 3000,
          },
          loading: { style: { background: "#3B82F6", color: "white" } },
        }}
      />

      <Header title={title} description={description} />

      <div className="px-16">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Product
          </button>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <ProductTable
          products={products}
          categories={categories}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={isLoading}
          onDeleteProduct={handleDeleteProduct}
          searchTerm={searchTerm}
        />

        {showAddModal && (
          <AddProductModal
            categories={categories}
            onClose={() => setShowAddModal(false)}
            onProductAdded={handleProductAdded}
          />
        )}
      </div>
    </div>
  );
}

const ProductTable = ({
  products,
  categories,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading,
  onDeleteProduct,
  searchTerm
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find((cat) => cat._id === categoryId._id);
    return category ? category.name : "N/A";
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    const halfRange = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const toggleRow = (productId) => {
    setExpandedRow(expandedRow === productId ? null : productId);
  };
  
  // Get the total number of filtered results
  const filteredResultsCount = products.length > 0 && totalPages > 0 
    ? (totalPages - 1) * itemsPerPage + products.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Product List</h2>
      
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredResultsCount === 0 
            ? "No results found" 
            : `Found ${filteredResultsCount} results for "${searchTerm}"`}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-4">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-4">
          {searchTerm ? `No products matching "${searchTerm}" found.` : "No products available."}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <ConfirmationModal
              isOpen={!!deletingProduct}
              onConfirm={() => {
                onDeleteProduct(deletingProduct);
                setDeletingProduct(null);
              }}
              onCancel={() => setDeletingProduct(null)}
              message="Are you sure you want to delete this product? This action cannot be undone."
            />

            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-4"></th>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">SKU</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Active</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <React.Fragment key={product._id}>
                    <tr className="border-b cursor-pointer hover:bg-gray-50">
                      <td
                        className="p-4"
                        onClick={() => toggleRow(product._id)}
                      >
                        <button
                          className="text-gray-600 hover:text-gray-800 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(product._id);
                          }}
                        >
                          {expandedRow === product._id ? "▼" : "▶"}
                        </button>
                      </td>
                      <td className="p-4">{product.title}</td>
                      <td className="p-4">{product.sku}</td>
                      <td className="p-4">
                        {getCategoryName(product.category)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded ${
                            product.stock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded ${
                            product.isActive
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 mr-4"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProduct(product._id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedRow === product._id && (
                      <tr className="bg-gray-100">
                        <td colSpan="7" className="p-4">
                          <div className="flex flex-col gap-4">
                            <div>
                              <strong>Colors:</strong>
                              {product.colors && product.colors.length > 0 ? (
                                <div className="mt-2">
                                  {product.colors.map((color, index) => (
                                    <div key={color._id} className="mb-4">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-5 h-5 rounded-full inline-block"
                                          style={{
                                            backgroundColor: color.hexCode,
                                          }}
                                        ></span>
                                        <span>{color.colorName}</span>
                                        {color.isDefault && (
                                          <span className="text-sm text-gray-600">
                                            (Default)
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-2 mt-2 flex-wrap">
                                        {color.images.map((image, imgIndex) => (
                                          <img
                                            key={image._id}
                                            src={image.url}
                                            alt={`${color.colorName} image ${
                                              imgIndex + 1
                                            }`}
                                            className="w-20 h-20 object-cover rounded border"
                                            onError={(e) =>
                                              (e.target.src =
                                                "https://via.placeholder.com/80?text=No+Image")
                                            }
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                " No colors available"
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              Showing {products.length} of {filteredResultsCount} products
              {searchTerm && ` matching "${searchTerm}"`}
              {` (Page ${currentPage} of ${totalPages})`}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center">
                <label className="mr-2 font-medium">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={onItemsPerPageChange}
                  className="border rounded px-2 py-1"
                  disabled={isLoading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
            </div>
          </div>

          {selectedProduct && (
            <EditProductModal
              productId={selectedProduct._id}
              categories={categories}
              onClose={() => setSelectedProduct(null)}
              onProductUpdated={() => {
                fetchProducts(currentPage, itemsPerPage);
                setSelectedProduct(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagement;