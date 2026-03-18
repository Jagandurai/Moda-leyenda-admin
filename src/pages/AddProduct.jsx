/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import axios from "axios";
import { backendURL } from "../constants.js";
import { toast } from "react-toastify";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const AddProduct = ({ token: propToken }) => {
  const token = propToken || localStorage.getItem("token");

  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState("");
  const [sizes, setSizes] = useState([]);
  const [fewItemsLeft, setFewItemsLeft] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [productCode, setProductCode] = useState("");

  // ✅ Fetch categories dynamically from backend
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/category/list`, {
        headers: { token },
      });
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🧩 When a category is selected → show its subcategories
  useEffect(() => {
    if (category) {
      const selected = categories.find((c) => c.name === category);
      setSubCategories(selected?.subCategories || []);
      setSubCategory("");
      setType("");
      setTypes([]);
    }
  }, [category, categories]);

  // 🧩 When a subcategory is selected → show its types
  useEffect(() => {
    if (subCategory && category) {
      const selectedCategory = categories.find((c) => c.name === category);
      const selectedSub = selectedCategory?.subCategories.find(
        (s) => s.name === subCategory
      );
      setTypes(selectedSub?.types || []);
      setType("");
    }
  }, [subCategory, category, categories]);

  // ✅ Calculate discount percentage
  const calculateDiscount = (mrp, selling) => {
    const original = Number(mrp);
    const discounted = Number(selling);
    if (!original || !discounted || discounted >= original) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  // ✅ Image upload handler
  const handleImage = (file, index) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 10MB");
      return;
    }
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  // ✅ Submit product
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!token) return toast.error("Unauthorized. Please login again.");
    if (!images.some(Boolean)) return toast.error("At least one image is required");
    if (!category || !subCategory || !type)
      return toast.error("Please select category, subcategory, and type");
    if (Number(discountPrice) > Number(originalPrice))
      return toast.error("Discount price cannot exceed MRP");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("type", type);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("fewItemsLeft", fewItemsLeft);
      formData.append("bestseller", bestseller);
      formData.append(
        "price",
        JSON.stringify({
          original: Number(originalPrice),
          discounted: Number(discountPrice),
          discountPercent: Number(discountPercent),
        })
      );

      images.forEach((img, i) => img && formData.append(`image${i + 1}`, img));

      const loadingToast = toast.loading("Uploading product...");
      const res = await axios.post(`${backendURL}/api/product/add`, formData, {
        headers: { token },
      });
      toast.dismiss(loadingToast);

      if (res.data.success) {
        toast.success(res.data.message);
        setProductCode(res.data.product.productCode);

        // Reset
        setName("");
        setDescription("");
        setOriginalPrice("");
        setDiscountPrice("");
        setDiscountPercent(0);
        setSizes([]);
        setImages([null, null, null, null]);
        setFewItemsLeft(false);
        setBestseller(false);
        setType("");
        setSubCategory("");
        setCategory("");
      } else toast.error(res.data.message);
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong while adding product");
    }
  };

  // ✅ UI
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <form
        onSubmit={onSubmitHandler}
        className="w-full px-1 sm:px-8 lg:px-12 py-8"
      >
        <div className="w-full p-2 sm:p-8 lg:p-10 rounded-xl shadow-sm flex flex-col gap-6">
          {/* Upload Images */}
          <div>
            <p className="font-semibold mb-4 text-lg">Upload Images</p>
            <div className="flex gap-4 flex-wrap">
              {images.map((img, i) => (
                <label key={i} className="cursor-pointer">
                  <img
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover border rounded-lg hover:shadow-md transition"
                    src={img ? URL.createObjectURL(img) : assets.upload_area}
                    alt="upload"
                  />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImage(e.target.files[0], i)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            className="border px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Description */}
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product Description"
            className="border px-4 py-3 rounded-lg min-h-[120px] w-full focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* Dynamic Category / Subcategory / Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              required
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select Type</option>
              {types.map((t) => (
                <option key={t._id || t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="number"
              required
              placeholder="MRP"
              value={originalPrice}
              onChange={(e) => {
                setOriginalPrice(e.target.value);
                setDiscountPercent(
                  calculateDiscount(e.target.value, discountPrice)
                );
              }}
              className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="number"
              required
              placeholder="Discount Price"
              value={discountPrice}
              onChange={(e) => {
                setDiscountPrice(e.target.value);
                setDiscountPercent(
                  calculateDiscount(originalPrice, e.target.value)
                );
              }}
              className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              disabled
              value={`${discountPercent}%`}
              className="border px-4 py-3 rounded-lg bg-gray-100"
            />
          </div>

          {/* Sizes */}
          <div>
            <p className="font-semibold mb-3">Available Sizes</p>
            <div className="flex gap-3 flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <span
                  key={size}
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(size)
                        ? prev.filter((s) => s !== size)
                        : [...prev, size]
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition ${
                    sizes.includes(size)
                      ? "bg-black text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
            <label className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={fewItemsLeft}
                onChange={() => setFewItemsLeft((p) => !p)}
                className="w-4 h-4"
              />
              Few Items Left
            </label>
            <label className="flex gap-3 items-center">
              <input
                type="checkbox"
                checked={bestseller}
                onChange={() => setBestseller((p) => !p)}
                className="w-4 h-4"
              />
              Top Selling
            </label>
          </div>

          {productCode && (
            <p className="text-green-600 font-semibold bg-green-50 p-3 rounded-lg">
              Generated Product Code: {productCode}
            </p>
          )}

          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg w-full sm:w-56 hover:opacity-90 transition"
          >
            ADD PRODUCT
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;