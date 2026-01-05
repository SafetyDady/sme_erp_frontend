import React from "react";
import { Layout } from "../components/Layout";

export const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          System Settings
        </h1>
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            ⚙️
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            System Settings
          </h2>
          <p className="text-gray-600 mb-6">
            Configure system-wide settings and preferences.
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                🔒 <strong>SUPER_ADMIN only</strong>
                <br />
                System configuration, security settings, and advanced features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
