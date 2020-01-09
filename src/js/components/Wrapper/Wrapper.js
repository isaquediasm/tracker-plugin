import React, { useCallback, useState, useMemo } from 'react';
import { message, notification, Button, Dropdown } from 'antd';
import CreationDrawer from '../CreationDrawer';
import { findMatches, getElementIdentifier } from '../../utils';
import { isTagAllowed, isInteractive, isExternal } from '../../utils/validate';
import 'antd/lib/button/style/index.css';
import './antd.scss';
import './styles.scss';

const ActionButtons = ({ children }) => (
  <div className='tracker-add-button'>{children}</div>
);

const Header = ({ isCreating }) => (
  <div className='tracker-header'>
    <Button.Group size='large'>
      <Button icon='eye' type={isCreating ? 'default' : 'primary'}>
        Visualize
      </Button>
      <Button icon='edit' type={!isCreating ? 'default' : 'primary'}>
        Editing
      </Button>
    </Button.Group>
  </div>
);

function elementsManipulation() {
  let elements = [];
  let activeClass = null;

  return {
    addClass: (node, className = 'activeElement', isStatic) => {
      elements = node;
      activeClass = className;
      for (let element of node) {
        element.classList.add(className);

        // add a listener to remove the active class
        !isStatic &&
          element.addEventListener('mouseleave', ev => {
            element.classList.remove(activeClass);
          });
      }
    },
    removeAddedClass: className => {
      console.log('##remove', elements, activeClass);
      for (let element of elements) {
        element.classList.remove(activeClass);
      }
    },
  };
}

function Listeners() {
  let listeners = {};

  return {
    addListener: (element, trigger, fn) => {
      const elementId = getElementIdentifier(element);
      element.addEventListener(trigger, fn);

      const currListener = listeners[elementId] || [];

      listeners[elementId] = [...currListener, { element, trigger, fn }];
    },

    removeListeners: (element, trigger) => {
      const elementId = getElementIdentifier(element);
      const currListener = listeners[elementId];

      if (!currListener) return;
      const filteredList = currListener.filter(
        item => item.trigger === trigger
      );

      for (let listener of filteredList) {
        listener.element.removeEventListener(listener.trigger, listener.fn);
      }

      listeners[elementid] = filteredList;
    },
  };
}

function ClassNameService(className = 'activeElement', callback = () => false) {
  const state = {
    current: null,
  };

  const addTo = hostElement => {
    if (state.current !== null) removeFrom(state.current);

    hostElement.classList.add(className);
    state.current = hostElement;
  };

  const removeFrom = hostElement => {
    hostElement.classList.remove(className);
    state.current = null;
  };

  return { addTo, removeFrom };
}

function TrackerCTA(newNode, callback = () => false) {
  const state = {
    current: null,
  };

  newNode.addEventListener('click', ev => {
    ev.stopPropagation();
    ev.preventDefault();
    callback(ev);
  });

  const addTo = hostElement => {
    if (state.current !== null) removeFrom(state.current);

    hostElement.appendChild(newNode);
    state.current = hostElement;
  };

  const removeFrom = hostElement => {
    if (state.current === null) return;
    hostElement.removeChild(newNode);
    state.current = null;
  };

  return { addTo, removeFrom };
}

const listenerService = Listeners();
const classManipulation = elementsManipulation();
const newEl = document.createElement('div');
newEl.innerText = '+';

newEl.style.display = 'inline-block';
newEl.style.position = 'absolute';
newEl.style.left = '0';
newEl.style.top = '-5px';
/*  newNode.style.top = `${offsetTop + offsetHeight + 4}px`;
newNode.style.left = `${offsetLeft}px`; */

newEl.style.borderRadius = '4px';
newEl.classList.add('tracker-cta');

const trackerCTA = TrackerCTA(newEl, ev => {
  ev.preventDefault();
  ev.stopPropagation();

  alert('clickou papai');
});
const activeClassName = ClassNameService();

const Wrapper = ({ onClose, onSetCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({});

  function documentListener(ev) {
    const { target, path } = ev;

    if (!isTagAllowed(target) || !isInteractive(target) || !isExternal(path))
      return;

    activeClassName.addTo(target);

    // experimental
    const {
      offsetHeight,
      offsetTop,
      offsetLeft,
      offsetBottom,
      offsetRight,
    } = target;

    trackerCTA.addTo(target);

    target.addEventListener('mouseleave', ev => {
      trackerCTA.removeFrom(target);
      console.log('##removed');
    });

    function clickListener(ev) {
      /*   ev.stopPropagation();
      ev.preventDefault();

      setSelectedElement(ev);
      setIsCreating(true);

      document.removeEventListener('mouseover', documentListener);
      target.removeEventListener('click', clickListener);

      console.log('##out', target); */
    }

    target.addEventListener('click', clickListener);
  }
  const createHighlight = () => {
    document.addEventListener('mouseover', documentListener);
  };

  const handleCreation = () => {
    notification.info({
      className: 'tracker-notification',
      message: 'Select one element',
      description:
        'Please select an element to be tracked. You just need to click on it 😄',
      duration: 10,
    });
    setIsEditing(true);
    createHighlight();
  };

  const handleTesting = ev => {
    const searchedMatches = findMatches(ev.rules);

    classManipulation.addClass(searchedMatches, 'matchedElement', true);
    setIsCreating(false);

    setIsTesting(true);

    listenerService.addListener(document, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
    });

    setCurrentEvent(ev);
    console.log('##matches', searchedMatches);
  };

  const handleSubmit = ev => {
    listenerService.removeListeners(document, 'click');
    setIsEditing(false);
    setIsCreating(false);

    message.success(`Your event "${ev.eventName}" was successfully created`, 5);
  };

  const handleEdit = () => {
    classManipulation.removeAddedClass();
    listenerService.removeListeners(document, 'click');
    setIsTesting(false);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleCancel = () => {
    classManipulation.removeAddedClass();
    listenerService.removeListeners(document, 'click');
    setIsTesting(false);
    setIsEditing(false);
    setIsCreating(false);
  };

  /*   const eventsMenu = (
    <Menu onClick={console.log}>
      <Menu.Item key={'click'}>Click Event</Menu.Item>
      <Menu.Item key={'modal'}>Modal Event</Menu.Item>
      <Menu.Item key={'form'}>3rd item</Menu.Item>
    </Menu>
  ); */

  return (
    <div className='tracker-menu'>
      {/* <Header isCreating={isCreating} /> */}
      <ActionButtons>
        {!isCreating && !isTesting && (
          <>
            <Button style={{ marginRight: 8 }} size='large' type='default'>
              See All Events
            </Button>

            {/*  <Dropdown overlay={menu}>
              <Button>
                Add New <Icon type='down' />
              </Button>
            </Dropdown> */}
            <Button
              onClick={handleCreation}
              type='primary'
              size='large'
              icon='plus'
            >
              Add new
            </Button>
          </>
        )}

        {isTesting && (
          <>
            <Button
              onClick={handleCancel}
              style={{ marginRight: 8 }}
              size='large'
              type='default'
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              style={{ marginRight: 8 }}
              size='large'
              type='default'
            >
              Edit Event
            </Button>
            <Button size='large' type='primary'>
              Submit
            </Button>
          </>
        )}
      </ActionButtons>

      {isEditing && selectedElement && (
        <CreationDrawer
          selectedElement={selectedElement}
          currentEvent={currentEvent}
          visible={isCreating}
          onClose={handleCancel}
          onCancel={handleCancel}
          onTest={handleTesting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Wrapper;
