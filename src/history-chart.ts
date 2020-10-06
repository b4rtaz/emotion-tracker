import 'chartjs-plugin-streaming';

import { Chart, ChartPoint } from 'chart.js';

import { getGradient } from './chart-utils';
import { Detection, Detector } from './detector';
import { EMOTIONS } from './model';

const DURATION_MS = 6000;

export class HistoryChart {

	private container: HTMLElement;
	private chartElement: HTMLCanvasElement;
	private chartCanvas: CanvasRenderingContext2D;
	private chart: Chart;

	public constructor(
		private readonly detector: Detector) {
	}

	public init() {
		this.chartElement = <HTMLCanvasElement>document.getElementById('history-chart');
		this.chartCanvas = this.chartElement.getContext('2d');
		this.container = this.chartElement.parentElement;

		this.detector.onDetected.listen(d => this.onDetectorDetected(d));

		window.addEventListener('resize', () => this.onResize());
		this.install();
	}

	private install() {
		this.chartElement.width = this.container.clientWidth;
		this.chartElement.height = this.container.clientHeight;

		this.chart = new Chart(this.chartElement, {
			type: 'line',
			data: {
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
				elements: {
					line: {
						tension: 0 // disables bezier curves
					}
				},
				scales: {
					xAxes: [<any>{
						type: 'realtime',
						display: false,
						realtime: {
							duration: DURATION_MS,
							ttl: DURATION_MS * 1.25
						}
					}],
					yAxes: [{
							ticks: {
								min: 0,
								max: EMOTIONS.length + 1,
								callback: function (value: number) {
									return (value === 0) ? '' : EMOTIONS[value - 1];
								}
							}
						}
					]
				},
				plugins: {
					streaming: {
						frameRate: 30
					}
				}
			}
		});
	}

	private onDetectorDetected(d: Detection) {
		if (d) {
			this.add(d.emotionIndex);
		}
	}

	private onResize() {
		if (this.chart) {
			this.chart.destroy();
			this.install();
		}
	}

	private add(emotionIndex: number) {
		const p: ChartPoint = {
			x: new Date(),
			y: emotionIndex + 1
		};
		this.chart.data.datasets[0].data.push(p as any);
		this.chart.update({ duration: 0 });
	}
}
