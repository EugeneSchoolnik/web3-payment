<script lang="ts">
  import s from "./app.module.scss";
  import Header from "./components/Header/Header.svelte";
  import Auth from "./routes/Auth/Auth.svelte";
  import Home from "./routes/Home/Home.svelte";
  import Pay from "./routes/Pay/Pay.svelte";
  import Profile from "./routes/Profile/Profile.svelte";
  import { USER } from "./store/user";
  import Route from "./utils/Router/Route.svelte";
  import Router from "./utils/Router/Router.svelte";
  import server from "./utils/axiosInstance";

  server
    .get("/user/me")
    .then((res) => USER.set(res.data))
    .then(() =>
      server.get("/payment/history").then((res) =>
        USER.update((s) => {
          s!.paymentHistory = res.data;
          return s;
        })
      )
    );
</script>

<main class={s.app}>
  <Header />
  <Router />
  <Route path="/" element={Home} />
  <Route path="/register" element={Auth} />
  <Route path="/login" element={Auth} />
  <Route path="/profile" element={Profile} />
  <Route path="/pay" element={Pay} />
</main>
