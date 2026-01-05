import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, ApiError } from "../api/client";
import { Layout } from "../components/Layout";

interface Item {
  id: number;
  name: string;
  description: string;
  sku: string;
  created_at: string;
}

interface StockLevel {
  item_id: number;
  item_name: string;
  location_id: number;
  location_name: string;
  current_quantity: number;
  last_updated: string;
}

interface StockLedgerEntry {
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

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [movements, setMovements] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItemData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const itemId = parseInt(id, 10);

        // Load item details
        const itemData = await apiClient.getItem(itemId);
        setItem(itemData);

        // Load current stock levels for this item
        const stockData = await apiClient.getCurrentStock();
        const itemStock = stockData.filter((stock) => stock.item_id === itemId);
        setStockLevels(itemStock);
        // Load movement history for this item
        const movementData = await apiClient.getStockLedger({
          item_id: itemId,
          limit: 20,
        });
        setMovements(movementData);
      } catch (err) {
        console.error("Failed to load item data:", err);
        if (err instanceof ApiError && err.status === 404) {
          setError("Item not found");
        } else {
          setError("Failed to load item data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadItemData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500">Loading item details...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate("/items")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Items
          </button>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Item not found</div>
          <button
            onClick={() => navigate("/items")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Items
          </button>
        </div>
      </Layout>
    );
  }

  const totalQuantity = stockLevels.reduce(
    (sum, stock) => sum + stock.current_quantity,
    0
  );

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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">SKU: {item.sku}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/transactions/new?item=${item.id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              New Transaction
            </button>
            <button
              onClick={() => navigate("/items")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Items
            </button>
          </div>
        </div>

        {/* Item Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Item Information
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{item.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                <dd className="mt-1 text-sm text-gray-900">{item.sku}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.description || "No description"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(item.created_at).toLocaleString()}
                </dd>
              </div>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Stock Summary
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total On Hand
                </dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {totalQuantity}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Locations</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {stockLevels.length} location(s)
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Stock by Location */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock by Location
            </h2>
          </div>

          {stockLevels.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No stock records found. This item has not been received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockLevels.map((stock) => (
                    <tr key={`${stock.item_id}-${stock.location_id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.location_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stock.current_quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(stock.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Movement History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Movement History
            </h2>
          </div>

          {movements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No movement history found. This item has not had any transactions
              yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {getTransactionIcon(movement.transaction_type)}
                          </span>
                          <span
                            className={`text-sm font-medium ${getTransactionColor(
                              movement.transaction_type
                            )}`}
                          >
                            {movement.transaction_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            movement.quantity > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movement.quantity > 0 ? "+" : ""}
                          {movement.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {movement.running_balance}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {movement.notes || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.created_at).toLocaleString()}
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
