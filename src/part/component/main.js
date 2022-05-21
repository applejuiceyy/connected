import { World } from "../../../../connected/map/world.js";
import { Component, Listener } from "../../../../connected/map/component.js";

function setup(app, container)
{
    let bindings = new Array(10).fill(null);

    function setToolComponent(registry)
    {
        app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, Component.from_builder(app.world.loadedWorld, null, null, registry)))
    }

    container.getComponentByRegistryName = function(name)
    {
        return registry[name];
    }

    container.renderComponentAt = function(component, x, y, maybe_hide)
    {
        let background = false;
        if(maybe_hide && !(app.world.loadedWorld.running || app.options.show_all_layers))
        {
            background = true;
            app.ctx.globalAlpha = 0.2;

            for(let interactor of Object.values(component.interactors))
            {
                if(interactor.layer_idx === app.tools.layer.selected)
                {
                    background = false;
                    app.ctx.globalAlpha = 1;
                    break;
                }
            }
        }
        else
        {
            app.ctx.globalAlpha = 1;
        }

        let screen = app.world.math.positionToScreen(x, y);

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        let rotatedSize = component.rotatedSize;

        let mouse_over = component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
            component.y <= pos.y && component.y + rotatedSize.y > pos.y;

        if(app.world.loadedWorld.running && app.options.display_component_updates)
        {
            let d = new Date();
            let now = d.getTime();

            let delta = Math.floor(Math.max(Math.min((now - component.last_update) / 1000 * 255, 255), 1));

            app.ctx.fillStyle = "rgba(0, " + delta + ", 0, 0.35)";
        }
        else
        {
            app.ctx.fillStyle = "#00ff0044";
        }
        
        app.ctx.fillRect(screen.x + 5, screen.y + 5, rotatedSize.x * app.tilesize - 10, rotatedSize.y * app.tilesize - 10);

        if(component.image !== null)
        {
            let pos = {x: (rotatedSize.x / 2) * app.tilesize + screen.x, y: (rotatedSize.y / 2) * app.tilesize + screen.y};
            app.ctx.translate(pos.x, pos.y);
            app.ctx.rotate(-component.rotation * (Math.PI / 2));
            app.ctx.drawImage(component.image, -20, -20);
            app.ctx.rotate(component.rotation * (Math.PI / 2));
            app.ctx.translate(-pos.x, -pos.y);
        }
        
        let turned_off = app.options.colorblind ? "rgb(40, 40, 40)" : "rgb(255, 0, 0)";
        let turned_on = app.options.colorblind ? "rgb(200, 200, 200)" : "rgb(0, 255, 0)";

        if(app.options.show_inputs_outputs)
        {
            for(let interactor of Object.values(component.interactors))
            {
                // avoid using the component position

                let pos = interactor.rotatedPosition;
                pos.x += x;
                pos.y += y;

                let centre;

                if(app.world.loadedWorld.map.isValid(pos.x, pos.y))
                {
                    let tile = app.world.loadedWorld.map.get(pos.x, pos.y);
                    centre = (interactor.layer_idx + 1) / (tile.layers.length + 1);
                }
                else
                {
                    centre = 0.5;
                }

                app.ctx.fillStyle = interactor instanceof Listener? "#ff0000" : "#0000ff";

                let interactor_screen = app.world.math.positionToScreen(pos.x + centre, pos.y + centre);
                
                if(!background)
                {
                    if(mouse_over && component.image !== null)
                    {
                        app.ctx.globalAlpha = 0.2;
                    }
                    else
                    {
                        app.ctx.globalAlpha = 1;
                    }
                }

                if(app.options.colorblind)
                {
                    app.ctx.strokeStyle = "#000000";
                    app.ctx.lineWidth = 1;

                    app.ctx.beginPath();
                    if(interactor instanceof Listener)
                    {
                        app.ctx.arc(interactor_screen.x, interactor_screen.y, 10, 0, Math.PI * 2);
                    }
                    else
                    {
                        app.ctx.moveTo(interactor_screen.x - 10, interactor_screen.y);
                        app.ctx.lineTo(interactor_screen.x, interactor_screen.y + 10);
                        app.ctx.lineTo(interactor_screen.x + 10, interactor_screen.y);
                        app.ctx.lineTo(interactor_screen.x, interactor_screen.y - 10);
                        app.ctx.lineTo(interactor_screen.x - 10, interactor_screen.y);
                    }
                    app.ctx.fill();
                }
                else
                {
                    app.ctx.fillRect(interactor_screen.x - 10, interactor_screen.y - 10, 20, 20);
                }

                if(component.world.running)
                {
                    app.ctx.fillStyle = interactor.state ? turned_on : turned_off;
                    app.ctx.strokeStyle = "#000000";
                    app.ctx.lineWidth = 1;

                    app.ctx.fillRect(interactor_screen.x - 5, interactor_screen.y - 5, 10, 10);

                    app.ctx.beginPath();
                    app.ctx.rect(interactor_screen.x - 5, interactor_screen.y - 5, 10, 10);
                    app.ctx.stroke();
                }
            }
        }

        app.ctx.globalAlpha = 1;
    }

    function mergeContext(ev)
    {
        if(app.world.loadedWorld.running) return;
        
        let components = app.world.loadedWorld.components;

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        let intersectedComponents = [];

        for(let component of components)
        {
            let rotatedSize = component.rotatedSize;
            if(component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
                component.y <= pos.y && component.y + rotatedSize.y > pos.y)
            {
                intersectedComponents.push(component);
            }
        }

        if(intersectedComponents.length === 0) return;

        let single = intersectedComponents.length === 1;

        let root = {};

        let merger = {};

        for(let i = 0; i < intersectedComponents.length; i++)
        {
            let component = intersectedComponents[i];

            let bucket;
            if(single)
            {
                bucket = merger;
            }
            else
            {
                let id = 0;
                while(merger[component.builder.name + id] !== undefined)
                {
                    console.log(component.builder.name + id);
                    id += 1;
                }

                bucket = {};
                merger[component.builder.name + id] = bucket;
            }

            bucket["rotate clockwise"] = function()
            {
                component.rotation += Math.PI / 2;
            }

            bucket["rotate anticlockwise"] = function()
            {
                component.rotation -= Math.PI / 2;
            }

            bucket["set position"] = function() {
                app.world.loadedWorld.components.delete(component);
                app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, component))
            }

            bucket["duplicate"] = function() {
                app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, component.clone()))
            }

            bucket["delete"] = function() {
                app.world.loadedWorld.components.delete(component);
            }

            for(let interactor of Object.values(component.interactors))
            {
                let interactor_pos = interactor.absolutePosition;

                if(interactor_pos.x == pos.x && interactor_pos.y == pos.y)
                {
                    root["interactor"] = {
                        ["set layer"]: app.tools.layer.layerSelector(function(idx)
                        {
                            interactor.layer_idx = idx;
                        })
                    };
                    break;
                }
            }

            component.builder.context(component, bucket);
        }

        root.component = merger;

        ev.merge(root);
    }

    app.context.mergeGlobalContext({
        components: function()
        {
            let entries = Object.entries(app.world.loadedWorld.registry);

            let ret = {};
            let number_binding = {};

            for(let number = 0; number <= 9; number++)
            {
                number_binding[number] = {};
            }

            for(let i = 0; i < entries.length; i++)
            {
                let registry_name = entries[i][0];
                let builder = entries[i][1];

                for(let number = 0; number <= 9; number++)
                {
                    if(bindings[number] !== registry_name)
                    {
                        number_binding[number][builder.name] = (function(to_set, name)
                        {
                            bindings[to_set] = name;
                        }).bind(null, number, registry_name);
                    }
                }
                if(!app.world.loadedWorld.running)
                {
                    ret[builder.name] = setToolComponent.bind(null, registry_name);
                }
            }

            for(let number = 0; number <= 9; number++)
            {
                if(bindings[number] !== null)
                {
                    number_binding[number]["<h3>clear</h3>"] = (function(to_clear)
                    {
                        bindings[to_clear] = null;
                    }).bind(null, number);
                }
            }

            ret["<h3>bind number</h3>"] = number_binding;

            return ret;
        }
    })

    function keydown(ev)
    {
        if(app.world.loadedWorld.running) return;

        if(isFinite(ev.key))
        {
            let number = parseInt(ev.key);

            if(bindings[number] !== null)
            {
                setToolComponent(bindings[number]);
            }
        }
    }

    function wheel(ev)
    {
        if(app.world.loadedWorld.running) return;
        let components = app.world.loadedWorld.components;

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        for(let component of components)
        {
            let rotatedSize = component.rotatedSize;
            if(component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
                component.y <= pos.y && component.y + rotatedSize.y > pos.y)
            {
                for(let interactor of Object.values(component.interactors))
                {
                    let interactor_pos = interactor.absolutePosition;

                    if(interactor_pos.x == pos.x && interactor_pos.y == pos.y)
                    {
                        let new_layer_idx = (ev.deltaY > 0? 1 : -1) + interactor.layer_idx;

                        interactor.layer_idx = Math.max(Math.min(new_layer_idx, app.world.loadedWorld.map.layers - 1), 0);
                    }
                }
            }
        }
    }

    app.keybinds.addCallback(["d"], function()
    {
        if(app.world.loadedWorld.running) return;
        let components = app.world.loadedWorld.components;

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        for(let component of components)
        {
            let rotatedSize = component.rotatedSize;
            if(component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
                component.y <= pos.y && component.y + rotatedSize.y > pos.y)
            {
                app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, component.clone()));
                app.toast.addToast("Duplicate");
                return;
            }
        }
    });

    app.event.addEventListener("context", mergeContext);
    app.event.addEventListener("keydown", keydown, 1);
    app.event.addEventListener("wheel", wheel);
}

const requiring = ["context", "tools"]

export {setup, requiring};