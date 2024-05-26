<script lang="ts">
  import { USER } from "../../store/user";
  import Link from "../../utils/Router/Link.svelte";
  import s from "./header.module.scss";
</script>

<header class={s.header}>
  <Link to="/" class={s.title}>
    <i class="fa-solid fa-globe"></i>
    Web3 Payment
  </Link>
  <Link class={s.login} to={$USER ? "/profile" : "/login"}>{$USER ? "Profile" : "Login"}</Link>
</header>
