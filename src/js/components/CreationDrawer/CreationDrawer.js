import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Radio,
  Tree,
  Drawer,
  Form,
  Row,
  Col,
  Input,
  Select,
  Typography,
  Divider,
} from 'antd';
import { findMatches } from '../../utils';
import Footer from './Footer';
import './styles.css';

function getEventName(element) {
  const basePrefix = 'Clicked on';
  const elementRef =
    element.target.innerText ||
    element.target.value ||
    element.target.id ||
    element.target.className;

  return `${basePrefix} ${elementRef}`;
}

function getElementTitle(element) {
  const { tagName, id, className } = elemennt;

  return `${tagName}${id && `#${id}`}`;
}

// TODO: Uncheck classes when tagName is unchecked
const RulesTree = ({ nodes, onChange }) => {
  const { TreeNode } = Tree;
  const [checkedKeys, setCheckedKeys] = useState([]);

  const handleCheck = useCallback((list, ev) => {
    const { eventKey } = ev.node.props;
    const rule = JSON.parse(eventKey);
    const prop = rule.className ? 'className' : rule.tagName ? 'tagName' : 'id';

    let checkedList = list.checked;
    if (prop === 'tagName' && !ev.checked) {
      checkedList = list.checked.filter(
        item => JSON.parse(item).idx !== rule.idx
      );
    } else if (
      prop !== 'tagName' &&
      ev.checked &&
      !list.checked.some(item => item.tagName && item.idx === rule.idx)
    ) {
      const parent = { idx: rule.idx, tagName: rule.parent.tagName };

      checkedList = [...checkedList, JSON.stringify(parent)];

      delete rule[prop].parent;

      setCheckedKeys(checkedList);
      onChange({
        idx: rule.idx,
        prop: 'tagName',
        value: parent.tagName,
        checked: true,
      });
      setTimeout(
        onChange({
          idx: rule.idx,
          prop,
          value: rule[prop],
          checked: ev.checked,
        }),
        100
      );

      return;
    }

    setCheckedKeys(checkedList);
    onChange({ idx: rule.idx, prop, value: rule[prop], checked: ev.checked });
  }, []);

  return (
    <Tree
      checkedKeys={checkedKeys}
      onCheck={handleCheck}
      checkStrictly
      defaultExpandAll
      checkable
    >
      {nodes
        .filter(
          ({ tagName }) => tagName && tagName !== 'BODY' && tagName !== 'HTML'
        )
        .map((node, idx) => (
          <TreeNode
            key={JSON.stringify({ idx, tagName: node.tagName })}
            title={node.tagName}
          >
            {node.id && (
              <TreeNode
                key={JSON.stringify({
                  idx,
                  id: node.id,
                  parent: { tagName: node.tagName },
                })}
                title={`#${node.id}`}
              />
            )}
            {node.className.length &&
              node.className.split(' ').map((className, _idx) => (
                <TreeNode
                  key={JSON.stringify({
                    idx,
                    className,
                    parent: { tagName: node.tagName },
                  })}
                  title={`.${className}`}
                />
              ))}
          </TreeNode>
        ))}
      {/*  <TreeNode title='parent 1' key='0-0'>
        <TreeNode title='parent 1-0' key='0-0-0' disabled>
          <TreeNode title='leaf' key='0-0-0-0' disableCheckbox />
          <TreeNode title='leaf' key='0-0-0-1' />
        </TreeNode>
        <TreeNode title='parent 1-1' key='0-0-1'>
          <TreeNode
            title={<span style={{ color: '#1890ff' }}>sss</span>}
            key='0-0-1-0'
          />
        </TreeNode>
      </TreeNode> */}
    </Tree>
  );
};

const { Title } = Typography;
const CreationDrawer = ({
  selectedElement,
  form,
  visible,
  onClose,
  onCancel,
  onSubmit,
  onTest,
  currentEvent,
}) => {
  const propertyValues = ['innerText', 'href'];

  const [eventName, setEventName] = useState(getEventName(selectedElement));
  const [eventValue, setEventValue] = useState(propertyValues[0]);
  const [occurenceLimit, setOccurenceLimit] = useState(0);
  const [rules, setRules] = useState({});
  const [matches, setMatches] = useState(0);
  const { getFieldDecorator } = form;

  useEffect(() => {
    if (!Object.keys(currentEvent).length) return;

    console.log('##currEvent', currentEvent);
    const { rules, eventName, eventValue, occurenceLimit } = currentEvent;

    setEventName(eventName);
    setRules(rules);
    setEventValue(eventValue);
    setOccurenceLimit(occurenceLimit);
  }, [currentEvent]);

  const rulesValues = Object.values(rules);
  const handleNameChange = useCallback(value => {
    setEventName(value);
  }, []);

  const handleRuleChange = useCallback(({ idx, prop, value, checked }) => {
    const _rules = rules;

    if (checked) {
      _rules[idx] = {
        ...(_rules[idx] || {}),
        [prop]:
          prop === 'className' ? [...(rules[idx][prop] || []), value] : value,
      };
    } else {
      if (prop === 'tagName') delete _rules[idx];
      else if (prop === 'id') delete _rules[idx][prop];
      else if (prop === 'className') {
        _rules[idx] = {
          ...(_rules[idx] || {}),
          [prop]: rules[idx][prop].filter(val => val !== value),
        };
      }
    }

    setRules({ ..._rules });

    const searchedMatches = findMatches(_rules);
    setMatches(searchedMatches.length);
  }, []);

  const handleRadioChange = setter =>
    useCallback(({ target }) => {
      setter(target.value);
    }, []);

  const handleSubmit = () => {
    onSubmit({ rules, eventName, eventValue, occurenceLimit });
  };

  const handleTest = () => {
    onTest({ rules, eventName, eventValue, occurenceLimit });
  };

  return (
    <Drawer
      className='tracker-drawer'
      title={
        <Title editable={{ onChange: handleNameChange }} level={4}>
          {eventName}
        </Title>
      }
      width={720}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form layout='vertical' hideRequiredMark>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Event Value'>
              <Radio.Group
                value={eventValue}
                onChange={handleRadioChange(setEventValue)}
              >
                {propertyValues.map(item => (
                  <Radio value={item}>{item}</Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Event Occurence'>
              <Radio.Group
                onChange={handleRadioChange(setOccurenceLimit)}
                value={occurenceLimit}
              >
                <Radio value={0}>Any match across the application</Radio>
                <Radio value={1}>
                  Only matches on this page ({window.location.pathname})
                </Radio>
              </Radio.Group>
            </Form.Item>
            {/*  <Form.Item label='Matches'>
              <p>
                <strong>{matches}</strong> matched elements
              </p>{' '}
            </Form.Item> */}
          </Col>
        </Row>
        <Divider style={{ marginTop: '-10px' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Rules'>
              <RulesTree
                onChange={handleRuleChange}
                nodes={selectedElement.path}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Matches'>
              <p>
                <strong>{matches}</strong> matched elements
              </p>{' '}
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label='Path'>
              {!!rulesValues.length &&
                rulesValues
                  .map(
                    item =>
                      `${item.tagName}${item.id ? `#${item.id}` : ''}${
                        item.className ? `.${item.className.join('.')}` : ''
                      }`
                  )
                  .reverse()
                  .join(' > ')}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Footer onTest={handleTest} onCancel={onCancel} onSubmit={handleSubmit} />
    </Drawer>
  );
};

export default Form.create()(CreationDrawer);
