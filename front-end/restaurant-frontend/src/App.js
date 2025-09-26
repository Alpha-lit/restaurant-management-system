import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AppLayout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import Dashboard from './pages/Dashboard';
import MenuList from './components/menu/MenuList';
import OrderList from './components/orders/OrderList';
import TableList from './components/tables/TableList';
import StockList from './components/inventory/StockList';
import DailySales from './components/reports/DailySales';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/menu" element={<PrivateRoute><AppLayout><MenuList /></AppLayout></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><AppLayout><OrderList /></AppLayout></PrivateRoute>} />
          <Route path="/tables" element={<PrivateRoute><AppLayout><TableList /></AppLayout></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><AppLayout><StockList /></AppLayout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><AppLayout><DailySales /></AppLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;