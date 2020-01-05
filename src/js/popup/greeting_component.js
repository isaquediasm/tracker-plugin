import React, { useState, useEffect } from 'react';
import icon from '../../img/icon-128.png';
import { hot } from 'react-hot-loader';
import { createListeners } from '../utils';
import { events } from '../utils/events';
import Table from 'antd/lib/table/index.js';
import 'antd/lib/table/style/index.css';

import './styles';

const noop = () => false;

const Checkbox = ({ label = '', value, onChange = noop, checked = false }) => {
  const [isChecked, setChecked] = useState(checked);

  const handleChange = () => {
    onChange(value, !isChecked);
    setChecked(!isChecked);
  };

  useEffect(() => {
    setChecked(checked);
  }, [checked]);

  return !!value ? (
    <li>
      <strong>
        <input type='checkbox' onClick={handleChange} checked={isChecked} />{' '}
        {label}:
      </strong>{' '}
      {value}
    </li>
  ) : (
    <></>
  );
};

const RadioGroup = ({ name, options, onChange }) =>
  options
    .filter(item => item.value)
    .map(item => (
      <>
        <input
          style={{ float: 'left', marginRight: '5px' }}
          type='radio'
          id={name}
          name={name}
          value={item.value}
          onChange={() => onChange(item.value)}
        />
        <label forHtml={name}>
          {item.label}: {item.value}
        </label>
      </>
    ));

const ClassNameSelector = ({ className = ' ', onChange }) => (
  <div className='classSelector'>
    {className.split(' ').map(el => (
      <div class='classItem'>
        <Checkbox onChange={onChange} value={el} />
      </div>
    ))}
  </div>
);

function GreetingComponent({
  activeElement,
  refElement,
  visible,
  onClose,
} = {}) {
  const [eventName, setEventName] = useState(
    `Clicked on ${activeElement.target.innerText ||
      activeElement.target.value ||
      activeElement.target.id ||
      activeElement.target.className}`
  );

  const [rules, setRules] = useState({});

  const [eventValue, setEventValue] = useState('');

  console.log('##rules', { rules, eventValue });
  /* console.log(
    '##rules set',
    '\n',
    eventName,
    '\n',
    Object.keys(rules)
      .sort((a, b) => a - b)
      .map(key => `${rules[key].tagName}.${rules[key].classNames.join('.')}`)
      .reverse()
      .join(' > ')
  ); */

  const formatEvent = event => {
    const value = eventValue === 'innerText' ? event.target.innerText : {};
    console.log({
      eventName,
      value,
    });
  };

  function highlightElements(elements) {
    const selector = elements
      .map(
        el =>
          `${el.tagName}${el.id ? `#${el.id}` : ''}${
            el.className ? `.${el.className}` : ''
          }`
      )
      .join(' ');

    const list = document.querySelectorAll(selector);

    if (!list.length) return;

    for (let item of list) {
      item.style = 'border: 5px solid red';
    }
  }

  const createEvent = () => {
    const rulesSet = Object.values(rules).reverse();

    events.create({ name: eventName, rules, value: eventValue });
    // highlights matching elements on the UI
    highlightElements(rulesSet);

    createListeners(rules);
    setEventValue('');
    setRules({});
  };

  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  return (
    <>
      <div
        style={{
          display: visible ? 'block' : 'none',
          height: '100vh',
          overflow: 'auto',
        }}
        className='tracker-menu'
      >
        <button style={{ float: 'right' }} onClick={onClose}>
          X
        </button>

        <Table dataSource={dataSource} columns={columns} />
        <ul>
          <label forHtml='name'>Event Name: </label>
          <input
            style={{ width: 200 }}
            type='text'
            onChange={ev => setEventName(ev.target.value)}
            value={eventName}
          />
        </ul>

        <br />
        <ul>
          <h3>Path</h3>
          {activeElement.path
            .filter(
              (el, idx) =>
                idx !== 0 ||
                el.tagName !== 'BODY' ||
                el.tagName !== 'MAIN' ||
                el.tagName !== 'HTML'
            )
            .map((el, idx) => (
              <li>
                <Checkbox
                  onChange={(_, checked) => {
                    const _rules = rules;

                    if (!checked) {
                      delete _rules[idx];
                    } else {
                      _rules[idx] = {
                        tagName: el.tagName,
                        className: '',
                        id: null,
                      };
                    }

                    setRules({
                      ..._rules,
                    });
                  }}
                  label={el.tagName}
                  value={el.tagName}
                />
                <Checkbox
                  onChange={id => {
                    setRules({
                      ...rules,
                      [idx]: {
                        ...rules[idx],
                        id,
                      },
                    });
                  }}
                  value={el.id}
                />
                {el.id && `#${el.id} `}

                <ClassNameSelector
                  onChange={className => {
                    setRules({
                      ...rules,
                      [idx]: {
                        ...rules[idx],
                        className,
                      },
                    });
                  }}
                  className={el.className}
                />
              </li>
            ))}
        </ul>
        <ul>
          <h3>Value</h3>
          <Checkbox
            label='InnerText'
            onChange={setEventValue}
            value={'innerText'}
          />
          <li>
            <input style={{ width: 200 }} type='text' value={eventValue} />
          </li>
          <br />

          <button onClick={createEvent}>Create Event </button>
          {!!refElement && (
            <li>
              <label forHtml='name'>
                <strong>Ref element: </strong>
              </label>
              <RadioGroup
                name='refElement'
                onChange={setEventValue}
                options={[
                  { label: 'Text', value: refElement.target.innerText },
                  { label: 'Value', value: refElement.target.value },
                ]}
              />
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

export default GreetingComponent;
