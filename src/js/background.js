import BackgroundScript from '../../framework/BackgroundScript';

import '../img/icon-128.png';
import '../img/icon-34.png';

class Background extends BackgroundScript {
  constructor() {
    super();

    const messages = {
      main: 'createEvent',
      ref: 'createRef',
    };

    const clickHandler = type =>
      function(ev, tab) {
        chrome.tabs.sendMessage(tab.id, messages[type]);
      };

    chrome.contextMenus.create({
      title: 'Track This',
      contexts: ['all', 'page', 'selection', 'image', 'link'],
      onclick: clickHandler('main'),
    });

    chrome.contextMenus.create({
      title: 'Add ref track',
      contexts: ['all', 'page', 'selection', 'image', 'link'],
      onclick: clickHandler('ref'),
    });
  }

  onReceiveMessage = async (port, data) => {
    this.po;
  };
}

const script = new Background();
script.init();
