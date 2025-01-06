<script lang="ts">
	import type { PageData } from './$types';
	import type { DropData } from '$lib/MyTypes';
	import { Chart } from 'chart.js/auto';
	import { onMount } from 'svelte';
	import annotationPlugin from 'chartjs-plugin-annotation';

	let { data }: { data: PageData } = $props();
	Chart.register(annotationPlugin);

	onMount(() => {
		for (const i of data.regexes) {
			const dropData: DropData = i[1] as DropData;

			const xValues = dropData.dayCounts.map((x) => x.date);
			const yValues = dropData.dayCounts.map((x) => x.count);

			new Chart(dropData.rareName, {
				type: 'bar',
				data: {
					labels: xValues,
					datasets: [{
						label: `Daily ${dropData.mobName} fought`,
						backgroundColor: dropData.color,
						data: yValues
					}]
				}
			});

			const newXValues = dropData.dayCounts.map((x) => x.date);
			const newYValues: number[] = [];
			for (let k = 0; k < newXValues.length; k++) {
				newYValues.push((newYValues.at(-1) ?? 0) + dropData.dayCounts[k].count);
			}

			const linesToAdd: {
				[key: string]: object
			} = {};

			dropData.dropCounts.forEach((i, j) => {
				linesToAdd[i.date] = {
					scaleID: 'x',
					type: 'line',
					label: {
						content: `Rare after ${i.drop} kills`,
						display: true,
						yAdjust: 30 * j
					},
					value: i.date
				};
			});

			new Chart(dropData.rareName + '2nd', {
				type: 'line',
				data: {
					labels: newXValues,
					datasets: [{
						fill: false,
						pointRadius: 1,
						label: `Total number of ${dropData.mobName} fought`,
						borderColor: dropData.color,
						data: newYValues
					}]
				},
				options: {
					plugins: {
						annotation: {
							annotations: linesToAdd
						}
					}
				}
			});
		}

		const dayTotals = new Map();

		data.regexes.flatMap((x) => (<DropData>x[1]).dayCounts).forEach((x) => dayTotals.set(x.date, (dayTotals.get(x.date) ?? 0) + x.count));

		const xValues = dayTotals.keys().toArray();
		const yValues = dayTotals.values().toArray();

		const sumValues: number[] = [];
		yValues.forEach(yValue => sumValues.push(yValue + (sumValues.at(-1) ?? 0)));

		const rareDrops: string[] = [];

		data.regexes.flatMap((x) => (<DropData>x[1]).dropCounts).forEach((x) => rareDrops.push(x.date));

		const linesToAdd: {
			[key: string]: object
		} = {};

		for (const i of rareDrops) {
			linesToAdd[i] = {
				scaleID: 'x',
				type: 'line',
				value: i
			};
		}

		new Chart('dailyTotal', {
			type: 'bar',
			data: {
				labels: xValues,
				datasets: [{
					label: `Daily rare fights`,
					backgroundColor: 'rgb(0,0,255)',
					data: yValues
				}]
			}
		});

		new Chart('dailySum', {
			type: 'line',
			data: {
				labels: xValues,
				datasets: [{
					fill: false,
					pointRadius: 1,
					label: `Total number of rares fought`,
					borderColor: 'rgb(0,0,255)',
					data: sumValues
				}]
			},
			options: {
				plugins: {
					annotation: {
						annotations: linesToAdd
					}
				}
			}
		});
	});

</script>
{#each data.regexes as regex}
	<div style="width: 25vw; height: fit-content;">
		<canvas id={regex[1].rareName}></canvas>
	</div>

	<div style="width: 25vw; height: fit-content;">
		<canvas id={regex[1].rareName + "2nd"}></canvas>
	</div>
{/each}
<div style="width: 25vw; height: fit-content;">
	<canvas id="dailyTotal"></canvas>
</div>
<div style="width: 25vw; height: fit-content;">
	<canvas id="dailySum"></canvas>
</div>
<style>

</style>
