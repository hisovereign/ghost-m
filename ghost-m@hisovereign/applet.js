const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Main = imports.ui.main;

const UUID = "ghost-m@hisovereign";

const HOME = GLib.get_home_dir();
const USER_BIN_DIR = HOME + "/.local/bin";
const GHOST_M_SCRIPT = USER_BIN_DIR + "/ghost-m";

class GhostMApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);

        if (!this._checkGhostMExists()) {
            this.set_applet_icon_symbolic_name("error");
            this.set_applet_tooltip("ghost-m not found in ~/.local/bin");
            this._disabled = true;
            return;
        }

        this._disabled = false;
        this._defaultOpacity = 50;

        if (this._iconExists("ghost-symbolic")) {
            this.set_applet_icon_symbolic_name("ghost-symbolic");
        } else {
            this.set_applet_icon_symbolic_name("window-new-symbolic");
        }
        this.set_applet_tooltip("Ghost-m");

        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menuManager.addMenu(this.menu);

        this._loadSettings();
        this._buildMenu();
    }

    _checkGhostMExists() {
        let scriptFile = Gio.File.new_for_path(GHOST_M_SCRIPT);
        try {
            let info = scriptFile.query_info('*', Gio.FileQueryInfoFlags.NONE, null);
            return info.get_file_type() === Gio.FileType.REGULAR;
        } catch (e) {
            return false;
        }
    }

    _iconExists(iconName) {
        try {
            let theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
            return theme.has_icon(iconName);
        } catch (e) {
            return false;
        }
    }

    _loadSettings() {
        let configPath = HOME + "/.config/ghost-m/applet-settings";
        let configFile = Gio.File.new_for_path(configPath);

        if (configFile.query_exists(null)) {
            try {
                let [success, contents] = configFile.load_contents(null);
                if (success) {
                    let settings = JSON.parse(contents);
                    if (settings.defaultOpacity) {
                        this._defaultOpacity = settings.defaultOpacity;
                    }
                }
            } catch (e) {
                global.logError("Error loading ghost-m settings: " + e);
            }
        }
    }

    _saveSettings() {
        let configPath = HOME + "/.config/ghost-m/applet-settings";
        let configDir = Gio.File.new_for_path(HOME + "/.config/ghost-m");
        if (!configDir.query_exists(null)) {
            configDir.make_directory_with_parents(null);
        }

        let configFile = Gio.File.new_for_path(configPath);
        let settings = {
            defaultOpacity: this._defaultOpacity
        };

        try {
            let contents = JSON.stringify(settings, null, 2);
            configFile.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
        } catch (e) {
            global.logError("Error saving ghost-m settings: " + e);
        }
    }

    _runGhostM(args) {
        if (this._disabled) return;
        let fullArgs = [GHOST_M_SCRIPT].concat(args);
        try {
            GLib.spawn_async(null, fullArgs, null,
                GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                null);
        } catch (e) {
            global.logError("Error running ghost-m: " + e);
        }
    }

    _setOpacityOnClick() {
        if (this._disabled) return;
        this.menu.close();
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            this._runGhostM(["opacity", this._defaultOpacity.toString(), "--click"]);
            return GLib.SOURCE_REMOVE;
        });
    }

    _clearWindowOnClick() {
        if (this._disabled) return;
        this.menu.close();
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            this._runGhostM(["clear", "--click"]);
            return GLib.SOURCE_REMOVE;
        });
    }

    _clearAllWindows() {
        if (this._disabled) return;
        this.menu.close();
        this._runGhostM(["clear-all"]);
        Main.notify("Ghost-m", "All windows have been reset");
    }

    _toggleOntopOnClick() {
        if (this._disabled) return;
        this.menu.close();
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            this._runGhostM(["ontop", "--click"]);
            return GLib.SOURCE_REMOVE;
        });
    }

    _buildMenu() {
        this.menu.removeAll();

        if (this._disabled) {
            let errorItem = new PopupMenu.PopupMenuItem("ghost-m not found");
            errorItem.setSensitive(false);
            this.menu.addMenuItem(errorItem);
            return;
        }

        // Opacity slider
        let sliderItem = new PopupMenu.PopupSliderMenuItem(this._defaultOpacity / 100);
        sliderItem.connect('value-changed', (item) => {
            this._defaultOpacity = Math.round(item._value * 100);
            this._saveSettings();
        });
        this.menu.addMenuItem(sliderItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Actions
        let opacityItem = new PopupMenu.PopupMenuItem("Set Opacity");
        opacityItem.connect('activate', () => this._setOpacityOnClick());
        this.menu.addMenuItem(opacityItem);

        let ontopItem = new PopupMenu.PopupMenuItem("Toggle Always on Top");
        ontopItem.connect('activate', () => this._toggleOntopOnClick());
        this.menu.addMenuItem(ontopItem);

        let clearItem = new PopupMenu.PopupMenuItem("Clear Window");
        clearItem.connect('activate', () => this._clearWindowOnClick());
        this.menu.addMenuItem(clearItem);

        let clearAllItem = new PopupMenu.PopupMenuItem("Clear All Windows");
        clearAllItem.connect('activate', () => this._clearAllWindows());
        this.menu.addMenuItem(clearAllItem);
    }

    on_applet_clicked() {
        if (this._disabled) return;
        this.menu.toggle();
    }

    on_applet_removed_from_panel() {
        this._runGhostM(["clear-all"]);
        if (this.menu) {
            this.menu.destroy();
            this.menu = null;
        }
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new GhostMApplet(metadata, orientation, panelHeight, instanceId);
}
