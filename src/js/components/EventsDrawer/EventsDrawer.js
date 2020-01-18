import React, { useState, useEffect } from 'react';
import { Drawer, Table, Button } from 'antd';
import { findMatches } from '../../utils';

const EventsDrawer = ({ events, visible = false, onClose }) => {
  const [data, setData] = useState([]);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'eventName',
      key: 'eventName',
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: 'Rules',
      dataIndex: 'rulesCount',
      key: 'rulesCount',
    },

    {
      title: 'Matches',
      dataIndex: 'matches',
      key: 'matches',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: () => (
        <span>
          <a>See matches</a>
        </span>
      ),
    },
  ];

  useEffect(() => {
    const _events = events.map(item => ({
      ...item,
      rulesCount: Object.keys(item.rules).length,
      matches: findMatches(item.rules).length,
    }));
    setData(_events);
  }, [events]);

  return (
    <Drawer
      title='Created Events'
      placement='right'
      closable
      width={650}
      onClose={onClose}
      visible={visible}
    >
      <Table
        size='small'
        pagination={{ position: 'none' }}
        dataSource={data}
        columns={columns}
      />
    </Drawer>
  );
};

export default EventsDrawer;
