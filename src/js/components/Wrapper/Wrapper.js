import React, { useCallback, useState, useMemo } from 'react';
import { message, notification, Button } from 'antd';
import CreationDrawer from '../CreationDrawer';
import { findMatches } from '../../utils';
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

    console.log('##listener triggered');
    // those are the tags we support, mostly interactive tags (where the user can click on)
    const allowedTags = ['span', 'div', 'a', 'button', 'select'];
    // checks for allowed tagnames
    const isTagAllowed = allowedTags.some(
      tag => target.nodeName.toLowerCase() === tag
    );
    // checks if the element is interactive
    const isInteractive =
      getComputedStyle(target).cursor === 'pointer' ||
      target.style.cursor === 'pointer';

    // checks if the element is not part of our chrome plugin
    const isExternal = !path.some(({ className = '' }) =>
      className.includes('tracker')
    );

    if (!isTagAllowed || !isInteractive || !isExternal) return;

    const activeClass = 'activeElement';

    target.classList.add(activeClass);

    target.addEventListener('mouseleave', ev => {
      target.classList.remove(activeClass);
      console.log('##removed');
    });

    function clickListener(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      setIsCreating(true);
      setSelectedElement(ev);

      document.removeEventListener('mouseover', documentListener);
      target.removeEventListener('click', clickListener);

      console.log('##out', target);
    }

    target.addEventListener('click', clickListener);
  }
  const createHighlight = () => {
    if (!isEditing) return;

    document.addEventListener('mouseover', documentListener);
  };

  const handleCreation = useCallback(() => {
    notification.info({
      message: 'Select one element',
      description:
        'Please select an element to be tracked. You just need to click on it 😄',
      duration: 10,
    });
    setIsEditing(true);
    createHighlight();
  });

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

  return (
    <div className='tracker-menu'>
      {/* <Header isCreating={isCreating} /> */}
      <ActionButtons>
        {!isCreating && !isTesting && (
          <Button
            onClick={handleCreation}
            type='primary'
            size='large'
            icon='plus'
          >
            Add new event
          </Button>
        )}

        {isTesting && (
          <>
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
          onClose={() => setIsCreating(false)}
          onTest={handleTesting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Wrapper;
