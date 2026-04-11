# ghost-m
**Set opacity and always on top for any X11 window**

`ghost-m` is a lightweight command-line tool that lets you make any window transparent and/or always on top by just clicking on them! Made for Muffin but works for any X11-based desktop

## Features 

- Set any window to any opacity level (0-100%)
- Set "always on top" for any window
- Save and load window presets
- Select windows by mouse-click, title, or class

## Requirements

- Linux with X11
- `wmctrl`, `xdotool`, `xprop`

Install dependencies

```
sudo apt install wmctrl xdotool x11-utils
```
## Installation


1. Download ghost-m script
    
    - click on the ghost-m script and go to the right of where it says raw then click download raw file

2. Move it to ~/.local/bin/

    - if you don't see .local right click in /home and show hidden files

3. Make the script executable

    - Open a terminal by going to menu and searching terminal

    - Type and hit enter

          chmod +x ~/.local/bin/ghost-m
    - Then type 

          ghost-m
      to bring up help menu

      ## How to use

      Type in terminal: ghost-m COMMAND [arguments]

## Commands

| Command | Description |
|---------|-------------|
| `ghost-m opacity <0-100> --click/--title <name>/--class <name>` | Set opacity for window by click, title, or class |
| `ghost-m ontop --click/--title <name>/--class <name>` | Set always on top for window |
| `ghost-m clear --click/--title <name>/--class <name>` | Reset window to 100% opacity and ontop off |
| `ghost-m preset save <name> --click/--title <name>/--class <name>` | Save preset for window |
| `ghost-m preset load <name>` | Loads preset for specific window (window must be open) |
| `ghost-m preset list` | Lists saved presets |
| `ghost-m help` | Shows help menu |

**Examples**

Set opacity to 50% by clicking on window
```
ghost-m opacity 50 --click
```
Set opacity to 70% for window titled "chat:"
```
ghost-m opacity 70 --title "Chat:"
```
Set window class to always on top
```
ghost-m ontop --class "firefox"
```
Reset window to 100% opacity and ontop off
```
ghost-m clear --click
```
Save window opacity and/or on top status as a preset
```
ghost-m preset save mychat --click
```
Load saved preset for opened window
```
ghost-m preset load mychat
```

Presets are saved to ~/.config/ghost-m/presets/

## Opacity doesn't work on some windows
Some applications (certain games or hardware-accelerated windows) ignore opacity requests. 

## Uninstall
Delete `ghost-m` from `~/.local/bin`
Delete `~/.config/ghost-m`

## ghost-m cinnamon applet installation

Copy the ghost-m@hisovereign folder and place it in ~/.local/share/cinnamon/applets

-Create a new folder in ~/.local/share/cinnamon/applets and name it ghost-m@hisovereign

-download the applet.js and metadata.json and palce it in folder you made

-restart cinnamon (alt + F2, type r then hit enter) or restart pc

-Right-click on panel > click on applets> add ghost-m applet to panel

-demo https://youtu.be/eYnwDRxlMFs
## Known bugs

When setting always on top and then starting a full-screen application mouse input will be locked between them;this is a known muffin bug when using Linux Cinnamon. To correct alt + tab into fullscreen app and always on top window or start fullscreen application first and then set always on top window.

--title and --class may fail to find correct window. Listing window titles and classes will help but still may fail with certain windows. Fallback to --click command and click on specific window
