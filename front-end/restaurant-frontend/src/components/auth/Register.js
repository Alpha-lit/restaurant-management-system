import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    
    // Rename confirmPassword to password_confirm to match backend
    const { confirmPassword, ...userData } = values;
    userData.password_confirm = confirmPassword;
    
    console.log('Sending registration data:', userData); // Debug log
    
    api.post('auth/users/', userData)
      .then(response => {
        console.log('Registration response:', response.data); // Debug log
        message.success('Registration successful! Please login.');
        navigate('/login');
      })
      .catch(error => {
        console.error('Registration error:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          message.error(`Registration failed: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          message.error('No response from server. Please try again later.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error:', error.message);
          message.error('An error occurred. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="Register New Account" style={{ width: 400 }}>
        <Form
          name="register"
          onFinish={onFinish}
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>
          
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="manager">Manager</Option>
              <Option value="chef">Chef</Option>
              <Option value="waiter">Waiter</Option>
              <Option value="cashier">Cashier</Option>
              <Option value="host">Host</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Register
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login now!</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;