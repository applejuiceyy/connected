import { Color } from "../../../connected/map/shared_system.js";
import { Side } from "./../../../connected/map/tilelayer.js";

function setup(app)
{
    let layer_opacities = new Array(0);

    function drawConnection(layer, side, centre, outwards)
    {
        if(layer.isConnected(side))
        {
            app.ctx.moveTo(centre.x, centre.y);
            app.ctx.lineTo(outwards.x, outwards.y);
        }
    }

    function draw()
    {
        if(layer_opacities.length !== app.world.loadedWorld.map.layers)
        {
            layer_opacities = new Array(app.world.loadedWorld.map.layers).fill(1);
        }

        let bounds = app.world.math.visibleBounds();

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        let pointing_shared_system;

        if(app.world.loadedWorld.map.isValid(pos.x, pos.y))
        {
            let tile = app.world.loadedWorld.map.get(pos.x, pos.y);
            let layer = tile.layers[app.tools.layer.selected];
            pointing_shared_system = layer.getSharedSystem();
        }

        let turned_off = app.options.colorblind ? new Color(40, 40, 40) : new Color(255, 0, 0);
        let turned_on = app.options.colorblind ? new Color(200, 200, 200) : new Color(0, 255, 0);

        for(let layeridx = 0; layeridx < app.world.loadedWorld.map.layers; layeridx++)
        {
            let target_alpha;

            if(app.world.loadedWorld.running || app.options.show_all_layers)
            {
                target_alpha = 1;
            }
            else
            {
                target_alpha = app.tools.layer.selected === layeridx ? 1 : 0.1;
            }

            layer_opacities[layeridx] += (target_alpha - layer_opacities[layeridx]) / 5;
        }

        for(let y = bounds.top; y < bounds.bottom; y++)
        {
            for(let x = bounds.left; x < bounds.right; x++)
            {
                let tile = app.world.loadedWorld.map.get(x, y);

                for(let layeridx = 0; layeridx < tile.layers.length; layeridx++)
                {
                    let layer = tile.layers[layeridx];

                    let system = layer.getSharedSystem();

                    if(system !== null)
                    {
                        let centre = (layer.idx + 1) / (layer.owner.layers.length + 1);

                        app.ctx.globalAlpha = layer_opacities[layeridx];

                        for(let outline = 0; outline < 2; outline++)
                        {
                            app.ctx.lineWidth = outline === 1? 3 : 5;

                            app.ctx.beginPath();

                            let color;

                            if(outline === 1)
                            {
                                let displayColor;

                                if(app.world.loadedWorld.running)
                                {
                                    displayColor = system.state ? turned_on : turned_off;
                                }
                                else
                                {
                                    displayColor = system.color;
                                }

                                if(system === pointing_shared_system)
                                {
                                    let farness = Math.abs(pos.x - x) + Math.abs(pos.y - y);

                                    let value = Math.max(0, 1 / (farness / 10 + 1)) * 0.8;

                                    if(app.world.loadedWorld.running)
                                    {
                                        value *= 0.1;
                                    }
                                    
                                    let other_value = (displayColor.R + displayColor.G + displayColor.B) / 3 > 200? 0: 255;

                                    color = displayColor.blend(new Color(other_value, other_value, other_value), value)
                                }
                                else
                                {
                                    color = displayColor;
                                }
                            }
                            else
                            {
                                color = "rgb(0, 0, 0)"
                            }

                            app.ctx.strokeStyle = color;
                            app.ctx.fillStyle = color;

                            let size = outline === 1? 5 : 7;

                            app.ctx.arc(app.pan.x + (x + centre) * app.tilesize, app.pan.y + (y + centre) * app.tilesize, size, 0, Math.PI * 2);

                            app.ctx.fill();

                            app.ctx.beginPath();

                            app.ctx.moveTo(app.pan.x + (x + centre) * app.tilesize, app.pan.y + (y + centre) * app.tilesize);
                            app.ctx.lineTo(app.pan.x + (x + centre) * app.tilesize + 1, app.pan.y + (y + centre) * app.tilesize + 1);

                            drawConnection(layer, Side.UP,
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize},
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + y * app.tilesize});
                            
                            drawConnection(layer, Side.DOWN,
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize},
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + (y + 1) * app.tilesize});

                            drawConnection(layer, Side.LEFT,
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize},
                                {x: app.pan.x + x * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize});
                            
                            drawConnection(layer, Side.RIGHT,
                                {x: app.pan.x + (x + centre) * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize},
                                {x: app.pan.x + (x + 1) * app.tilesize, y: app.pan.y + (y + centre) * app.tilesize});

                            app.ctx.stroke();
                        }
                    }
                }
            }
        }

        app.ctx.globalAlpha = 1;

    }

    app.event.addEventListener("draw", draw, 3);
}


export {setup};