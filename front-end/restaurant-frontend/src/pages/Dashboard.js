import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, TableOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
    popularDishes: []
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // In a real app, you would have a dedicated dashboard endpoint
        // For now, we'll fetch from multiple endpoints
        const ordersResponse = await api.get('orders/orders/');
        const orders = ordersResponse.data;
        
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || 0);
        }, 0);
        
        // Count active tables (tables with active orders)
        const activeTables = new Set(
          orders
            .filter(order => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status))
            .map(order => order.table)
        ).size;
        
        // Get popular dishes
        const dishCounts = {};
        orders.forEach(order => {
          order.items.forEach(item => {
            if (dishCounts[item.dish.name]) {
              dishCounts[item.dish.name] += item.quantity;
            } else {
              dishCounts[item.dish.name] = item.quantity;
            }
          });
        });
        
        const popularDishes = Object.entries(dishCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setStats({
          totalOrders,
          totalRevenue,
          activeTables,
          popularDishes
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  const popularDishesColumns = [
    {
      title: 'Dish',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Orders',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'blue';
      case 'chef': return 'green';
      case 'waiter': return 'orange';
      case 'cashier': return 'purple';
      case 'host': return 'cyan';
      default: return 'default';
    }
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Tables"
              value={stats.activeTables}
              prefix={<TableOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Your Role"
              value={user?.role}
              prefix={<UserOutlined />}
              valueRender={(node) => <Tag color={getRoleColor(user?.role)}>{node}</Tag>}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Popular Dishes">
            <Table 
              dataSource={stats.popularDishes} 
              columns={popularDishesColumns} 
              pagination={false}
              rowKey="name"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Welcome to Restaurant Management System">
            <p>Hello, {user?.username}!</p>
            <p>You are logged in as a <Tag color={getRoleColor(user?.role)}>{user?.role}</Tag>.</p>
            <p>Use the menu above to navigate through the system.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;