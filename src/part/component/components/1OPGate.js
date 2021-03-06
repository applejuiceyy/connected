import ComponentBuilder from "../../../../connected/map/component.js";
import { Listener, Emitter } from "../../../../connected/map/component.js";
import { World } from "../../../../connected/map/world.js";

class Component1Operation extends ComponentBuilder
{
    imagepath = null;

    build(component)
    {
        component.imagepath = this.imagepath;

        component.width = 2;
        component.height = 1;
        component.addInteractor(Listener, "input", 0, 0);
        component.addInteractor(Emitter, "output", 1, 0);
    }

    load(world_data, component_data, component)
    {
        component.imagepath = this.imagepath;
    }
}

class NOTGate extends Component1Operation
{
    imagepath = "./images/not.png";

    evaluate(component)
    {
        component.interactors.output.setState(!component.interactors.input.state);
    }
}

class BufferGate extends Component1Operation
{
    imagepath = "./images/buffer.png";

    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input.state);
    }
}

function setup(app, container)
{
    World.global_registry["builtin:notgate"] = new NOTGate("NOT Gate");
    World.global_registry["builtin:buffergate"] = new BufferGate("Buffer Gate");
}

export {setup};