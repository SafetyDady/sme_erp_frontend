
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ItemsPage } from "./pages/ItemsPage";
import { NewItemPage } from "./pages/NewItemPage";
import { LocationsPage } from "./pages/LocationsPage";
import { NewLocationPage } from "./pages/NewLocationPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { StockOnHandReportPage } from "./pages/StockOnHandReportPage";
import { MovementReportPage } from "./pages/MovementReportPage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { LocationDetailPage } from "./pages/LocationDetailPage";
import { NewTransactionPage } from "./pages/NewTransactionPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="VIEWER">
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Items Routes */}
          <Route
            path="/items"
            element={
              <ProtectedRoute requiredRole="VIEWER">
                <ItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/new"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <NewItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id"
            element={
              <ProtectedRoute requiredRole="VIEWER">
                <ItemDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Locations Routes */}
          <Route
            path="/locations"
            element={
              <ProtectedRoute requiredRole="VIEWER">
                <LocationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations/new"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <NewLocationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations/:id"
            element={
              <ProtectedRoute requiredRole="VIEWER">
                <LocationDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Transactions Routes */}
          <Route
            path="/transactions"
            element={
              <ProtectedRoute requiredRole="STAFF">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <ProtectedRoute requiredRole="STAFF">
                <NewTransactionPage />
              </ProtectedRoute>
            }
          />

          {/* Reports Route */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="viewer">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/stock-on-hand"
            element={
              <ProtectedRoute requiredRole="viewer">
                <StockOnHandReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/movement"
            element={
              <ProtectedRoute requiredRole="viewer">
                <MovementReportPage />
              </ProtectedRoute>
            }
          />

          {/* Users Route - Admin Only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Settings Route - Super Admin Only */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
