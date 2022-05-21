function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

import Tile from "./tile.js";
import { Side } from "./tilelayer.js";
import SharedSystem from "./shared_system.js";
import { Color } from "./shared_system.js";
import ComponentBuilder, { Component, Emitter, Listener } from "./component.js";

var _running = new WeakMap();

var _tickComponents = new WeakSet();

var _tickSystems = new WeakSet();

class World {
  constructor(width = 10, height = 10) {
    _tickSystems.add(this);

    _tickComponents.add(this);

    _running.set(this, {
      writable: true,
      value: void 0
    });

    this.map = new WorldMap(this, width, height);
    this.components = new Set();

    _classPrivateFieldSet(this, _running, false);

    this.local_registry = {};
  }

  get running() {
    return _classPrivateFieldGet(this, _running);
  }

  prepareRun() {
    this.queuedSystems = new Set();
    this.queuedComponents = new Set();
    this.map.prepareRun();

    for (let component of this.components) {
      component.prepareRun();
      this.queuedComponents.add(component);
    }

    _classPrivateFieldSet(this, _running, true);
  }

  stop() {
    _classPrivateFieldSet(this, _running, false);
  }

  tick() {
    _classPrivateMethodGet(this, _tickComponents, _tickComponents2).call(this);

    _classPrivateMethodGet(this, _tickSystems, _tickSystems2).call(this);
  }

  serialize() {
    let map = this.map.serialize();
    let components = [];
    let world_data = {
      map: map,
      components
    };

    for (let component of this.components) {
      let interactors = {};
      let entries = Object.entries(component.interactors);

      for (let i = 0; i < entries.length; i++) {
        let interactor = entries[i][1];
        interactors[entries[i][0]] = {
          x: interactor.x,
          y: interactor.y,
          layer: interactor.layer_idx,
          is_listener: interactor instanceof Listener
        };
      }

      let reduced = {
        x: component.x,
        y: component.y,
        width: component.width,
        height: component.height,
        interactors: interactors,
        registry_name: component.registry_name,
        data: { ...component.data
        },
        rotation: component.rotation,
        imagepath: component.imagepath
      };
      component.builder.save(world_data, reduced, component);
      components.push(reduced);
    }

    return world_data;
  }

  static unserialize(obj) {
    let world = new this(0, 0);
    world.map = WorldMap.unserialize(world, obj.map);

    for (let i = 0; i < obj.components.length; i++) {
      let reduced = obj.components[i];
      let component = new Component(world, reduced.x, reduced.y);
      component.registry_name = reduced.registry_name;
      component.width = reduced.width;
      component.height = reduced.height;
      component.rotation = reduced.rotation === undefined ? 0 : reduced.rotation;

      if (component.rotation % 1 != 0) {
        let a = Math.round(-component.rotation / (Math.PI / 2));

        while (a < 0) {
          a += 4;
        }

        component.rotation = a % 4;
      }

      component.data = reduced.data === undefined ? {} : reduced.data;
      component.imagepath = reduced.imagepath === undefined ? null : reduced.imagepath;
      let entries = Object.entries(reduced.interactors);

      for (let ii = 0; ii < entries.length; ii++) {
        let reduced_interactor = entries[ii][1];
        let interactor = new (reduced_interactor.is_listener ? Listener : Emitter)(component, reduced_interactor.x, reduced_interactor.y);
        interactor.layer_idx = reduced_interactor.layer;
        component.interactors[entries[ii][0]] = interactor;
      }

      component.builder.load(obj, reduced, component);
      world.components.add(component);
    }

    return world;
  }

  get registry() {
    return { ...this.constructor.global_registry,
      ...this.local_registry
    };
  }

}

function _tickComponents2() {
  let d = new Date();
  let now = d.getTime();

  for (let component of this.queuedComponents) {
    this.queuedComponents.delete(component);
    component.builder.evaluate(component);
    component.last_update = now;
  }
}

