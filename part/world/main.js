import { World } from "../../../connected/map/world.js";

function setup(app, container) {
  container.loadedWorld = new World(100, 100);
}

export { setup };