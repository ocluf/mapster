<script lang="ts">
	import type { State } from '$lib/types';
	import type { Map } from 'leaflet';
	import { leafletLayer } from 'protomaps-leaflet';
	import { onMount, onDestroy } from 'svelte';

	// reactive variables
	let mapElement: string | HTMLElement;
	let map: Map;
	let mousepoints: any[] = [];
	let zoomlevel = 0;

	let leaflet: any;
	let realMousePosition = { x: 0, y: 0 };
	let mapMousePosition = { x: 0, y: 0 };
	let latLng = { lat: 0, lng: 0 };
	let showContextMenu = true;
	let emote = { emote: '👋', timestamp: null };
	let ws: WebSocket;
	let intervalId: string | number | NodeJS.Timeout | undefined;
	let currentState: State = {
		mouseInfo: []
	};

	//derived
	$: zoomLevelVariant = zoomlevel <= 9 ? 'world' : zoomlevel <= 15 ? 'city' : 'street';

	$: mousepoints = currentState.mouseInfo.map((mouseInfo) => {
		if (leaflet) {
			let latl = leaflet.latLng(mouseInfo.position.latLng.lat, mouseInfo.position.latLng.lng);
			return {
				point: map.latLngToContainerPoint(latl),
				zoomRatio: (zoomlevel + 1) / (mouseInfo.position.zoomlevel + 1),
				color: uuidToColor(mouseInfo.client)
			};
		}
	});

	function moveCursor(e) {
		realMousePosition = { x: e.clientX, y: e.clientY };
		if (!showContextMenu) {
			mapMousePosition = { x: e.clientX, y: e.clientY };
		}
	}

	function handleContextMenu(e) {
		showContextMenu = true;
		map.dragging.disable();
	}

	function hideMenu() {
		showContextMenu = false;
		map.dragging.enable();
	}

	function handleKeyDown(e) {
		if (e.key === 'Escape') {
			hideMenu();
		}
	}

	const neonColors = [
		'#39FF14', // Neon Green
		'#CFFF04', // Neon Yellow
		'#4D4DFF', // Neon Blue
		'#FF6EC7', // Neon Pink
		'#944dff', // Neon Purple
		'#FFA500', // Neon Orange
		'#FF2500', // Neon Red
		'#00FFFF', // Neon Cyan
		'#FF00FF', // Neon Magenta
		'#AAFF00' // Neon Lime
	];

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

	onMount(async () => {
		leaflet = await import('leaflet');
		document.addEventListener('mousemove', moveCursor);

		map = leaflet.map(mapElement, {
			maxBoundsViscosity: 1.0,
			maxZoom: 7
		});
		map.setView([51.505, -0.09], 2);

		leaflet
			.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			})
			.addTo(map);

		// leaflet
		// 	.marker([51.5, -0.09])
		// 	.addTo(map)
		// 	.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
		// 	.openPopup();

		map.on('mousemove', function (event) {
			latLng = { lat: event.latlng.lat, lng: event.latlng.lng };
		});
		map.addEventListener('contextmenu', handleContextMenu);
		map.addEventListener('mousedown', hideMenu);
		document.addEventListener('keydown', handleKeyDown);

		ws = new WebSocket('ws://localhost:8081');
		ws.onopen = function () {
			ws.onmessage = function (event) {
				try {
					const newState = JSON.parse(event.data);
					newState.mouseInfo = newState.mouseInfo.filter(
						(mouseInfo: { client: string }) => mouseInfo.client !== newState.client
					);
					currentState = newState;
				} catch (error) {
					console.log(error);
				}
			};

			intervalId = setInterval(() => {
				zoomlevel = map.getZoom();
				let mouseInfo = {
					latLng,
					zoomlevel: zoomlevel
				};
				ws.send(JSON.stringify(mouseInfo));
			}, 16);
		};
	});

	onDestroy(async () => {
		document.removeEventListener('mousemove', moveCursor);
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
			map.removeEventListener('contextmenu', handleContextMenu);
			map.removeEventListener('click', hideMenu);
		}
		if (ws) {
			console.log('Closing WebSocket.');
			ws.close();
		}
		if (intervalId) {
			console.log('Clearing interval.');
			clearInterval(intervalId);
		}
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<main on:click={hideMenu}>
	<div
		class:pointer-events-none={showContextMenu}
		class="h-[100vh] cursor-none z-0"
		bind:this={mapElement}
	/>
</main>
<svg
	fill="#000000"
	style="top: {realMousePosition.y}px; left: {realMousePosition.x}px;"
	viewBox="0 0 24 24"
	id="custom-cursor"
	class="absolute z-[998] pointer-events-none w-4 h-4"
	data-name="Flat Color"
	xmlns="http://www.w3.org/2000/svg"
>
	<g id="SVGsdRepo_bgCarrier" stroke-width="0" /><g
		id="SVGResdpo_tracerCarrier"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<g id="SVGRepsdo_iconCarrier"
		><path
			id="primasdry"
			d="M20.8,9.4,4.87,2.18A2,2,0,0,0,2.18,4.87h0L9.4,20.8A2,2,0,0,0,11.27,22h.25a2.26,2.26,0,0,0,2-1.8l1.13-5.58,5.58-1.13a2.26,2.26,0,0,0,1.8-2A2,2,0,0,0,20.8,9.4Z"
			style="fill: #000000;"
		/></g
	></svg
>
<div class="text-[#39FF14]" />
{#each mousepoints as point}
	<svg
		fill="#000000"
		viewBox="0 0 24 24"
		id="cursor-up-left"
		class="absolute z-[1000] pointer-events-none"
		style="left: {point.point.x}px; top: {point.point.y}px; width: {Math.max(
			point.zoomRatio * 16,
			6
		) + 'px'}; height: {Math.max(point.zoomRatio * 16, 6) + 'px'}; opacity:{(1 / point.zoomRatio) **
			2};"
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
{/each}
<div
	class="fixed right-4 top-4 grid gap-2 rounded-xl bg-gray-100 text-gray-900 border border-gray-900 p-4 z-[999] font-bold"
