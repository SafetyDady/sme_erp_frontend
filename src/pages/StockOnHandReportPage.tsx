import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { apiClient } from "../api/client";

interface StockOnHandItem {
  item_id: number;
  item_name: string;
  location_id: number;
  location_name: string;
  current_quantity: string | number;
  last_updated: string;
}

interface Location {
  id: number;
  name: string;
  code: string;
}

export const StockOnHandReportPage: React.FC = () => {
  const [data, setData] = useState<StockOnHandItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedLocation, setSelectedLocation] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [selectedLocation, itemSearch]);

  const loadInitialData = async () => {
    try {
      const locationsData = await apiClient.getLocations();
      setLocations(locationsData);
    } catch (err) {
      console.error("Failed to load locations:", err);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const stockData = await apiClient.getCurrentStock();
      let filteredData = stockData;

      // Apply location filter
      if (selectedLocation) {
        filteredData = filteredData.filter(
          (item) => item.location_id.toString() === selectedLocation
        );
      }

      // Apply item search filter
      if (itemSearch.trim()) {
        const searchTerm = itemSearch.toLowerCase().trim();
        filteredData = filteredData.filter((item) =>
          item.item_name.toLowerCase().includes(searchTerm)
        );
      }

      setData(filteredData);
    } catch (err) {
      console.error("Failed to load stock data:", err);
      setError("Failed to load stock on hand report");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";

    const headers = [
      "Item Name",
      "Location",
      "Current Quantity",
      "Last Updated",
    ];

    const csvRows = [
      headers.join(","),
      ...data.map((item) =>
        [
          `"${item.item_name}"`,
          `"${item.location_name}"`,
          (Number(item.current_quantity) || 0).toFixed(2),
          `"${new Date(item.last_updated).toISOString()}"`,
        ].join(",")
      ),
    ];

    const csvContent = BOM + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stock-on-hand-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalQuantity = data.reduce(
    (sum, item) => sum + (Number(item.current_quantity) || 0),
    0
  );
  const uniqueItems = new Set(data.map((item) => item.item_id)).size;
  const uniqueLocations = new Set(data.map((item) => item.location_id)).size;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Stock On Hand Report
          </h1>
          <button
            onClick={exportToCSV}
            disabled={data.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">
              Total Quantity
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {totalQuantity.toFixed(2)}
            </dd>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Unique Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {uniqueItems}
            </dd>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Locations</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {uniqueLocations}
            </dd>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="itemSearch"
                className="block text-sm font-medium text-gray-700"
              >
                Item Search
              </label>
              <input
                type="text"
                id="itemSearch"
                placeholder="Search item name..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Report Data */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock On Hand
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading report...
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600">{error}</div>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No stock data found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={`${item.item_id}-${item.location_id}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.item_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.location_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(Number(item.current_quantity) || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
