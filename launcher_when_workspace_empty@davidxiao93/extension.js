const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Config = imports.misc.config;
const Version = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
const ImportClass = Version == 3 ? imports.ui.viewSelector.ViewSelector : imports.ui.overviewControls.ControlsManager;
const ShowAppsButton = Version == 3 ? Main.overview.viewSelector._showAppsButton : Main.overview.dash.showAppsButton;
const OverviewShowApps = Version == 3 ? Main.overview.viewSelector : Main.overview;
const MainOverview = Version == 3 ? Main.overview.viewSelector : Main.overview.dash;

let _signal = [];

let _manager, _workspace, _monitor;

let _launched = false;

function maybeOpenLauncher() {
    if (_workspace.list_windows().length === 0 && _launched === false) {
        try {
            // The process starts running immediately after this function is called. Any
            // error thrown here will be a result of the process failing to start, not
            // the success or failure of the process itself.
            Gio.Subprocess.new(
                // The program and command options are passed as a list of arguments
                // ['rofi', '-combi-modi', 'window,drun', 
                // '-show', 'combi', 
                // '-show-icons', '-theme', 'Pop-Dark', 
                // '-sort', '-sorting-method', 'fzf'],
                
                // ['xdotool', 'key', 'alt+space'],

                ['ulauncher-toggle'],
        
                // The flags control what I/O pipes are opened and how they are directed
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            _launched = true;
        } catch (e) {
            console.log("help", e);
        }
    }
}

function maybeCloseLauncher() {
    if (_workspace.list_windows().length !== 0 && _launched === true) {
        _launched = false;
    }
}


function connectWindowSignals() {
    _workspace = _manager.get_active_workspace();
    _signal['window-removed'] = _workspace.connect('window-removed', maybeOpenLauncher);
    _signal['window-added'] = _workspace.connect('window-added', maybeCloseLauncher);
}

function disconnectWindowSignals() {
    if (_signal['window-added']) {
        _workspace.disconnect(_signal['window-added']);
    }

    if (_signal['window-removed']) {
        _workspace.disconnect(_signal['window-removed']);
    }
}

function checkWorkspace() {
    _launched = false;
    disconnectWindowSignals();
    connectWindowSignals();
    maybeOpenLauncher();
    maybeCloseLauncher();
}

function init() {
    _manager = global.screen;
    if (_manager == undefined) {
        _manager = global.workspace_manager;
    }

    _monitor = global.display.get_primary_monitor();
}

function enable() {
    connectWindowSignals();

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
