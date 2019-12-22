import React, { useState, useEffect } from 'react';
import icon from '../../img/icon-128.png';
import { hot } from 'react-hot-loader';
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

  const [rules, setRules] = useState({
    '0': { tagName: 'A', classNames: [], id: null },
    '1': { tagName: 'LI', classNames: ['LinkText'], id: null },
    '3': { tagName: 'LI', classNames: ['ProductsNav'], id: null },
  });

  const [eventValue, setEventValue] = useState('');

  console.log('##rules', rules);
  console.log(
    '##rules set',
    '\n',
    eventName,
    '\n',
    Object.keys(rules)
      .sort((a, b) => a - b)
      .map(key => `${rules[key].tagName}.${rules[key].classNames.join('.')}`)
      .reverse()
      .join(' > ')
  );

  const createEvent = () => {
    const rulesSet = Object.keys(rules)
      .sort((a, b) => b - a)
      .map(key => rules[key]);

    const lastParent = rulesSet[0];
    const elements = document.getElementsByClassName(lastParent.classNames[0]);

    console.log('##el', elements);

    for (let el of elements) {
      el.addEventListener(
        'click',
        function(event) {
          const { path } = event;
          event.preventDefault();
          console.log('clicked', event.path[0].className);

          const entries = Object.entries(rules);
          const check = entries.filter(
            ([idx, rule]) =>
              path[idx].tagName === rule.tagName &&
              (rule.classNames.length
                ? path[idx].className.includes(rule.classNames[0])
                : true)
          );

          if (check.length === entries.length) {
            console.log('track this', check);
          }
        },
        false
      );
    }
  };

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
                        classNames: [],
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
                {el.id && `#${el.id} `}

                <ClassNameSelector
                  onChange={className => {
                    setRules({
                      ...rules,
                      [idx]: {
                        ...rules[idx],
                        classNames: [...rules[idx].classNames, className],
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
          <Checkbox label='InnerText' value={activeElement.target.innerText} />
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
