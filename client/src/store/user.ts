import { writable } from "svelte/store";

type payment = {
  id: string;
  userId: string;
  txHash: string;
  symbol: string;
  status: string;
  amount: number;
};

interface IUser {
  id: string;
  email: string;
  balance: number;
  paymentHistory: payment[];
}

export const USER = writable<null | IUser>(null);

export const onAuth = (cb: () => void) => {
  return USER.subscribe((s) => {
    if (s) cb();
  });
};

export const onLogout = (cb: () => void) => {
  return USER.subscribe((s) => {
    if (!s) cb();
  });
};
