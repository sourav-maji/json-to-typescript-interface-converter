import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { saveAs } from "file-saver";
import { Sun, Moon, Copy, Download, Play } from "lucide-react";
import { jsonToInterface } from "./utils/jsonToInterface";
import useDebounce from "./hooks/useDebounce"; // <- new hook

export default function App() {
  const [jsonInput, setJsonInput] = useState<string>(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": 10001
  },
  "tags": ["dev", "blogger"],
  "isActive": true
}`);
  const [tsOutput, setTsOutput] = useState<string>("");
  const [useOptional, setUseOptional] = useState<boolean>(false);
  const [useReadonly, setUseReadonly] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  // debounce the json input to avoid frequent parsing while typing
  const debouncedJson = useDebounce(jsonInput, 500); // 500ms delay

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const convert = (inputJson?: string) => {
    try {
      const parsed = JSON.parse(typeof inputJson === "string" ? inputJson : jsonInput);
      const ts = jsonToInterface(parsed, "Root", useOptional, useReadonly);
      setTsOutput(ts || "// (No interface generated)");
    } catch (e) {
      setTsOutput("// ❌ Invalid JSON");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tsOutput);
    } catch {
      // ignore
    }
  };

  const downloadFile = () => {
    const blob = new Blob([tsOutput], { type: "text/typescript;charset=utf-8" });
    saveAs(blob, "interfaces.ts");
  };

  // Auto-convert when the debounced JSON changes OR options change.
  // This avoids parsing on every keystroke.
  useEffect(() => {
    convert(debouncedJson);
    // we include useOptional and useReadonly so changing toggles re-converts immediately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedJson, useOptional, useReadonly]);

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-md flex items-center justify-center font-bold">JS</div>
          <h1 className="text-lg font-semibold">JSON → TypeScript (Pro)</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={useOptional} onChange={(e) => setUseOptional(e.target.checked)} />
              Optional
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={useReadonly} onChange={(e) => setUseReadonly(e.target.checked)} />
              Readonly
            </label>
          </div>

          <button onClick={() => { setDarkMode(!darkMode); }} className="px-3 py-1 rounded-md border">
            {darkMode ? <Sun className="w-4 h-4 inline-block mr-2" /> : <Moon className="w-4 h-4 inline-block mr-2" />}
            <span className="text-sm">{darkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button onClick={() => convert()} className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2">
            <Play className="w-4 h-4" /> Convert
          </button>
          <button onClick={copyToClipboard} className="px-4 py-2 border rounded-md flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={downloadFile} className="px-4 py-2 border rounded-md flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </button>
          <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">Auto-convert (debounced)</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="flex flex-col border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-medium">JSON Input</div>
            <Editor
              height="60vh"
              defaultLanguage="json"
              theme={darkMode ? "vs-dark" : "light"}
              value={jsonInput}
              onChange={(v) => setJsonInput(v ?? "")}
              options={{ minimap: { enabled: false }, automaticLayout: true }}
            />
          </section>

          <section className="flex flex-col border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-medium">Generated TypeScript</div>
            <Editor
              height="60vh"
              defaultLanguage="typescript"
              theme={darkMode ? "vs-dark" : "light"}
              value={tsOutput}
              options={{ readOnly: true, minimap: { enabled: false } }}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center border-t bg-white dark:bg-gray-800">
        <div className="flex justify-center items-center gap-2">
          <span>Developed by <strong>Sourav Maji</strong></span>
          <a
            href="https://github.com/sourav-maji"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-black"
          >
            Github
          </a>
        </div>
      </footer>
    </div>
  );
}
