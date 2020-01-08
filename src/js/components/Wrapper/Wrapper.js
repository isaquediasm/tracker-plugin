import React, { useCallback, useState, useMemo } from 'react';
import { message, notification, Button } from 'antd';
import CreationDrawer from '../CreationDrawer';
import { findMatches } from '../../utils';
import { isTagAllowed, isInteractive, isExternal } from '../../utils/validate';
import 'antd/lib/button/style/index.css';
import './antd.scss';
import './styles.css';

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

const classManipulation = elementsManipulation();

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

    const activeClass = 'activeElement';

    target.classList.add(activeClass);

    target.addEventListener('mouseleave', ev => {
      target.classList.remove(activeClass);
      console.log('##removed');
    });

    function clickListener(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      setSelectedElement(ev);
      setIsCreating(true);

      document.removeEventListener('mouseover', documentListener);
      target.removeEventListener('click', clickListener);

      console.log('##out', target);
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
    document.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
    });

    setCurrentEvent(ev);
    console.log('##matches', searchedMatches);
  };

  const handleSubmit = ev => {
    setIsEditing(false);
    setIsCreating(false);

    message.success(`Your event "${ev.eventName}" was successfully created`, 5);
  };

  const handleEdit = () => {
    classManipulation.removeAddedClass();
    setIsTesting(false);
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleCancel = () => {
    classManipulation.removeAddedClass();
    setIsTesting(false);
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <div className='tracker-menu'>
      {/* <Header isCreating={isCreating} /> */}
      <ActionButtons>
        {!isCreating && !isTesting && (
          <>
            <Button style={{ marginRight: 8 }} size='large' type='default'>
              See All Events
            </Button>
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
