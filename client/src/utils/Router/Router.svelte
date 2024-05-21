<script lang="ts">
  import { onMount } from "svelte";
  import { handleRoute } from "./router";

  let Route = null;
  let prevRoute = null;
  let frame = true;

  const query: Record<string, string> = {};
  const params: Record<string, string> = {};
  onMount(() => (Route = handleRoute(query, params)));
  window.onpopstate = () => {
    prevRoute = Route;
    Route = handleRoute(query, params);
    if (prevRoute === Route) frame = !frame;
  };
</script>

<slot />
{#if Route}
  {#if frame}
    <svelte:component this={Route} props={{ query, params }} />
  {:else}
    <svelte:component this={Route} props={{ query, params }} />
  {/if}
{/if}
