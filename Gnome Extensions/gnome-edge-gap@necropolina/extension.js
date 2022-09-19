const Main = imports.ui.main;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

/*
Based on https://github.com/necropolina/gnome-edge-gap
Adds a 1px panel to the top to prevent a nasty gap left behind where the panel is after resuming from suspens 
*/


let topPanel = null;

const gap = 1;

function init () {}

function enable() {
  let monitor = Main.layoutManager.primaryMonitor;

  topPanel = new St.Bin({
    reactive: false,
    can_focus: false,
    track_hover: false,
    height: gap,
    width: monitor.width,
  });

  topPanel.set_position(0, 0);

  Main.layoutManager.addChrome(topPanel, {
    affectsInputRegion: true,
    affectsStruts: true,
  });  
}

function disable() {
  Main.layoutManager.removeChrome(topPanel);
  topPanel.destroy();
  topPanel = null;
}
