<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import EmailIcon from '../EmailIcon.svelte';
	import Loading from '../Loading.svelte';

	let loading = false;
	let showEmailInput = false;
	let showEmailValidation = false;
	let showCheckEmailMessage = false;
	let email = '';
	$: supabase = $modalStore[0]?.meta?.supabase;

	$: {
		if (validateEmail(email)) {
			showEmailValidation = false;
		}
	}

	// Stores
	const modalStore = getModalStore();

	function handleConintueWithGoogle() {
		supabase.auth.signInWithOAuth({
			provider: 'google'
		});
	}

	function handleContinueWithEmail() {
		if (!showEmailInput) {
			showEmailInput = true;
		} else {
			const valid = validateEmail(email);
			if (valid) {
				signInWithEmail(email);
			} else {
				showEmailValidation = true;
			}
		}
	}

	function validateEmail(email: string) {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	async function signInWithEmail(email: string) {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${location.origin}/auth/callback`
				}
			});
			if (error) throw error;
			showCheckEmailMessage = true;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	function signInWithGoogle(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		showCheckEmailMessage = true;
	}
</script>

{#if $modalStore[0]}
	{#if showCheckEmailMessage}
		<div
			transition:fade
			class="flex card p-10 flex-col text-center items-center align-middle justify-center w-[470px]"
		>
			<EmailIcon />
			<h1 class="text-3xl mt-2 font-semibold">Check your inbox</h1>
			<p class="mt-2 text-xl">
				We sent you an activation link. Please be sure to check your spam folder too.
			</p>
		</div>
	{:else}
		<div class="flex card p-10 flex-col items-center justify-center w-[470px]">
			<h1 class="mb-8 text-2xl font-bold">Welcome to Mapster!</h1>
			<button
				on:click={signInWithGoogle}
				disabled={loading}
				class="btn variant-filled-primary flex w-full text-white text-xl"
				><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-8 h-8 mr-1"
					><path
						fill="white"
						d="M5.89 8.86a7 7 0 0110.94-2.04l-2.01 2.01a3.78 3.78 0 00-2.68-1.05 4.17 4.17 0 00-3.91 2.89 4.2 4.2 0 000 2.66 4.2 4.2 0 006.29 2.22 3.23 3.23 0 001.39-2.12h-3.77v-2.7h6.6c.08.45.12.93.12 1.43 0 2.13-.76 3.92-2.09 5.14a6.68 6.68 0 01-4.63 1.7A7 7 0 015.88 8.86h.01z"
					></path></svg
				>Continue with Google</button
			>
			{#if showEmailInput}
				<!-- svelte-ignore a11y-autofocus -->
				<input
					type="text"
					class="flex w-full mt-8 p-2 px-4 input"
					placeholder="Email"
					disabled={loading}
					bind:value={email}
					autofocus
				/>
			{/if}
			{#if showEmailValidation}
				<p class="text-red-500 text-md mt-1 mr-auto ml-2">Please enter a valid email address.</p>
			{/if}
			<button
				disabled={loading}
				class="btn variant-ghost-secondary mt-3 flex w-full text-xl"
				on:click={handleContinueWithEmail}
			>
				{#if loading}
					<Loading />
				{/if}
				<div class="ml-2">Continue with Email</div>
			</button>
		</div>
	{/if}
{/if}
