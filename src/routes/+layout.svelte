<script lang="ts">
	import '../app.postcss';
	import { browser } from '$app/environment';
	import { Modal, getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent, ModalStore } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import SignupModal from '$lib/components/modals/SignupModal.svelte';

	initializeStores();

	const modalComponentRegistry: Record<string, ModalComponent> = {
		signup: {
			// Pass a reference to your custom component
			ref: SignupModal
		}
	};
</script>

<Modal components={modalComponentRegistry} />
{#if browser}
	<slot />
{/if}
