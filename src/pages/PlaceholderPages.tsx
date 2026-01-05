import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Item #{id}</h1>
        <p className="text-gray-600 mb-6">
          Detailed item view with edit capabilities.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            Coming next: Item details, stock levels, transaction history
          </p>
        </div>
        <button
          onClick={() => navigate("/items")}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Items
        </button>
      </div>
    </Layout>
  );
};

export const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Location #{id}
        </h1>
        <p className="text-gray-600 mb-6">
          Detailed location view with edit capabilities.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            Coming next: Location details, current stock, capacity management
          </p>
        </div>
        <button
          onClick={() => navigate("/locations")}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Locations
        </button>
      </div>
    </Layout>
  );
};

export const NewTransactionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          New Stock Transaction
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-green-300 transition-colors">
              <div className="text-green-600 text-2xl mb-2">⬆️</div>
              <h3 className="font-medium text-gray-900">Stock IN</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add inventory to location
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-red-300 transition-colors">
              <div className="text-red-600 text-2xl mb-2">⬇️</div>
              <h3 className="font-medium text-gray-900">Stock OUT</h3>
              <p className="text-sm text-gray-600 mt-1">
                Remove inventory from location
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
              <div className="text-blue-600 text-2xl mb-2">🔄</div>
              <h3 className="font-medium text-gray-900">Transfer</h3>
              <p className="text-sm text-gray-600 mt-1">
                Move between locations
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900">Coming Next</h3>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Interactive transaction forms</li>
              <li>• Real-time stock validation</li>
              <li>• Barcode scanning support</li>
              <li>• Bulk transaction entry</li>
            </ul>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate("/transactions")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
