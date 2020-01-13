import React, { useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form } from 'antd';

const EditableContext = React.createContext();

const EditableCell = props => {
  const getInput = () => {
    if (props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };

  const renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
            })(getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return <EditableContext.Consumer>{renderCell}</EditableContext.Consumer>;
};

const EditableTable = props => {
  const [data, setData] = useState(props.data || []);
  const [editingKey, setEditingKey] = useState('');

  const tableColumns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'value',
      dataIndex: 'value',
      width: '15%',
      editable: true,
    },
    {
      title: 'current',
      dataIndex: 'current',
      width: '40%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <EditableContext.Consumer>
              {form => (
                <a
                  onClick={() => save(form, record.key)}
                  style={{ marginRight: 8 }}
                >
                  Save
                </a>
              )}
            </EditableContext.Consumer>

            <a onClick={() => cancel(record.key)}>Cancel</a>
          </span>
        ) : (
          <a disabled={editingKey !== ''} onClick={() => edit(record.key)}>
            Edit
          </a>
        );
      },
    },
  ];

  const isEditing = record => record.key === editingKey;

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  const columns = tableColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const cancel = () => {
    setEditingKey('');
  };

  const save = (form, key) => {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    });
  };

  const edit = key => {
    setEditingKey(key);
  };

  return (
    <EditableContext.Provider value={props.form}>
      <Table
        components={components}
        bordered
        dataSource={data}
        columns={columns}
        rowClassName='editable-row'
        pagination={{
          onChange: cancel,
        }}
      />
    </EditableContext.Provider>
  );
};

export default Form.create()(EditableTable);
