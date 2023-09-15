<!-- <script lang="ts">
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	import { tick } from 'svelte';

	export let mapElement: HTMLElement;

	let mousePosition = { x: 200, y: 400 };
	let checked = true;
	let ghostWorldpin = false;

	function moveCursor(e) {
		if (checked) return;
		mousePosition = { x: e.clientX, y: e.clientY };
	}

	function toggleMenu() {
		console.log('toggleMenu');
		checked = !checked;
	}
	onMount(async () => {
		await tick();
		document.addEventListener('mousemove', moveCursor);
		console.log(mapElement);
		if (mapElement) {
			mapElement.addEventListener('click', toggleMenu);
		}
	});

	onDestroy(() => {
		document.removeEventListener('mousemove', moveCursor);
		if (mapElement) {
			mapElement.removeEventListener('click', toggleMenu);
		}
	});
</script>

<div
	class="fixed z-[1000] top-[200px] right-[200px] -translate-x-1/2 translate-y-1/2"
	style="top: {mousePosition.y}px; left: {mousePosition.x}px;"
>
	<nav class="menu">
		<input bind:checked class="menu-toggler cursor-none" type="checkbox" />
		<ul>
			<li class="menu-item">
				<button
					on:mouseenter={() => (ghostWorldpin = true)}
					on:mouseleave={() => (ghostWorldpin = false)}
					class="group"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="w-6 h-6 absolute opacity-70 group-hover:opacity-100 transition-opacity duration-200 top-[45px] left-[45px] text-red-500"
					>
						<path
							fill-rule="evenodd"
							d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
							clip-rule="evenodd"
						/>
					</svg>

					🌎
				</button>
			</li>
			<li class="menu-item">
				<button on:click>
					<div>👋</div>
				</button>
			</li>
		</ul>
	</nav>
</div>
{#if checked}
	<svg
		fill="#000000"
		style="top: {mousePosition.y}px; left: {mousePosition.x}px;"
		viewBox="0 0 24 24"
		id="custom-cursor"
		class="absolute z-[998] pointer-events-none w-4 h-4 opacity-[0.3]"
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
{/if}
{#if ghostWorldpin}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		style="top: {mousePosition.y}px; left: {mousePosition.x}px;"
		class="w-6 h-6 absolute opacity-30 -translate-x-[10px] -translate-y-5 text-red-500"
	>
		<path
			fill-rule="evenodd"
			d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
			clip-rule="evenodd"
		/>
	</svg>
{/if}

<style>
	.menu-toggler {
		position: absolute;
		display: block;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		margin: auto;
		width: 90px;
		height: 90px;
		z-index: 2;
		opacity: 0;
		border-radius: 100%;
	}

	.menu-toggler:checked ~ ul .menu-item {
		opacity: 1;
	}
	.menu-toggler:checked ~ ul .menu-item:nth-child(1) {
		transform: rotate(60deg) translate(-90px);
	}
	.menu-toggler:checked ~ ul .menu-item:nth-child(2) {
		transform: rotate(120deg) translateX(-90px);
	}
	/* .menu-toggler:checked ~ ul .menu-item:nth-child(3) {
		transform: rotate(120deg) translateX(-90px);
	}
	.menu-toggler:checked ~ ul .menu-item:nth-child(4) {
		transform: rotate(180deg) translateX(-90px);
	}
	.menu-toggler:checked ~ ul .menu-item:nth-child(5) {
		transform: rotate(240deg) translateX(-90px);
	}
	.menu-toggler:checked ~ ul .menu-item:nth-child(6) {
		transform: rotate(300deg) translateX(-90px);
	}
	*/
	.menu-toggler:checked ~ ul .menu-item button {
		pointer-events: auto;
	}

	.menu-item:nth-child(1) button {
		transform: rotate(-60deg);
	}
	.menu-item:nth-child(2) button {
		transform: rotate(-120deg);
	}
	/* .menu-item:nth-child(3) button {
		transform: rotate(-120deg);
	}
	.menu-item:nth-child(4) button {
		transform: rotate(-180deg);
	}
	.menu-item:nth-child(5) button {
		transform: rotate(-240deg);
	}
	.menu-item:nth-child(6) button {
		transform: rotate(-300deg);
	} */
	.menu-item {
		position: absolute;
		display: block;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
		width: 80px;
		height: 80px;
		opacity: 0;
		transition: 0.2s;
	}
	.menu-item button {
		display: block;
		width: inherit;
		height: inherit;
		line-height: 80px;
		color: rgba(255, 255, 255, 0.7);
		background: rgba(230, 230, 250, 0.7);
		border-radius: 50%;
		text-align: center;
		font-size: 40px;
		pointer-events: none;
		transition: 0.2s;
	}

	.menu-item button:hover {
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
		color: white;
		background: rgba(255, 255, 255, 0.3);
		font-size: 44.44px;
	}
</style> -->
