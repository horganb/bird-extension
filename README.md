## Setting up for development

First:

1. Install node.js, Git, Visual Studio Code, and Chrome
2. In Visual Studio Code, install ESLint and Prettier extensions
3. Install the "Extensions Reloader" Chrome extension (https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en)
4. Clone the repository into VS Code (type ctrl+shift+p, select "Git: Clone", paste URL from GitHub repository's "Code" dialog)
5. run `npm install` in root of repository

Now, add a shortcut to build the code and refresh the extension:

1. In VS Code, type ctrl+shift+p
2. Select "Open Keyboard Shortcuts (JSON)"
3. Paste the following, replacing the "key" with your preferred key sequence:

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

Adding development version of extension to Chrome:

1. In Chrome, navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Disable the live version of the extension, if you have it
4. Select "Load unpacked", and select the repository

## Development

To make changes and view them in Chrome:

1. Save your changes
2. Use the shortcut designated above to build the code and refresh the extension
3. When your page refreshes, the development version of the extension will have your changes

## Deploying to Chrome Web Store

1. Run `npm run compress`
2. Upload generated zip file (`bird-extension.zip`) to Web Store