function _tickSystems2() {
  for (let system of this.queuedSystems) {
    if (system.state !== system.oldstate) {
      for (let listener of system.listeners) {
        listener.owner.invalidate();
      }

      system.oldstate = system.state;
    }
  }

  this.queuedSystems.clear();
}

_defineProperty(World, "global_registry", {});

class Map {
  constructor(width, height, item_filler) {
    this.buildMap(width, height, item_filler);
  }

  buildMap(width, height, item_filler) {
    item_filler = item_filler === undefined ? (x, y) => {
      return {
        x: x,
        y: y,
        neighbours: {}
      };
    } : item_filler;
    this.width = width;
    this.height = height;
    this._arr = new Array(width * height);

    for (let i = 0; i < this._arr.length; i++) {
      let pos = this._positionFromArray(i);

      this._arr[i] = item_filler(pos.x, pos.y);
    }

    for (let i = 0; i < this._arr.length; i++) {
      let pos = this._positionFromArray(i);

      let obj = this._arr[i];

      for (let side = 1; side <= 8; side <<= 1) {
        let relative = Side.toPosition(side);
        let absolute = {
          x: pos.x + relative.x,
          y: pos.y + relative.y
        };

        if (this.isValid(absolute.x, absolute.y)) {
          obj.neighbours[side] = this.get(absolute.x, absolute.y);
        }
      }
    }
  }

  _positionFromArray(pos) {
    return {
      x: pos % this.width,
      y: Math.floor(pos / this.width)
    };
  }

  _positionInArray(x, y) {
    return x + y * this.width;
  }

  get(x, y) {
    return this._arr[this._positionInArray(x, y)];
  }

  set(x, y, obj) {
    this._arr[this._positionInArray(x, y)] = obj;
  }

  isValid(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

}

class WorldMap extends Map {
  constructor(world, width, height) {
    super(width, height);
    this.world = world;
    this.systems = new Set();
  }

  buildMap(width, height) {
    super.buildMap(width, height, (x, y) => new Tile(this.world, x, y));
  }

  buildWiring(path, idx) {
    if (path.length < 1) return;

    if (path.length === 1) {
      let layer = this.get(path[0].x, path[0].y).layers[idx];
      if (layer.getSharedSystem() !== null) return;
    }

    let found_containing_system = [];

    for (let i = 0; i < path.length - 1; i++) {
      let tile = this.get(path[i].x, path[i].y);
      let other_tile = this.get(path[i + 1].x, path[i + 1].y);
      let layer = tile.layers[idx];
      let other_layer = other_tile.layers[idx];

      if (i === 0 && layer.getSharedSystem() !== null) {
        found_containing_system.push(layer);
      }

      if (other_layer.getSharedSystem() !== null) {
        found_containing_system.push(other_layer);
      }

      let relativeX = layer.x - other_layer.x;
      let relativeY = layer.y - other_layer.y;
      let side = Side.toSide(relativeX, relativeY);
      layer.setConnected(Side.opposite(side), true);
      other_layer.setConnected(side, true);
    }

    if (found_containing_system.length === 0) {
      let new_system = new SharedSystem(this.world);
      console.log("created system");
      this.systems.add(new_system);
      let layer = this.get(path[0].x, path[0].y).layers[idx];
      layer.setSharedSystem(new_system);
      layer.spread();
    } else {
      let to_spread = found_containing_system[0];
      let to_check = [];

      for (let i = 1; i < found_containing_system.length; i++) {
        let layer = this.get(found_containing_system[i].x, found_containing_system[i].y).layers[idx];
        to_check.push(layer.getSharedSystem());
      }

      let layer = this.get(to_spread.x, to_spread.y).layers[idx];
      layer.spread();
      this.checkSystems(...to_check);
    }
  }

