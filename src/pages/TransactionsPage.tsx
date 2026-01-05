import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Layout } from "../components/Layout";

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

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<StockLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await apiClient.getStockLedger({ limit: 50 });
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions:", err);
        setError("Failed to load transaction history");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Transactions
          </h1>
          <Link
            to="/transactions/new"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            New Transaction
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading transactions...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600">{error}</div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found.{" "}
                <Link
                  to="/transactions/new"
                  className="text-green-600 hover:text-green-800"
                >
                  Create the first transaction
                </Link>
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
                        Item
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {getTransactionIcon(transaction.transaction_type)}
                            </span>
                            <span
                              className={`text-sm font-medium ${getTransactionColor(
                                transaction.transaction_type
                              )}`}
                            >
                              {transaction.transaction_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Item #{transaction.item_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${
                              transaction.quantity > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.quantity > 0 ? "+" : ""}
                            {transaction.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction.running_balance}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {transaction.notes || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        {!loading && !error && transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {["IN", "OUT", "TRANSFER", "ADJUSTMENT"].map((type) => {
              const typeTransactions = transactions.filter(
                (t) => t.transaction_type === type
              );
              const totalQuantity = typeTransactions.reduce(
                (sum, t) => sum + Math.abs(t.quantity),
                0
              );

              return (
                <div key={type} className="bg-white shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getTransactionIcon(type)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <dt className="text-sm font-medium text-gray-500">
                        {type}
                      </dt>
                      <dd
                        className={`text-lg font-semibold ${getTransactionColor(
                          type
                        )}`}
                      >
                        {typeTransactions.length} txns
                      </dd>
                      <dd className="text-xs text-gray-500">
                        Total: {totalQuantity.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
