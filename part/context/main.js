function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function figureOutNextPosition(el) {
  let rect = el.getBoundingClientRect();
  return {
    x: rect.right,
    y: rect.top
  };
}

var _x = new WeakMap();

var _y = new WeakMap();

class Context {
  constructor(context, x, y, parent) {
    _x.set(this, {
      writable: true,
      value: void 0
    });

    _y.set(this, {
      writable: true,
      value: void 0
    });

    this.parent = parent;
    this.child = null;
    this.childButton = null;
    this.context = context;
    this.initX = x;
    this.initY = y;
    this.context = context;
    this.root = document.createElement("div");
    this.root.classList.add("context-root");
    this.root.classList.add("context");
    this.root.style.position = "fixed";
    this.root.style.width = "200px";
    this.root.style.backgroundColor = "#dddddd";
    this.root.style.zIndex = 2;
    this.shadow = document.createElement("div");
    this.shadow.classList.add("context-shadow");
    this.shadow.classList.add("context");
    this.shadow.style.position = "fixed";
    this.shadow.style.width = "200px";
    this.shadow.style.backgroundColor = "#dddddd";
    this.shadow.style.zIndex = 1;
    this.shadow.style.boxShadow = "black 0 0 5px 2px";
    this.innerShadow = document.createElement("div");
    this.innerShadow.style.boxShadow = "black 0px 0px 0px 1px inset";
    this.innerShadow.style.position = "absolute";
    this.innerShadow.style.top = "0";
    this.innerShadow.style.left = "0";
    this.innerShadow.style.width = "100%";
    this.innerShadow.style.height = "100%";
    this.innerShadow.style.zIndex = "2";
    this.innerShadow.style.pointerEvents = "none";
    this.x = 0;
    this.y = 0;
    this.root.addEventListener("contextmenu", ev => ev.preventDefault());
    let body = document.getElementById("root");
    body.appendChild(this.root);
    body.appendChild(this.shadow);
    this.root.appendChild(this.innerShadow);

    let _this = this;

    let entries = Object.entries(this.context);

    if (entries.length == 0) {
      let b = document.createElement("button");
      b.innerHTML = "no options here";
      b.style.display = "block";
      b.style.width = "100%";
      b.style.border = "0";
      b.style.zIndex = "1";
      b.style.position = "relative";
      b.style.backgroundImage = "linear-gradient(#eeeeee, #dddddd)";
      b.setAttribute("disabled", "");
      this.root.appendChild(b);
    } else {
      for (let [key, value] of entries) {
        let b = document.createElement("button");
        b.innerHTML = key;
        b.classList.add("context-button");
        b.classList.add("context");
        b.style.display = "block";
        b.style.width = "100%";
        b.style.border = "0";
        b.style.zIndex = "1";
        b.style.position = "relative";
        b.style.backgroundImage = "linear-gradient(#eeeeee, #dddddd)";
        this.root.appendChild(b);

        if (typeof value === "object") {
          b.addEventListener("click", function () {
            let pos = figureOutNextPosition(this);

            _this.openFor(this, value, pos.x, pos.y);
          });
        }

        if (typeof value === "function") {
          b.addEventListener("click", function () {
            let out = value();
            let pos = figureOutNextPosition(this);

            if (typeof out === "object") {
              _this.openFor(this, out, pos.x, pos.y);
            } else {
              _this.getTopOwner().destroy();
            }
          });
        }
      }
    }

    requestAnimationFrame(() => {
      this.position();
      this.root.style.transition = null;
      this.shadow.style.transition = null;
      let rect = this.root.getBoundingClientRect();
      this.shadow.style.height = rect.height;
    });
  }

  position() {
    let pos = this.getCalculatedRelativePosition();
    let rect = this.root.getBoundingClientRect();
    this.x = this.initX + pos.x;
    this.y = this.initY + pos.y;
    this.root.style.transition = "top 0.5s cubic-bezier(.18,.89,.32,1.28), left 0.5s cubic-bezier(.18,.89,.32,1.28)";
    this.shadow.style.transition = "top 0.5s cubic-bezier(.18,.89,.32,1.28), left 0.5s cubic-bezier(.18,.89,.32,1.28)";

    if (this.child !== null) {
      let nextPos = this.childButton.getBoundingClientRect();
      let relativeTop = nextPos.top - rect.top;
      this.child.initX = this.initX + pos.x + 200;
      this.child.initY = this.initY + pos.y + relativeTop;
      this.child.position();
    }
  }

