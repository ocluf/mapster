<script lang="ts">
	import type { ClientsInfo } from '$lib/types';
	import { latLngToContainerPoint } from '$lib/utils';

	export let currentClientsInfo: ClientsInfo;
	export let zoomlevel: number;
	export let map: import('maplibre-gl').Map;

	$: mousepoints = currentClientsInfo.map((clientInfo) => {
		let point = latLngToContainerPoint(map, clientInfo.lnglat);
		return {
			point: point,
			zoomlevel: clientInfo.zoomlevel,
			color: uuidToColor(clientInfo.clientId),
			mobile: clientInfo.mobile
		};
	});

	const neonColors = [
		'#4D4DFF', // Neon Blue
		'#FF6EC7', // Neon Pink
		'#944dff', // Neon Purple
		'#FF2500', // Neon Red
		'#FFA500', // Neon Orange
		'#FF00FF' // Neon Magenta
	];

	function calculateCursorSize(ownZoomLevel: number, otherZoomLevel: number) {
		// negative I am bigger
		const baseSize = 16;
		const diff = ownZoomLevel - otherZoomLevel;
		let size;
		if (diff < 0) {
			size = Math.max(baseSize - Math.round(diff ** 2), 8);
		} else {
			size = Math.max(baseSize + Math.round(diff ** 4), 6);
		}

		return size;
	}

	function calculateOpacity(ownZoomLevel: number, otherZoomLevel: number) {
		// if there zoom level is smaller they are bigger
		const diff = ownZoomLevel - otherZoomLevel;
		if (diff > 0) {
			return 80 - (diff + 2) ** 2;
		} else {
			return 90;
		}
	}

	function uuidToColor(uuid: string) {
		// Convert UUID string to a number using a simple hash
		let hash = 0;
		for (let i = 0; i < uuid.length; i++) {
			hash = hash * 31 + uuid.charCodeAt(i); // Using a prime number like 31 ensures better distribution
		}
		// Ensure non-negative hash value
		hash = Math.abs(hash);
		// Convert the hash into an index for the color array
		const colorIndex = hash % neonColors.length;

		return neonColors[colorIndex];
	}

	console.log(mousepoints);
</script>

<div class="fixed z-[99] bg-white text-black top-0 left-0">
	{JSON.stringify(mousepoints)}
	{zoomlevel}
</div>
{#each mousepoints as point}
	{#if point.mobile}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="fixed z-[1000] -translate-x-1/2 -translate-y-1/2 text-black pointer-events-none"
			style="left: {point.point.x}px; top: {point.point.y}px; width: {calculateCursorSize(
				zoomlevel,
				point.zoomlevel
			) + 'px'}; height: {calculateCursorSize(zoomlevel, point.zoomlevel) +
				'px'}; opacity:{calculateOpacity(zoomlevel, point.zoomlevel)}%;"
		>
			<path
				style="fill: {point.color}; opacity:{calculateOpacity(zoomlevel, point.zoomlevel)}%;"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
			/>
		</svg>
	{:else}
		<svg
			fill="#000000"
			viewBox="0 0 24 24"
			id="cursor-up-left"
			class="absolute z-[1000] pointer-events-none"
			style="left: {point.point.x}px; top: {point.point.y}px; width: {calculateCursorSize(
				zoomlevel,
				point.zoomlevel
			) + 'px'}; height: {calculateCursorSize(zoomlevel, point.zoomlevel) +
				'px'}; opacity:{calculateOpacity(zoomlevel, point.zoomlevel)}%;"
			data-name="Flat Color"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0" /><g
				id="SVGRepo_tracerCarrier"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<g id="SVGRepo_iconCarrier"
				><path
					id="primary"
					d="M20.8,9.4,4.87,2.18A2,2,0,0,0,2.18,4.87h0L9.4,20.8A2,2,0,0,0,11.27,22h.25a2.26,2.26,0,0,0,2-1.8l1.13-5.58,5.58-1.13a2.26,2.26,0,0,0,1.8-2A2,2,0,0,0,20.8,9.4Z"
					style="fill: {point.color};"
				/></g
			></svg
		>
	{/if}
{/each}
