/**
 * Mock BrowserWindow for testing
 */

class BrowserWindow {
  constructor(options) {
    this.options = options;
    this.webContents = {
      on: jest.fn(),
      executeJavaScript: jest.fn().mockResolvedValue(true)
    };
  }

  loadURL(url) {
    this.url = url;
  }

  show() {
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }
}

module.exports = BrowserWindow;
