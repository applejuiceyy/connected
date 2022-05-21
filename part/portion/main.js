import SharedSystem from "../../connected/map/shared_system.js";
import { Side } from "../../connected/map/tilelayer.js";

function setup(app, container) {
  let is_selecting_area = false;
  let initial_selection = null;
  let selection_bounds = null;
  let selecting_destination = false;
  let operation_function = null;
  let requires_destination = null;
  app.context.mergeGlobalContext({
    portion: {
      copy: function () {
        is_selecting_area = true;
        initial_selection = null;
        operation_function = do_copy;
        requires_destination = true;
      },
      delete: function () {
        is_selecting_area = true;
        initial_selection = null;
        operation_function = do_delete;
        requires_destination = false;
      }
    }
  });

  function do_delete(bounds) {
    let components = app.world.loadedWorld.components;

    for (let component of components) {
      let rotatedSize = component.rotatedSize;

      if (component.x <= bounds.right && component.x + rotatedSize.x > bounds.left && component.y <= bounds.bottom && component.y + rotatedSize.y > bounds.top) {
        components.delete(component);
      }
    }

    let layers_to_spread = [];

    for (let layeridx = 0; layeridx < app.world.loadedWorld.map.layers; layeridx++) {
      for (let y = bounds.top; y <= bounds.bottom; y++) {
        for (let x = bounds.left; x <= bounds.right; x++) {
          let tile = app.world.loadedWorld.map.get(x, y);
          let layer = tile.layers[layeridx];
          layer.connections = 0;
          layer.setSharedSystem(null);

          for (let side = 1; side <= 8; side <<= 1) {
            let relative = Side.toPosition(side);
            let absolute = {
              x: layer.x + relative.x,
              y: layer.y + relative.y
            };

            if (app.world.loadedWorld.map.isValid(absolute.x, absolute.y) && !(absolute.x <= bounds.right && absolute.x >= bounds.left && absolute.y <= bounds.bottom && absolute.y >= bounds.top)) {
              let other_tile = app.world.loadedWorld.map.get(absolute.x, absolute.y);
              let other_layer = other_tile.layers[layeridx];
              other_layer.setConnected(Side.opposite(side), false);

              if (other_layer.getSharedSystem() !== null) {
                let new_system = new SharedSystem(app.world.loadedWorld);
                app.world.loadedWorld.map.systems.add(new_system);
                new_system.color = other_layer.getSharedSystem().color;
                other_layer.setSharedSystem(new_system);
                layers_to_spread.push(other_layer);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < layers_to_spread.length; i++) {
      layers_to_spread[i].spread();
    }
  }

  function do_copy(from_bounds, position) {
    let components = app.world.loadedWorld.components;
    let offset = {
      x: position.x - from_bounds.left,
      y: position.y - from_bounds.top
    };
    let new_components = [];

    for (let component of components) {
      let rotatedSize = component.rotatedSize;

      if (component.x <= from_bounds.right && component.x + rotatedSize.x > from_bounds.left && component.y <= from_bounds.bottom && component.y + rotatedSize.y > from_bounds.top) {
        let copy = component.clone();
        copy.x += offset.x;
        copy.y += offset.y;
        new_components.push(copy);
      }
    }

    for (let i = 0; i < new_components.length; i++) {
      components.add(new_components[i]);
    }

    for (let layeridx = 0; layeridx < app.world.loadedWorld.map.layers; layeridx++) {
      let tiledata = [];
      let systems = [];

      for (let y = from_bounds.top; y <= from_bounds.bottom; y++) {
        for (let x = from_bounds.left; x <= from_bounds.right; x++) {
          let tile = app.world.loadedWorld.map.get(x, y);
          let layer = tile.layers[layeridx];
          systems.push(layer.getSharedSystem());
          let connection_to_copy = layer.connections;

          for (let side = 1; side <= 8; side <<= 1) {
            let relative = Side.toPosition(side);
            let absolute = {
              x: layer.x + relative.x,
              y: layer.y + relative.y
            };

            if (!(absolute.x <= from_bounds.right && absolute.x >= from_bounds.left && absolute.y <= from_bounds.bottom && absolute.y >= from_bounds.top)) {
              connection_to_copy &= ~side;
            }
          }

          tiledata.push(connection_to_copy);
        }
      }

      let to_spread = [];

      for (let y = from_bounds.top; y <= from_bounds.bottom; y++) {
        for (let x = from_bounds.left; x <= from_bounds.right; x++) {
          let tile = app.world.loadedWorld.map.get(x + offset.x, y + offset.y);
          let layer = tile.layers[layeridx];
          layer.connections |= tiledata.shift();
          let system_to_copy = systems.shift();

          if (system_to_copy !== null) {
            let new_system = new SharedSystem(app.world.loadedWorld);
            app.world.loadedWorld.map.systems.add(new_system);
            new_system.color = system_to_copy.color;
            layer.setSharedSystem(new_system);
            to_spread.push(layer);
          }
        }
      }

      for (let i = 0; i < to_spread.length; i++) {
        to_spread[i].spread();
      }

      app.world.loadedWorld.map.checkSystems();
    }
  }

  function handleClick(ev) {
    if (is_selecting_area) {
      if (ev.button === 0) initial_selection = app.world.math.screenToPosition(app.mouseX, app.mouseY);
      ev.cancel();
    }

    if (selecting_destination) {
      if (ev.button === 0) {
        operation_function(selection_bounds, app.world.math.screenToPosition(app.mouseX, app.mouseY));
        selecting_destination = false;
      }

      ev.cancel();
    }
  }

  function handleUp(ev) {
    if (is_selecting_area) {
      if (ev.button === 0 && is_selecting_area !== null) {
        let mouse_position = app.world.math.screenToPosition(app.mouseX, app.mouseY);
        let TL = {
          x: Math.min(mouse_position.x, initial_selection.x),
          y: Math.min(mouse_position.y, initial_selection.y)
        };
        let BR = {
          x: Math.max(mouse_position.x, initial_selection.x),
          y: Math.max(mouse_position.y, initial_selection.y)
        };
        selection_bounds = {
          left: TL.x,
          right: BR.x,
          top: TL.y,
          bottom: BR.y
        };
        is_selecting_area = false;

        if (requires_destination) {
          selecting_destination = true;
        } else {
          operation_function(selection_bounds);
        }
      }

      ev.cancel();
    }
  }

  function handleDraw() {
    if (is_selecting_area && initial_selection) {
      app.ctx.fillStyle = "#00000044";
      let mouse_position = app.world.math.screenToPosition(app.mouseX, app.mouseY);
      let bounds = app.world.math.visibleBounds();
      let TL = {
        x: Math.max(Math.min(mouse_position.x, initial_selection.x), bounds.left),
        y: Math.max(Math.min(mouse_position.y, initial_selection.y), bounds.top)
      };
      let BR = {
        x: Math.min(Math.max(mouse_position.x, initial_selection.x), bounds.right),
        y: Math.min(Math.max(mouse_position.y, initial_selection.y), bounds.bottom)
      };
      let TL_screen = app.world.math.positionToScreen(TL.x, TL.y);
      let BR_screen = app.world.math.positionToScreen(BR.x, BR.y);
      let dimensions = {
        x: BR_screen.x - TL_screen.x,
        y: BR_screen.y - TL_screen.y
      };
      dimensions.x += app.tilesize;
      dimensions.y += app.tilesize;
      app.ctx.fillRect(TL_screen.x, TL_screen.y, dimensions.x, dimensions.y);
    }

    if (selecting_destination) {
      app.ctx.fillStyle = "#00000044";
      let mouse_position = app.world.math.screenToPosition(app.mouseX, app.mouseY);
      let dimensions = {
        x: selection_bounds.right - selection_bounds.left,
        y: selection_bounds.bottom - selection_bounds.top
      };
      let draw_pos = app.world.math.positionToScreen(mouse_position.x, mouse_position.y);
      let screen_dimensions = {
        x: dimensions.x * app.tilesize,
        y: dimensions.y * app.tilesize
      };
      screen_dimensions.x += app.tilesize;
      screen_dimensions.y += app.tilesize;
      app.ctx.fillRect(draw_pos.x, draw_pos.y, screen_dimensions.x, screen_dimensions.y);
    }
  }

  app.event.addEventListener("click", handleClick, 2);
  app.event.addEventListener("up", handleUp, 2);
  app.event.addEventListener("draw", handleDraw, -1);
}

const requiring = ["context"];
export { setup, requiring };