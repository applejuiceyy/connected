function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

var _activeEmitters = new WeakMap();

var _checkState = new WeakSet();

class SharedSystem {
  constructor(world) {
    _checkState.add(this);

    _activeEmitters.set(this, {
      writable: true,
      value: void 0
    });

    this.world = world;
    this.bound_layers = new Set();
    this.color = new Color(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
  }

  prepareRun() {
    _classPrivateFieldSet(this, _activeEmitters, new Set());

    this.listeners = new Set();
    this.oldstate = false;
  }

  activate(emitter) {
    _classPrivateFieldGet(this, _activeEmitters).add(emitter);

    _classPrivateMethodGet(this, _checkState, _checkState2).call(this);
  }

  deactivate(emitter) {
    _classPrivateFieldGet(this, _activeEmitters).delete(emitter);

    _classPrivateMethodGet(this, _checkState, _checkState2).call(this);
  }

  get state() {
    return _classPrivateFieldGet(this, _activeEmitters).size > 0;
  }

}

function _checkState2() {
  if (_classPrivateFieldGet(this, _activeEmitters).size < 2) {
    this.world.queuedSystems.add(this);
  }
}

function fromHex(red, green, blue) {
  return new Color(parseInt(red, 16), parseInt(green, 16), parseInt(blue, 16));
}

function fromNumbers(red, green, blue) {
  return new Color(parseInt(red), parseInt(green), parseInt(blue));
}

class Color {
  static from(s) {
    let match = s.match(/^#(?<red>[0-9a-fA-F]{2})(?<green>[0-9a-fA-F]{2})(?<blue>[0-9a-fA-F]{2})$/);

    if (match !== null) {
      return fromHex(match.groups.red, match.groups.green, match.groups.blue);
    }

    match = s.match(/^rgb\(\s*?(?<red>[0-9]{1,3}(?:\.[0-9]*?)?)\s*?,\s*?(?<green>[0-9]{1,3}(?:\.[0-9]*?)?)\s*?,\s*?(?<blue>[0-9]{1,3}(?:\.[0-9]*?)?)\s*?\)$/);

    if (match !== null) {
      return fromNumbers(match.groups.red, match.groups.green, match.groups.blue);
    }
  }

  constructor(R, G, B) {
    this.R = R;
    this.G = G;
    this.B = B;
  }

  blend(other, alpha) {
    let R = this.R * (1 - alpha) + other.R * alpha;
    let G = this.G * (1 - alpha) + other.G * alpha;
    let B = this.B * (1 - alpha) + other.B * alpha;
    return new Color(R, G, B);
  }

  toString() {
    return "rgb(" + this.R + ", " + this.G + ", " + this.B + ")";
  }

}

export default SharedSystem;
export { Color };