"use client";

import type { Extension, ReactCodeMirrorProps } from "@uiw/react-codemirror";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { cn } from "~/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import { getLanguageExtensionsByName } from "./language-extension-map";
import {
  useEditorSettingsStore,
  selectTabSize,
  selectIndentType,
} from "./editor-settings-store";
import EditorSettingsMenu from "./editor-settings-menu";

interface SolutionEditorProps extends ReactCodeMirrorProps {
  languageName?: string;
}

export default function SolutionEditor({
  languageName = "javascript",
  ...props
}: Readonly<SolutionEditorProps>) {
  const { resolvedTheme } = useTheme();
  const [languageExtensions, setLanguageExtensions] = useState<Extension[]>(
    [],
  );
  const tabSize = useEditorSettingsStore(selectTabSize);
  const indentType = useEditorSettingsStore(selectIndentType);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const extensions = await getLanguageExtensionsByName(languageName);
      if (!cancelled) {
        setLanguageExtensions(extensions);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [languageName]);

  const indentExtensions = useMemo(
    () => [
      indentUnit.of(indentType === "tabs" ? "\t" : " ".repeat(tabSize)),
      EditorState.tabSize.of(tabSize),
      keymap.of([indentWithTab]),
    ],
    [tabSize, indentType],
  );

  return (
    <div className="relative h-full">
      <div className="absolute top-2 right-2 z-10">
        <EditorSettingsMenu />
      </div>
      <CodeMirror
        {...props}
        extensions={[
          ...languageExtensions,
          ...indentExtensions,
          ...(props.extensions ?? []),
        ]}
        height={props.height ?? "100%"}
        className={cn("h-full", props.className)}
        theme={resolvedTheme === "light" ? vscodeLight : vscodeDark}
      />
    </div>
  );
}
