import { writable } from "svelte/store";

interface IUser {
  id: string;
  email: string;
  balance: number;
}

export const USER = writable<null | IUser>(null);

export const onAuth = (cb: () => void) => {
  return USER.subscribe((s) => {
    if (s) cb();
  });
};
