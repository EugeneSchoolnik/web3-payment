<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import s from "./captcha.module.scss";
  import server from "../../utils/axiosInstance";
  import type { captchaData } from "./types";

  const disptach = createEventDispatcher();

  const captcha: { data: null | captchaData; is: boolean; status: boolean | null; begin: () => void } = {
    is: false,
    data: null,
    status: null,
    begin() {
      if (captcha.status) return;

      captcha.is = true;
      captcha.status = null;
      captcha.data = null;
      btn.x = 0;
      server
        .get("/user/captcha")
        .then((res) => {
          captcha.data = res.data;
        })
        .catch((e) => console.log(e));
    },
  };

  const btn: {
    x: number;
    onMouseDown: (e: MouseEvent) => void;
    onMouseUp: () => void;
    initX: null | number;
    onMouseMove: (e: MouseEvent) => void;
  } = {
    x: 0,
    onMouseDown(e) {
      btn.initX = e.pageX - btn.x;
      document.addEventListener("mouseup", btn.onMouseUp);
    },
    onMouseUp() {
      btn.initX = null;
      document.removeEventListener("mouseup", btn.onMouseUp);
      checkCaptcha();
    },
    initX: null,
    onMouseMove(e) {
      if (btn.initX === null) return;
      btn.x = Math.max(Math.min(e.pageX - btn.initX, 260), 0);
    },
  };

  const checkCaptcha = () => {
    captcha.is = false;

    server
      .post("/user/captcha", { hash: captcha.data!.data.hash, x: btn.x * 2 })
      .then((res) => {
        captcha.status = res.data;
        disptach("captcha", { hash: captcha.data!.data.hash, x: btn.x * 2, status: captcha.status });
      })
      .catch((e) => console.log(e));
  };

  onMount(() => {
    document.addEventListener("mousemove", btn.onMouseMove);
  });

  onDestroy(() => {
    document.removeEventListener("mousemove", btn.onMouseMove);
  });
</script>

<div class={s.captcha}>
  <div class={`${s.status} ${s[captcha.status !== null ? captcha.status.toString() : ""]}`} on:click={captcha.begin}>
    {#if captcha.status}
      <i class="fa-solid fa-circle-check"></i>
    {:else if captcha.status === false}
      <i class="fa-solid fa-circle-xmark"></i>
    {:else}
      <i class="fa-regular fa-circle"></i>
    {/if}
    I'm not a robot
  </div>
  {#if captcha.is}
    <div class={s.captchaZone}>
      <div class={s.puzzleZone}>
        {#if captcha.data}
          <img src={captcha.data.puzzleBackground} alt="captcha" width="300px" />
          <img
            class={s.puzzle}
            src={captcha.data.puzzlePiece}
            alt="puzzle"
            width="40px"
            style={`--y: ${captcha.data.data.y / 2}px; --x: ${btn.x}px`}
          />
          <div class={s.btnZone}>
            <i class="fa-solid fa-angles-right" style={`--x: ${btn.x}px`} on:mousedown={btn.onMouseDown}></i>
          </div>
        {:else}
          <p>Loading ...</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