  eraseWiring(path, idx) {
    if (path.length < 1) return;
    let to_update = [];
    let to_check = [];

    for (let i = 0; i < path.length; i++) {
      let tile = this.get(path[i].x, path[i].y);
      let layer = tile.layers[idx];
      let system = layer.getSharedSystem();

      if (system !== null) {
        for (let side = 1; side <= 8; side <<= 1) {
          if (layer.isConnected(side)) {
            let other_layer = tile.neighbours[side].layers[idx];
            layer.setConnected(side, false);
            other_layer.setConnected(Side.opposite(side), false);
            to_update.push(other_layer);
          }
        }

        layer.clearSharedSystem();
        this.checkSystems(system);
      }
    }

    let created_systems = [];

    for (let i = 0; i < to_update.length - 1; i++) {
      let layer = to_update[i];
      let old_system = layer.getSharedSystem();

      if (old_system !== null) {
        if (!created_systems.includes(old_system)) {
          let system = new SharedSystem(this.world);
          console.log("created system");
          system.color = old_system.color;
          this.systems.add(system);
          created_systems.push(system);
          layer.setSharedSystem(system);
          layer.spread();
          this.checkSystems(old_system);
        }
      }
    }
  }

  checkSystems(...systems) {
    if (systems.length == 0) {
      systems = this.systems;
    }

    for (let system of systems) {
      if (system.bound_layers.size === 0) {
        this.systems.delete(system);
        console.log("erased system");
      }
    }
  }

  prepareRun() {
    for (let system of this.systems) {
      system.prepareRun();
    }
  }

  get layers() {
    return this.get(0, 0).layers.length;
  }

  serialize() {
    let arr_systems = Array.from(this.systems);
    let reduced_systems = arr_systems.map(item => item.color.toString());
    let connections = "";
    let system_spread = "";

    for (let i = 0; i < this._arr.length; i++) {
      for (let layeridx = 0; layeridx < this.layers; layeridx++) {
        let storage_idx = i * this.layers + layeridx;
        let layer = this._arr[i].layers[layeridx];

        if (layer.connections > 0) {
          if (connections.length > 0) {
            connections += "|";
          }

          connections += storage_idx.toString(36) + "|" + this._arr[i].layers[layeridx].connections;
        }

        let system = layer.getSharedSystem();

        if (system !== null) {
          let idx = arr_systems.findIndex(val => system === val);

          if (idx > -1) {
            if (system_spread.length > 0) {
              system_spread += "|";
            }

            system_spread += storage_idx.toString(36) + "|" + idx;
            arr_systems[idx] = null;
          }
        }
      }
    }

    return {
      width: this.width,
      height: this.height,
      layers: this.layers,
      systems: reduced_systems,
      system_spread: system_spread,
      connections: connections
    };
  }

  static unserialize(world, obj) {
    let map = new this(world, obj.width, obj.height);

    for (let i = 0; i < map._arr.length; i++) {
      let tile = map._arr[i];

      for (let layeridx = 1; layeridx < obj.layers; layeridx++) {
        tile.createLayer();
      }
    }

    let chunks = obj.connections.split("|");

    while (chunks.length > 0) {
      let connections = parseInt(chunks.pop());
      let raw_storage_idx = parseInt(chunks.pop(), 36);
      let position = Math.floor(raw_storage_idx / map.layers);
      let layer = raw_storage_idx % map.layers;
      map._arr[position].layers[layer].connections = connections;
    }

    let unserialized_systems = [];

    for (let i = 0; i < obj.systems.length; i++) {
      let new_system = new SharedSystem(world);
      new_system.color = Color.from(obj.systems[i]);
      map.systems.add(new_system);
      unserialized_systems.push(new_system);
    }

    chunks = obj.system_spread.split("|");

    while (chunks.length > 0) {
      let system_idx = parseInt(chunks.pop());
      let raw_storage_idx = parseInt(chunks.pop(), 36);
      let position = Math.floor(raw_storage_idx / map.layers);
      let layer = raw_storage_idx % map.layers;

      map._arr[position].layers[layer].setSharedSystem(unserialized_systems[system_idx]);

      map._arr[position].layers[layer].spread();
    }

    return map;
  }

}

export { World, Map, WorldMap };