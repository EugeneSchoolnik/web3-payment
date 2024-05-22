<script lang="ts">
  import { onDestroy } from "svelte";
  import { USER, onLogout } from "../../store/user";
  import { goTo } from "../../utils/Router/router";
  import s from "./profile.module.scss";
  import Withdraw from "./Withdraw.svelte";
  import server from "../../utils/axiosInstance";

  let isWithdrawPopup = false;

  const unsubOnLogout = onLogout(() => goTo("/login"));

  let balanceAnim = false;
  const refreshBalance = () => {
    balanceAnim = true;
    server.get("/profile/balance").then((res) => {
      balanceAnim = false;
      USER.update((s) => {
        s!.balance = res.data.data;
        return s;
      });
    });
  };

  const logout = () => {
    server.get("/user/logout").then(() => USER.set(null));
  };

  onDestroy(() => {
    unsubOnLogout();
  });
</script>

<div class={s.profile}>
  <div class={s.info}>
    <div>
      <b>id: {$USER?.id}</b>
      <span>{$USER?.email}</span>
    </div>
    <div>
      <button class="btn primary" on:click={() => (isWithdrawPopup = true)}>Withdraw</button>
      <button class="btn" on:click={logout}>Logout</button>
    </div>
  </div>
  <div class={s.panel}>
    <div class={s.balance}>
      <span>Balance: {$USER?.balance.toPrecision(3)}</span>
      <i class={`fa-solid fa-rotate-right ${balanceAnim && s.anim}`} on:click={refreshBalance}></i>
    </div>
    <h2>Payment history</h2>
    <ul>
      <li>
        <span>id</span>
        <span>symbol</span>
        <span>amount</span>
        <span>status</span>
        <span>txHash</span>
      </li>
      {#each $USER?.paymentHistory || [] as i (i.id)}
        <li>
          <span>{i.id}</span>
          <span>{i.symbol}</span>
          <span>{i.amount}</span>
          <span>{i.status}</span>
          <span>{i.txHash}</span>
        </li>
      {/each}
      {#if $USER?.paymentHistory && $USER?.paymentHistory.length == 0}
        <li><p>EMPTY</p></li>
      {/if}
    </ul>
  </div>
  {#if isWithdrawPopup}
    <Withdraw on:hide={() => (isWithdrawPopup = false)} />
  {/if}
</div>
