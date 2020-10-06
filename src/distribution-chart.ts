import { Chart, ChartPoint } from 'chart.js';

import { getGradient } from './chart-utils';
import { Detection, Detector } from './detector';
import { EMOTIONS } from './model';

export class DistributionChart {

	private container: HTMLElement;
	private chartElement: HTMLCanvasElement;
	private chartCanvas: CanvasRenderingContext2D;
	private chart: Chart;
	private time: HTMLElement;

	private readonly data: { [emotionIndex: number]: number } = {};
	private total = 0;
	private startTime: number;

	public constructor(
		private readonly detector: Detector) {
	}

	public init() {
		this.chartElement = <HTMLCanvasElement>document.getElementById('distribution-chart');
		this.chartCanvas = this.chartElement.getContext('2d');
		this.container = this.chartElement.parentElement;
		this.time = <HTMLCanvasElement>document.getElementById('distribution-time');

		this.detector.onStarted.listen(() => this.onDetectorStarted());
		this.detector.onDetected.listen(d => this.onDetectorDetected(d));

		window.addEventListener('resize', () => this.onResize());
		this.install();
	}

	private install() {
		this.chartElement.width = this.container.clientWidth;
		this.chartElement.height = this.container.clientHeight;

		this.chart = new Chart(this.chartElement, {
			type: 'bar',
			data: {
				labels: EMOTIONS,
				datasets: [{
					label: 'x',
					data: [],
					backgroundColor: getGradient(this.chartCanvas),
					borderWidth: 0,
					pointBorderColor: '#04DED3'
				}]
			},
			options: {
				responsive: false,
				legend: {
					display: false
				},
				animation: {
					duration: 0
				},
				tooltips: {
					enabled: false
				},
				scales: {
					yAxes: [{
							ticks: {
								min: 0,
								max: 1
							}
						}
					]
				}
			}
		});
	}

	private onResize() {
		if (this.chart) {
			this.chart.destroy();
			this.install();
		}
	}

	private onDetectorStarted() {
		EMOTIONS.forEach((e, index) => {
			this.data[index] = 0;
		});
		this.total = 0;
		this.startTime = null;
	}

	private onDetectorDetected(d: Detection) {
		if (d) {
			if (this.startTime === null) {
				this.startTime = Date.now();
			}
			const seconds = Math.floor((Date.now() - this.startTime) / 1000);

			this.data[d.emotionIndex]++;
			this.total++;

			this.chart.data.datasets[0].data = EMOTIONS.map((e, index) => {
				return <ChartPoint>{
					x: index,
					y: this.data[index] / this.total
				};
			});
			this.chart.update();

			this.time.innerText = `${seconds} seconds`;
		}
	}
}
