import React from 'react';
import { Modal, Form, Input, Button, Select, InputNumber, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
 
const { Option } = Select;
const { TextArea } = Input;

const DishForm = ({ visible, onCreate, onCancel, dish, categories, ingredients }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);

  React.useEffect(() => {
    if (dish) {
      form.setFieldsValue({
        ...dish,
        category: dish.category.id,
      });
      if (dish.image) {
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: `http://localhost:8000${dish.image}`,
        }]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [dish, form]);

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(values => {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (key !== 'image') {
            formData.append(key, values[key]);
          }
        });
        
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append('image', fileList[0].originFileObj);
        }
        
        onCreate(formData);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      visible={visible}
      title={dish ? 'Edit Dish' : 'Create New Dish'}
      okText={dish ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input dish name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input dish description!' }]}
        >
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[{ required: true, message: 'Please input price!' }]}
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
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category!' }]}
        >
          <Select placeholder="Select a category">
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="available"
          label="Available"
          valuePropName="checked"
          initialValue={true}
        >
          <input type="checkbox" />
        </Form.Item>
        <Form.Item
          name="preparation_time"
          label="Preparation Time (minutes)"
          rules={[{ required: true, message: 'Please input preparation time!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="calories" label="Calories">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Image">
          <Upload {...uploadProps} listType="picture-card">
            {fileList.length === 0 && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DishForm;