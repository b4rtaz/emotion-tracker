import { Detection, Detector } from './detector';
import { isElectron } from './electron-utils';
import { EMOTIONS } from './model';
import { MyEvent } from './my-event';

export class Notificator {

	public readonly onPermissionChanged = new MyEvent<void>();

	private items: MoodItem[] = [];

	private level: string;
	private duration: number;
	private activation: number;
	private message: string;

	public constructor(
		private readonly detector: Detector) {
	}

	public init() {
		if (this.isSupported()) {
			this.detector.onDetected.listen(d => this.onDetectorDetected(d));
			this.showNotification('Hello!');
		}
	}

	public isSupported() {
		return isElectron();
	}

	public setConfig(level: string, duration: number, activation: number, message: string) {
		this.level = level;
		this.duration = duration;
		this.activation = activation;
		this.message = message;
	}

	private onDetectorDetected(d: Detection) {
		if (d) {
			this.add(d.emotionIndex);
		}
	}

	private add(emotionIndex: number) {
		const now = (new Date()).getTime();

		this.items.push({
			time: now,
			emotionIndex
		});
		this.items = this.items.filter(i => i.time > now - this.duration);
		this.check(now);
	}

	private check(now: number) {
		const minEmotionIndex = EMOTIONS.indexOf(this.level);
		const count = this.items.filter(i => i.emotionIndex < minEmotionIndex).length;
		const percent = count / this.items.length;

		if (percent > this.activation && this.items.findIndex(i => i.time < now - this.duration * 0.75) >= 0) {
			this.items.length = 0;
			this.showNotification(this.message);
		}
	}

	private showNotification(message: string) {
		const notifier = window.require('node-notifier');
		notifier.notify({
			title: 'Mood Tracker AI',
			message: message,
			timeout: 3
		});
	}
}

interface MoodItem {
	time: number;
	emotionIndex: number;
}
