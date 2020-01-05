import React, { useState, useCallback } from 'react';
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
} from 'antd';
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

  const handleCheck = (list, ev) => {
    const { eventKey } = ev.node.props;
    const rule = JSON.parse(eventKey);
    const prop = rule.className ? 'className' : rule.tagName ? 'tagName' : 'id';

    onChange({ idx: rule.idx, prop, value: rule[prop], checked: ev.checked });
  };

  return (
    <Tree onCheck={handleCheck} checkStrictly defaultExpandAll checkable>
      {nodes
        .filter(
          ({ tagName }) => tagName && tagName !== 'BODY' && tagName !== 'HTML'
        )
        .map((node, idx) => (
          <TreeNode
            key={JSON.stringify({ idx, tagName: node.tagName })}
            title={node.tagName}
          >
            {node.id && <TreeNode title={`#${node.id}`} />}
            {node.className.length &&
              node.className
                .split(' ')
                .map((className, _idx) => (
                  <TreeNode
                    key={JSON.stringify({ idx, className })}
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
  onSubmit,
}) => {
  const [eventName, setEventName] = useState(getEventName(selectedElement));
  const [rules, setRules] = useState({});
  const [matches, setMatches] = useState(0);
  const { getFieldDecorator } = form;

  const propertyValues = ['innertText', 'href'];

  const rulesValues = Object.values(rules);
  const handleNameChange = useCallback(value => {
    setEventName(value);
  }, []);

  const findMatches = useCallback(_rules => {
    const rulesSet = Object.values(_rules).reverse();

    const query = rulesSet
      .map(
        item =>
          `${item.tagName}${item.id ? `#${item.id}` : ''}${
            item.className && item.className.length ? `.${item.className}` : ''
          }`
      )
      .join(' ');

    const results = document.querySelectorAll(query);
    setMatches(results.length);
  });

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

    setRules(_rules);
    findMatches(_rules);
  });

  return (
    <Drawer
      className='tracker-drawer'
      title={
        <Title onChange={handleNameChange} editable level={4}>
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
              {getFieldDecorator('radio-group')(
                <Radio.Group onChange={console.log}>
                  {propertyValues.map(item => (
                    <Radio value={item}>{item}</Radio>
                  ))}
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Matches'>
              <p>
                <strong>{matches}</strong> matched elements
              </p>{' '}
              {!!rulesValues.length &&
                rulesValues
                  .map(
                    item =>
                      `${item.tagName}${
                        item.className ? `.${item.className.join('.')}` : ''
                      }`
                  )
                  .reverse()
                  .join(' > ')}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Rules'>
              <RulesTree
                onChange={handleRuleChange}
                nodes={selectedElement.path}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Footer onClose={onClose} onSubmit={onSubmit} />
    </Drawer>
  );
};

export default Form.create()(CreationDrawer);
