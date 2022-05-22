import { useState } from "react";

export function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [value, () => setValue((value) => value + 1)];
}

export function isFloat(n) {
  return n === +n && n !== (n | 0);
}

export function isInteger(n) {
  return n === +n && n === (n | 0);
}