  getCalculatedRelativePosition() {
    let rect = this.root.getBoundingClientRect();
    let x;
    let y;

    if (this.initY + rect.height > window.innerHeight) {
      y = -rect.height;
    } else {
      y = 0;
    }

    if (this.initX + rect.width > window.innerWidth) {
      x = -400;
    } else {
      x = 0;
    }

    return {
      x,
      y
    };
  }

  getTopOwner() {
    return this.parent === undefined ? this : this.parent.getTopOwner();
  }

  destroy() {
    this.root.remove();
    this.shadow.remove();

    if (this.child !== null) {
      this.child.destroy();
    }
  }

  openFor(button, context, x, y) {
    if (this.child !== null) {
      this.child.destroy();
    }

    this.child = new Context(context, x, y, this);
    this.childButton = button;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  get x() {
    return _classPrivateFieldGet(this, _x);
  }

  set x(value) {
    _classPrivateFieldSet(this, _x, value);

    this.root.style.left = value + "px";
    this.shadow.style.left = value + "px";
  }

  get y() {
    return _classPrivateFieldGet(this, _y);
  }

  set y(value) {
    _classPrivateFieldSet(this, _y, value);

    this.root.style.top = value + "px";
    this.shadow.style.top = value + "px";
  }

}

class MouseContext extends Context {
  constructor(ctx, x, y) {
    super(ctx, x, y);
    let body = document.getElementById("root");
    this.blob = document.createElement("div");
    this.blob.style.position = "absolute";
    this.blob.style.top = y - 5 + "px";
    this.blob.style.left = x - 5 + "px";
    this.blob.style.width = "10px";
    this.blob.style.height = "10px";
    this.blob.style.backgroundColor = "#ff0000";
    this.blob.style.borderRadius = "5px";
    this.blob.style.pointerEvents = "none";
    body.appendChild(this.blob);
  }

  getCalculatedRelativePosition() {
    let rect = this.root.getBoundingClientRect();
    let x;
    let y;

    if (this.initY + rect.height > window.innerHeight) {
      y = -rect.height;
    } else {
      y = 0;
    }

    if (this.initX + rect.width > window.innerWidth) {
      x = -200;
      x += Math.min(window.innerWidth - this.initX + rect.width - 200 - 20, 0);
    } else {
      x = 0;
    }

    return {
      x,
      y
    };
  }

  destroy() {
    this.blob.remove();
    super.destroy();
  }

}

class PermanentContext extends Context {
  destroy() {
    if (this.child !== null) {
      this.child.destroy();
    }
  }

}

function merge(self, other) {
  for (let [key, value] of Object.entries(other)) {
    if (typeof value === "object") {
      if (self[key] === undefined) {
        self[key] = {};
      }

      merge(self[key], value);
    } else {
      if (self[key] !== undefined) {
        throw new Error("Could not merge at key " + key);
      }

      self[key] = value;
    }
  }
}

function setup(app, container) {
  container.createContext = function (obj, x, y) {
    return new Context(obj, x, y);
  };

  let global_context = {};
  let permanent_context;
  let mouse_context = null;

  container.mergeGlobalContext = function (obj) {
    merge(global_context, obj);
  };

  function loadPermanentContent() {
    permanent_context = new PermanentContext(global_context, 0, 0);
  }

  function loadContext() {
    let rect = app.canvas.getBoundingClientRect();
    let mouseX = app.mouseX + rect.left;
    let mouseY = app.mouseY + rect.top;

    if (mouse_context !== null) {
      mouse_context.destroy();
    }

    let ctx = {};
    app.event.fire("context", {
      merge: merge.bind(null, ctx)
    });
    mouse_context = new MouseContext(ctx, mouseX, mouseY);
  }

  function handleWindowResize() {
    if (mouse_context !== null) {
      mouse_context.position();
    }

    permanent_context.position();
  }

  app.event.addEventListener("afterload", loadPermanentContent);
  app.event.addEventListener("raisecontext", loadContext);
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("click", function (ev) {
    let target = ev.target;

    if (!target.classList.contains("context") && !target.parentElement.classList.contains("context")) {
      if (mouse_context !== null) {
        mouse_context.destroy();
      }

      permanent_context.destroy();
    }
  });
}

export { setup };