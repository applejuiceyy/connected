import ComponentBuilder from "../../../../connected/map/component.js";
import { Listener, Emitter } from "../../../../connected/map/component.js";
import { World } from "../../../../connected/map/world.js";

class Lamp extends ComponentBuilder
{
    build(component)
    {
        component.imagepath = "./images/lamp.png";
        component.width = 1;
        component.height = 1;
        component.addInteractor(Listener, "input", 0, 0);
        component.data.color = "#ffffff";
    }


    draw(component, app)
    {
        if(component.world.running)
        {
            let pos = app.world.math.positionToScreen(component.x, component.y);

            let color = component.interactors.input.state ? component.data.color : "#000000";
            color = color === undefined? "#ffffff" : color;
            app.ctx.fillStyle = color;

            let rotatedSize = component.rotatedSize;

            app.ctx.fillRect(pos.x, pos.y, rotatedSize.x * app.tilesize, rotatedSize.y * app.tilesize);
        }
        else
        {
            super.draw(component, app);
        }
    }

    context(component, context)
    {
        context["set color"] = function()
        {
            component.data.color = prompt("Color");
        }
    }

    load(world_data, component_data, component)
    {
        component.imagepath = "./images/lamp.png";
    }
}

class SegmentDisplay extends ComponentBuilder
{
    constructor(name)
    {
        super(name);

        this.arr = [
            0b0111111,
            0b0100001,
            0b1011011,
            0b1110011,
            0b1100101,
            0b1110110,
            0b1111110,
            0b0100011,
            0b1111111,
            0b1110111,
            0b1101111,
            0b1111100,
            0b0011110,
            0b0111111,
            0b1011110,
            0b1001110
        ]
    }

    build(component)
    {
        component.width = 2;
        component.height = 7;
        component.addInteractor(Listener, "A", 0, 0);
        component.addInteractor(Listener, "B", 0, 1);
        component.addInteractor(Listener, "C", 0, 2);
        component.addInteractor(Listener, "D", 0, 3);

        component.addInteractor(Emitter, "out1", 1, 0);
        component.addInteractor(Emitter, "out2", 1, 1);
        component.addInteractor(Emitter, "out3", 1, 2);
        component.addInteractor(Emitter, "out4", 1, 3);
        component.addInteractor(Emitter, "out5", 1, 4);
        component.addInteractor(Emitter, "out6", 1, 5);
        component.addInteractor(Emitter, "out7", 1, 6);
    }

    evaluate(component)
    {
        let idx = component.interactors.A.state << 3 |
            component.interactors.B.state << 2 |
            component.interactors.C.state << 1 |
            component.interactors.D.state;
        
        let val = this.arr[idx];

        let pos = 1;

        while(pos < 8)
        {
            component.interactors["out" + (pos++)].setState(val & 0b1);
            val >>= 1;
        }
    }
}

function setup(app, container)
{
    World.global_registry["builtin:lamp"] = new Lamp("Lamp");
    World.global_registry["builtin:segmentdisplay"] = new SegmentDisplay("Segment Display Converter");
}

export {setup};