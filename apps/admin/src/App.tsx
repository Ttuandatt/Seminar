import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/admin/DashboardPage';
import POIListPage from './pages/admin/POIListPage';
import POIFormPage from './pages/admin/POIFormPage';
import TourListPage from './pages/admin/TourListPage';
import TourFormPage from './pages/admin/TourFormPage';
import MerchantListPage from './pages/admin/MerchantListPage';
import MerchantFormPage from './pages/admin/MerchantFormPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import PlaceholderPage from './pages/admin/PlaceholderPage';
import ShopOwnerLayout from './components/layout/ShopOwnerLayout';
import ShopOwnerLoginPage from './pages/owner/ShopOwnerLoginPage';
import ShopOwnerRegisterPage from './pages/owner/ShopOwnerRegisterPage';
import ShopOwnerDashboardPage from './pages/owner/ShopOwnerDashboardPage';
import ShopOwnerAnalyticsPage from './pages/owner/ShopOwnerAnalyticsPage';
import ShopOwnerProfilePage from './pages/owner/ShopOwnerProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/owner/login" element={<ShopOwnerLoginPage />} />
        <Route path="/owner/register" element={<ShopOwnerRegisterPage />} />

        <Route path="/owner" element={<ShopOwnerLayout />}>
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<ShopOwnerDashboardPage />} />
          <Route path="analytics" element={<ShopOwnerAnalyticsPage />} />
          <Route path="profile" element={<ShopOwnerProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pois" element={<POIListPage />} />
          <Route path="pois/new" element={<POIFormPage />} />
          <Route path="pois/:id" element={<POIFormPage readOnly />} />
          <Route path="pois/:id/edit" element={<POIFormPage />} />
          <Route path="tours" element={<TourListPage />} />
          <Route path="tours/new" element={<TourFormPage />} />
          <Route path="tours/:id" element={<TourFormPage readOnly />} />
          <Route path="tours/:id/edit" element={<TourFormPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="merchants" element={<MerchantListPage />} />
          <Route path="merchants/new" element={<MerchantFormPage />} />
          <Route path="merchants/:id" element={<MerchantFormPage readOnly />} />
          <Route path="merchants/:id/edit" element={<MerchantFormPage />} />
          <Route path="settings" element={<PlaceholderPage title="System Settings" />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
