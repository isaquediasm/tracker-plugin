import React from 'react';
import { Button } from 'antd';

const Footer = ({ onClose, onSubmit }) => (
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
    <Button onClick={onClose} style={{ marginRight: 8 }}>
      Cancel
    </Button>
    <Button onClick={onSubmit} type='primary'>
      Submit
    </Button>
  </div>
);

export default Footer;
