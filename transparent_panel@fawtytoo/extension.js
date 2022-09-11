const Main = imports.ui.main;
const Config = imports.misc.config;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const AppDisplay = imports.ui.appDisplay;
const [VersionMajor, VersionMinor] = Config.PACKAGE_VERSION.split('.');
const Version = parseInt(VersionMajor) == 3 ? parseInt(VersionMinor) : parseInt(VersionMajor);

var _transparentPanel;

let appFolderDialogPopup;
let appFolderDialogPopdown;

function addTransparency()
{
    if (Version < 42)
        Main.panel._addStyleClassName('transparent');
    else
        Main.panel.add_style_class_name('transparent');
}

function removeTransparency()
{
    if (Version < 42)
        Main.panel._removeStyleClassName('transparent');
    else
        Main.panel.remove_style_class_name('transparent');
}

function appFolderDialog_popup()
{
    appFolderDialogPopup.apply(this, []);

    Main.panel._addStyleClassName('dialogPopup');
}

function appFolderDialog_popdown()
{
    appFolderDialogPopdown.apply(this, []);

    Main.panel._removeStyleClassName('dialogPopup');
}

let TransparentPanel = class
{
    constructor()
    {
        this.actor = Main.panel;

        this._signalIds = new Map();
        this._trackedWindows = new Map();

        this._signalIds.set(Main.overview, [
            Main.overview.connect('showing', addTransparency),
            Main.overview.connect('hiding', this._updateSolidStyle.bind(this))
        ]);

        //this._signalIds.set(Main.sessionMode, [
        //    Main.sessionMode.connect('updated', this._updateSolidStyle.bind(this))
        //]);

        for (const metaWindowActor of global.get_window_actors())
            this._onWindowActorAdded(metaWindowActor.get_parent(), metaWindowActor);

        this._signalIds.set(global.window_group, [
            global.window_group.connect('actor-added', this._onWindowActorAdded.bind(this)),
            global.window_group.connect('actor-removed', this._onWindowActorRemoved.bind(this))
        ]);

        this._signalIds.set(global.window_manager, [
            global.window_manager.connect('switch-workspace', this._updateSolidStyle.bind(this))
        ]);

        this._updateSolidStyle();
        //addTransparency();
    }

    destroy()
    {
        for (const allSignalIds of [this._signalIds, this._trackedWindows])
            for (const [actor, signalIds] of allSignalIds)
                for (const signalId of signalIds)
                    actor.disconnect(signalId);
    }

    _onWindowActorAdded(container, metaWindowActor)
    {
        let signalIds = [];
        [Version < 38 ? 'allocation-changed' : 'notify::allocation', 'notify::visible'].forEach(s => {
            signalIds.push(metaWindowActor.connect(s, this._updateSolidStyle.bind(this)));
        });
        this._trackedWindows.set(metaWindowActor, signalIds);
    }

    _onWindowActorRemoved(container, metaWindowActor)
    {
        this._trackedWindows.get(metaWindowActor).forEach(id => {
            metaWindowActor.disconnect(id);
        });
        this._trackedWindows.delete(metaWindowActor);
        this._updateSolidStyle();
    }

    _updateSolidStyle()
    {        
        if (!Main.layoutManager.primaryMonitor)
            return;

        if (Main.overview._shown || Main.panel.has_style_pseudo_class('overview') || !Main.sessionMode.hasWindows) {
            addTransparency()
            return;
        }

        /* Get all the windows in the active workspace that are in the primary monitor and visible */
        let workspaceManager = global.workspace_manager;
        let activeWorkspace = workspaceManager.get_active_workspace();
        let windows = activeWorkspace.list_windows().filter(metaWindow => {
            return metaWindow.is_on_primary_monitor() &&
                   metaWindow.showing_on_its_workspace() &&
                   !metaWindow.is_hidden() &&
                   metaWindow.get_window_type() != Meta.WindowType.DESKTOP;
        });

        /* Check if at least one window is near enough to the panel */
        let [, panelTop] = this.actor.get_transformed_position();
        let panelBottom = panelTop + this.actor.get_height();
        let scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        let isNearEnough = windows.some(metaWindow => {
            let verticalPosition = metaWindow.get_frame_rect().y;
            return verticalPosition < panelBottom + 5 * scale;
        });

        if (isNearEnough)
            removeTransparency();
        else
            addTransparency()
    }
};

function init()
{
}

function enable()
{
    if (Version > 30)
        _transparentPanel = new TransparentPanel();
    else
        addTransparency();

    if (Version == 38)
    {
        appFolderDialogPopup = AppDisplay.AppFolderDialog.prototype.popup;
        AppDisplay.AppFolderDialog.prototype.popup = appFolderDialog_popup;
        appFolderDialogPopdown = AppDisplay.AppFolderDialog.prototype.popdown;
        AppDisplay.AppFolderDialog.prototype.popdown = appFolderDialog_popdown;
    }
}

function disable()
{
    if (Version == 38)
    {
        AppDisplay.AppFolderDialog.prototype.popup = appFolderDialogPopup;
        AppDisplay.AppFolderDialog.prototype.popdown = appFolderDialogPopdown;
    }

    if (Version > 30)
        _transparentPanel.destroy();
    else
        removeTransparency();
}
