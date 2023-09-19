<script lang="ts">
	import '../app.postcss';
	import { browser } from '$app/environment';
	import { Modal, getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent, ModalStore } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import SignupModal from '$lib/components/modals/SignupModal.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	initializeStores();

	const modalComponentRegistry: Record<string, ModalComponent> = {
		signup: {
			// Pass a reference to your custom component
			ref: SignupModal
		}
	};

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<Modal components={modalComponentRegistry} />
{#if browser}
	<slot />
{/if}
