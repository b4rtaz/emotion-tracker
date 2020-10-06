const { app, BrowserWindow } = require('electron')

function createWindow () {
	const window = new BrowserWindow({
		width: 1000,
		height: 800,
		minimizable: false,
		maximizable: false,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});

	window.setMenuBarVisibility(false);
	window.loadFile('./app/index.html');
}

app.on('ready', () => {
	createWindow();
});
