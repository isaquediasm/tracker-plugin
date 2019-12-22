import ContentScript from '../../framework/ContentScript';
import Greeting from '../js/popup/greeting_component';
import React from 'react';
import { render } from 'react-dom';

class Inject extends ContentScript {
  constructor() {
    super();

    const jwt = localStorage.getItem('jwt');
    console.log('##state', jwt);

    window.onload = () => {
      const topbar = document.createElement('div');
      topbar.id = 'tracker-app-container';

      document.body.appendChild(topbar);
    };

    document.addEventListener('mouseup', ev => {
      console.log(ev.button);
    });

    window.oncontextmenu = selectedElement => {
      this.state = { ...this.state, selectedElement, visible: true };
      /*      this.setState({ selectedElement: ev.target }); */
    };

    document.addEventListener('click', ev => console.log('##click', ev));

    document.addEventListener('mouseenter', ev =>
      console.log('##mouseenter', ev)
    );

    document.addEventListener('change', ev => console.log('##change', ev));
    document.addEventListener('select', ev => console.log('##select', ev));

    /*   document.addEventListener('mouseover', ev => {
      const { target } = ev;

      if (
        target.nodeName.toLowerCase() === 'a' ||
        target.nodeName.toLowerCase() === 'button' ||
        target.style.cursor === 'pointer'
      ) {
        console.log('##target', target.nodeName, target.style.cursor);

        target.classList.add('activeElement');

        target.addEventListener('click', ev => {
          console.log('##out', ev.target);
        });
      }
    }); */
  }

  onClose = () => {
    this.state = { ...this.state, visible: false };

    this.updateDOM(this.state);
  };

  onReceiveMessage = (request, sender) => {
    if (request === 'createEvent') {
      this.state = { ...this.state, activeElement: this.state.selectedElement };
    } else if (request === 'createRef') {
      this.state = { ...this.state, refElement: this.state.selectedElement };
    }

    console.log('##request', request);
    this.updateDOM(this.state);
  };

  updateDOM = (props, onClose = this.onClose) => {
    render(
      <Greeting {...props} onClose={onClose} />,
      window.document.getElementById('tracker-app-container')
    );
  };
}

const script = new Inject();
script.init();
