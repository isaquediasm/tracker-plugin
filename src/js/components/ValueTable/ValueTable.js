import React, { useState, useCallback, useEffect } from 'react';
import {
  Table,
  Modal,
  Button,
  Select,
  Input,
  InputNumber,
  Popconfirm,
  Form,
} from 'antd';
import { useSelectedElement } from '../CreationContext';

const { Option } = Select;
const EditingModal = Form.create()(
  ({ title, options, visible, onOk, onCancel, form }) => {
    const { getFieldDecorator } = form;
    const [selectedAttribute, setSelectedAttribute] = useState(null);

    const onSubmit = useCallback(e => {
      e.preventDefault();

      form.validateFields((err, fieldsValue) => {
        if (err) {
          return;
        }

        onOk({
          ...fieldsValue,
          ...options.find(el => el.attribute === fieldsValue.attribute),
        });
      });
    }, []);

    const handleChangeAttribute = useCallback(val => {
      setSelectedAttribute(val);
    }, []);

    return (
      <Modal
        wrapClassName='tracker-modal'
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={onSubmit}
        maskStyle={{ zIndex: '1000000' }}
        okText={'Add'}
        okButtonProps={{
          htmlType: 'submit',
        }}
      >
        <Form onSubmit={onSubmit}>
          <Form.Item label='Prop Name'>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: 'Please input name',
                },
              ],
            })(<Input placeholder='Please input name' />)}
          </Form.Item>

          <Form.Item label='Prop Name'>
            {getFieldDecorator('attribute', {
              rules: [
                {
                  required: true,
                  message: 'Please attribute',
                },
              ],
            })(
              <Select onChange={handleChangeAttribute}>
                {options.map((item, key) => (
                  <Option key={key} value={item.attribute}>
                    {item.attribute}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          {selectedAttribute && (
            <Form.Item label='Current Value'>
              {options.find(el => el.attribute === selectedAttribute).current}
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
);

const ValueTable = ({ onChange, value = null }) => {
  const [data, setData] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeProp, setActiveProp] = useState({});

  const selectedElement = useSelectedElement();
  const excludedAttributes = ['class', 'style', 'target'];
  const allowedValues = ['innerText'];

  const propertyValues = [
    ...new Array(...selectedElement.target.attributes)
      .map(attr => attr.name)
      .filter(attr => !excludedAttributes.includes(attr)),
  ];

  useEffect(() => {
    if (value) setData(value);
  }, [value]);

  useEffect(() => {
    let options = [
      ...allowedValues.map(item => ({
        name: item,
        type: 'property',
        attribute: item,
        current: selectedElement.target[item],
      })),
      ...propertyValues.map((item, key) => ({
        name: item,
        type: 'attribute',
        attribute: item,
        current: selectedElement.target.getAttribute(item),
      })),
    ];

    setData(options);
    setAttributeOptions(options);
    onChange(options);
  }, [selectedElement]);

  const handleDelete = useCallback(
    record => {
      const newData = data.filter(item => item.name !== record.name);

      setData(newData);
      onChange(newData);
    },
    [data]
  );

  const columns = [
    {
      title: 'Prop Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Element Attr.',
      dataIndex: 'attribute',
      key: 'attribute',
    },

    {
      title: 'Current Attr. Value',
      dataIndex: 'current',
      key: 'current',
    },

    {
      title: '',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={() => handleDelete(record)}>Delete</a>
        </span>
      ),
    },
  ];

  const handleSave = useCallback(
    newAttr => {
      const newData = [...data, newAttr];
      setData(newData);
      setIsEditing(false);
      onChange(newData);
    },
    [data]
  );

  const handleCancel = () => setIsEditing(false);
  const handleNew = useCallback(() => setIsEditing(true), []);

  return (
    <>
      <a onClick={handleNew}>Add new</a>
      <Table
        /*  title={() => 'Event Value'} */
        pagination={{ position: 'none' }}
        size='small'
        columns={columns}
        dataSource={data}
      />

      {isEditing && (
        <EditingModal
          title='Basic Modal'
          visible={isEditing}
          onOk={handleSave}
          onCancel={handleCancel}
          options={attributeOptions}
        ></EditingModal>
      )}
    </>
  );
};

export default ValueTable;
