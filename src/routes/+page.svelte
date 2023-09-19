<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import maplibre, { LngLat } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import * as pmtiles from 'pmtiles';
	import layers from 'protomaps-themes-base';
	import { browser } from '$app/environment';
	import { createClient } from '@supabase/supabase-js';
	import emojiMartData from '@emoji-mart/data';
	import * as EmojiMart from 'emoji-mart';
	import type { ClientsInfo } from '$lib/types';
	import { getMousePositionAsLnglat, hasTouch } from '$lib/utils';
	import MouseDisplay from '$lib/components/MouseDisplay.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import type { PageData } from './$types';
	import Loading from '$lib/components/Loading.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	const protocol = new pmtiles.Protocol();
	maplibre.addProtocol('pmtiles', protocol.tile);
	const isDev = import.meta.env.MODE === 'development';
	const webSocketUrl = isDev ? 'ws://localhost:3000' : 'wss://ws.mapster.club';
	const mapUrl = isDev
		? 'http://localhost:8080/world.pmtiles'
		: 'https://map.mapster.club/world.pmtiles';
	let map: import('maplibre-gl').Map;
	let mapContainer: HTMLDivElement;
	let ws: WebSocket;
	let isMobile = browser && window.innerWidth < 800 && hasTouch();
	let clientId: string;
	let intervalId: string | number | NodeJS.Timeout | undefined;
	let currentClientsInfo: ClientsInfo = [];
	let currentMousePos = { x: 0, y: 0 };
	let zoomlevel = 0;
	let expanded = false;
	let lastPinFetch: null | string = null;
	let showContextMenu = false;
	let contextPos = { x: 0, y: 0 };
	let pins: any[] = [];
	let picker: any;
	let currentPinEmoji = '📌';
	let showPicker = false;

	// creating pin variables
	let creatingPin = false;
	let title = '';
	let post = '';
	let submittingPin = false;

	function handleContextMenu(e) {
		showContextMenu = true;
		contextPos = { x: e.clientX, y: e.clientY };
	}

	function hideMenu() {
		showContextMenu = false;
	}

	function setShowPicker(value: boolean) {
		showPicker = value;
	}

	function handleIncomingMessage(event: MessageEvent) {
		try {
			const message = JSON.parse(event.data);

			if (message.type === 'setClientId') {
				clientId = message.data;
			}
			if (message.type === 'updateClientInfo') {
				if (clientId) {
					let newClientsInfo = message.data.filter(
						(clientInfo) => clientInfo.clientId !== clientId
					);
					currentClientsInfo = newClientsInfo;
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	function setUpdateInterval() {
		intervalId = setInterval(() => {
			zoomlevel = map.getZoom();
			let clientInfo;
			if (isMobile) {
				clientInfo = {
					lnglat: getMousePositionAsLnglat(map, {
						x: window.innerWidth / 2,
						y: window.innerHeight / 2
					}),
					zoomlevel: zoomlevel,
					mobile: true
				};
			} else {
				clientInfo = {
					lnglat: getMousePositionAsLnglat(map, currentMousePos),
					zoomlevel: zoomlevel,
					mobile: false
				};
			}
			ws.send(
				JSON.stringify({
					type: 'updatePos',
					data: clientInfo
				})
			);
		}, 16);
	}

	function handleEmojiSelect(emoji) {
		currentPinEmoji = emoji.native;
		setShowPicker(false);
	}

	function initWebsockets() {
		ws = new WebSocket(webSocketUrl);
		ws.onopen = () => {
			ws.onmessage = handleIncomingMessage;
			setUpdateInterval();
		};
	}

	async function refreshPins() {
		let query = supabase.from('pins').select('*');
		if (lastPinFetch) {
			query = query.gte('created_at', lastPinFetch);
		}
		let newlastPinFetch = new Date().toISOString().toLocaleString();

		const { data, error } = await query;
		console.log(data);
		// add pins to map with custom marker based on emoji
		data?.forEach((pin) => {
			const marker = document.createElement('div');
			marker.className = 'marker';
			marker.innerText = pin.emoji;
			marker.addEventListener('click', () => {
				console.log(pin);
			});
			new maplibre.Marker({
				element: marker
			})
				.setLngLat([pin.lng, pin.lat])
				.addTo(map);
		});

		if (error) {
			console.log(error);
		} else {
			pins = [...data];
			lastPinFetch = newlastPinFetch;
		}
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
						url: `pmtiles://${mapUrl}`
					}
				},
				layers: layers('protomaps', 'light')
			},

			center: [-122.4421507274264, 37.75171480770049], // starting position [lng, lat]
			zoom: 1, // starting zoom
			minZoom: 1,
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
		map.dragRotate.disable();
		refreshPins();
		initWebsockets();
		picker.append(
			new EmojiMart.Picker({
				data: emojiMartData,
				onEmojiSelect: handleEmojiSelect,
				onClickOutside: () => setShowPicker(false)
			})
		);
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

	function openPinMenu() {
		creatingPin = true;
	}

	function cancelCreatePin(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		creatingPin = false;
		showContextMenu = false;
	}

	async function createPin(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		submittingPin = true;
		let latLng = map.unproject([contextPos.x, contextPos.y]);
		try {
			await supabase.from('pins').insert([
				{
					title: title,
					description: post,
					emoji: currentPinEmoji,
					lat: latLng.lat,
					lng: latLng.lng
				}
			]);
			refreshPins();
		} catch (error) {
			console.log(error);
		}
		submittingPin = false;
	}
</script>

{#if session}
	<div class="fixed z-50 top-10 right-10 bg-black w-10 h-10 text-white">Logged In!</div>
{/if}
<Menu {supabase} />
{#if showContextMenu}
	{#if creatingPin}
		<div
			style="top: {contextPos.y}px; left: {contextPos.x}px;"
			class="w-6 h-6 fixed z-[99] -translate-y-1/2 -translate-x-1/2 marker opacity-70;"
		>
			{currentPinEmoji}
		</div>

		<div
			style="top: {contextPos.y}px; left: {contextPos.x}px;"
			class="border border-black rounded bg-white p-4 text-black fixed z-10"
		>
			<div>
				<label for="title" class="block text-sm font-medium leading-6 text-gray-900">Title</label>
				<div class="mt-2">
					<div
						class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
					>
						<input
							bind:value={title}
							type="text"
							name="username"
							id="username"
							autocomplete="username"
							class="block flex-1 border-0 bg-transparent p-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
						/>
					</div>
				</div>
			</div>
			<div class=" mt-2">
				<label for="post" class="block text-sm font-medium leading-6 text-gray-900"
					>Description</label
				>
				<div class="mt-2">
					<textarea
						bind:value={post}
						id="about"
						name="about"
						rows="3"
						class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
			<div class="mt-4">
				<label for="type" class="block text-sm font-medium leading-6 text-gray-900"
					>marker icon</label
				>
				<button
					class="h-10 w-10 bg-gray-200 rounded-xl border border-gray-400"
					on:click={(event) => {
						setShowPicker(true);
						event.stopPropagation();
					}}
				>
					{currentPinEmoji}
				</button>
			</div>
			<div class="mt-6 flex justify-end">
				<button on:click={cancelCreatePin}>Cancel</button>
				<button
					class="bg-blue-500 flex items-center justify-center space-x-2 py-1 px-2 ml-4 rounded-lg font-bold text-white"
					disabled={submittingPin}
					class:bg-gray-300={submittingPin}
					on:click={createPin}
				>
					{#if submittingPin}
						<Loading />
					{/if}
					<div>Create pin</div>
				</button>
			</div>
		</div>
	{:else}
		<div
			class="border border-black rounded bg-white p-2 text-black absolute z-50 top"
			style="top: {contextPos.y}px; left: {contextPos.x}px;"
		>
			<button on:click={openPinMenu}>Place pin</button>
		</div>
	{/if}
{/if}
<div
	bind:this={picker}
	class="fixed top-1/2 left-1/2 z-[100] -translate-x-1/2 -translate-y-1/2"
	class:hidden={!showPicker}
/>

<div
	class="map"
	id="map"
	on:mousemove={(event) => (currentMousePos = { x: event.clientX, y: event.clientY })}
	on:contextmenu={handleContextMenu}
	on:mousedown={hideMenu}
	bind:this={mapContainer}
/>

{#if isMobile}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="fixed top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 text-black"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
		/>
	</svg>
{/if}

{#if map}
	<MouseDisplay {currentClientsInfo} {map} {zoomlevel} />
{/if}

<style>
	.map {
		position: relative;
		flex-grow: 1;
		width: 100%;
		height: 100vh;
		cursor: default;
	}
</style>
