<script lang="ts">
  import { onMount } from "svelte";
  import { getQuery } from "../../utils/parseQuery";
  import s from "./pay.module.scss";
  import type { IPayment } from "./type";
  import server from "../../utils/axiosInstance";
  import { copyToClipboard } from "../../utils/copy";

  const { symbol, amount, redirect, userId, network } = getQuery();
  let error =
    !symbol && !amount && !redirect && !userId && !network
      ? "Not all parameters were passed. Mandatory: symbol, amount, redirect, userId, network"
      : "";

  const order = sessionStorage.getItem(window.location.search);
  let payment: IPayment | null = order ? JSON.parse(order) : null;

  let paymentStatus: "pending" | "success" | "canceled" = "pending";

  let checkStatusId: number | null = null;
  const checkStatus = async () => {
    if (!payment) return checkStatusId !== null && clearInterval(checkStatusId);

    const res = await server.get("/payment/get?id=" + payment!.id);
    paymentStatus = res.data.status;
    if (paymentStatus !== "pending") {
      sessionStorage.removeItem(window.location.search);
      checkStatusId !== null && clearInterval(checkStatusId);
      timerId !== null && clearInterval(timerId);
      timeLeft = "00:00";
    }
  };
  const checkStatusInterval = () => {
    checkStatusId = setInterval(checkStatus, 30000);
    checkStatus();
  };

  let timeLeft = "";
  let timerId: number | null = null;
  const timer = () => {
    if (!payment) return timerId !== null && clearInterval(timerId);
    const delta = (payment.until - Date.now()) / 1000;
    if (delta < 0) {
      onExpired();
      return timerId !== null && clearInterval(timerId);
    }

    const minutes = (~~(delta / 60)).toString();
    const seconds = (~~(delta % 60)).toString();

    timeLeft = `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
  };
  const startTimer = () => {
    timerId = setInterval(timer, 1000);
    timer();
  };
  const onExpired = async () => {
    await checkStatus();
    if (paymentStatus == "pending") onExpired();
  };

  onMount(() => {
    if (!error && payment === null)
      server
        .get("/payment/pay" + window.location.search)
        .then((res) => {
          payment = res.data.data;
          sessionStorage.setItem(window.location.search, JSON.stringify(payment));
          checkStatusInterval();
          startTimer();
        })
        .catch((e) => (error = e.response.data.message));
    else if (payment) {
      checkStatusInterval();
      startTimer();
    }
  });
</script>

<div class={s.pay}>
  {#if error}
    <p class={s.error}>{error}</p>
  {:else if payment}
    <div class={s.payment}>
      <span>ID: <o>{payment.id}</o></span>
      <span>Symbol: <o>{payment.symbol}</o></span>
      <span>Amount: <o>{payment.amount}</o></span>
      <span>
        address:
        <o
          class={s.address}
          on:click={() => {
            copyToClipboard(payment ? payment.address : "");
            alert("copied");
          }}
        >
          {payment.address}
        </o>
      </span>
      <div class={`${s.status} ${s[paymentStatus]}`}>
        {paymentStatus}
        {#if paymentStatus === "pending"}
          <i class="fa-solid fa-spinner"></i>
        {/if}
      </div>
      <div class={s.timer}>{timeLeft}</div>
    </div>
  {:else}
    <p class={s.creating}>Creating payment ...</p>
  {/if}
  {#if payment && paymentStatus !== "pending"}
    <a class={s.goBack} href={payment.redirect}>Go back</a>
  {/if}
</div>
