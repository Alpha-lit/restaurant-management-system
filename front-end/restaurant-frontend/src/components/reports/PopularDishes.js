import React, { useEffect, useState } from 'react';
import { Table, Card, DatePicker, Button, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ExportOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const PopularDishes = () => {
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    fetchPopularDishes();
  }, []);

  const fetchPopularDishes = async (startDate = null, endDate = null) => {
    setLoading(true);
    try {
      let url = 'reports/popular-dishes/';
      if (startDate && endDate) {
        url += `?start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}`;
      }
      
      const response = await fetch(`http://localhost:8000/api/${url}`);
      const data = await response.json();
      setPopularDishes(data.results || []);
    } catch (error) {
      console.error('Error fetching popular dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      fetchPopularDishes(dates[0], dates[1]);
    }
  };

  const columns = [
    {
      title: 'Dish',
      dataIndex: ['dish', 'name'],
      key: 'dish',
    },
    {
      title: 'Order Count',
      dataIndex: 'order_count',
      key: 'order_count',
      sorter: (a, b) => a.order_count - b.order_count,
    },
    {
      title: 'Revenue Generated',
      dataIndex: 'revenue_generated',
      key: 'revenue_generated',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.revenue_generated - b.revenue_generated,
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => `${record.period_start} to ${record.period_end}`,
    },
  ];

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Dish,Order Count,Revenue Generated,Period\n"
      + popularDishes.map(dish => 
          `${dish.dish.name},${dish.order_count},${dish.revenue_generated},${dish.period_start} to ${dish.period_end}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "popular_dishes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Card title="Popular Dishes Report" style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker onChange={handleDateRangeChange} />
          <Button 
            type="primary" 
            icon={<ExportOutlined />} 
            onClick={exportData}
            disabled={popularDishes.length === 0}
          >
            Export CSV
          </Button>
        </Space>
        
        <Table
          columns={columns}
          dataSource={popularDishes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Card title="Popular Dishes Chart">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={popularDishes}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dish.name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Legend />
            <Bar dataKey="order_count" name="Order Count" fill="#8884d8" />
            <Bar dataKey="revenue_generated" name="Revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default PopularDishes;