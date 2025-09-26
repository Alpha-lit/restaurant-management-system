import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tabs, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import StockForm from './StockForm';

const { TabPane } = Tabs;

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchStocks();
    fetchIngredients();
    fetchTransactions();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await api.get('inventory/stocks/');
      console.log('Stocks response:', response.data);
      setStocks(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('menu/ingredients/');
      console.log('Ingredients response:', response.data);
      setIngredients(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('inventory/stock-transactions/');
      console.log('Transactions response:', response.data);
      setTransactions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddStock = () => {
    setCurrentStock(null);
    setModalVisible(true);
  };

  const handleUpdateStock = async (values) => {
    try {
      console.log('Updating stock with values:', values);
      
      if (currentStock) {
        // Update existing stock
        const updateData = {
          ingredient: currentStock.ingredient.id, // Always include the ingredient
          quantity: values.quantity,
          reorder_threshold: values.reorder_threshold,
        };
        
        console.log('Updating existing stock with data:', updateData);
        
        try {
          const response = await api.put(`inventory/stocks/${currentStock.id}/`, updateData);
          console.log('Stock updated response:', response.data);
          
          // Record stock transaction
          const quantityDiff = values.quantity - currentStock.quantity;
          if (quantityDiff !== 0) {
            await api.post('inventory/stock-transactions/', {
              ingredient: currentStock.ingredient.id,
              type: quantityDiff > 0 ? 'in' : 'out',
              quantity: Math.abs(quantityDiff),
              notes: 'Stock update',
            });
          }
          
          message.success('Stock updated successfully');
          setModalVisible(false);
          fetchStocks();
          fetchTransactions();
        } catch (error) {
          console.error('Error updating stock:', error);
          
          // Check if this is the ingredient field error but the update actually worked
          if (error.response && error.response.status === 400 && 
              error.response.data.ingredient && 
              error.response.data.ingredient[0] === 'This field is required.') {
            // The update likely succeeded despite the error message
            // Let's check if the stock was actually updated
            try {
              const checkResponse = await api.get(`inventory/stocks/${currentStock.id}/`);
              const updatedStock = checkResponse.data;
              
              // Check if the values were updated
              if (updatedStock.quantity === values.quantity && 
                  updatedStock.reorder_threshold === values.reorder_threshold) {
                // The update was successful, so we'll show success message
                message.success('Stock updated successfully');
                setModalVisible(false);
                fetchStocks();
                fetchTransactions();
                return;
              }
            } catch (checkError) {
              console.error('Error checking stock update:', checkError);
            }
          }
          
          // If we get here, it's a real error
          if (error.response) {
            console.error('Error response:', error.response.data);
            message.error(`Failed to update stock: ${JSON.stringify(error.response.data)}`);
          } else {
            message.error('Failed to update stock');
          }
        }
      } else {
        // Create new stock
        const stockData = {
          ingredient: values.ingredient,
          quantity: values.quantity,
          reorder_threshold: values.reorder_threshold,
        };
        
        console.log('Creating new stock with data:', stockData);
        
        const response = await api.post('inventory/stocks/', stockData);
        console.log('Stock created:', response.data);
        
        // Record stock transaction
        await api.post('inventory/stock-transactions/', {
          ingredient: values.ingredient,
          type: 'in',
          quantity: values.quantity,
          notes: 'Initial stock',
        });
        
        message.success('Stock created successfully');
        setModalVisible(false);
        fetchStocks();
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error in handleUpdateStock:', error);
      message.error('Failed to update stock');
    }
  };

  const stockColumns = [
    {
      title: 'Ingredient',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredient',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => `${quantity} ${record.ingredient.unit}`,
    },
    {
      title: 'Reorder Threshold',
      dataIndex: 'reorder_threshold',
      key: 'reorder_threshold',
      render: (threshold, record) => `${threshold} ${record.ingredient.unit}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.needs_reorder ? 'red' : 'green'}>
          {record.needs_reorder ? 'Needs Reorder' : 'In Stock'}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
      key: 'last_updated',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {['manager', 'chef'].includes(user?.role) && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="small"
              onClick={() => {
                setCurrentStock(record);
                setModalVisible(true);
              }}
            >
              Update Stock
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Ingredient',
      dataIndex: ['ingredient', 'name'],
      key: 'ingredient',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'in' ? 'green' : type === 'out' ? 'red' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => `${quantity} ${record.ingredient.unit}`,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'User',
      dataIndex: ['user', 'username'],
      key: 'user',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div>
      {['manager', 'chef'].includes(user?.role) && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStock}>
            Update Stock
          </Button>
        </div>
      )}
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Current Stock" key="1">
          <Table
            columns={stockColumns}
            dataSource={stocks}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="Transactions" key="2">
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>
      
      <StockForm
        visible={modalVisible}
        onCreate={handleUpdateStock}
        onCancel={() => setModalVisible(false)}
        stock={currentStock}
        ingredients={ingredients}
      />
    </div>
  );
};

export default StockList;