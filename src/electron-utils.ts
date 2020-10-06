
export function isElectron(): boolean {
	// https://github.com/electron/electron/issues/2288
	return window && window.process && (<any>window.process).type;
}

export function bindExternalAnchors() {
	const shell = window.require('electron').shell;
	const elements = document.getElementsByTagName('a');
	for (let i = 0; i < elements.length; i++) {
		elements[i].addEventListener('click', (event) => {
			event.preventDefault();
			shell.openExternal(elements[i].getAttribute('href'));
		});
	}
}
