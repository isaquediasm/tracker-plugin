import manifest from '../src/manifest.json';

class ContentScript {
  state = {};

  constructor() {
    this.setState = this.setState.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }

  init() {
    this.connection = chrome.runtime.connect({ name: manifest.name });
    chrome.runtime.onMessage.addListener(this.onReceiveMessage);
  }

  postMessage(id, payload = null) {
    return new Promise(res => {
      // sends the message to the background script
      this.connection.postMessage({ id, payload });

      const listener = ev => {
        if (ev.id === id) {
          res(ev);
        }
      };

      // set up a listener to the responses
      this.connection.onMessage.addListener(listener);
    });
  }

  onReceiveMessage(request, sender) {}

  setState(newState) {
    this.state = newState;
  }
}

export default ContentScript;
