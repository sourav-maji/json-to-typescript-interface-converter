export function jsonToInterface(
  obj: any,
  rootName: string = "Root",
  useOptional: boolean = false,
  useReadonly: boolean = false
): string {
  const interfaces: string[] = [];
  const seen = new WeakMap<object, string>();

  function capitalize(s: string) {
    if (!s) return "Root";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function inferType(value: any, keyName = "Item"): string {
    if (value === null) return "any";
    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";
      const types = Array.from(new Set(value.map((v) => inferType(v, keyName))));
      if (types.length === 1) return `${types[0]}[]`;
      return `(${types.join(" | ")})[]`;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return seen.get(value)!;
      const name = capitalize(keyName);
      seen.set(value, name);
      buildInterface(value, name);
      return name;
    }
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "any";
  }

  function buildInterface(obj: any, name: string) {
    if (typeof obj !== "object" || obj === null) return;
    if (interfaces.some((s) => s.startsWith(`export interface ${name} `) || s.startsWith(`interface ${name} `))) {
      return;
    }
    const entries = Object.entries(obj);
    const lines = entries.map(([k, v]) => {
      const t = inferType(v, k);
      const opt = useOptional ? "?" : "";
      const ro = useReadonly ? "readonly " : "";
      return `  ${ro}${k}${opt}: ${t};`;
    });
    interfaces.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
  }

  inferType(obj, rootName);
  return interfaces.reverse().join("\n\n");
}
