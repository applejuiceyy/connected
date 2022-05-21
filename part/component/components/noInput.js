function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";

class noInput extends ComponentBuilder {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", null);
  }

  build(component) {
    component.imagepath = this.imagepath;
    component.width = 1;
    component.height = 1;
    component.addInteractor(Emitter, "output", 0, 0);
  }

  load(world_data, component_data, component) {
    component.imagepath = this.imagepath;
  }

}

class UserInput extends noInput {
  draw(component, app) {
    if (component.world.running) {
      let pos = app.world.math.positionToScreen(component.x, component.y);
      app.ctx.fillStyle = "#888888";
      let rotatedSize = component.rotatedSize;
      app.ctx.fillRect(pos.x, pos.y, rotatedSize.x * app.tilesize, rotatedSize.y * app.tilesize);
      let turned_off = app.options.colorblind ? "rgb(40, 40, 40)" : "rgb(255, 0, 0)";
      let turned_on = app.options.colorblind ? "rgb(200, 200, 200)" : "rgb(0, 255, 0)";
      app.ctx.fillStyle = component.interactors.output.state ? turned_on : turned_off;
      app.ctx.fillRect(pos.x + 5, pos.y + 5, rotatedSize.x * app.tilesize - 10, rotatedSize.y * app.tilesize - 10);
    } else {
      super.draw(component, app);
    }
  }

}

class Switch extends UserInput {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/switch.png");
  }

  click(component) {
    component.interactors.output.setState(!component.interactors.output.state);
  }

}

class Button extends UserInput {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "imagepath", "./images/button.png");
  }

  click(component) {
    component.interactors.output.setState(true);
    setTimeout(() => {
      component.interactors.output.setState(false);
    }, 100);
  }

}

class Constant extends noInput {
  evaluate(component) {
    component.interactors.output.setState(true);
  }

}

class Randomizer extends noInput {
  prepare(component) {
    let update = () => {
      if (component.world.running) {
        component.interactors.output.setState(!component.interactors.output.state);
        schedule();
      }
    };

    let schedule = () => {
      setTimeout(update, Math.random() * 1000);
    };

    schedule();
  }

}

function setup(app, container) {
  World.global_registry["builtin:switch"] = new Switch("Switch");
  World.global_registry["builtin:button"] = new Button("Button");
  World.global_registry["builtin:randomize"] = new Randomizer("Randomizer");
  World.global_registry["builtin:constant"] = new Constant("Constant");
}

export { setup };