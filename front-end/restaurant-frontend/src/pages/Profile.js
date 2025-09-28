import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../services/api';
 
const { TextArea } = Input;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      });
      
      if (user.profile_image) {
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: `http://localhost:8000${user.profile_image}`,
        }]);
      }
    }
  }, [user, form]);

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'profile_image') {
          formData.append(key, values[key]);
        }
      });
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('profile_image', fileList[0].originFileObj);
      }
      
      await api.patch(`auth/users/${user.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        title="My Profile"
        extra={
          <Button 
            type={editMode ? "default" : "primary"} 
            icon={<EditOutlined />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar 
            size={100} 
            icon={<UserOutlined />} 
            src={user?.profile_image ? `http://localhost:8000${user.profile_image}` : null}
          />
          <h2>{user?.username}</h2>
          <p>{user?.role}</p>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={!editMode}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="first_name"
            label="First Name"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="last_name"
            label="Last Name"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>
          
          {editMode && (
            <Form.Item label="Profile Image">
              <Upload {...uploadProps} listType="picture-card">
                {fileList.length === 0 && (
                  <div>
                    <UserOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}
          
          {editMode && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default Profile;