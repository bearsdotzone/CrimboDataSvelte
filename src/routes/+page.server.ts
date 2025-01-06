import type { PageLoad } from './$types';

import path from 'node:path';

console.log('Happy developing ✨');

import { readFileSync } from 'fs';
import { opendir } from 'node:fs/promises';
import type { DropData } from '$lib/MyTypes';

import dotenv from 'dotenv';

dotenv.config();

const username = process.env.USERNAME ?? 'bearsdotzone';

const moaiData: DropData = {
	color: 'rgb(50,50,50)',
	dayCounts: [],
	dropCounts: [],
	mobName: 'moai',
	rareName: 'moaiball',
	total: 0
};
const potatoData: DropData = {
	color: 'rgb(0,255,0)',
	dayCounts: [],
	dropCounts: [],
	mobName: 'giant potato',
	rareName: 'potato jacket',
	total: 0
};
const sectionData: DropData = {
	color: 'rgb(255,0,0)',
	dayCounts: [],
	dropCounts: [],
	mobName: 'Section 11',
	rareName: 'Congressional Medal of Insanity',
	total: 0
};
const wraithData: DropData = {
	color: 'rgb(255,165,0)',
	dayCounts: [],
	dropCounts: [],
	mobName: 'pumpkin spice wraith',
	rareName: 'pumpkin spice whorl',
	total: 0
};
const snowmanData: DropData = {
	color: 'rgb(200,200,200)',
	dayCounts: [],
	dropCounts: [],
	mobName: 'magically-animated snowman',
	rareName: 'snowman-enchanting tophat',
	total: 0
};

const moai = new RegExp(
	`(Encounter: moai\\r?\\n((?!Encounter).)*?${username} wins the fight)|(You acquire an item: ${moaiData.rareName})`,
	'gs'
);
const giantPotato = new RegExp(
	`(Encounter: giant potato\r?\n((?!Encounter).)*?${username} wins the fight)|(You acquire an item: ${potatoData.rareName})`,
	'gs'
);
const section11 = new RegExp(
	`(Encounter: Section 11\r?\n((?!Encounter).)*?${username} wins the fight)|(You acquire an item: ${sectionData.rareName})`,
	'gs'
);
const pumpkinSpiceWraith = new RegExp(
	`(Encounter: pumpkin spice wraith\r?\n((?!Encounter).)*?${username} wins the fight)|(You acquire an item: ${wraithData.rareName})`,
	'gs'
);
const magicallyAnimatedSnowman = new RegExp(
	`(Encounter: magically-animated snowman\r?\n((?!Encounter).)*?${username} wins the fight)|(You acquire an item: ${snowmanData.rareName})`,
	'gs'
);

const regexes = [
	[moai, moaiData],
	[giantPotato, potatoData],
	[section11, sectionData],
	[pumpkinSpiceWraith, wraithData],
	[magicallyAnimatedSnowman, snowmanData]
];

try {
	if (!process.env.SESSIONPATH) {
		console.error('Invalid path!');
		process.exit(1);
	}
	const dir = await opendir(process.env.SESSIONPATH);
	for await (const dirent of dir) {
		const dateNumber = parseInt((dirent.name.match(/\d+/) ?? '19690101').toString());

		if (dirent.name.startsWith(username) && dateNumber >= 20241215 && dateNumber <= 20250105) {
			const dateSubstring = (dirent.name.match(/\d+/) ?? ['19670101'])[0];
			const formattedDate = `${dateSubstring.substring(0, 4)}-${dateSubstring.substring(4, 6)}-${dateSubstring.substring(6)}`;

			for (const i of regexes) {
				const regex = <RegExp>i[0];
				const dropData = <DropData>i[1];

				const dayDrops: { date: string; drop: number }[] = [];

				const fileContents = readFileSync(path.join(dirent.parentPath, dirent.name));
				const moaiKills = fileContents
					.toString()
					.matchAll(<RegExp>regex)
					.reduce((x, y, z) => {
						if (y.toString().includes(`You acquire an item: ${dropData.rareName}`)) {
							dayDrops.push({ date: formattedDate, drop: x + dropData.total });
							return x;
						} else return x + 1;
					}, 0);

				if (moaiKills || true) {
					if (dayDrops.length > 0) dropData.dropCounts.push(...dayDrops);
					dropData.dayCounts.push({ date: formattedDate, count: moaiKills });
					dropData.total += moaiKills;
				}
			}
		}
	}
} catch (err) {
	console.error(err);
}

export const load: PageLoad = async ({ fetch, params }) => {
	return { regexes: regexes };
};
