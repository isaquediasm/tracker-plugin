import React, { useCallback, useState, useMemo } from 'react';
import { Button } from 'antd';
import CreationDrawer from '../CreationDrawer';
import 'antd/lib/button/style/index.css';

import './antd.scss';
import './styles.css';
import { create } from 'domain';

const AddButton = ({ onClick }) => (
  <div className='tracker-add-button'>
    <Button onClick={onClick} type='primary' size='large' icon='plus'>
      Add new event
    </Button>
  </div>
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

const Wrapper = ({ onClose, onSetCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  const createHighlight = useCallback(() => {
    console.log('##editing', isEditing);
    if (!isEditing) return;

    document.addEventListener('mouseover', ev => {
      const { target, path } = ev;

      // those are the tags we support, mostly interactive tags (where the user can click on)
      const allowedTags = ['div', 'a', 'button', 'select'];
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

      target.addEventListener('click', ev => {
        ev.stopPropagation();
        ev.preventDefault();

        setIsCreating(true);
        setSelectedElement(ev);

        console.log('##out', target);
      });
    });
  }, [isEditing]);

  const handleCreation = useCallback(() => {
    setIsEditing(true);
    createHighlight();
  });

  console.log('');

  return (
    <div className='tracker-menu'>
      {/* <Header isCreating={isCreating} /> */}
      {!isCreating && <AddButton onClick={handleCreation} />}

      {isCreating && selectedElement && (
        <CreationDrawer
          selectedElement={selectedElement}
          visible={isCreating}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
};

export default Wrapper;
