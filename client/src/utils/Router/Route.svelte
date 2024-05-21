<script lang="ts">
  import { addRoute } from "./router";

  export let path: string;
  let Element: any;
  export { Element as element };

  addRoute(path, Element);
</script>
