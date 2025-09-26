import React from 'react';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, DashboardOutlined, 
         MenuOutlined, OrderedListOutlined, TableOutlined, 
         StockOutlined, BarChartOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const { Header } = Layout;

const AppHeader = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      },
    ];

    // All roles can view menu
    baseItems.push({
      key: 'menu',
      icon: <MenuOutlined />,
      label: <Link to="/menu">Menu</Link>,
    });

    // Orders: manager, waiter, cashier
    if (['manager', 'waiter', 'cashier'].includes(user?.role)) {
      baseItems.push({
        key: 'orders',
        icon: <OrderedListOutlined />,
        label: <Link to="/orders">Orders</Link>,
      });
    }

    // Tables: manager, host
    if (['manager', 'host'].includes(user?.role)) {
      baseItems.push({
        key: 'tables',
        icon: <TableOutlined />,
        label: <Link to="/tables">Tables</Link>,
      });
    }

    // Inventory: manager, chef
    if (['manager', 'chef'].includes(user?.role)) {
      baseItems.push({
        key: 'inventory',
        icon: <StockOutlined />,
        label: <Link to="/inventory">Inventory</Link>,
      });
    }

    // Reports: only manager
    if (user?.role === 'manager') {
      baseItems.push({
        key: 'reports',
        icon: <BarChartOutlined />,
        label: <Link to="/reports">Reports</Link>,
      });
    }

    return baseItems;
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="logo" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        Restaurant Management
      </div>
      
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: '64px' }} items={getMenuItems()} />
      
      <div>
        {user && (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span style={{ color: 'white' }}>{user.username}</span>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;