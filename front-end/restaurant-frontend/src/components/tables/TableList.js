import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import ReservationForm from './ReservationForm';

const TableList = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await api.get('tables/tables/');
      console.log('Tables response:', response.data); // Debug log
      setTables(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get('tables/reservations/');
      console.log('Reservations response:', response.data); // Debug log
      setReservations(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      message.error('Failed to fetch reservations');
    }
  };

  const handleCreateReservation = () => {
    setCurrentReservation(null);
    setModalVisible(true);
  };

  const handleCreateReservationSubmit = async (values) => {
    try {
      console.log('Creating reservation with values:', values); // Debug log
      
      // Make sure we're sending the table ID correctly
      const reservationData = {
        table: values.table, // This should be the table ID
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_email: values.customer_email,
        date: values.date,
        time: values.time,
        party_size: values.party_size,
        status: values.status,
        notes: values.notes || '',
      };
      
      console.log('Sending reservation data:', reservationData); // Debug log
      
      const response = await api.post('tables/reservations/', reservationData);
      console.log('Reservation created:', response.data); // Debug log
      
      message.success('Reservation created successfully');
      setModalVisible(false);
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to create reservation: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Failed to create reservation');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'confirmed': return 'cyan';
      case 'seated': return 'green';
      case 'completed': return 'success';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const tableColumns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const activeReservation = reservations.find(r => 
          r.table?.id === record.id && ['confirmed', 'seated'].includes(r.status)
        );
        return activeReservation ? (
          <Tag color={getStatusColor(activeReservation.status)}>
            {activeReservation.status}
          </Tag>
        ) : (
          <Tag color="green">Available</Tag>
        );
      },
    },
  ];

  const reservationColumns = [
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Table',
      dataIndex: ['table', 'number'],
      key: 'table',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Party Size',
      dataIndex: 'party_size',
      key: 'party_size',
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {['manager', 'host'].includes(user?.role) && (
            <>
              <Button 
                type="primary" 
                size="small"
                onClick={() => {
                  api.patch(`tables/reservations/${record.id}/`, { status: 'confirmed' })
                    .then(() => {
                      message.success('Reservation confirmed');
                      fetchReservations();
                    });
                }}
                disabled={record.status !== 'pending'}
              >
                Confirm
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => {
                  api.patch(`tables/reservations/${record.id}/`, { status: 'seated' })
                    .then(() => {
                      message.success('Customer seated');
                      fetchReservations();
                    });
                }}
                disabled={record.status !== 'confirmed'}
              >
                Seat
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {['manager', 'host'].includes(user?.role) && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReservation}>
            Create Reservation
          </Button>
        </div>
      )}
      
      <h2>Tables</h2>
      <Table
        columns={tableColumns}
        dataSource={tables}
        rowKey="id"
        loading={loading}
        pagination={false}
        style={{ marginBottom: 32 }}
      />
      
      <h2>Reservations</h2>
      <Table
        columns={reservationColumns}
        dataSource={reservations}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <ReservationForm
        visible={modalVisible}
        onCreate={handleCreateReservationSubmit}
        onCancel={() => setModalVisible(false)}
        reservation={currentReservation}
        tables={tables}
      />
    </div>
  );
};

export default TableList;