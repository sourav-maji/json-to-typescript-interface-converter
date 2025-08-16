import { useEffect, useState } from "react";

/**
 * Returns a debounced value that updates `delay` ms after the input stops changing.
 * Example: const debounced = useDebounce(value, 500)
 */
export default function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
