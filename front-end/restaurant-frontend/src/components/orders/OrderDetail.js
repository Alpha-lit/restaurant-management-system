import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Form, Select, InputNumber, Button, Card, message, Input } from 'antd';
import { DollarOutlined, EditOutlined } from '@ant-design/icons';
 
const { Option } = Select;
const { TextArea } = Input;

const OrderDetail = ({ visible, order, onClose, onUpdateStatus, onProcessPayment, tables = [], waiters = [] }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    if (order && visible) {
      // Set payment form values
      paymentForm.setFieldsValue({
        amount: order.total_amount,
        method: 'cash',
      });
    }
  }, [order, visible, paymentForm]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const values = await paymentForm.validateFields();
      console.log('Payment values:', values);
      
      const paymentData = {
        amount: parseFloat(values.amount),
        method: values.method,
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      console.log('Sending payment data:', paymentData);
      
      await onProcessPayment(order.id, paymentData);
      message.success('Payment processed successfully');
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await onUpdateStatus(order.id, status);
      message.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update order status');
    }
  };

  const handleOrderUpdate = async (values) => {
    try {
      const updateData = {
        table: values.table,
        waiter: values.waiter,
        status: values.status,
        notes: values.notes,
      };
      
      // Call API to update order
      const response = await fetch(`http://localhost:8000/api/orders/orders/${order.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        message.success('Order updated successfully');
        setEditMode(false);
        onClose();
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Failed to update order');
    }
  };

  const columns = [
    {
      title: 'Dish',
      dataIndex: ['dish', 'name'],
      key: 'dish',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: ['dish', 'price'],
      key: 'price',
      render: (price) => `$${price}`,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `$${(record.dish.price * record.quantity).toFixed(2)}`,
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
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

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

  return (
    <Modal
      visible={visible}
      title={`Order #${order?.id}`}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        !editMode && order?.status !== 'paid' && (
          <Button 
            key="edit" 
            icon={<EditOutlined />}
            onClick={() => setEditMode(true)}
          >
            Edit Order
          </Button>
        ),
        editMode && (
          <>
            <Button key="cancel" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button 
              key="save" 
              type="primary" 
              onClick={() => {
                const formValues = document.getElementById('order-form');
                const formData = new FormData(formValues);
                handleOrderUpdate(Object.fromEntries(formData));
              }}
            >
              Save Changes
            </Button>
          </>
        ),
        !editMode && order?.status !== 'paid' && (
          <Button 
            key="payment" 
            type="primary" 
            icon={<DollarOutlined />} 
            onClick={handlePayment}
            loading={loading}
          >
            Process Payment
          </Button>
        )
      ]}
    >
      {order && (
        <>
          {editMode ? (
            <Card title="Edit Order" style={{ marginBottom: 16 }}>
              <Form id="order-form" layout="vertical" initialValues={{
                table: order.table?.id,
                waiter: order.waiter?.id,
                status: order.status,
                notes: order.notes || '',
              }}>
                <Form.Item
                  name="table"
                  label="Table"
                  rules={[{ required: true, message: 'Please select a table!' }]}
                >
                  <Select placeholder="Select a table">
                    {Array.isArray(tables) && tables.map(table => (
                      <Option key={table.id} value={table.id}>
                        Table {table.number} (Capacity: {table.capacity})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="waiter"
                  label="Waiter"
                  rules={[{ required: true, message: 'Please select a waiter!' }]}
                >
                  <Select placeholder="Select a waiter">
                    {Array.isArray(waiters) && waiters.map(waiter => (
                      <Option key={waiter.id} value={waiter.id}>
                        {waiter.username} ({waiter.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="pending">Pending</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="preparing">Preparing</Option>
                    <Option value="ready">Ready</Option>
                    <Option value="served">Served</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="notes"
                  label="Notes"
                >
                  <TextArea rows={3} />
                </Form.Item>
              </Form>
            </Card>
          ) : (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p><strong>Table:</strong> {order.table ? `Table ${order.table.number}` : 'N/A'}</p>
                  <p><strong>Waiter:</strong> {order.waiter ? order.waiter.username : 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> <Tag color={getStatusColor(order.status)}>{order.status}</Tag></p>
                  <p><strong>Total Amount:</strong> ${order.total_amount}</p>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Notes:</strong> {order.notes || 'None'}</p>
              </div>
            </Card>
          )}
          
          <Card title="Order Items" style={{ marginBottom: 16 }}>
            <Table
              dataSource={order.items}
              columns={columns}
              pagination={false}
              rowKey="id"
            />
          </Card>
          
          {!editMode && (
            <Card title="Quick Actions" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {order.status === 'pending' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusUpdate('confirmed')}
                  >
                    Confirm Order
                  </Button>
                )}
                {order.status === 'confirmed' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusUpdate('preparing')}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusUpdate('ready')}
                  >
                    Mark as Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusUpdate('served')}
                  >
                    Mark as Served
                  </Button>
                )}
                {order.status === 'served' && (
                  <Button 
                    type="primary" 
                    onClick={() => handleStatusUpdate('paid')}
                  >
                    Mark as Paid
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status) && (
                  <Button 
                    danger 
                    onClick={() => handleStatusUpdate('cancelled')}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          )}
          
          {!editMode && order.status !== 'paid' && (
            <Card title="Payment Details">
              <Form
                form={paymentForm}
                layout="vertical"
              >
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true, message: 'Please input amount!' }]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
                
                <Form.Item
                  name="method"
                  label="Payment Method"
                  rules={[{ required: true, message: 'Please select payment method!' }]}
                >
                  <Select placeholder="Select payment method">
                    <Option value="cash">Cash</Option>
                    <Option value="card">Card</Option>
                    <Option value="mobile">Mobile Payment</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          )}
        </>
      )}
    </Modal>
  );
};

export default OrderDetail;