<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibre, { LngLat } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import * as pmtiles from 'pmtiles';
	import layers from 'protomaps-themes-base';
	const protocol = new pmtiles.Protocol();
	maplibre.addProtocol('pmtiles', protocol.tile);

	type ClientsInfo = Array<{
		lnglat: { lng: number; lat: number };
		zoomlevel: number;
		clientId: string;
	}>;

	let map: import('maplibre-gl').Map;
	let mapContainer: HTMLDivElement;
	let ws: WebSocket;
	let clientId: string;
	let intervalId: string | number | NodeJS.Timeout | undefined;
	let currentClientsInfo: ClientsInfo = [];
	let currentMousePos = { x: 0, y: 0 };
	let zoomlevel = 0;

	$: mousepoints = currentClientsInfo.map((clientInfo) => {
		let point = latLngToContainerPoint(map, clientInfo.lnglat);
		return {
			point: point,
			zoomlevel: clientInfo.zoomlevel,
			color: uuidToColor(clientInfo.clientId)
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

	// equivalent of leaflet map.latLngToContainerPoint
	function latLngToContainerPoint(
		map: import('maplibre-gl').Map,
		latLng: { lat: number; lng: number }
	) {
		return map.project(latLng);
	}

	//function that gets mouse position on map
	function getMousePositionAsLnglat(
		map: import('maplibre-gl').Map,
		mousePosition: { x: number; y: number }
	) {
		const Lnglat: LngLat = map.unproject([mousePosition.x, mousePosition.y]);
		return Lnglat;
	}

	function initWebsockets() {
		ws = new WebSocket('wss://ws.mapster.club');
		ws.onopen = () => {
			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					//TODO make cleaner with messagetype
					if (data.clientId) {
						clientId = data.clientId;
					} else {
						if (clientId) {
							let newClientsInfo = data.filter((clientInfo) => clientInfo.clientId !== clientId);
							currentClientsInfo = newClientsInfo;
						}
					}
				} catch (error) {
					console.log(error);
				}
			};
			intervalId = setInterval(() => {
				zoomlevel = map.getZoom();
				let mouseInfo = {
					lnglat: getMousePositionAsLnglat(map, currentMousePos),
					zoomlevel: zoomlevel
				};
				ws.send(JSON.stringify(mouseInfo));
			}, 16);
		};
	}

	onMount(() => {
		map = new maplibre.Map({
			container: mapContainer,
			style: {
				version: 8,
				glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
				sources: {
					protomaps: {
						type: 'vector',
						url: 'pmtiles://https://d2mwjre38pvsaf.cloudfront.net/world.pmtiles' //'pmtiles://http://localhost:8080/world.pmtiles'
					}
				},
				layers: layers('protomaps', 'light')
			},

			center: [-122.4421507274264, 37.75171480770049], // starting position [lng, lat]
			zoom: 9.15, // starting zoom
			maxZoom: 15,
			minZoom: 2,

			hash: 'map'
		});

		// Add controls
		map.addControl(new maplibre.NavigationControl({}));
		map.addControl(new maplibre.ScaleControl({}));
		map.addControl(
			new maplibre.GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true
				},
				trackUserLocation: true
			})
		);
		initWebsockets();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
		if (intervalId) {
			clearInterval(intervalId);
		}
		if (ws) {
			ws.close();
		}
	});
</script>

<div
	class="map"
	id="map"
	on:mousemove={(event) => (currentMousePos = { x: event.clientX, y: event.clientY })}
	bind:this={mapContainer}
/>
{#each mousepoints as point}
	<svg
		fill="#000000"
		viewBox="0 0 24 24"
		id="cursor-up-left"
		class="absolute z-[1000] pointer-events-none"
		style="left: {point.point.x}px; top: {point.point.y}px; width: {calculateCursorSize(
			zoomlevel,
			point.zoomlevel
		) + 'px'}; height: {calculateCursorSize(zoomlevel, point.zoomlevel) + 'px'}; opacity:{(200 /
			calculateCursorSize(zoomlevel, point.zoomlevel)) **
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
<div class="fixed bg-white text-black top-0 right-0 z-[9999999]">
	{JSON.stringify(currentClientsInfo)}
	{'zoomlevel = ' + zoomlevel}
</div>

<!-- <script lang="ts">
	import type { Pin } from '$lib/types';

	const pin: Pin = {
		latlng: 'lat',
		title: 'lat',
		description: 'lat',
		ip_address_creator: 'lat',
		type: 'world'
	};
	function get() {
		fetch('/api/pins')
			.then((res) => res.json())
			.then((data) => console.log(data));
	}

	function post() {
		fetch('/api/pins', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(pin)
		})
			.then((res) => res.json())
			.then((data) => console.log(data));
	}
</script>

<button on:click={get} class="btn bg-primary-100 p-4">get </button>
<button on:click={post} class="btn bg-primary-100 p-4">submit </button> -->

<style>
	.map {
		position: relative;
		flex-grow: 1;
		width: 100%;
		height: 100vh;
	}
</style>
