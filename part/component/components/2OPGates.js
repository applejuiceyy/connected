function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import ComponentBuilder from "../../../../connected/map/component.js";
import { Listener, Emitter } from "../../../../connected/map/component.js";
import { World } from "../../../../connected/map/world.js";

class Component2Operations extends ComponentBuilder {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", null);
  }

  build(component) {
    component.imagepath = this.imagepath;
    component.width = 2;
    component.height = 2;
    component.addInteractor(Listener, "input1", 0, 0);
    component.addInteractor(Listener, "input2", 0, 1);
    component.addInteractor(Emitter, "output", 1, 0);
  }

  load(world_data, component_data, component) {
    component.imagepath = this.imagepath;
  }

}

class ANDGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/and.png");
  }

  evaluate(component) {
    component.interactors.output.setState(component.interactors.input1.state && component.interactors.input2.state);
  }

}

class NANDGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/nand.png");
  }

  evaluate(component) {
    component.interactors.output.setState(!(component.interactors.input1.state && component.interactors.input2.state));
  }

}

class ORGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/or.png");
  }

  evaluate(component) {
    component.interactors.output.setState(component.interactors.input1.state || component.interactors.input2.state);
  }

}

class NORGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/nor.png");
  }

  evaluate(component) {
    component.interactors.output.setState(!(component.interactors.input1.state || component.interactors.input2.state));
  }

}

class XORGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/xor.png");
  }

  evaluate(component) {
    component.interactors.output.setState(component.interactors.input1.state !== component.interactors.input2.state);
  }

}

class XNORGate extends Component2Operations {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/xnor.png");
  }

  evaluate(component) {
    component.interactors.output.setState(component.interactors.input1.state === component.interactors.input2.state);
  }

}

function setup(app, container) {
  World.global_registry["builtin:andgate"] = new ANDGate("AND Gate");
  World.global_registry["builtin:nandgate"] = new NANDGate("NAND Gate");
  World.global_registry["builtin:orgate"] = new ORGate("OR Gate");
  World.global_registry["builtin:norgate"] = new NORGate("NOR Gate");
  World.global_registry["builtin:xorgate"] = new XORGate("XOR Gate");
  World.global_registry["builtin:xnorgate"] = new XNORGate("XNOR Gate");
}

export { setup };