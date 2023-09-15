<script lang="ts">
	import '../app.postcss';
	import { browser } from '$app/environment';
</script>

{#if browser}
	<slot />
{/if}

<style>
	:global(.leaflet-grab) {
		cursor: none !important;
	}
</style>
