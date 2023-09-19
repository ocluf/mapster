<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

	export let supabase;

	const modalStore = getModalStore();

	const modal: ModalSettings = {
		type: 'component',
		component: 'signup',
		meta: {
			supabase
		}
	};

	// let expanded = false;
	// function toggleExpansion() {
	// 	if (expanded) {
	// 		progress.set(40);
	// 		expanded = false;
	// 	} else {
	// 		progress.set(200);
	// 		expanded = true;
	// 	}
	// }

	// const progress = tweened(40, {
	// 	duration: 100,
	// 	easing: cubicOut
	// });
</script>

<div class="fixed top-4 left-4 card p-3 border border-black max-w-[230px] z-[500]">
	<div class="text-xl font bold">m/world</div>
	<!-- <div class="text-gray-500 text-md mt-1">
		A free-for-all submap where every user can post one pin.
	</div> -->
	<!-- <button class="bg-blue-500 p-2 mt-4 text-white rounded-xl font-bold">
		Create your own submap</button
	> -->
</div>

<!-- <button class="btn variant-outline-primary mt-6 font-bold w-full"> Create your own submap</button> -->
<button
	on:click={() => modalStore.trigger(modal)}
	class="fixed bottom-4 left-4 z-10 btn bg-white mt-2 font-bold w-[98px]"
>
	Login</button
>
<!-- <button
	on:click={() => modalStore.trigger(modal)}
	class="fixed bottom-4 left-1/2 -translate-x-1/2 border-2 border-black rounded-full z-10 btn bg-white"
>
	<div>📍 Place Pin</div>
</button> -->

<button
	class="fixed bottom-4 right-4 z-10 bg-gradient-to-br variant-gradient-secondary-tertiary btn text-white font-bold w"
	on:click={() => modalStore.trigger(modal)}
>
	Create pin
	<div class="ml-2 marker">📍</div>
</button>

<!-- <button
	class="fixed bg-white text-black cursor-pointer left-0 top-0 p-2 rounded-xl m-4 z-[99] overflow-hidden"
	on:click={toggleExpansion}
	style="width: {$progress}px; height: {$progress}px;"
>
	
</button> -->
