function setup(app, container) {
  let queued_component_stats = [];
  app.context.mergeGlobalContext({
    simulation: function () {
      if (app.world.loadedWorld.running) {
        return {
          stop: function () {
            app.world.loadedWorld.stop();
          }
        };
      } else {
        return {
          run: function () {
            app.world.loadedWorld.prepareRun();
          }
        };
      }
    }
  });

  function tick() {
    if (app.world.loadedWorld.running) {
      queued_component_stats.push(app.world.loadedWorld.queuedComponents.size);

      if (queued_component_stats.length > 200) {
        queued_component_stats.shift();
      }

      app.world.loadedWorld.tick();
    }
  }

  function componentClick(ev) {
    if (app.world.loadedWorld.running) {
      let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);
      let components = app.world.loadedWorld.components;

      for (let component of components) {
        let rotatedSize = component.rotatedSize;

        if (component.x <= pos.x && component.x + rotatedSize.x > pos.x && component.y <= pos.y && component.y + rotatedSize.y > pos.y) {
          component.builder.click(component);
        }
      }

      ev.cancel();
    }
  }

  function draw() {
    if (app.world.loadedWorld.running && app.options.show_simulation_stats) {
      draw_stat(queued_component_stats, app.height - 10);
    }
  }

  function draw_stat(arr, y) {
    app.ctx.lineWidth = 1;
    app.ctx.strokeStyle = "#000000";
    let gradient = app.ctx.createLinearGradient(app.width, y, app.width, 0);
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(1, "#00ff0000");
    app.ctx.fillStyle = gradient;

    function position(idx) {
      return app.width - (arr.length - idx) * 2;
    }

    app.ctx.beginPath();
    app.ctx.moveTo(position(0), y);
    app.ctx.lineTo(position(0), y - arr[0] * 5);

    for (let idx = 0; idx < arr.length; idx++) {
      app.ctx.lineTo(position(idx), y - arr[idx] * 5);
    }

    app.ctx.lineTo(app.width, y);
    app.ctx.closePath();
    app.ctx.stroke();
    app.ctx.fill();
  }

  app.event.addEventListener("click", componentClick, 1);
  app.event.addEventListener("tick", tick);
  app.event.addEventListener("draw", draw, -9);
}

const requiring = ["world", "context"];
export { setup, requiring };