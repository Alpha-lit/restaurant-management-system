import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import OrderForm from './OrderForm';
import OrderDetail from './OrderDetail';
 
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchDishes();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('orders/orders/');
      console.log('Orders response:', response.data);
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await api.get('tables/tables/');
      console.log('Tables response:', response.data);
      setTables(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Failed to fetch tables');
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await api.get('menu/dishes/');
      console.log('Dishes response:', response.data);
      setDishes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      message.error('Failed to fetch dishes');
    }
  };

  const handleCreate = () => {
    setCurrentOrder(null);
    setModalVisible(true);
  };

  const handleView = (order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const handleCreateOrder = async (values) => {
    try {
      console.log('Creating order with values:', values);
      
      // Format the data for the API
      const orderData = {
        table: values.table,
        notes: '',
      };
      
      const response = await api.post('orders/orders/', orderData);
      console.log('Order created:', response.data);
      
      // Add items to the order
      const orderId = response.data.id;
      for (const item of values.items) {
        await api.post(`orders/orders/${orderId}/add_item/`, {
          dish_id: item.dish,
          quantity: item.quantity,
          notes: item.notes || '',
        });
      }
      
      message.success('Order created successfully');
      setModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to create order: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Failed to create order');
      }
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.patch(`orders/orders/${orderId}/`, { status });
      message.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const handleProcessPayment = async (orderId, paymentData) => {
    try {
      console.log('Processing payment for order:', orderId);
      console.log('Payment data:', paymentData);
      
      const response = await api.post(`orders/orders/${orderId}/make_payment/`, paymentData);
      console.log('Payment response:', response.data);
      
      message.success('Payment processed successfully');
      setDetailVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to process payment: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Failed to process payment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'confirmed': return 'cyan';
      case 'preparing': return 'orange';
      case 'ready': return 'green';
      case 'served': return 'purple';
      case 'paid': return 'success';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Table',
      dataIndex: ['table', 'number'],
      key: 'table',
    },
    {
      title: 'Waiter',
      dataIndex: ['waiter', 'username'],
      key: 'waiter',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `$${amount}`,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          
          {['manager', 'waiter', 'cashier'].includes(user?.role) && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'confirmed')}
              disabled={record.status !== 'pending'}
            >
              Confirm
            </Button>
          )}
          
          {user?.role === 'chef' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStatusUpdate(record.id, 
                record.status === 'confirmed' ? 'preparing' : 'ready')}
              disabled={!['confirmed', 'preparing'].includes(record.status)}
            >
              {record.status === 'confirmed' ? 'Start Preparing' : 'Mark Ready'}
            </Button>
          )}
          
          {user?.role === 'waiter' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'served')}
              disabled={record.status !== 'ready'}
            >
              Mark Served
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {['manager', 'waiter', 'cashier'].includes(user?.role) && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Order
          </Button>
        </div>
      )}
      
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <OrderForm
        visible={modalVisible}
        onCreate={handleCreateOrder}
        onCancel={() => setModalVisible(false)}
        order={currentOrder}
        tables={tables}
        dishes={dishes}
      />
      
      <OrderDetail
        visible={detailVisible}
        order={currentOrder}
        onClose={() => setDetailVisible(false)}
        onUpdateStatus={handleStatusUpdate}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
};

export default OrderList;