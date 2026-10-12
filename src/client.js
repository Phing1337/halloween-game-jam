import g from 'g.js/web';
import { State } from './state.js';
import { Renderer } from './renderer.js';
import { nextCustomer, submitBrew } from './gameplay.js';
import { palette } from './palette.js';
import { createIntro, installGameStyles } from './intro.js';

installGameStyles(asset_list['fonts/UnifrakturCook-Bold.ttf'] ?? '/fonts/UnifrakturCook-Bold.ttf');
g.web.canvas(document.getElementById('primary'));

g.initialize(function ()
{
    g.is_running = false;

    g.state = new State();

    g.web.assets.load(asset_list, function() {
        g.renderer = new Renderer(g.web.assets);

        g.renderer.on_press("yellow_vial", function(dt) {
            g.state.pouring_color = palette().primaries[1];
        });

        g.renderer.on_press("red_vial", function(dt) {
            g.state.pouring_color = palette().primaries[0];
        });

        g.renderer.on_press("blue_vial", function(dt) {
            g.state.pouring_color = palette().primaries[2];
        });

        g.intro = createIntro(function() {
            g.web._audio_ctx.resume().catch(error => {
                console.error('Unable to resume game audio:', error);
            });
            g.song.audio.play().catch(error => {
                console.error('Unable to start background music:', error);
            });
            g.state.intro_easer.target(1);
        });

        g.renderer.on_press("brew", function(dt) {
            console.log("brew");
            submitBrew(g.state);
        });


        g.song = new g.web.assets['sound/spooky-kitchen-background']([0,0,0]);
        g.song.gain(0.5);

        g.renderer.on_release(function() { g.state.pouring_color = null; });

        g.is_running = true;
    });

    return true;
});



g.update(function (dt)
{
    if (!g.is_running) { return; }
    g.state.intro_easer.update(dt);
    if (g.state.intro_easer.value < 1) { return; }

    // Spawn the next customer
    if (g.state.customers.length === 0) {
        let customer = nextCustomer(g.state);
        customer.easer.target(0);
        g.state.customers.push(customer);
    } else {
        g.state.customers.at(-1).update(dt);

        if (g.state.customers.at(-1).has_left) {
            g.state.customers.pop();
        }
    }

    if (g.state.pouring_color) {
        console.log("pouring");
        g.state.cauldron.add(g.state.pouring_color, dt * 0.5);
    }

    g.state.cauldron.update(dt);
    g.state.time_s += dt;
});

g.web.draw(function (dt)
{
    if (!g.is_running) { return; }

    g.renderer.draw(g.state, dt);
    g.intro.update(g.web._canvas, g.renderer.intro_time, g.state.intro_easer.value);
});

g.start();
