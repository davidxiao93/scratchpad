const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Config = imports.misc.config;
const Version = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
const ImportClass = Version == 3 ? imports.ui.viewSelector.ViewSelector : imports.ui.overviewControls.ControlsManager;
const ShowAppsButton = Version == 3 ? Main.overview.viewSelector._showAppsButton : Main.overview.dash.showAppsButton;
const OverviewShowApps = Version == 3 ? Main.overview.viewSelector : Main.overview;
const MainOverview = Version == 3 ? Main.overview.viewSelector : Main.overview.dash;

let _signal = [];
let _function;

let _manager, _workspace, _monitor;

var _showAppsButtonChecked;

function maybeOpenCosmicLauncher() {
    if (_workspace.list_windows()./*filter(window => window.get_monitor() == _monitor).*/length == 0) {
        let pop_cosmic = Main.extensionManager.lookup("pop-cosmic@system76.com");
        if (pop_cosmic) {
            pop_cosmic.stateObj.overview_show(pop_cosmic.stateObj.OVERVIEW_LAUNCHER);
        }
    }
}

function disconnectWindowSignals() {
    if (_signal['window-added']) {
        _workspace.disconnect(_signal['window-added']);
    }

    if (_signal['window-removed']) {
        _workspace.disconnect(_signal['window-removed']);
    }
}

function getWorkspace() {
    _workspace = _manager.get_active_workspace();
    _signal['window-removed'] = _workspace.connect('window-removed', maybeOpenCosmicLauncher);
}

function checkWorkspace() {
    disconnectWindowSignals();
    getWorkspace();
    maybeOpenCosmicLauncher();
}

function init() {
    _manager = global.screen;
    if (_manager == undefined) {
        _manager = global.workspace_manager;
    }

    _monitor = global.display.get_primary_monitor();
}

function enable() {
    getWorkspace();

    _signal['workspace-switched'] = _manager.connect('workspace-switched', checkWorkspace);
    
    // shows Cosmic Launcher at login, but waits for mainloop to turn idle first
    // .. and then waits 1 second
    GLib.idle_add(GLib.PRIORITY_LOW, () => {
        GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 0, () => {
            checkWorkspace();
            return GLib.SOURCE_REMOVE;
        });
        return GLib.SOURCE_REMOVE;
    });
}

function disable() {
    disconnectWindowSignals();
    _manager.disconnect(_signal['workspace-switched']);
}
