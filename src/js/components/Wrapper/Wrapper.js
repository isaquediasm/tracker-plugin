import React, { useCallback, useState, useMemo } from 'react';
import { message, notification, Button, Tooltip } from 'antd';
import CreationDrawer from '../CreationDrawer';
import { findMatches, getElementIdentifier } from '../../utils';
import { isTagAllowed, isInteractive, isExternal } from '../../utils/validate';
import { ListenerService } from '../../utils/listeners';
import { CreationProvider } from '../CreationContext';
import EventsDrawer from '../EventsDrawer';
import { events } from '../../utils/events';

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

function ClassNameService(className = 'activeElement', callback = () => false) {
  const state = {
    current: null,
  };

  const addTo = hostElement => {
    if (state.current !== null) removeFrom(state.current);

    hostElement.classList.add(className);
    state.current = hostElement;
  };

  const removeFrom = () => {
    if (!state.current) return;
    state.current.classList.remove(className);
    state.current = null;
  };

  return { addTo, removeFrom };
}

function TrackerCTA(newNode) {
  const listeners = new ListenerService();
  const state = {
    current: null,
    node: null,
  };

  const addTo = (hostElement, cb = () => false) => {
    if (state.current !== null) removeFrom();

    listeners.addListener(newNode, 'click', cb);
    hostElement.appendChild(newNode);

    state.current = hostElement;
  };

  const removeFrom = () => {
    if (!state.current) return;

    listeners.removeListeners(newNode, 'click');
    state.current.removeChild(newNode);

    state.current = null;
  };

  const getInstance = () => state.current;

  return { addTo, removeFrom, getInstance };
}
const listenerService = new ListenerService();
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

const trackerCTA = TrackerCTA(newEl);

const activeClassName = ClassNameService();

const Wrapper = ({ onClose, onSetCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isAddingRef, setIsAddingRef] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [refElement, setRefElement] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({});
  const [createdEvents, setCreatedEvents] = useState([]);
  const [isVisualizingEvents, setIsVisualizingEvents] = useState(false);
  const documentListener = cb => ev => {
    const { target, path } = ev;

    if (!isTagAllowed(target) || !isInteractive(target) || !isExternal(path))
      return;

    cb(ev);
  };

  const showAddButton = (target, cb) => {
    return trackerCTA.addTo(target, async ev => {
      console.log('##click called', ev.target);
      ev.preventDefault();
      ev.stopPropagation();

      await cb(ev);

      /* trackerCTA.removeFrom(); */
      activeClassName.removeFrom();
    });
  };

  const createHighlight = onClick => {
    const docListener = documentListener(ev => {
      const { target, path } = ev;
      activeClassName.addTo(target);

      showAddButton(target, ev => {
        const element = {
          target: ev.target.offsetParent,
          path: ev.path.slice(1, ev.path.length),
        };

        onClick(element);
      });
    });

    listenerService.addListener(document, 'mouseover', docListener);
  };

  const handleCreation = () => {
    notification.info({
      className: 'tracker-notification',
      message: 'Select one element',
      description:
        'Please select an element to be tracked. You just need to click on it 😄',
    });
    setIsEditing(true);

    // create hightlight and cta btn on the selected elementn
    createHighlight(element => {
      trackerCTA.removeFrom();

      listenerService.removeAll(document, 'mouseover');
      setSelectedElement(element);
      setIsCreating(true);
    });
  };

  function createListeners(ev) {
    const helpers = {
      property: (el, prop) => el[prop],
      attribute: (el, attr) => el.getAttribute(attr),
    };

    const matches = findMatches(ev.rules);

    for (let el of matches) {
      listenerService.addListener(el, ev.trigger, () => {
        const eventValue = Object.assign(
          ...ev.eventValue.map(item => ({
            [item.name]: helpers[item.type](el, item.attribute),
          }))
        );

        const finalEvent = {
          name: ev.eventName,
          value: eventValue,
        };

        console.log('##event dispatched', finalEvent);
      });
    }
  }

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

  const handleSubmit = useCallback(
    ev => {
      listenerService.removeListeners(document, 'click');
      setIsEditing(false);
      setIsCreating(false);

      events.create(ev);

      message.success(
        `Your event "${ev.eventName}" was successfully created`,
        5
      );

      createListeners(ev);

      setCreatedEvents([...createdEvents, ev]);
    },
    [createdEvents]
  );

  const handleEdit = () => {
    classManipulation.removeAddedClass();
    listenerService.removeAll();

    setIsTesting(false);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleCancel = () => {
    classManipulation.removeAddedClass();
    listenerService.removeAll();

    setIsTesting(false);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleVisualize = () => {
    setIsVisualizingEvents(!isVisualizingEvents);
  };

  const handleAddRefMode = () => {
    setIsCreating(false);
    setIsAddingRef(true);
    message.info('Please select the reference element');

    createHighlight(element => {
      setRefElement(element);
      setIsCreating(true);
      setIsAddingRef(false);
    });
  };

  /*   const eventsMenu = (
    <Menu onClick={console.log}>
      <Menu.Item key={'click'}>Click Event</Menu.Item>
      <Menu.Item key={'modal'}>Modal Event</Menu.Item>
      <Menu.Item key={'form'}>3rd item</Menu.Item>
    </Menu>
  ); */
  console.log('##re-rendered', isEditing, isCreating, selectedElement);
  return (
    <div className='tracker-menu'>
      {/* <Header isCreating={isCreating} /> */}
      <ActionButtons>
        {!isCreating && !isTesting && (
          <>
            <Button
              onClick={handleVisualize}
              style={{ marginRight: 8 }}
              size='large'
              type='default'
            >
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
        <CreationProvider selectedElement={selectedElement}>
          <CreationDrawer
            selectedElement={selectedElement}
            refElement={refElement}
            currentEvent={currentEvent}
            visible={isCreating}
            onClose={handleCancel}
            onCancel={handleCancel}
            onTest={handleTesting}
            onSubmit={handleSubmit}
            onAddRef={handleAddRefMode}
          />
        </CreationProvider>
      )}

      {isVisualizingEvents && (
        <EventsDrawer
          onClose={handleVisualize}
          visible={isVisualizingEvents}
          events={createdEvents}
        />
      )}
    </div>
  );
};

export default Wrapper;
