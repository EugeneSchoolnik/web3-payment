<script lang="ts">
  export let to: string;
  let className: string = "";
  export { className as class };

  const toHandle = (e: MouseEvent) => {
    if (to === window.location.pathname) return;
    window.history.pushState(
      {},
      "",
      (e.currentTarget as HTMLAnchorElement).href,
    );
    window.dispatchEvent(new Event("popstate"));
  };
</script>

<a href={to} class={className} on:click|preventDefault={toHandle}><slot /></a>
