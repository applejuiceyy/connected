function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

var _shared_system = new WeakMap();

class TileLayer {
  constructor(owner) {
    _shared_system.set(this, {
      writable: true,
      value: void 0
    });

    this.owner = owner;
    this.connections = 0b0000;

    _classPrivateFieldSet(this, _shared_system, null);
  }

  getSharedSystem() {
    return _classPrivateFieldGet(this, _shared_system);
  }

  clearSharedSystem() {
    if (_classPrivateFieldGet(this, _shared_system) !== null) {
      _classPrivateFieldGet(this, _shared_system).bound_layers.delete(this);

      _classPrivateFieldSet(this, _shared_system, null);
    }
  }

  setSharedSystem(new_system) {
    this.clearSharedSystem();

    _classPrivateFieldSet(this, _shared_system, new_system);

    if (new_system !== null) {
      _classPrivateFieldGet(this, _shared_system).bound_layers.add(this);
    }
  }

  get idx() {
    return this.owner.layers.indexOf(this);
  }

  get x() {
    return this.owner.x;
  }

  get y() {
    return this.owner.y;
  }

  get world() {
    return this.owner.world;
  }

  isConnected(side) {
    return (this.connections & side) > 0;
  }

  setConnected(side, value) {
    if (value) {
      this.connections |= side;
    } else {
      this.connections &= ~side;
    }
  }

  spread(pass) {
    pass = pass || new Set();

    for (let side = 1; side <= 8; side <<= 1) {
      this.spreadToSide(side, pass);
    }
  }

  spreadToSide(side, pass) {
    pass = pass || new Set();

    if (this.isConnected(side)) {
      let this_system = this.getSharedSystem();
      let neighbour_tile = this.owner.neighbours[side];

      if (neighbour_tile !== undefined) {
        let neighbour = neighbour_tile.layers[this.idx];
        let other_system = neighbour.getSharedSystem();

        if (!pass.has(neighbour)) {
          if (other_system !== null) {
            this_system.color = this_system.color.blend(other_system.color, 1 / (this_system.bound_layers.size + 1));
          }

          neighbour.setSharedSystem(this.getSharedSystem());
          pass.add(neighbour);
          neighbour.spread(pass);
        }
      }
    }
  }

}

function mapper(map) {
  return function (side) {
    return map[side];
  };
}

const Side = {
  UP: 0b0001,
  LEFT: 0b0010,
  DOWN: 0b0100,
  RIGHT: 0b1000
};
Side.opposite = mapper({
  [Side.UP]: Side.DOWN,
  [Side.DOWN]: Side.UP,
  [Side.LEFT]: Side.RIGHT,
  [Side.RIGHT]: Side.LEFT
});
Side.clockwise = mapper({
  [Side.UP]: Side.RIGHT,
  [Side.DOWN]: Side.LEFT,
  [Side.LEFT]: Side.UP,
  [Side.RIGHT]: Side.DOWN
});
Side.counterclockwise = mapper({
  [Side.UP]: Side.LEFT,
  [Side.DOWN]: Side.RIGHT,
  [Side.LEFT]: Side.DOWN,
  [Side.RIGHT]: Side.UP
});
Side.toPosition = mapper({
  [Side.UP]: {
    x: 0,
    y: -1
  },
  [Side.DOWN]: {
    x: 0,
    y: 1
  },
  [Side.LEFT]: {
    x: -1,
    y: 0
  },
  [Side.RIGHT]: {
    x: 1,
    y: 0
  }
});

Side.toSide = function (x, y) {
  if (Math.abs(x) + Math.abs(y) !== 1) return;

  if (x === 0) {
    return y === -1 ? Side.UP : Side.DOWN;
  } else {
    return x === -1 ? Side.LEFT : Side.RIGHT;
  }

  ;
};

export default TileLayer;
export { Side };