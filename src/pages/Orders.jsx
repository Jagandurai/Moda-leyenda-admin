/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { backendURL } from "../constants";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("All");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");       

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [expandedOrder, setExpandedOrder] = useState(null);

  /* ================= INR FORMATTER ================= */
  const formatINR = (value) => {
    if (!value) return "₹0";
    const amount = Number(value) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  /* ================= FETCH ================= */
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendURL}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Order Fetch Error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  /* ================= STATUS UPDATE ================= */
  const statusHandler = async (event, orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendURL}/api/order/update-order-status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order status updated");
        fetchAllOrders();
      }
    } catch (error) {
      console.log("Status Update Error:", error.response?.data || error.message);
    }
  };

  /* ================= COPY HANDLERS ================= */
  const copyProductId = (productId) => {
    navigator.clipboard.writeText(productId);
    toast.success("Product ID copied!");
  };

  const copyAddress = (address) => {
    if (!address) return;
    const text = `${address.name}\n${address.phone}\n${address.address}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode}`;
    navigator.clipboard.writeText(text);
    toast.success("Address copied!");
  };

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    let data = [...orders];
    const term = searchTerm.toLowerCase();

    if (term) {
      data = data.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.address?.name?.toLowerCase().includes(term) ||
          order.address?.phone?.includes(term)
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((order) => order.status === statusFilter);
    }

    data.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Filter by start date
if (startDate) {
  data = data.filter(
    (order) => new Date(order.createdAt) >= new Date(startDate)
  );
}

// Filter by end date
if (endDate) {
  data = data.filter(
    (order) => new Date(order.createdAt) <= new Date(endDate)
  );
}

    return data;
  }, [orders, searchTerm, sortOrder, statusFilter, startDate, endDate]);

  /* ================= DASHBOARD COUNTS ================= */
  const dashboardStats = useMemo(() => {
    const placed = orders.filter(o => o.status === "Order Placed").length;
    const delivered = orders.filter(o => o.status === "Delivered").length;
    const cancelled = orders.filter(o => o.status === "Cancelled").length;

    const uniqueUsers = new Set(
      orders.map(o => o.userId?._id || o.userId)
    );

    return {
      placed,
      delivered,
      cancelled,
      activeUsers: uniqueUsers.size
    };
  }, [orders]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, statusFilter]);

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "returned":
        return "bg-pink-100 text-pink-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "out for delivery":
        return "bg-indigo-100 text-indigo-700";
      case "packing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Order List</h2>

        {/* ================= DASHBOARD CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setStatusFilter("Order Placed")}
            className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl cursor-pointer hover:shadow-md transition"
          >
            <p className="text-xs text-yellow-600 font-medium uppercase">
              Order Placed
            </p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {dashboardStats.placed}
            </p>
          </div>

          <div
            onClick={() => setStatusFilter("Delivered")}
            className="bg-green-50 border border-green-200 p-4 rounded-xl cursor-pointer hover:shadow-md transition"
          >
            <p className="text-xs text-green-600 font-medium uppercase">
              Delivered
            </p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {dashboardStats.delivered}
            </p>
          </div>

          <div
            onClick={() => setStatusFilter("Cancelled")}
            className="bg-red-50 border border-red-200 p-4 rounded-xl cursor-pointer hover:shadow-md transition"
          >
            <p className="text-xs text-red-600 font-medium uppercase">
              Cancelled
            </p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              {dashboardStats.cancelled}
            </p>
          </div>

          <div
            onClick={() => setStatusFilter("All")}
            className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl cursor-pointer hover:shadow-md transition"
          >
            <p className="text-xs text-indigo-600 font-medium uppercase">
              Active Users
            </p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {dashboardStats.activeUsers}
            </p>
          </div>
        </div>

        {/* 🔍 SEARCH & SORT BAR */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by Order ID, Name or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="All">All Orders</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
  
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm w-full sm:w-auto"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm w-full sm:w-auto"
              />
            </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* ================= ORDER LIST ================= */}
        {currentOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-5 rounded-xl shadow cursor-pointer"
            onClick={() =>
              setExpandedOrder(expandedOrder === order._id ? null : order._id)
            }
          >
            <div className="flex justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-lg">
                    Order ID: {order.orderNumber}
                  </h4>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedOrder(
                    expandedOrder === order._id ? null : order._id
                  );
                }}
                className="text-sm text-indigo-600 font-medium"
              >
                {expandedOrder === order._id ? "Hide Details" : "View Details"}
              </button>
            </div>

            {expandedOrder === order._id && (
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  {order.items?.map((item, i) => {
                    const productId =
                      typeof item?.productId === "object"
                        ? item?.productId?.productCode ||
                          item?.productId?._id
                        : item?.productCode ||
                          item?.productId ||
                          "N/A";

                    let priceValue = 0;
                    if (typeof item.price === "number") {
                      priceValue = item.price;
                    } else if (
                      typeof item.price === "object" &&
                      item.price !== null
                    ) {
                      priceValue =
                        item.price.discounted ||
                        item.price.original ||
                        Number(item.price) ||
                        0;
                    } else {
                      priceValue = Number(item.price) || 0;
                    }

                    return (
                      <div
                        key={i}
                        className="flex justify-between border-b pb-2 text-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-medium">
                            {item.name}
                          </span>

                          <span>Qty: {item.quantity}</span>

                          {item.size && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                              Size: {item.size}
                            </span>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>({productId})</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyProductId(productId);
                              }}
                              className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                            >
                              Copy Product ID
                            </button>
                          </div>
                        </div>

                        <div className="font-semibold">
                          {formatINR(priceValue)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border text-sm relative">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold mb-2">Shipping Details</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAddress(order.address);
                      }}
                      className="text-xs bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      Copy Address
                    </button>
                  </div>
                  <p>{order.address?.name}</p>
                  <p>{order.address?.phone}</p>
                  <p>
                    {order.address?.address}, {order.address?.locality}
                  </p>
                  <p>
                    {order.address?.city}, {order.address?.state} -{" "}
                    {order.address?.pincode}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <p className="font-bold text-lg">
                    Total: {formatINR(order.amount)}
                  </p>

                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="border px-3 py-2 rounded-md text-sm"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
        {/* ================= PAGINATION UI ================= */}
<div className="flex justify-center flex-wrap gap-2 mt-4">
  <button
    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => {
      // Mobile view: only show current ±1 page, plus first/last
      if (window.innerWidth < 640) {
        return Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
      }
      return true; // Desktop: show all pages
    })
    .map((page) => (
      <button
        key={page}
        className={`px-3 py-1 rounded text-sm ${
          currentPage === page ? "bg-indigo-500 text-white" : "bg-gray-200 hover:bg-gray-300"
        }`}
        onClick={() => handlePageChange(page)}
      >
        {page}
      </button>
    ))}

  <button
    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>
      </div>
    </div>
  );
};

export default Orders;