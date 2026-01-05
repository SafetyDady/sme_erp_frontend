import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export const ReportsPage: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock On Hand Report */}
          <Link
            to="/reports/stock-on-hand"
            className="block bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Stock On Hand
                </h3>
                <p className="text-gray-600 mt-1">
                  View current inventory levels by item and location
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Real-time data
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Movement Report */}
          <Link
            to="/reports/movement"
            className="block bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Movement Report
                </h3>
                <p className="text-gray-600 mt-1">
                  Analyze stock movements and transactions over time
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Date range filtering
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Report Features
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Real-time data from live database</li>
            <li>• CSV export compatible with Excel</li>
            <li>• Advanced filtering options</li>
            <li>• Responsive design for mobile access</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};
