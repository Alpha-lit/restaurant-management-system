import React from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, InputNumber } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const ReservationForm = ({ visible, onCreate, onCancel, reservation, tables = [] }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (reservation) {
      form.setFieldsValue({
        ...reservation,
        table: reservation.table?.id, // Make sure we're setting the table ID
        date: reservation.date,
        time: reservation.time,
      });
    } else {
      form.resetFields();
    }
  }, [reservation, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        console.log('Reservation form values:', values); // Debug log
        
        // Format date and time for API
        const formattedValues = {
          ...values,
          table: values.table, // This should be the table ID
          date: values.date.format('YYYY-MM-DD'),
          time: values.time.format('HH:mm:ss'),
        };
        
        console.log('Formatted reservation values:', formattedValues); // Debug log
        onCreate(formattedValues);
      })
      .catch(info => {
        console.log('Validate Failed:', info); // Debug log
      });
  };

  return (
    <Modal
      visible={visible}
      title={reservation ? 'Edit Reservation' : 'Create New Reservation'}
      okText={reservation ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="table"
          label="Table"
          rules={[{ required: true, message: 'Please select a table!' }]}
        >
          <Select placeholder="Select a table">
            {tables.map(table => (
              <Option key={table.id} value={table.id}>
                Table {table.number} (Capacity: {table.capacity})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="customer_name"
          label="Customer Name"
          rules={[{ required: true, message: 'Please input customer name!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="customer_phone"
          label="Customer Phone"
          rules={[{ required: true, message: 'Please input customer phone!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="customer_email"
          label="Customer Email"
          rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="time"
          label="Time"
          rules={[{ required: true, message: 'Please select a time!' }]}
        >
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>
        
        <Form.Item
          name="party_size"
          label="Party Size"
          rules={[{ required: true, message: 'Please input party size!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
          initialValue="pending"
        >
          <Select>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="seated">Seated</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReservationForm;