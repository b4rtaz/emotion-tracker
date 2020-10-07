import { Detection, Detector } from './detector';
import { MyEvent } from './my-event';

export class Preview {

	private container: HTMLElement;
	private video: HTMLVideoElement;
	private overlay: HTMLCanvasElement;
	private overlayContext: CanvasRenderingContext2D;
	private streamWidth: number;
	private streamHeight: number;
	private scale: number;
	private error: HTMLElement;

	public readonly onPreviewReady = new MyEvent<void>();

	public constructor(
		private readonly detector: Detector) {
	}

	public init() {
		this.video = <HTMLVideoElement>document.getElementById('preview-video');
		this.video.addEventListener('loadedmetadata', () => this.onPreviewLoaded());
		this.container = this.video.parentElement;
		this.overlay = <HTMLCanvasElement>document.getElementById('preview-overlay');
		this.overlayContext = this.overlay.getContext('2d');
		this.error = <HTMLElement>document.getElementById('preview-error');

		try {
			navigator.mediaDevices.getUserMedia({ video: true }).then(
				s => this.onSuccess(s),
				e => this.onError(e)
			);
		} catch (e) {
			console.error(e);
			this.showError('Your browser doesn\'t support camera preview.');
		}

		window.addEventListener('resize', () => this.onResize());

		this.detector.onDetected.listen(d => this.onDetectorDetected(d));
		this.detector.onStopped.listen(() => this.onDetectorStopped());
	}

	private onSuccess(stream: MediaStream) {
		const settings = stream.getTracks()[0].getSettings();
		this.streamWidth = settings.width;
		this.streamHeight = settings.height;

		this.video.srcObject = stream;
		this.reloadSize();
	}

	private onResize() {
		if (this.streamWidth && this.streamHeight) {
			this.reloadSize();
		}
	}

	private reloadSize() {
		const maxWidth = this.container.clientWidth;
		const maxHeight = this.container.clientHeight;
		let width = this.streamWidth;
		let height = this.streamHeight;

		this.scale = Math.max(width / maxWidth, height / maxHeight);
		width /= this.scale;
		height /= this.scale;
		const left = (maxWidth - width) / 2;
		const top = (maxHeight - height) / 2;

		this.overlay.width = width;
		this.overlay.height = height;
		this.overlay.style.top = top + 'px';
		this.overlay.style.left = left + 'px';

		this.video.width = width;
		this.video.height = height;
		this.video.style.top = top + 'px';
		this.video.style.left = left + 'px';
	}

	private onError(error: any) {
		console.error(error);
		this.showError('Cannot get access to the camera. Check permissions and restart this app.');
	}

	private showError(message: string) {
		this.video.style.display = 'none';
		this.error.style.display = 'block';
		this.error.innerText = message;
	}

	private onPreviewLoaded() {
		this.onPreviewReady.fire();
	}

	private onDetectorDetected(d?: Detection) {
		this.clearOverlay();
		if (d) {
			this.overlayContext.beginPath();
			this.overlayContext.lineWidth = 6;
			this.overlayContext.strokeStyle = '#04DED3';
			this.overlayContext.rect(
				d.face.x / this.scale,
				d.face.y / this.scale,
				d.face.width / this.scale,
				d.face.height / this.scale);
			this.overlayContext.stroke();
		}
	}

	private onDetectorStopped() {
		this.clearOverlay();
	}

	private clearOverlay() {
		this.overlayContext.clearRect(0, 0, this.overlay.width, this.overlay.height);
	}

	public getVideo(): HTMLVideoElement {
		return this.video;
	}
}
