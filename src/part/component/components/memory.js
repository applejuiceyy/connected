import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";

class Memory extends ComponentBuilder
{
    build(component)
    {
        component.imagepath = "./images/memory.png";

        component.width = 2;
        component.height = 2;
        
        component.addInteractor(Listener, "clear", 0, 0);
        component.addInteractor(Listener, "take", 0, 1);

        component.addInteractor(Emitter, "output", 1, 0);
    }

    evaluate(component)
    {
        if(component.interactors.take.state)
        {
            component.interactors.output.setState(component.interactors.clear.state);
        }
    }

    load(world_data, component_data, component)
    {
        component.imagepath = "./images/memory.png";
    }
}

function setup(app, container)
{
    World.global_registry["builtin:memory"] = new Memory("Memory");
}

export {setup};