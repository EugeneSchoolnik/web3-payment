type inspections = "notEmpty" | "email" | "notNull" | "number" | "address_bep20";
type formats = "number";
type field = { value: any; error: string } | string;

const inspections: Record<inspections, (v: any) => boolean> = {
  notEmpty: (v: string) => v.length > 0,
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  notNull: (v: any) => v !== null && v !== "",
  number: (v: any) => /^\d*\.?\d*$/.test(v),
  address_bep20: (v: string) => v.length == 42 && v.slice(0, 2) == "0x",
};

export const formats: Record<formats, (e: Event & { currentTarget: HTMLInputElement }) => void> = {
  number: (e) => {
    if (!/^\d*\.?\d*$/.test(e.currentTarget.value)) e.currentTarget.value = e.currentTarget.value.slice(0, -1);
  },
};

const errorMessages: Record<inspections, string> = {
  notEmpty: "Field must not be empty",
  email: "Incorrect email",
  notNull: "Field must not be empty",
  number: "It's not a number",
  address_bep20: "Incorrect bep20 address is specified",
};

export const validate = <T extends Record<string, field>>(data: T, types: [keyof T, inspections][]) => {
  let isValid = true;

  for (const i of types) {
    const field = data[i[0]];
    if (typeof field !== "object") continue;
    field.error = "";
    if (!inspections[i[1]](field.value)) {
      field.error = errorMessages[i[1]];
      isValid = false;
    }
  }

  return isValid;
};
