function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

import { Color } from "./shared_system.js";

function rotate(x, y, originX, originY, rotation) {
  let translatedX = x - originX;
  let translatedY = y - originY;
  let c = Math.cos(rotation);
  let s = Math.sin(rotation);
  let rotatedX = translatedX * c - translatedY * s;
  let rotatedY = translatedX * s + translatedY * c;
  return {
    x: rotatedX + originX,
    y: rotatedY + originY
  };
}

class ComponentBuilder {
  constructor(name) {
    this.name = name;
  }

  build(component) {}

  evaluate(component) {}

  click(component) {}

  draw(component, app) {
    app.component.renderComponentAt(component, component.x, component.y, true);
  }

  prepare(component) {}

  context(component, context) {}

  save(world_data, component_data, component) {}

  load(world_data, component_data, component) {}

  create(world, x, y) {
    return Component.from_builder(world, x, y, this);
  }

}

var _image = new WeakMap();

var _imagepath = new WeakMap();

class Component {
  constructor(world, x, y) {
    _image.set(this, {
      writable: true,
      value: void 0
    });

    _imagepath.set(this, {
      writable: true,
      value: void 0
    });

    this.rotation = Rotation.NORMAL;
    this.world = world;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.interactors = {};
    this.registry_name = null;

    _classPrivateFieldSet(this, _image, null);

    _classPrivateFieldSet(this, _imagepath, null);

    this.data = {};
    this.last_update = null;
  }

  static from_builder(world, x, y, registry_name) {
    let component = new this(world, x, y);
    component.registry_name = registry_name;
    component.builder.build(component);
    return component;
  }

  addInteractor(klass, name, x, y) {
    this.interactors[name] = new klass(this, x, y);
  }

  get rotatedSize() {
    let pos = {
      x: this.width,
      y: this.height
    };

    if (this.rotation % 2 !== 0) {
      let temp = pos.x;
      pos.x = pos.y;
      pos.y = temp;
    }

    return pos;
  }

  get builder() {
    return this.world.registry[this.registry_name];
  }

  prepareRun() {
    for (let interactor of Object.values(this.interactors)) {
      interactor.prepareRun();
    }

    this.builder.prepare(this);
  }

  invalidate() {
    this.world.queuedComponents.add(this);
  }

  clone() {
    let component = new Component(this.world, this.x, this.y);
    component.registry_name = this.registry_name;
    component.rotation = this.rotation;
    component.width = this.width;
    component.height = this.height;
    component.imagepath = this.imagepath;
    let entries = Object.entries(this.interactors);

    for (let i = 0; i < entries.length; i++) {
      let interactor = entries[i][1];
      let klass = interactor.constructor;
      let copy = new klass(component, interactor.x, interactor.y);
      copy.layer_idx = interactor.layer_idx;
      component.interactors[entries[i][0]] = copy;
    }

    component.data = { ...this.data
    };
    return component;
  }

  get image() {
    return _classPrivateFieldGet(this, _image);
  }

  get imagepath() {
    return _classPrivateFieldGet(this, _imagepath);
  }

  set imagepath(val) {
    _classPrivateFieldSet(this, _imagepath, val);

    _classPrivateFieldSet(this, _image, null);

    let image = new Image();
    image.src = val;

    image.onload = () => {
      _classPrivateFieldSet(this, _image, image);
    };
  }

}

class Interactor {
  constructor(owner, x, y) {
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.layer_idx = 0;
    this.system = null;
  }

  get absolutePosition() {
    let rotated = this.rotatedPosition;
    return {
      x: rotated.x + this.owner.x,
      y: rotated.y + this.owner.y
    };
  }

  get unflooredPosition() {
    let pos = {
      x: this.x,
      y: this.y
    };
    let temp;

    switch (this.owner.rotation) {
      case 0:
        break;

      case 1:
        pos.x = -pos.x;
        pos.x += this.owner.width - 1;
        temp = pos.x;
        pos.x = pos.y;
        pos.y = temp;
        break;

      case 2:
        pos.x = -pos.x;
        pos.x += this.owner.width - 1;
        pos.y = -pos.y;
        pos.y += this.owner.height - 1;
        break;

      case 3:
        pos.y = -pos.y;
        pos.y += this.owner.height - 1;
        temp = pos.x;
        pos.x = pos.y;
        pos.y = temp;
        break;
    }

    return pos;
  }

  get rotatedPosition() {
    let pos = this.unflooredPosition;
    return {
      x: Math.floor(pos.x.toFixed(2)),
      y: Math.ceil(pos.y.toFixed(2))
    };
  }

  get world() {
    return this.owner.world;
  }

  prepareRun() {
    let pos = this.absolutePosition;
    let tile = this.world.map.get(pos.x, pos.y);
    let layer = tile.layers[this.layer_idx];
    this.system = layer.getSharedSystem();
  }

}

_defineProperty(Interactor, "color", new Color(0, 0, 0));

class Listener extends Interactor {
  prepareRun() {
    super.prepareRun();

    if (this.system !== null) {
      this.system.listeners.add(this);
    }
  }

  get state() {
    return this.system !== null && this.system.oldstate;
  }

}

_defineProperty(Listener, "color", new Color(255, 0, 0));

var _internal = new WeakMap();

class Emitter extends Interactor {
  constructor(...args) {
    super(...args);

    _internal.set(this, {
      writable: true,
      value: void 0
    });
  }

  prepareRun() {
    _classPrivateFieldSet(this, _internal, false);

    super.prepareRun();
  }

  setState(newstate) {
    if (this.system !== null) {
      if (newstate) {
        this.system.activate(this);
      } else {
        this.system.deactivate(this);
      }
    }

    _classPrivateFieldSet(this, _internal, newstate);
  }

  get state() {
    return _classPrivateFieldGet(this, _internal);
  }

}

_defineProperty(Emitter, "color", new Color(0, 0, 255));

const Rotation = {
  NORMAL: 0,
  CLOCKWISE: 1,
  INVERTED: 2,
  ANTICLOCKWISE: 3
};
export default ComponentBuilder;
export { Component, Rotation, Interactor, Listener, Emitter };