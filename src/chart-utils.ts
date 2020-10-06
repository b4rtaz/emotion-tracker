
export function getGradient(canvas: CanvasRenderingContext2D): CanvasGradient {
	const gradient = canvas.createLinearGradient(0, 0, 0, 400);
	gradient.addColorStop(0, 'rgba(4, 222, 211, 1)');
	gradient.addColorStop(1, 'rgba(0, 168, 230, 0.5)');
	return gradient;
}
