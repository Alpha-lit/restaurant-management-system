import React from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const CategoryForm = ({ visible, onCreate, onCancel, category }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState([]);

  React.useEffect(() => {
    if (category) {
      form.setFieldsValue(category);
      if (category.image) {
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: `http://localhost:8000${category.image}`,
        }]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [category, form]);

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
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        
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
      title={category ? 'Edit Category' : 'Create New Category'}
      okText={category ? 'Update' : 'Create'}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input category name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
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

export default CategoryForm;