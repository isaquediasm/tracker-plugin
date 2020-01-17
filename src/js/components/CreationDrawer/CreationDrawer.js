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
  Tooltip,
  Divider,
  Table,
  Steps,
} from 'antd';
import { findMatches } from '../../utils';
import EditableTable from '../EditableTable';
import ValueTable from '../ValueTable';
import Footer from './Footer';
import './styles.css';

const { Step } = Steps;

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
const { Option } = Select;

const CreationDrawer = ({
  selectedElement,
  form,
  visible,
  onClose,
  onCancel,
  onSubmit,
  onAddRef,
  onTest,
  currentEvent,
  refElement,
}) => {
  const [eventName, setEventName] = useState(getEventName(selectedElement));
  const [eventValue, setEventValue] = useState();
  const [occurenceLimit, setOccurenceLimit] = useState(0);
  const [rules, setRules] = useState({});
  const [matches, setMatches] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { getFieldDecorator } = form;

  const getAvailableProps = element => element;

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
    console.log('##value', value);
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

  const handleRadioChange = useCallback(({ target }) => {
    setOccurenceLimit(target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    onSubmit({ rules, eventName, eventValue, occurenceLimit });
  }, [currentStep, rules, eventName, eventValue, occurenceLimit]);

  const handleTest = () => {
    onTest({ rules, eventName, eventValue, occurenceLimit });
  };

  const isFormValid = () => {
    const hasRules = Object.keys(rules).length > 0 && matches > 0;

    if (currentStep === 0) return true;

    return currentStep === 0 || hasRules;
  };

  const handleEventValueChange = useCallback(value => {
    setEventValue(value);
  }, []);

  const handleChangeStep = step => setCurrentStep(step);

  return (
    <Drawer
      className='tracker-drawer'
      width={720}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Steps
        type='navigation'
        size='small'
        onChange={handleChangeStep}
        current={currentStep}
      >
        <Step title='Settings' />
        <Step
          status={
            Object.keys(rules).length && currentStep !== 1
              ? 'finish'
              : 'process'
          }
          title='Element'
        />
        <Step disabled={!Object.keys(rules).length} title='Event Value' />
      </Steps>
      <br />
      <Row gutter={16}>
        {currentStep === 0 && (
          <>
            <Col span={12}>
              <Form.Item label='Event Name'>
                <Input onChange={console.log} defaultValue={eventName} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='Event Trigger'>
              <Select
                
                dropdownClassName='tracker-dropdown'
             
                onChange={console.log}
  
              >
                <Option key={1}>teste</Option>
               
              </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label='Event Occurence'>
                <Radio.Group
                  onChange={handleRadioChange}
                  value={occurenceLimit}
                >
                  <Radio value={0}>Any match across the application</Radio>
                  <Radio value={1}>
                    Only matches on this page ({window.location.pathname})
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Col span={12}>
              <RulesTree
                onChange={handleRuleChange}
                nodes={selectedElement.path}
              />
            </Col>
            <Col span={12}>
              <Form.Item label='Matches'>
                <p>
                  <strong>{matches}</strong> matched elements
                </p>{' '}
              </Form.Item>
            </Col>
          </>
        )}

        {currentStep === 2 && (
          <Col span={24}>
            <ValueTable value={eventValue} onChange={handleEventValueChange} />
          </Col>
        )}
      </Row>

      {/* <Form layout='vertical' hideRequiredMark>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item>
              <Select
                mode='multiple'
                dropdownClassName='tracker-dropdown'
                  value={eventValue}
                onChang e={handleRadioChange(setEventValue)}
                placeholder='Attribute Value'
              >
                {propertyValues.map(item => (
                  <Option key={item}>{item}</Option>
                ))}
              </Select>
              <Tooltip
                className='tracker-element'
                placement='top'
                title='You can add an reference element to provide the value to this event'
              >
                <Button onClick={onAddRef} type='link' size='small'>
                  Add reference element
                </Button>
              </Tooltip>
               <EditableTable data={tableData(selectedElement.target)} />
              <ValueTable
                value={eventValue}
                onChange={handleEventValueChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
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
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Trigger Elements'>
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
      </Form> */}
      <Footer>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        {matches > 0 && (
          <Button onClick={handleTest} style={{ marginRight: 8 }}>
            See matches
          </Button>
        )}
        <Button disabled={!isFormValid()} onClick={handleSubmit} type='primary'>
          {currentStep === 2 ? 'Submit' : 'Next'}
        </Button>
      </Footer>
    </Drawer>
  );
};

export default Form.create()(CreationDrawer);
