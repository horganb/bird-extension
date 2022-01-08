To build for development:

`npm run dev`

To build for production:

`npm run build`

To create a keyboard shortcut (in this case, ctrl+shift+L) to build and refresh extensions, paste this in `keybindings.json`:

```
[
  {
    "key": "ctrl+shift+l",
    "command": "workbench.action.terminal.sendSequence",
    "args": {
      "text": "npm run dev && start chrome http://reload.extensions\u000D"
    }
  }
]
```
