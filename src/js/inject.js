import ContentScript from '../../framework/ContentScript';
import Greeting from '../js/popup/greeting_component';
import Wrapper from './components/Wrapper';
import React from 'react';
import { render } from 'react-dom';
import { events } from './utils/events';
import { createListeners } from './utils';

class Inject extends ContentScript {
  constructor() {
    super();

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

    setTimeout(this.updateDOM, 3000);

    this.loadEvents();
  }

  // TODO: Validate if rules set is undefined
  loadEvents = async () => {
    const { data = [] } = await events.list();

    setTimeout(() => {
      for (let item of data) {
        createListeners(item.rules, event => {
          const value =
            item.value === 'innerText' ? event.target.innerText : {};
          console.log('##event', {
            name: item.name,
            value,
          });
        });
      }
    }, 3000);
  };

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

  onSetCreate = () => {
    document.addEventListener('mouseover', ev => {
      console.log('##mouseover', ev);
      const { target } = ev;
      if (
        !target.className.includes('tracker') &&
        (target.nodeName.toLowerCase() === 'a' ||
          target.nodeName.toLowerCase() === 'button' ||
          getComputedStyle(target).cursor === 'pointer')
      ) {
        console.log('##target', target.nodeName, target.style.cursor);
        target.classList.add('activeElement');

        const { offsetHeight, offsetWidth } = target;
        const { paddingTop, paddingLeft } = getComputedStyle(target);

        console.log(
          ` margin: calc((-${offsetHeight}px / 2) - ${paddingTop})  -${paddingLeft};`,
          '\n',
          paddingTop,
          paddingLeft
        );

        /*  if (target.querySelector('.tracker-overlay') === null) {
          const overlay = document.createElement('div');
          overlay.classList.add('tracker-overlay');
          overlay.setAttribute('id', 'tracker-overlay');

          overlay.style = `
          width: ${offsetWidth}px;
          height: ${offsetHeight}px;
          margin: calc((-${offsetHeight}px / 2) - ${paddingTop})  -${paddingLeft};
          background: #ff000033;
        `;

          console.log(overlay.style);
          target.appendChild(overlay);
        } */

        /*   target.addEventListener('mouseleave', ev => {
          const elem = document.querySelector('#tracker-overlay');

          elem.parentNode.removeChild(elem);
          console.log('##removed');
        }); */

        target.addEventListener('click', ev => {
          ev.stopPropagation();
          ev.preventDefault();
          console.log('##out', target);
        });
      }
    });
  };

  updateDOM = (props, onClose = this.onClose) => {
    setTimeout(() => {
      const container = document.getElementById('tracker-app-container');

      if (container === null) return this.updateDOM();

      return render(
        <Wrapper {...props} onSetCreate={this.onSetCreate} onClose={onClose} />,
        window.document.getElementById('tracker-app-container')
      );
    }, 1000);
  };
}

const script = new Inject();
script.init();
