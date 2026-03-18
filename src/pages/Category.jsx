import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
});

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // assuming admin token stored here
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/category/list");
      if (res.data.success) setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      toast.error("Failed to fetch categories");
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ Add Category
  const handleAddCategory = async () => {
    if (!newCategory) return toast.error("Enter a category name");
    try {
      const res = await api.post("/api/category/add", { name: newCategory });
      if (res.data.success) {
        toast.success("Category added!");
        setNewCategory("");
        fetchCategories();
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  // ➕ Add SubCategory
  const handleAddSubCategory = async () => {
    if (!selectedCategoryId || !newSubCategory)
      return toast.error("Select category and enter subcategory name");
    try {
      const res = await api.post("/api/category/add-subcategory", {
        categoryId: selectedCategoryId,
        subCategoryName: newSubCategory,
      });
      if (res.data.success) {
        toast.success("Subcategory added!");
        setNewSubCategory("");
        fetchCategories();
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add subcategory");
    }
  };

  // ➕ Add Type
  const handleAddType = async () => {
    if (!selectedCategoryId || !selectedSubCategoryId || !newType)
      return toast.error("Select subcategory and enter type name");
    try {
      const res = await api.post("/api/category/add-type", {
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
        typeName: newType,
      });
      if (res.data.success) {
        toast.success("Type added!");
        setNewType("");
        fetchCategories();
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add type");
    }
  };

  // 🧩 Hide / Unhide Category
  const toggleCategoryHide = async (categoryId) => {
    try {
      const cat = categories.find((c) => c._id === categoryId);
      const newHiddenState = !cat?.isHidden;

      await api.patch(`/api/category/${categoryId}/toggle`, {
        isHidden: newHiddenState,
      });

      toast.success(newHiddenState ? "Category hidden" : "Category unhidden");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle category visibility");
    }
  };

  // 🗑 Delete Category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/api/category/${categoryId}`);
      toast.success("Category deleted");
      setSelectedCategoryId("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // 🧩 Hide / Unhide Subcategory
  const toggleSubCategoryHide = async (categoryId, subCategoryId) => {
    try {
      const cat = categories.find((c) => c._id === categoryId);
      const sub = cat?.subCategories.find((s) => s._id === subCategoryId);
      const newHiddenState = !sub?.isHidden;

      await api.patch(
        `/api/category/${categoryId}/subcategory/${subCategoryId}/toggle`,
        { isHidden: newHiddenState }
      );

      toast.success(newHiddenState ? "Subcategory hidden" : "Subcategory unhidden");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle subcategory visibility");
    }
  };

  // 🧩 Hide / Unhide Type
  const toggleTypeHide = async (categoryId, subCategoryId, typeId) => {
    try {
      const cat = categories.find((c) => c._id === categoryId);
      const sub = cat?.subCategories.find((s) => s._id === subCategoryId);
      const type = sub?.types.find((t) => t._id === typeId);
      const newHiddenState = !type?.isHidden;

      await api.patch(
        `/api/category/${categoryId}/subcategory/${subCategoryId}/type/${typeId}/toggle`,
        { isHidden: newHiddenState }
      );

      toast.success(newHiddenState ? "Type hidden" : "Type unhidden");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle type visibility");
    }
  };

  // 🗑 Delete Subcategory
  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await api.delete(`/api/category/${categoryId}/subcategory/${subCategoryId}`);
      toast.success("Subcategory deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subcategory");
    }
  };

  // 🗑 Delete Type
  const handleDeleteType = async (categoryId, subCategoryId, typeId) => {
    if (!window.confirm("Are you sure you want to delete this type?")) return;
    try {
      await api.delete(
        `/api/category/${categoryId}/subcategory/${subCategoryId}/type/${typeId}`
      );
      toast.success("Type deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete type");
    }
  };



  return (
  <div className="p-3 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold mb-4 text-center sm:text-left">
      Category Management
    </h2>

    {/* ---------------- ADD CATEGORY ---------------- */}
    <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
      <input
        className="border p-2 rounded w-full sm:w-auto flex-1"
        placeholder="New Category"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded w-full sm:w-auto transition"
        onClick={handleAddCategory}
      >
        Add Category
      </button>

      {selectedCategoryId && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded w-full sm:w-auto transition shadow-sm"
            onClick={() => toggleCategoryHide(selectedCategoryId)}
          >
            {categories.find((c) => c._id === selectedCategoryId)?.isHidden
              ? `Unhide ${categories.find((c) => c._id === selectedCategoryId)?.name}`
              : `Hide ${categories.find((c) => c._id === selectedCategoryId)?.name}`}
          </button>

          <button
            className="bg-red-400 hover:bg-red-500 text-black px-4 py-2 rounded w-full sm:w-auto transition shadow-sm"
            onClick={() => handleDeleteCategory(selectedCategoryId)}
          >
            Delete Category
          </button>
        </div>
      )}
    </div>

    {/* ---------------- ADD SUBCATEGORY ---------------- */}
    <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-3">
      <select
        className="border p-2 rounded w-full sm:w-auto flex-1"
        value={selectedCategoryId}
        onChange={(e) => {
          setSelectedCategoryId(e.target.value);
          setSelectedSubCategoryId("");
        }}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        className="border p-2 rounded w-full sm:w-auto flex-1"
        placeholder="New SubCategory"
        value={newSubCategory}
        onChange={(e) => setNewSubCategory(e.target.value)}
      />
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded w-full sm:w-auto transition"
        onClick={handleAddSubCategory}
      >
        Add SubCategory
      </button>

      {selectedCategoryId && selectedSubCategoryId && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded w-full sm:w-auto transition shadow-sm"
            onClick={() =>
              toggleSubCategoryHide(selectedCategoryId, selectedSubCategoryId)
            }
          >
            {(() => {
              const sub = categories
                .find((c) => c._id === selectedCategoryId)
                ?.subCategories.find((s) => s._id === selectedSubCategoryId);
              return sub?.isHidden ? `Unhide ${sub?.name}` : `Hide ${sub?.name}`;
            })()}
          </button>
          <button
            className="bg-red-400 hover:bg-red-500 text-black px-4 py-2 rounded w-full sm:w-auto transition shadow-sm"
            onClick={() =>
              handleDeleteSubCategory(selectedCategoryId, selectedSubCategoryId)
            }
          >
            Delete
          </button>
        </div>
      )}
    </div>

    {/* ---------------- ADD TYPE ---------------- */}
    <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-3">
      <select
        className="border p-2 rounded w-full sm:w-auto flex-1"
        value={selectedCategoryId}
        onChange={(e) => {
          setSelectedCategoryId(e.target.value);
          setSelectedSubCategoryId("");
        }}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        className="border p-2 rounded w-full sm:w-auto flex-1"
        value={selectedSubCategoryId}
        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
      >
        <option value="">Select SubCategory</option>
        {selectedCategoryId &&
          categories
            .find((cat) => cat._id === selectedCategoryId)
            ?.subCategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
      </select>

      <input
        className="border p-2 rounded w-full sm:w-auto flex-1"
        placeholder="New Type"
        value={newType}
        onChange={(e) => setNewType(e.target.value)}
      />
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded w-full sm:w-auto transition"
        onClick={handleAddType}
      >
        Add Type
      </button>
    </div>

    {/* ---------------- TYPE LIST & ACTIONS ---------------- */}
    {selectedCategoryId && selectedSubCategoryId && (
      <div className="flex flex-col sm:flex-row flex-wrap gap-4">
        {categories
          .find((c) => c._id === selectedCategoryId)
          ?.subCategories.find((s) => s._id === selectedSubCategoryId)
          ?.types.map((t) => (
            <div
              key={t._id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border border-black-200 bg-gray-200 p-4 rounded w-full sm:w-auto"
            >
              <button
                className={`px-3 py-2 rounded ${
                  t.isHidden
                    ? "bg-blue-300 hover:bg-green-400"
                    : "bg-green-400 hover:bg-green-500"
                } text-black transition shadow-sm`}
                onClick={() =>
                  toggleTypeHide(selectedCategoryId, selectedSubCategoryId, t._id)
                }
              >
                {t.isHidden ? "Unhide" : "Hide"} {t.name}
              </button>
              <button
                className="bg-red-500 hover:bg-red-400 text-black px-3 py-2 rounded transition shadow-sm"
                onClick={() =>
                  handleDeleteType(selectedCategoryId, selectedSubCategoryId, t._id)
                }
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    )}
  </div>
);
};

export default Category;