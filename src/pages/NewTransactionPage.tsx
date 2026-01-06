import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient, ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { useAuth } from "../auth/AuthContext";

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

type TransactionType = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";

export const NewTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preSelectedItemId = searchParams.get("item");

  const [transactionType, setTransactionType] = useState<TransactionType>("IN");

  // Form fields
  const [itemId, setItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  // Data
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, locationsData] = await Promise.all([
          apiClient.getItems(),
          apiClient.getLocations(),
        ]);
        setItems(itemsData);
        setLocations(locationsData);

        // Pre-select item if provided in URL
        if (
          preSelectedItemId &&
          itemsData.some((item) => item.id.toString() === preSelectedItemId)
        ) {
          setItemId(preSelectedItemId);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load items and locations");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseData = {
        item_id: parseInt(itemId, 10),
        quantity: parseFloat(quantity),
        notes: notes.trim() || "",
      };

      switch (transactionType) {
        case "IN":
          await apiClient.stockIn({
            ...baseData,
            location_id: parseInt(locationId, 10),
          });
          break;

        case "OUT":
          await apiClient.stockOut({
            ...baseData,
            location_id: parseInt(locationId, 10),
          });
          break;

        case "TRANSFER":
          await apiClient.stockTransfer({
            ...baseData,
            from_location_id: parseInt(fromLocationId, 10),
            to_location_id: parseInt(toLocationId, 10),
          });
          break;

        case "ADJUSTMENT":
          await apiClient.stockAdjustment({
            ...baseData,
            location_id: parseInt(locationId, 10),
          });
          break;
      }

      // Success - redirect to item detail page to show the result
      navigate(`/items/${itemId}`, {
        state: {
          message: `${transactionType} transaction completed successfully`,
        },
      });
    } catch (err) {
      console.error("Transaction failed:", err);
      if (err instanceof ApiError) {
        setError(`Transaction failed: ${err.message}`);
      } else {
        setError("Transaction failed. Please check your input and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setItemId("");
    setLocationId("");
    setFromLocationId("");
    setToLocationId("");
    setQuantity("");
    setNotes("");
    setError("");
  };

  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    resetForm();
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0 || locations.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            New Stock Transaction
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-medium text-yellow-900 mb-2">Setup Required</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Before creating transactions, you need:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 mb-4">
              {items.length === 0 && <li>• At least one item</li>}
              {locations.length === 0 && <li>• At least one location</li>}
            </ul>
            <div className="flex space-x-3">
              {items.length === 0 && (
                <button
                  onClick={() => navigate("/items/new")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Item
                </button>
              )}
              {locations.length === 0 && (
                <button
                  onClick={() => navigate("/locations/new")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Location
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Check permissions for adjustment
  const canAdjust = user?.role === "admin" || user?.role === "super_admin";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          New Stock Transaction
        </h1>

        {/* Transaction Type Selection */}
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Transaction Type
          </h2>
          <div className="flex flex-row justify-between gap-2">
            <button
              onClick={() => handleTransactionTypeChange("IN")}
              className={`flex-1 py-2 px-1 border rounded text-center transition-colors ${
                transactionType === "IN"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="text-lg mb-1">⬆️</div>
              <div className="font-medium text-sm">Stock IN</div>
              <div className="text-xs text-gray-600">Receive</div>
            </button>

            <button
              onClick={() => handleTransactionTypeChange("OUT")}
              className={`flex-1 py-2 px-1 border rounded text-center transition-colors ${
                transactionType === "OUT"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="text-lg mb-1">⬇️</div>
              <div className="font-medium text-sm">Stock OUT</div>
              <div className="text-xs text-gray-600">Issue</div>
            </button>

            <button
              onClick={() => handleTransactionTypeChange("TRANSFER")}
              className={`flex-1 py-2 px-1 border rounded text-center transition-colors ${
                transactionType === "TRANSFER"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="text-lg mb-1">🔄</div>
              <div className="font-medium text-sm">Transfer</div>
              <div className="text-xs text-gray-600">Move</div>
            </button>

            <button
              onClick={() => handleTransactionTypeChange("ADJUSTMENT")}
              disabled={!canAdjust}
              className={`flex-1 py-2 px-1 border rounded text-center transition-colors ${
                !canAdjust
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : transactionType === "ADJUSTMENT"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="text-lg mb-1">⚖️</div>
              <div className="font-medium text-sm">Adjustment</div>
              <div className="text-xs text-gray-600">
                {canAdjust ? "Admin" : "Admin req"}
              </div>
            </button>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {transactionType === "IN" && "Stock IN Details"}
            {transactionType === "OUT" && "Stock OUT Details"}
            {transactionType === "TRANSFER" && "Transfer Details"}
            {transactionType === "ADJUSTMENT" && "Adjustment Details"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Selection */}
            <div>
              <label
                htmlFor="item"
                className="block text-sm font-medium text-gray-700"
              >
                Item *
              </label>
              <select
                id="item"
                required
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Selection - For IN, OUT, ADJUSTMENT */}
            {transactionType !== "TRANSFER" && (
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location *
                </label>
                <select
                  id="location"
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Transfer-specific locations */}
            {transactionType === "TRANSFER" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fromLocation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    From Location *
                  </label>
                  <select
                    id="fromLocation"
                    required
                    value={fromLocationId}
                    onChange={(e) => setFromLocationId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select source location</option>
                    {locations.map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                        disabled={location.id.toString() === toLocationId}
                      >
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="toLocation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    To Location *
                  </label>
                  <select
                    id="toLocation"
                    required
                    value={toLocationId}
                    onChange={(e) => setToLocationId(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select destination location</option>
                    {locations.map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                        disabled={location.id.toString() === fromLocationId}
                      >
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                required
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
              />
              {transactionType === "ADJUSTMENT" && (
                <p className="mt-1 text-xs text-gray-500">
                  This will set the stock to exactly this quantity
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about this transaction"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Process ${transactionType}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
