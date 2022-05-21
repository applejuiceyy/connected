function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

var _cached = new WeakMap();

var _cache = new WeakMap();

var _prepareCache = new WeakSet();

var _fireCache = new WeakSet();

class PriorityEvent {
  constructor() {
    _fireCache.add(this);

    _prepareCache.add(this);

    _cached.set(this, {
      writable: true,
      value: void 0
    });

    _cache.set(this, {
      writable: true,
      value: void 0
    });

    this.listeners = {};

    _classPrivateFieldSet(this, _cached, true);

    _classPrivateFieldSet(this, _cache, []);
  }

  addEventListener(obj, priority = 0) {
    if (this.listeners[priority] === undefined) {
      this.listeners[priority] = [];
    }

    this.listeners[priority].push(obj);

    _classPrivateFieldSet(this, _cached, false);
  }

  removeEventListener(obj) {
    for (const [key, value] of Object.entries(this.listeners)) {
      let new_arr = value.filter(el => obj !== el);
      this.listeners[key] = new_arr.length === 0 ? undefined : new_arr;
    }

    _classPrivateFieldSet(this, _cached, false);
  }

  fire(kwargs) {
    _classPrivateMethodGet(this, _prepareCache, _prepareCache2).call(this);

    _classPrivateMethodGet(this, _fireCache, _fireCache2).call(this, kwargs);
  }

  get size() {
    let sum = 0;

    for (const [key, value] of Object.entries(this.listeners)) {
      sum += value.length;
    }

    return sum;
  }

}

function _prepareCache2() {
  if (!_classPrivateFieldGet(this, _cached)) {
    let sorted = Object.entries(this.listeners);
    sorted.sort(function (a, b) {
      return b[0] - a[0];
    });

    _classPrivateFieldSet(this, _cache, []);

    for (let i = 0; i < sorted.length; i++) {
      _classPrivateFieldGet(this, _cache).push(...sorted[i][1]);
    }

    _classPrivateFieldSet(this, _cached, true);
  }
}

function _fireCache2(kwargs) {
  let ev = kwargs || {};
  ev.cancelled = false;

  ev.cancel = () => ev.cancelled = true;

  for (let i = 0; i < _classPrivateFieldGet(this, _cache).length && !ev.cancelled; i++) {
    _classPrivateFieldGet(this, _cache)[i](ev);
  }
}

class PriorityEventMapping {
  constructor() {
    this.events = {};
  }

  addEventListener(name, obj, priority = 0) {
    if (this.events[name] === undefined) {
      this.events[name] = new PriorityEvent();
    }

    this.events[name].addEventListener(obj, priority);
  }

  removeEventListener(name, obj) {
    let ev = this.events[name];

    if (ev !== undefined) {
      ev.removeEventListener(obj);

      if (ev.size == 0) {
        this.events[name] = undefined;
      }
    }
  }

  fire(name, kwargs) {
    let ev = this.events[name];

    if (ev !== undefined) {
      ev.fire(kwargs);
    }
  }

  delegate(name) {
    return this.fire.bind(this, name);
  }

}

export { PriorityEvent, PriorityEventMapping };