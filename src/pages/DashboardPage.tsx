import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Layout } from "../components/Layout";

interface InventorySummary {
  total_items: number;
  total_locations: number;
  estimated_stock_value: number;
  low_stock_items_count: number;
  last_transaction_date: string;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await apiClient.getInventorySummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load summary:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            You are logged in as{" "}
            <span className="font-medium">{user?.email}</span> with{" "}
            <span className="font-medium text-blue-600">{user?.role}</span>{" "}
            privileges.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading inventory summary...</div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
              <p className="text-3xl font-bold text-gray-900">
                {summary.total_items}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Total Locations
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {summary.total_locations}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
              <p className="text-3xl font-bold text-gray-900">
                ${summary.estimated_stock_value.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                Low Stock Items
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {summary.low_stock_items_count}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load inventory summary
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/items/new"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h4 className="font-medium text-blue-900">Add New Item</h4>
              <p className="text-sm text-blue-600 mt-1">
                Create a new inventory item
              </p>
            </a>
            <a
              href="/transactions/new"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h4 className="font-medium text-green-900">Record Transaction</h4>
              <p className="text-sm text-green-600 mt-1">
                Stock IN/OUT or transfer
              </p>
            </a>
            <a
              href="/reports"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h4 className="font-medium text-purple-900">View Reports</h4>
              <p className="text-sm text-purple-600 mt-1">
                Inventory and movement reports
              </p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};
