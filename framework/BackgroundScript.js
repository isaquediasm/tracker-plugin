const webRequestPermissions = ['blocking', 'requestHeaders', 'extraHeaders'];

const urls = ['*://*/*'];

class BackgroundScript {
  constructor() {
    this.state = {};
  }

  init() {
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener((...args) =>
        this.onReceiveMessage(port, ...args)
      );
    });

    chrome.webRequest.onBeforeSendHeaders.addListener(
      console.log,
      { urls },
      webRequestPermissions
    );
  }

  setState(newState) {
    this.state = newState;
  }

  onReceiveMessage = async port => {};
}

export default BackgroundScript;
