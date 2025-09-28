import React from 'react';
import { Modal, Form, Select, InputNumber, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
 
const { Option } = Select;

const OrderForm = ({ visible, onCreate, onCancel, order, tables = [], dishes = [] }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (order) {
      form.setFieldsValue({
        table: order.table?.id,
        items: order.items.map(item => ({
          dish: item.dish.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      });
    } else {
      form.resetFields();
    }
  }, [order, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        console.log('Order form values:', values); // Debug log
        onCreate(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info); // Debug log
      });
  };

  return (
    <Modal
      visible={visible}
      title={order ? 'Edit Order' : 'Create New Order'}
      okText={order ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
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
        
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-end' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'dish']}
                    label="Dish"
                    rules={[{ required: true, message: 'Missing dish' }]}
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    <Select placeholder="Select dish">
                      {dishes.map(dish => (
                        <Option key={dish.id} value={dish.id}>
                          {dish.name} - ${dish.price}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    label="Quantity"
                    rules={[{ required: true, message: 'Missing quantity' }]}
                    style={{ width: 100, marginRight: 8 }}
                  >
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'notes']}
                    label="Notes"
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    <Select placeholder="Select notes">
                      <Option value="Extra spicy">Extra spicy</Option>
                      <Option value="No onions">No onions</Option>
                      <Option value="Well done">Well done</Option>
                      <Option value="Rare">Rare</Option>
                    </Select>
                  </Form.Item>
                  <Button onClick={() => remove(name)} type="primary" danger>
                    Remove
                  </Button>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default OrderForm;