<script lang="ts">
  import s from "./app.module.scss";
  import Auth from "./routes/Auth/Auth.svelte";
  import { USER } from "./store/user";
  import Route from "./utils/Router/Route.svelte";
  import Router from "./utils/Router/Router.svelte";
  import server from "./utils/axiosInstance";

  server.get("/user/me").then((res) => USER.set(res.data));
</script>

<main class={s.app}>
  <Router />
  <Route path="/register" element={Auth} />
  <Route path="/login" element={Auth} />
</main>
