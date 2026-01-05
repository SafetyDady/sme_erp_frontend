import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { apiClient } from "../api/client";

interface MovementEntry {
  id: number;
  item_id: number;
  location_id: number;
  transaction_type: string;
  quantity: number;
  running_balance: number;
  notes: string;
  created_at: string;
  created_by: number;
}

interface Item {
  id: number;
  name: string;
  sku: string;
}

interface Location {
  id: number;
  name: string;
  code: string;
}

export const MovementReportPage: React.FC = () => {
  const [data, setData] = useState<MovementEntry[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [dateFrom, dateTo, selectedItem, selectedLocation]);

  const loadInitialData = async () => {
    try {
      const [itemsData, locationsData] = await Promise.all([
        apiClient.getItems(),
        apiClient.getLocations(),
      ]);
      setItems(itemsData);
      setLocations(locationsData);

      // Set default date range (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      setDateTo(today.toISOString().split("T")[0]);
      setDateFrom(thirtyDaysAgo.toISOString().split("T")[0]);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = { limit: 1000 };

      if (selectedItem) {
        params.item_id = parseInt(selectedItem, 10);
      }
      if (selectedLocation) {
        params.location_id = parseInt(selectedLocation, 10);
      }

      const movementData = await apiClient.getStockLedger(params);

      // Client-side date filtering (API doesn't support date range yet)
      let filteredData = movementData;

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredData = filteredData.filter(
          (entry) => new Date(entry.created_at) >= fromDate
        );
      }

      if (dateTo) {
        const toDate = new Date(dateTo + "T23:59:59.999Z");
        filteredData = filteredData.filter(
          (entry) => new Date(entry.created_at) <= toDate
        );
      }

      setData(filteredData);
    } catch (err) {
      console.error("Failed to load movement data:", err);
      setError("Failed to load movement report");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";

    const headers = [
      "Date",
      "Transaction Type",
      "Item ID",
      "Location ID",
      "Quantity",
      "Running Balance",
      "Notes",
      "Created By",
    ];

    const csvRows = [
      headers.join(","),
      ...data.map((entry) =>
        [
          `"${new Date(entry.created_at).toISOString()}"`,
          `"${entry.transaction_type}"`,
          entry.item_id,
          entry.location_id,
          entry.quantity,
          entry.running_balance,
          `"${entry.notes || ""}"`,
          entry.created_by,
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
      `movement-report-${dateFrom || "all"}-to-${dateTo || "all"}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "IN":
        return "⬆️";
      case "OUT":
        return "⬇️";
      case "TRANSFER":
        return "🔄";
      case "ADJUSTMENT":
        return "⚖️";
      default:
        return "📦";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "IN":
        return "text-green-600";
      case "OUT":
        return "text-red-600";
      case "TRANSFER":
        return "text-blue-600";
      case "ADJUSTMENT":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    return item ? `${item.name} (${item.sku})` : `Item #${itemId}`;
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find((l) => l.id === locationId);
    return location
      ? `${location.name} (${location.code})`
      : `Location #${locationId}`;
  };

  const totalTransactions = data.length;
  const totalIn = data
    .filter((d) => d.transaction_type === "IN")
    .reduce((sum, d) => sum + d.quantity, 0);
  const totalOut = data
    .filter((d) => d.transaction_type === "OUT")
    .reduce((sum, d) => sum + Math.abs(d.quantity), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Movement Report</h1>
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
              Total Transactions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {totalTransactions}
            </dd>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Total IN</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              +{totalIn.toFixed(2)}
            </dd>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Total OUT</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              -{totalOut.toFixed(2)}
            </dd>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700"
              >
                Date From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700"
              >
                Date To
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="item"
                className="block text-sm font-medium text-gray-700"
              >
                Item
              </label>
              <select
                id="item"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Items</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>
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
          </div>
        </div>

        {/* Report Data */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Movement History
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
              No movement data found for the selected date range and filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {getTransactionIcon(entry.transaction_type)}
                          </span>
                          <span
                            className={`text-sm font-medium ${getTransactionColor(
                              entry.transaction_type
                            )}`}
                          >
                            {entry.transaction_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getItemName(entry.item_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getLocationName(entry.location_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            entry.quantity > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.quantity > 0 ? "+" : ""}
                          {entry.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.running_balance}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {entry.notes || "-"}
                        </div>
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
