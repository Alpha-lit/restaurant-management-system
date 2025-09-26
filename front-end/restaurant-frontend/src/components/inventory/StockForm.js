import React from 'react';
import { Modal, Form, Select, InputNumber } from 'antd';

const { Option } = Select;

const StockForm = ({ visible, onCreate, onCancel, stock, ingredients = [] }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (stock) {
      form.setFieldsValue({
        ingredient: stock.ingredient.id,
        quantity: stock.quantity,
        reorder_threshold: stock.reorder_threshold,
      });
    } else {
      form.resetFields();
    }
  }, [stock, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        console.log('Stock form values:', values); // Debug log
        
        // For both create and update, include the ingredient
        const stockData = {
          ingredient: stock ? stock.ingredient.id : values.ingredient,
          quantity: values.quantity,
          reorder_threshold: values.reorder_threshold,
        };
        
        console.log('Sending stock data:', stockData); // Debug log
        onCreate(stockData);
      })
      .catch(info => {
        console.log('Validate Failed:', info); // Debug log
      });
  };

  return (
    <Modal
      visible={visible}
      title={stock ? 'Edit Stock' : 'Add Stock'}
      okText={stock ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        {/* Conditionally render the ingredient field */}
        {stock ? (
          <Form.Item
            name="ingredient"
            label="Ingredient"
          >
            <Select 
              value={stock.ingredient.id} 
              style={{ width: '100%' }} 
              disabled
            >
              <Option key={stock.ingredient.id} value={stock.ingredient.id}>
                {stock.ingredient.name} ({stock.ingredient.unit})
              </Option>
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            name="ingredient"
            label="Ingredient"
            rules={[{ required: true, message: 'Please select an ingredient!' }]}
          >
            <Select placeholder="Select an ingredient">
              {ingredients.map(ingredient => (
                <Option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Please input quantity!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="reorder_threshold"
          label="Reorder Threshold"
          rules={[{ required: true, message: 'Please input reorder threshold!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockForm;