import { Action, ActionPanel, List, useNavigation } from "@raycast/api";
import { useState } from "react";
import SnippetsResult from "../components/SnippetsResult";
import { useSnippetsSearch } from "../hooks";
import useSnippetsApp from "../hooks/useSnippetsApp";

export default function SnippetsSearch() {
  const [searchText, setSearchText] = useState("");
  const [snippetsApp, issnippetsAppLoading] = useSnippetsApp();
  const [searchResults, isLoadingSearchResults] = useSnippetsSearch(searchText);

  if (!issnippetsAppLoading && !snippetsApp) {
    return (
      <List>
        <List.EmptyView
          title="SnippetsLab.app not found"
          description="You need to have SnippetsLab installed to use this extension."
          icon="empty-view-icon.png"
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="Get SnippetsLab"
                shortcut={{ modifiers: ["cmd"], key: "g" }}
                url="https://www.renfei.org/snippets-lab/"
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoadingSearchResults}
      searchBarPlaceholder="Search snippets by name or keyword..."
      onSearchTextChange={(newValue) => {
        setSearchText(newValue.trim());
      }}
    >
      <List.Section title="Search Results">
        {searchResults.map((result, index) => (
          <SnippetsResult result={result} index={result["@_uid"]} key={index} />
        ))}
      </List.Section>
    </List>
  );
}