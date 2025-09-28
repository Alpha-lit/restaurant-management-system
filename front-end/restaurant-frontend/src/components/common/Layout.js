import React from 'react';
import { Layout } from 'antd';
import AppHeader from './Header';
 
const { Content, Footer } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Restaurant Management System ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default AppLayout;