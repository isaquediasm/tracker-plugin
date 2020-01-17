import React from 'react';
import { Button } from 'antd';

const Footer = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: '100%',
      borderTop: '1px solid #e9e9e9',
      padding: '10px 16px',
      background: '#fff',
      textAlign: 'right',
    }}
  >
    {children}
  </div>
);

export default Footer;
