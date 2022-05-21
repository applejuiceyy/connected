import ComponentBuilder from "../../../../connected/map/component.js";
import { Listener, Emitter } from "../../../../connected/map/component.js";
import { World } from "../../../../connected/map/world.js";

class HalfAdder extends ComponentBuilder {
  build(component) {
    component.imagepath = "./images/adder.png";
    component.width = 2;
    component.height = 2;
    component.addInteractor(Listener, "A", 0, 0);
    component.addInteractor(Listener, "B", 0, 1);
    component.addInteractor(Emitter, "output", 1, 0);
    component.addInteractor(Emitter, "carry", 1, 1);
  }

  evaluate(component) {
    let val = component.interactors.A.state + component.interactors.B.state;
    component.interactors.output.setState(val & 0b1);
    component.interactors.carry.setState(val & 0b10);
  }

  load(world_data, component_data, component) {
    component.imagepath = "./images/adder.png";
  }

}

class FullAdder extends ComponentBuilder {
  build(component) {
    component.imagepath = "./images/adder.png";
    component.width = 2;
    component.height = 3;
    component.addInteractor(Listener, "C", 0, 0);
    component.addInteractor(Listener, "A", 0, 1);
    component.addInteractor(Listener, "B", 0, 2);
    component.addInteractor(Emitter, "output", 1, 0);
    component.addInteractor(Emitter, "carry", 1, 1);
  }

  evaluate(component) {
    let val = component.interactors.A.state + component.interactors.B.state + component.interactors.C.state;
    component.interactors.output.setState(val & 0b1);
    component.interactors.carry.setState(val & 0b10);
  }

  load(world_data, component_data, component) {
    component.imagepath = "./images/adder.png";
  }

}

function setup(app, container) {
  World.global_registry["builtin:halfadder"] = new HalfAdder("Half Adder");
  World.global_registry["builtin:fulladder"] = new FullAdder("Full Adder");
}

export { setup };