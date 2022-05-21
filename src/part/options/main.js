function setup(app, container)
{
    container.colorblind = false;
    container.show_all_layers = false;
    container.display_component_updates = false;
    container.show_inputs_outputs = true;
    container.show_simulation_stats = false;

    app.context.mergeGlobalContext({
        options: {
            colorblind: ()=>container.colorblind = !container.colorblind,
            ["Show all layers at once"]: ()=>container.show_all_layers = !container.show_all_layers,
            ["Display when a component updates"]: ()=>container.display_component_updates = !container.display_component_updates,
            ["Show inputs/outputs"]: ()=>container.show_inputs_outputs = !container.show_inputs_outputs,
            ["Show simulation stats"]: ()=>container.show_simulation_stats = !container.show_simulation_stats
        }
    })
}

export {setup};