import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendURL } from "../constants";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaCheck, FaMinus, FaPlus } from "react-icons/fa";

const ListProduct = ({ token: propToken }) => {
  const token = propToken || localStorage.getItem("token");
  const authHeaders = { token, Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);  
  const itemsPerPage = 15; // adjust per page

  // 🔍 FILTER STATES
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSubCategory, setSearchSubCategory] = useState("");
  const [searchProductId, setSearchProductId] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/product/list`);
      if (res.data.success) {
        const updated = res.data.products.map((p) => ({
          ...p,
          fewItemsLeft: Boolean(p.fewItemsLeft),
          bestseller: Boolean(p.bestseller),
          inStock: p.inStock !== false,
          productCode: p.productCode || "",
        }));
        setProducts(updated);
        setFilteredProducts(updated);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  // Calculate pagination
const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);



/* ---------------- FILTER + SORT ---------------- */
useEffect(() => {
  let updated = [...products];

  if (searchCategory) {
    updated = updated.filter(
      (item) => item.category === searchCategory
    );
  }

  if (searchSubCategory) {
    updated = updated.filter(
      (item) => item.subCategory === searchSubCategory
    );
  }

  if (searchProductId.trim() !== "") {
    updated = updated.filter((item) =>
      item.productCode
        ?.toLowerCase()
        .includes(searchProductId.toLowerCase())
    );
  }

  if (sortOrder === "latest") {
    updated.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else {
    updated.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  // Update filtered products
  setFilteredProducts(updated);

  // Reset to first page when filters or sort change
  setCurrentPage(1);
}, [
  products,
  searchCategory,
  searchSubCategory,
  searchProductId,
  sortOrder,
]);
  /* ---------------- TOGGLE FEW ITEMS ---------------- */
const toggleFewItemsLeft = async (product) => {
  // 🚫 Prevent clicking when Out of Stock
  if (!product.inStock) {
    toast.error("Product is out of stock");
    return;
  }

  try {
    const newStatus = !product.fewItemsLeft;

    const res = await axios.post(
      `${backendURL}/api/product/toggle-few-items`,
      { productId: product._id, status: newStatus },
      { headers: authHeaders }
    );

    if (res.data.success) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, fewItemsLeft: newStatus }
            : p
        )
      );
      toast.success("Few Items updated");
    }
  } catch {
    toast.error("Update failed");
  }
};

  /* ---------------- TOGGLE BESTSELLER ---------------- */
  const toggleBestseller = async (product) => {
    try {
      const newStatus = !product.bestseller;

      const res = await axios.post(
        `${backendURL}/api/product/toggle-bestseller`,
        { productId: product._id, status: newStatus },
        { headers: authHeaders }
      );

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id
              ? { ...p, bestseller: newStatus }
              : p
          )
        );
        toast.success("Top Selling updated");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ---------------- TOGGLE IN STOCK ---------------- */
  const toggleInStock = async (product) => {
    try {
      const newStatus = !product.inStock;

      const res = await axios.post(
        `${backendURL}/api/product/toggle-instock`,
        { productId: product._id, status: newStatus },
        { headers: authHeaders }
      );

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id
              ? {
                  ...p,
                  inStock: newStatus,
                  fewItemsLeft: newStatus ? p.fewItemsLeft : false,
                }
              : p
          )
        );
        toast.success("Stock updated");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ---------------- DELETE PRODUCT ---------------- */
  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await axios.post(
        `${backendURL}/api/product/remove`,
        { id: productId },
        { headers: authHeaders }
      );

      if (res.data.success) {
        setProducts((prev) =>
          prev.filter((p) => p._id !== productId)
        );
        toast.success("Product deleted");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- PRICE EDIT ---------------- */
  const startEditPrice = (product) => {
    setEditingPriceId(product._id);
    setTempPrice(product.price.discounted);
  };

  const savePrice = async (productId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/product/update-price`,
        { productId, price: tempPrice },
        { headers: authHeaders }
      );

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId
              ? { ...p, price: { ...p.price, discounted: tempPrice } }
              : p
          )
        );
        setEditingPriceId(null);
        toast.success("Price updated");
      }
    } catch {
      toast.error("Price update failed");
    }
  };

  /* ---------------- SHORTEN PRODUCT NAME ---------------- */
  const formatName = (name) => {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    }
    return name;
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        Product List
      </h2>

      {/* 🔍 FILTER SECTION */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="">All Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>

        <select
          value={searchSubCategory}
          onChange={(e) => setSearchSubCategory(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="">All Type</option>
          <option value="Topwear">Topwear</option>
          <option value="Bottomwear">Bottomwear</option>
          <option value="Sportswear">Sportswear</option>
        </select>

        <input
          type="text"
          placeholder="Search Product ID"
          value={searchProductId}
          onChange={(e) =>
            setSearchProductId(e.target.value)
          }
          className="border px-3 py-2 rounded-lg text-sm flex-1"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Sub</th>
              <th className="p-2">Price</th>
              <th className="p-2">Few</th>
              <th className="p-2">Top</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="p-2 text-center font-mono text-[10px]">
                  {product.productCode}
                </td>

                <td className="p-2">
                  <img
                    src={product.image?.[0]}
                    alt=""
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>

                <td className="p-2 break-words max-w-[120px]">
                  {formatName(product.name)}
                </td>

                <td className="p-2">{product.category}</td>
                <td className="p-2">{product.subCategory}</td>

                <td className="p-2">
                  {editingPriceId === product._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setTempPrice((p) => Math.max(0, p - 10))
                        }
                      >
                        <FaMinus />
                      </button>

                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) =>
                          setTempPrice(Number(e.target.value))
                        }
                        className="w-16 border rounded text-center"
                      />

                      <button
                        onClick={() =>
                          setTempPrice((p) => p + 10)
                        }
                      >
                        <FaPlus />
                      </button>

                      <button
                        onClick={() =>
                          savePrice(product._id)
                        }
                      >
                        <FaCheck className="text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      ₹{product.price.discounted}
                      <button
                        onClick={() =>
                          startEditPrice(product)
                        }
                      >
                        <FaEdit className="text-blue-600" />
                      </button>
                    </div>
                  )}
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() => toggleFewItemsLeft(product)}
                    disabled={!product.inStock}
                    className={`px-2 py-1 rounded text-white text-xs ${
                      !product.inStock
                        ? "bg-green-600 opacity-50 cursor-not-allowed"
                        : product.fewItemsLeft
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  >
                    {!product.inStock
                      ? "N/A"
                      : product.fewItemsLeft
                      ? "Remove"
                      : "Add"}
                  </button>
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      toggleBestseller(product)
                    }
                    className={`px-2 py-1 rounded text-white text-xs ${
                      product.bestseller
                        ? "bg-yellow-600"
                        : "bg-gray-500"
                    }`}
                  >
                    {product.bestseller
                      ? "Remove"
                      : "Add"}
                  </button>
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      toggleInStock(product)
                    }
                    className={`px-2 py-1 rounded text-white text-xs ${
                      product.inStock
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {product.inStock
                      ? "In"
                      : "Out"}
                  </button>
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      deleteProduct(product._id)
                    }
                  >
                    <FaTrash className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p className="text-center py-6 text-gray-500">
            No products found
          </p>
          
        )}
        

        {/* PAGINATION */}
<div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
  {/* Small screens */}
  <div className="flex flex-1 justify-between sm:hidden">
    <button
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
      disabled={currentPage === 1}
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>

  {/* Larger screens */}
  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
    <div>
      <p className="text-sm text-gray-800">
        Showing{" "}
        <span className="font-medium">
          {indexOfFirstItem + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(indexOfLastItem, filteredProducts.length)}
        </span>{" "}
        of{" "}
        <span className="font-medium">
          {filteredProducts.length}
        </span>{" "}
        results
      </p>
    </div>
    <div>
      <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md">
        {/* Previous button */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:bg-white/5"
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:outline-none ${
                  page === currentPage
                    ? "bg-indigo-500 text-white"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            );
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span
                key={i}
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400"
              >
                ...
              </span>
            );
          } else {
            return null;
          }
        })}

        {/* Next button */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:bg-white/5"
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</div>


      </div>
    </div>
  );
};

export default ListProduct;