>
	<button
		class:bg-blue-300={zoomLevelVariant == 'world'}
		class:text-gray-100={zoomLevelVariant == 'world'}
		class="p-2 text-left rounded-lg cursor-pointer"
		on:click={() => map.setZoom(2)}
	>
		🌎 World
	</button>
	<button
		class:bg-blue-300={zoomLevelVariant == 'city'}
		class:text-gray-100={zoomLevelVariant == 'city'}
		on:click={() => map.setZoom(12)}
		class="p-2 text-left rounded-lg"
	>
		🏙️ City
	</button>
	<button
		class:bg-blue-300={zoomLevelVariant == 'street'}
		class:text-gray-100={zoomLevelVariant == 'street'}
		class="p-2 text-left rounded-lg"
		on:click={() => map.setZoom(18)}
	>
		🏠 Street
	</button>

	<div class="text-blue-700" />
</div>
{#if showContextMenu}
	<div
		style="left: {mapMousePosition.x}px; top: {mapMousePosition.y}px;"
		class="fixed z-[10] p-4 bg-gray-100 text-gray-800 rounded shadow-lg"
	>
		<div>👋 wave</div>
		{#if zoomLevelVariant == 'world'}
			<div>🌎 set world level pin</div>
		{/if}
		{#if zoomLevelVariant == 'city'}
			<div>🏙️ set city level pin</div>
		{/if}
		{#if zoomLevelVariant == 'street'}
			<div>🏠 set street level pin</div>
		{/if}
	</div>
{/if}
<div class="fixed z-[10000] bg-white top-24 right-10">
	zoomlevel: {zoomlevel}
</div>

<style>
	@import 'leaflet/dist/leaflet.css';
</style>
