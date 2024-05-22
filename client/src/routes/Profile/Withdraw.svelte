<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { formats, validate } from "../../utils/validate";
  import s from "./profile.module.scss";
  import server from "../../utils/axiosInstance";
  import { USER } from "../../store/user";

  const dispatch = createEventDispatcher();

  const data = {
    address: { value: "", error: "" },
    amount: { value: null, error: "" },
    error: "",
  };

  const checkData = () => {
    const isValid = validate(data, [
      ["address", "address_bep20"],
      ["amount", "number"],
    ]);
    data.error = data.error;
    return isValid;
  };

  const onSubmit = () => {
    if (!checkData()) return;

    const Data = Object.fromEntries(Object.entries(data).map((i) => [i[0], (i[1] as any).value]));

    data.address.value = "";
    data.amount.value = null;

    server
      .post("/profile/withdraw", Data)
      .then((res) => {
        alert(`Success\ntransaction hash: ${res.data.data}`);
        USER.update((s) => {
          s!.balance -= Data.amount;
          return s;
        });
      })
      .catch((e) => (data.error = e.response.data.message));
  };

  const hidePopup = (e: Event) => e.currentTarget == e.target && dispatch("hide");
</script>

<div class={s.withdraw} on:click={hidePopup}>
  <form class="form" on:submit|preventDefault={onSubmit}>
    <h2>Withdraw</h2>
    <label>
      BEP-20 Address
      <input type="text" bind:value={data.address.value} />
      <span>{data.address.error}</span>
    </label>
    <label>
      Amount
      <input type="text" bind:value={data.amount.value} on:input={formats.number} />
      <span>{data.amount.error}</span>
    </label>
    <p>{data.error}</p>
    <button>Confirm</button>
  </form>
</div>
