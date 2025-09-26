import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const MenuList = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentDish, setCurrentDish] = useState(null);
  const [fileList, setFileList] = useState([]);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchCategories();
    fetchIngredients();
    fetchDishes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('menu/categories/');
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setCategories(response.data.results);
      } else {
        console.error('Unexpected categories response format:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('menu/ingredients/');
      if (Array.isArray(response.data)) {
        setIngredients(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setIngredients(response.data.results);
      } else {
        console.error('Unexpected ingredients response format:', response.data);
        setIngredients([]);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setIngredients([]);
    }
  };

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await api.get('menu/dishes/');
      if (Array.isArray(response.data)) {
        setDishes(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setDishes(response.data.results);
      } else {
        console.error('Unexpected dishes response format:', response.data);
        setDishes([]);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentDish(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleEdit = (dish) => {
    setCurrentDish(dish);
    form.setFieldsValue({
      ...dish,
      category_id: dish.category.id,
    });
    
    // Set image if exists
    if (dish.image) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: `http://localhost:8000${dish.image}`,
      }]);
    } else {
      setFileList([]);
    }
    
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`menu/dishes/${id}/`);
      message.success('Dish deleted successfully');
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      message.error('Failed to delete dish');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(values).forEach(key => {
        if (key !== 'ingredients' && key !== 'image') {
          formData.append(key, values[key]);
        }
      });
      
      // Handle ingredients
      if (values.ingredients) {
        values.ingredients.forEach((ing, index) => {
          formData.append(`ingredients[${index}].ingredient`, ing.ingredient);
          formData.append(`ingredients[${index}].quantity`, ing.quantity);
        });
      }
      
      // Handle image
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }
      
      if (currentDish) {
        await api.put(`menu/dishes/${currentDish.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Dish updated successfully');
      } else {
        await api.post('menu/dishes/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Dish created successfully');
      }
      
      setModalVisible(false);
      fetchDishes();
    } catch (error) {
      console.error('Error saving dish:', error);
      message.error('Failed to save dish');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => image ? (
        <img 
          src={`http://localhost:8000${image}`} 
          alt="Dish" 
          style={{ width: 50, height: 50, objectFit: 'cover' }} 
        />
      ) : 'No Image',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Available',
      dataIndex: 'available',
      key: 'available',
      render: (available) => (
        <span style={{ color: available ? 'green' : 'red' }}>
          {available ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Preparation Time',
      dataIndex: 'preparation_time',
      key: 'preparation_time',
      render: (time) => `${time} min`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {user.role === 'manager' && (
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Dish
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={dishes}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={currentDish ? 'Edit Dish' : 'Add New Dish'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
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
            name="category_id"
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
          
          <Form.Item
            name="calories"
            label="Calories"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Image">
            <Upload {...uploadProps} listType="picture">
              <Button>Upload Image</Button>
            </Upload>
          </Form.Item>
          
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'ingredient']}
                      rules={[{ required: true, message: 'Missing ingredient' }]}
                    >
                      <Select placeholder="Select ingredient" style={{ width: 200 }}>
                        {ingredients.map(ingredient => (
                          <Option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                    >
                      <InputNumber placeholder="Quantity" min={0} />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>Delete</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Ingredient
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentDish ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuList;