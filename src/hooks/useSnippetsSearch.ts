import { useEffect, useRef, useState } from "react";
import { parse } from "fast-xml-parser";
import { execFile } from "child_process";
import { promisify } from "util";
import useSnippetsApp from "./useSnippetsApp";
import { SnippetsResult } from "../types";
import { Application } from "@raycast/api";
const execFilePromisified = promisify(execFile);

export default function useSnippetsSearch(searchText: string): [SnippetsResult[], boolean] {
  const [state, setState] = useState<{ isLoading: boolean; results: SnippetsResult[] }>({ isLoading: true, results: [] });
  const cancel = useRef<AbortController>(new AbortController());
  const [snippetsApp, issnippetsAppLoading] = useSnippetsApp();

  useEffect(() => {
    if (!snippetsApp || issnippetsAppLoading) {
      return;
    }
    (async () => {
      setState((previous) => ({ ...previous, isLoading: true }));
      cancel.current?.abort();
      cancel.current = new AbortController();
      if (!searchText) {
        setState({ results: [], isLoading: false });
        return;
      }
      try {
        setState({
          results: await searchSnippets(snippetsApp, `--query=${searchText}`, cancel.current.signal),
          isLoading: false,
        });
      } catch (err) {
        setState({ results: [], isLoading: false });
      }
    })();
    return function cleanup() {
      cancel.current?.abort();
    };
  }, [snippetsApp, searchText]);

  return [state.results, state.isLoading];
}

async function searchSnippets(snippetsApp: Application, query: string, signal: AbortSignal): Promise<SnippetsResult[]> {
  try {
    const { stdout: data } = await execFilePromisified(`./SnippetsLabAlfredWorkflow`, ["--action=search", query], {
      cwd: `${snippetsApp.path}/Contents/SharedSupport/Integrations`,
      signal,
    });
  
    const jsonData = parse(data, { ignoreAttributes: false });

    if (!jsonData || typeof jsonData.items.item === "undefined" || jsonData.items.item == "undefined") {
      return [];
    }

    if (Array.isArray(jsonData.items.item)) {
      return jsonData.items.item;
    }
    
    return [jsonData.items.item];
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return [];
    }
    throw err;
  }
}
