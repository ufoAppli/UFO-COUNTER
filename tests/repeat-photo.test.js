const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createElement(tagName) {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [],
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    className: '',
    classList: {
      classes: new Set(),
      add(...names) {
        names.forEach((name) => this.classes.add(name));
      },
      remove(...names) {
        names.forEach((name) => this.classes.delete(name));
      },
      toggle(name, force) {
        if (force === undefined) {
          if (this.classes.has(name)) {
            this.classes.delete(name);
            return false;
          }
          this.classes.add(name);
          return true;
        }
        if (force) {
          this.classes.add(name);
          return true;
        }
        this.classes.delete(name);
        return false;
      },
      contains(name) {
        return this.classes.has(name);
      }
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    click() {},
    focus() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
  return element;
}

function createContext() {
  const elements = {};
  const document = {
    body: createElement('body'),
    createElement(tagName) {
      return createElement(tagName);
    },
    getElementById(id) {
      if (!elements[id]) {
        elements[id] = createElement('div');
      }
      return elements[id];
    },
    querySelectorAll() {
      return [];
    }
  };

  const localStorage = {
    store: {},
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
    },
    setItem(key, value) {
      this.store[key] = String(value);
    },
    removeItem(key) {
      delete this.store[key];
    }
  };

  const context = {
    console,
    setTimeout,
    clearTimeout,
    localStorage,
    document,
    navigator: {
      serviceWorker: {
        register() {
          return Promise.resolve();
        }
      }
    },
    window: {},
    URL: {
      createObjectURL() {
        return 'blob:mock';
      },
      revokeObjectURL() {}
    },
    Blob,
    FileReader: function FileReader() {
      this.onload = null;
      this.onerror = null;
      this.readAsDataURL = function readAsDataURL() {};
    },
    File: function File() {},
    JSZip: undefined,
    fetch: async () => ({ blob: async () => new Blob() })
  };
  context.global = context;
  context.globalThis = context;
  return vm.createContext(context);
}

function loadApp() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const context = createContext();
  vm.runInContext(`${source}\n;globalThis.__app = { state, handleNavigation, resetCurrentMachine, saveCurrentMachine, updateSummary };`, context);
  return context;
}

const context = loadApp();
const app = context.__app;

app.state.currentMachine = {
  machine: '2本爪 小型',
  prizeType: 'ぬい',
  prizeSize: '小型10以下',
  hook: '橋渡し'
};
app.state.currentMachinePhoto = 'data:image/jpeg;base64,abc';
app.state.shopId = 'shop-1';
app.state.shopName = '店舗';
app.state.shops = [{
  id: 'shop-1',
  name: '店舗',
  createdAt: new Date().toISOString(),
  storePhotos: [],
  machines: []
}];

app.handleNavigation('repeatCount');

assert.strictEqual(app.state.currentMachinePhoto, null, 'repeatCount should clear the current photo after saving');
assert.strictEqual(app.state.shops[0].machines[0].photo, 'data:image/jpeg;base64,abc', 'repeatCount should save the current photo once');
assert.strictEqual(app.state.currentMachine.machine, '2本爪 小型', 'repeatCount should keep the current machine selection');

console.log('repeat photo test passed');
