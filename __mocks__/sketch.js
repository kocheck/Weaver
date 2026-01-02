/**
 * Mock Sketch API for testing
 */

const sketch = {
  getSelectedDocument: jest.fn(),
  Settings: {
    settingForKey: jest.fn(),
    setSettingForKey: jest.fn()
  }
};

module.exports = sketch;
