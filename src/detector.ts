import { detectSingleFace, loadFaceDetectionModel, loadFaceExpressionModel, SsdMobilenetv1Options } from 'face-api.js';

import { EMOTIONS } from './model';
import { MyEvent } from './my-event';

export class Detector {

	public readonly onDetectorReady = new MyEvent<void>();
	public readonly onStarted = new MyEvent<void>();
	public readonly onDetected = new MyEvent<Detection>();
	public readonly onStopped = new MyEvent<void>();

	private video: HTMLVideoElement;
	private delay = 0;
	private lastLoopIndex = 0;

	public init(video: HTMLVideoElement) {
		this.video = video;
		this.load();
	}

	private async load() {
		await loadFaceDetectionModel('./models/');
		await loadFaceExpressionModel('./models/');
		this.onDetectorReady.fire();
	}

	public setDelay(delay: number) {
		this.delay = delay;
	}

	public start() {
		const loopIndex = ++this.lastLoopIndex;
		this.onStarted.fire();
		this.detect(loopIndex);
	}

	public stop() {
		this.lastLoopIndex++;
	}

	private async detect(loopIndex: number) {
		const start = Date.now();

		const result = await detectSingleFace(this.video, new SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceExpressions();

		const time = Date.now() - start;

		const isEnabled = (this.lastLoopIndex === loopIndex);
		if (isEnabled) {
			if (result) {
				const bestMatch = result.expressions.asSortedArray()[0];
				const index = EMOTIONS.indexOf(bestMatch.expression);

				this.onDetected.fire({
					face: result.detection.box,
					emotionIndex: index
				});
			} else {
				this.onDetected.fire(null);
			}

			setTimeout(() => this.detect(loopIndex), this.delay);
		} else {
			this.onStopped.fire();
		}
	}
}

export interface Detection {
	face: FaceBox;
	emotionIndex: number;
}

export interface FaceBox {
	x: number;
	y: number;
	width: number;
	height: number;
}
