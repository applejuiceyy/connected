function setup(app, container) {
  container.ComponentTool = ComponentTool;
}

class ComponentTool {
  constructor(app, component) {
    this.app = app;
    this.component = component;
  }

  begin() {}

  move(ev) {}

  getPos() {
    let rotatedSize = this.component.rotatedSize;
    return this.app.world.math.screenToPosition(this.app.mouseX - rotatedSize.x / 2 * this.app.tilesize + this.app.tilesize / 2, this.app.mouseY - rotatedSize.y / 2 * this.app.tilesize + this.app.tilesize / 2);
  }

  finish() {
    let pos = this.getPos();
    this.component.x = pos.x;
    this.component.y = pos.y;
    this.app.world.loadedWorld.components.add(this.component);
    return true;
  }

  cancel() {}

  wheel(ev) {
    this.component.rotation += ev.deltaY > 0 ? -1 : 1;
    this.component.rotation = (this.component.rotation + 4) % 4;
    ev.cancel();
  }

  draw() {
    let pos = this.getPos();
    this.component.x = pos.x;
    this.component.y = pos.y;
    this.component.builder.draw(this.component, this.app);
  }

}

const requiring = ["tools", "world.math", "world"];
export { setup, requiring };