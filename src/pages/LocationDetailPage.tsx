import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, ApiError } from "../api/client";
import { Layout } from "../components/Layout";

interface Location {
  id: number;
  name: string;
  code: string;
  description: string;
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

export const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [stockItems, setStockItems] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLocationData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const locationId = parseInt(id, 10);

        // Load location details
        const locationData = await apiClient.getLocation(locationId);
        setLocation(locationData);

        // Load current stock at this location
        const stockData = await apiClient.getCurrentStock();
        const locationStock = stockData.filter(
          (stock) => stock.location_id === locationId
        );
        setStockItems(locationStock);
      } catch (err) {
        console.error("Failed to load location data:", err);
        if (err instanceof ApiError && err.status === 404) {
          setError("Location not found");
        } else {
          setError("Failed to load location data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadLocationData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500">Loading location details...</div>
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
            onClick={() => navigate("/locations")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Locations
          </button>
        </div>
      </Layout>
    );
  }

  if (!location) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Location not found</div>
          <button
            onClick={() => navigate("/locations")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Locations
          </button>
        </div>
      </Layout>
    );
  }

  const totalItems = stockItems.length;
  const totalQuantity = stockItems.reduce(
    (sum, stock) => sum + stock.current_quantity,
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {location.name}
            </h1>
            <p className="text-gray-600">Code: {location.code}</p>
          </div>
          <button
            onClick={() => navigate("/locations")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Locations
          </button>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location Information
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{location.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{location.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {location.description || "No description"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(location.created_at).toLocaleString()}
                </dd>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory Summary
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Items
                </dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {totalItems}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Quantity
                </dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {totalQuantity}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Current Stock
            </h2>
          </div>

          {stockItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No inventory in this location. Perform stock transactions to add
              items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockItems.map((stock) => (
                    <tr key={`${stock.item_id}-${stock.location_id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.item_name}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/items/${stock.item_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Item
                        </button>
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
