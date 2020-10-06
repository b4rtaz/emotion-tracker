import { Detector } from './detector';
import { DistributionChart } from './distribution-chart';
import { bindExternalAnchors, isElectron } from './electron-utils';
import { HistoryChart } from './history-chart';
import { Notificator } from './notificator';
import { Preview } from './preview';
import { Settings } from './settings';

window.addEventListener('load', async () => {
	const detector = new Detector();
	const historyChart = new HistoryChart(detector);
	const distributionChart = new DistributionChart(detector);
	const preview = new Preview(detector);
	const notificator = new Notificator(detector);
	const settings = new Settings(preview, detector, notificator);

	preview.init();
	detector.init(preview.getVideo());
	historyChart.init();
	distributionChart.init();
	settings.init();
	notificator.init();

	if (isElectron()) {
		bindExternalAnchors();
	}
});
