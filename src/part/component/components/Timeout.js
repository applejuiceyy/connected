import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";
class Timeout extends ComponentBuilder
{
    build(component)
    {
        component.imagepath = "./images/timer.png";
        component.width = 2;
        component.height = 1;
        component.addInteractor(Listener, "input", 0, 0);
        component.addInteractor(Emitter, "output", 1, 0);
        component.data.timeout = 1000;
    }


    evaluate(component)
    {
        let setting = component.interactors.input.state;

        setTimeout(()=>{
            component.interactors.output.setState(setting);
        }, component.data.timeout);
    }

    context(component, context)
    {
        context["set timeout"] = function()
        {
            component.data.timeout = parseInt(prompt("Delay in milliseconds"));
        }
    }

    load(world_data, component_data, component)
    {
        component.imagepath = "./images/timer.png";
    }
}

function setup(app, container)
{
    World.global_registry["builtin:timeoutgate"] = new Timeout("Timeout Gate");
}

export {setup};