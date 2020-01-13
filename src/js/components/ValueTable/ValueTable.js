import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form } from 'antd';
import { useSelectedElement } from '../CreationContext';

const ValueTable = ({ onEdit }) => {
  const selectedElement = useSelectedElement();

  const columns = [
    {
      title: 'Property Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Element Attribute',
      dataIndex: 'value',
      key: 'value',
    },

    {
      title: 'Current Attribute Value',
      dataIndex: 'current',
      key: 'current',
    },

    {
      title: '',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => onEdit(record)}>Edit</a>{' '}
          <a onClick={() => onDelete(record)}>Delete</a>
        </span>
      ),
    },
  ];

  const excludedAttributes = ['class', 'style'];
  const allowedAttributes = ['role', 'data'];
  const allowedValues = ['innerText'];

  const propertyValues = [
    ...new Array(...selectedElement.target.attributes)
      .map(attr => attr.name)
      .filter(attr => !excludedAttributes.includes(attr)),
  ];

  const tableData = useEffect(
    () => [
      ...allowedValues.map(item => ({
        name: item,
        value: item,
        current: selectedElement.target[item],
      })),
      ...propertyValues.map((item, key) => ({
        name: item,
        value: item,
        current: selectedElement.target.getAttribute(item),
      })),
    ],
    [selectedElement]
  );

  return (
    <Table
      pagination={{ position: 'none' }}
      size='small'
      columns={columns}
      dataSource={tableData}
    />
  );
};

export default ValueTable;
