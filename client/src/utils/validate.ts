type inspections = "notEmpty" | "email" | "notNull";
type field = { value: any; error: string } | string;

const inspections: Record<inspections, (v: any) => boolean> = {
  notEmpty: (v: string) => v.length > 0,
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  notNull: (v: any) => v !== null && v !== "",
};

const errorMessages: Record<inspections, string> = {
  notEmpty: "Field must not be empty",
  email: "Incorrect email",
  notNull: "Field must not be empty",
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
