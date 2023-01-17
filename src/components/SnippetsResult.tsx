import { Clipboard, ActionPanel, List, Action, closeMainWindow } from "@raycast/api";
import { execa } from "execa";
import { decode } from "html-entities";
import { SnippetsResult } from "../types";
import { execFile } from "child_process";
import { promisify } from "util";
import useSnippetsApp from "../hooks/useSnippetsApp";

const execFilePromisified = promisify(execFile);

export default function ({ result, index }: { result: SnippetsResult; index: string }) {
  
  const [snippetName, subtitle] = result.subtitle
  const [snippetsApp, issnippetsAppLoading] = useSnippetsApp();
  
  return (
    <List.Item
      key={result["@_uid"]}
      title={decode(result.title.toString())}
      subtitle={decode(subtitle)}
      icon={result.icon}
      actions={
        <ActionPanel>
          <Action title="Paste" onAction={async () => pasteCallbackInBackground(snippetsApp.path, index)} />
          <Action title="Copy to clipboard" shortcut={{ modifiers: ["cmd"], key: "enter" }} onAction={async () => copyCallbackInBackground(index)} />
          <Action title="Open in SnippetsLab" shortcut={{ modifiers: ["opt"], key: "enter" }} onAction={async () => openCallbackInBackground(index)} />
        </ActionPanel>
      }
      accessories={[
        {
          text: snippetName,
        },
      ]}
    />
  );
}

async function openCallbackInBackground(snippetsIndex: string) {
  await closeMainWindow({ clearRootSearch: true });
  await execa("open", ["-g", "snippetslab://alfred/" + snippetsIndex + "/?modifier=alt"]);
}

async function copyCallbackInBackground(snippetsIndex: string) {
  await closeMainWindow({ clearRootSearch: true });
  await execa("open", ["-g", "snippetslab://alfred/" + snippetsIndex + "/?modifier=cmd"]);
}

async function pasteCallbackInBackground(path: string, snippetsIndex: string) {
  await closeMainWindow({ clearRootSearch: true });

  const { stdout: data } = await execFilePromisified(`./SnippetsLabAlfredWorkflow`, ["--action=fetch", `--query=${snippetsIndex}`], {
    cwd: `${path}/Contents/SharedSupport/Integrations`
  });

  await Clipboard.paste(data);
}