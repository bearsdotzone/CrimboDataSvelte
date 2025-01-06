// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DropData } from '$lib/MyTypes';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageData {
			regexes: [[RegExp, DropData]];
		}

		// interface PageState {}
		// interface Platform {}
	}
}

export {};
