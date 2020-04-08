import React, { useState, useEffect } from 'react';
import icon from '../../img/icon-128.png';
import { hot } from 'react-hot-loader';
import { createListeners } from '../utils';
import { events } from '../utils/events';
import Table from 'antd/lib/table/index.js';
import Login from '../components/Login';
import 'antd/lib/table/style/index.css';

import './styles';

const GreetingComponent = () => {
  const handleSubmit = ({ email, password }) => {
    console.log(email, password);
  };
  return (
    <div style={{ width: '300px' }}>
      <Login onSubmit={handleSubmit} />
    </div>
  );
};

export default GreetingComponent;
