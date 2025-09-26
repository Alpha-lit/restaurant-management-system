import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Space } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const { RangePicker } = DatePicker;

const DailySales = () => {
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchDailySales();
  }, []);

  const fetchDailySales = async (startDate = null, endDate = null) => {
    setLoading(true);
    try {
      let url = 'reports/daily-sales/';
      if (startDate && endDate) {
        url += `?start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}`;
      }
      
      const response = await api.get(url);
      setDailySales(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      fetchDailySales(dates[0], dates[1]);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Total Orders',
      dataIndex: 'total_orders',
      key: 'total_orders',
      sorter: (a, b) => a.total_orders - b.total_orders,
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.total_revenue - b.total_revenue,
    },
    {
      title: 'Average Order Value',
      dataIndex: 'average_order_value',
      key: 'average_order_value',
      render: (amount) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.average_order_value - b.average_order_value,
    },
  ];

  // Calculate summary statistics
  const totalRevenue = dailySales.reduce((sum, day) => sum + parseFloat(day.total_revenue), 0);
  const totalOrders = dailySales.reduce((sum, day) => sum + day.total_orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      {user?.role === 'manager' ? (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={totalRevenue}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="$"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Orders"
                  value={totalOrders}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Average Order Value"
                  value={avgOrderValue}
                  precision={2}
                  prefix={<UserOutlined />}
                  suffix="$"
                />
              </Card>
            </Col>
          </Row>
          
          <Card title="Daily Sales Report" style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <RangePicker onChange={handleDateRangeChange} />
            </Space>
            
            <Table
              columns={columns}
              dataSource={dailySales}
              rowKey="date"
              loading={loading}
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                let totalRevenue = 0;
                let totalOrders = 0;
                
                pageData.forEach(({ total_revenue, total_orders }) => {
                  totalRevenue += parseFloat(total_revenue);
                  totalOrders += total_orders;
                });
                
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>{totalOrders}</Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Statistic value={totalRevenue} precision={2} prefix="$" />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Statistic 
                        value={totalOrders > 0 ? totalRevenue / totalOrders : 0} 
                        precision={2} 
                        prefix="$" 
                      />
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </>
      ) : (
        <Card>
          <p>You don't have permission to view reports.</p>
        </Card>
      )}
    </div>
  );
};

export default DailySales;