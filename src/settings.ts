import { Detection, Detector } from './detector';
import { EMOTIONS } from './model';
import { Notificator } from './notificator';
import { Preview } from './preview';

export class Settings {

	private startButton: HTMLElement;
	private currentEmotion: HTMLElement;

	private detectionDelay: HTMLSelectElement;

	private notificationWarning: HTMLElement;
	private notificationLevel: HTMLSelectElement;
	private notificationDuration: HTMLSelectElement;
	private notificationActivation: HTMLSelectElement;
	private notificationMessage: HTMLInputElement;

	private _subPartReadyCount = 0;

	private _isDetecting = false;

	public constructor(
		private readonly preview: Preview,
		private readonly detector: Detector,
		private readonly notificator: Notificator) {
	}

	public init() {
		this.startButton = document.getElementById('start-button');
		this.startButton.setAttribute('disabled', '');
		this.detectionDelay = <HTMLSelectElement>document.getElementById('detection-delay');
		this.detectionDelay.addEventListener('change', () => this.reloadDetectorSettings());
		this.currentEmotion = document.getElementById('current-emotion');

		this.notificator.onPermissionChanged.listen(() => this.reloadNotificationPermission());
		this.notificationWarning = document.getElementById('notification-warning');
		this.notificationLevel = <HTMLSelectElement>document.getElementById('notification-level');
		this.notificationLevel.addEventListener('change', () => this.reloadNotificationSettings());
		this.notificationDuration = <HTMLSelectElement>document.getElementById('notification-duration');
		this.notificationDuration.addEventListener('change', () => this.reloadNotificationSettings());
		this.notificationActivation = <HTMLSelectElement>document.getElementById('notification-activation');
		this.notificationActivation.addEventListener('change', () => this.reloadNotificationSettings());
		this.notificationMessage = <HTMLInputElement>document.getElementById('notification-message');
		this.notificationMessage.addEventListener('change', () => this.reloadNotificationSettings());

		this.preview.onPreviewReady.listen(() => this.onSubpartReady());
		this.detector.onDetectorReady.listen(() => this.onSubpartReady());
		this.detector.onDetected.listen(d => this.onDetectorDetected(d));

		this.reloadNotificationPermission();
		this.reloadDetectorSettings();
		this.reloadNotificationSettings();
	}

	private onSubpartReady() {
		this._subPartReadyCount++;
		if (this._subPartReadyCount === 2) {
			this.startButton.removeAttribute('disabled');
			this.startButton.innerText = 'Start';
			this.startButton.addEventListener('click', () => this.onStartButtonClicked());
		}
	}

	private onStartButtonClicked() {
		if (this._isDetecting) {
			this.detector.stop();
			this.startButton.innerText = 'Start';
		} else {
			this.detector.start();
			this.startButton.innerText = 'Stop';
		}
		this._isDetecting = !this._isDetecting;
	}

	private onDetectorDetected(d?: Detection) {
		this.currentEmotion.innerHTML = d
			? EMOTIONS[d.emotionIndex]
			: '&mdash;';
	}

	private reloadDetectorSettings() {
		const delay = parseInt(this.detectionDelay.value, 10);
		this.detector.setDelay(delay);
	}

	private reloadNotificationPermission() {
		if (!this.notificator.isSupported()) {
			this.notificationWarning.style.display = 'block';
		}
	}

	private reloadNotificationSettings() {
		const level = this.notificationLevel.value;
		const duration = parseInt(this.notificationDuration.value, 10);
		const activation = parseFloat(this.notificationActivation.value);
		const message = this.notificationMessage.value;
		this.notificator.setConfig(level, duration, activation, message);
	}
}
