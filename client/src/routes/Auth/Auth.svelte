<script lang="ts">
  import { onDestroy } from "svelte";
  import { USER, onAuth } from "../../store/user";
  import Link from "../../utils/Router/Link.svelte";
  import { goTo } from "../../utils/Router/router";
  import server from "../../utils/axiosInstance";
  import { validate } from "../../utils/validate";
  import s from "./auth.module.scss";

  let isLogin = window.location.pathname == "/login";
  let isPassVisible = false;

  const data = {
    email: { value: "", error: "" },
    password: { value: "", error: "" },
    error: "",
  };

  const checkData = () => {
    const isValid = validate(data, [
      ["email", "email"],
      ["password", "notEmpty"],
    ]);
    data.error = data.error;
    return isValid;
  };

  const onSubmit = () => {
    if (!checkData()) return;

    const Data = Object.fromEntries(Object.entries(data).map((i) => [i[0], (i[1] as any).value]));
    server
      .post(`/user/${isLogin ? "login" : "register"}`, Data)
      .then((res) => USER.set(res.data))
      .catch((e) => (data.error = e.response.data.message));
  };

  const unsubOnAuth = onAuth(() => goTo("/profile"));

  onDestroy(() => {
    unsubOnAuth();
  });
</script>

<div class={s.auth}>
  <h1>{isLogin ? "Autorization" : "Registration"}</h1>
  <form class="form" on:submit|preventDefault={onSubmit}>
    <label>
      Email
      <input type="email" bind:value={data.email.value} />
      <span>{data.email.error}</span>
    </label>
    <label>
      Password
      <input
        type={isPassVisible ? "text" : "password"}
        on:input={(e) => (data.password.value = e.currentTarget.value)}
      />
      <i class={`fa-solid fa-eye${isPassVisible ? "" : "-slash"}`} on:click={() => (isPassVisible = !isPassVisible)}>
      </i>
      <span>{data.password.error}</span>
    </label>
    <p>{data.error}</p>
    <button>CONFIRM</button>
  </form>
  <div class={s.actions}>
    {#if isLogin}
      <Link to="/register">Don't have an account?</Link>
    {:else}
      <Link to="/login">Already registered?</Link>
    {/if}
  </div>
</div>
