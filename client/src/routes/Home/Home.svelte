<script lang="ts">
  import { USER } from "../../store/user";
  import { copyToClipboard } from "../../utils/copy";
  import s from "./home.module.scss";
</script>

<div class={s.home}>
  <h1>Web3 Payment</h1>
  <p>
    Welcome to our website, which provides a convenient and secure way to accept cryptocurrency payments. Our service
    supports API integration and allows you to accept payments in the BEP20 network using popular cryptocurrencies: BTC,
    ETH, USDT, BNB and XRP. With us, your transactions will be fast, reliable and secure. Start using our service today
    and discover all the advantages of cryptocurrency payments!
  </p>
  <br />
  <h2>How to use</h2>
  <div class={s.block}>
    <h3>Create payment</h3>
    <p>endpoint: <b>/pay</b> <br />GET parameters:</p>
    <ul>
      <li><b>symbol</b> - payment currency, available: [BTC, ETH, USDT, BNB, XRP]</li>
      <li><b>amount</b> - amount of payment in dollars, not less than 10</li>
      <li>
        <b>redirect</b> - Link to go after completion (GET parameter <b>payment_id</b> will be added automatically)
      </li>
      <li><b>userId</b> - your id on this site, you can get it from your profile</li>
      <li><b>network</b> - payment network, available: [main, test]</li>
    </ul>
    <p>
      Example: <br />
      <span
        class={s.link}
        on:click={(e) => {
          copyToClipboard(e.currentTarget.innerText);
          alert("copied");
        }}
      >
        http://localhost:5173/pay?symbol=USDT&amount=10&redirect=yoursite.com&userId={$USER?.id ||
          "<userId>"}&network=main
      </span>
    </p>
    <br />
    <h3>Payment check</h3>
    <p>endpoint: <b>/payment/get</b> <br />GET parameters:</p>
    <ul>
      <li><b>id</b> - payment identifier (payment_id)</li>
    </ul>
    <p>
      Example:<br />
      <span
        class={s.link}
        on:click={(e) => {
          copyToClipboard(e.currentTarget.innerText);
          alert("copied");
        }}
      >
        http://localhost:5173/payment/get?id={"<payment_id>"}
      </span>
    </p>
    <p>Output (json):</p>
    <ul>
      <li><b>txHash</b> - transaction hash, can be checked on bscscan</li>
      <li><b>symbol</b> - payment currency, available: [BTC, ETH, USDT, BNB, XRP]</li>
      <li><b>status</b> - payment status, available: [success, canceled, pending]</li>
      <li><b>amount</b> - amount of payment in dollars</li>
      <li><b>timestamp</b> - time in seconds</li>
    </ul>
  </div>
</div>
