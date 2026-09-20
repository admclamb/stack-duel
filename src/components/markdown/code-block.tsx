"use client";

import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { getLanguageExtensionsByName } from "~/components/workspace/language-extension-map";

type CodeBlockProps = {
  code: string;
  language: string;
  className?: string;
};

export default function CodeBlock({
  code,
  language,
  className,
}: Readonly<CodeBlockProps>) {
  const { resolvedTheme } = useTheme();
  const [languageExtensions, setLanguageExtensions] = useState<Extension[]>(
    [],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const extensions = await getLanguageExtensionsByName(language);
      if (!cancelled) {
        setLanguageExtensions(extensions);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <CodeMirror
      value={code}
      editable={false}
      extensions={[...languageExtensions, EditorView.lineWrapping]}
      className={cn("my-6 overflow-hidden rounded-md text-sm", className)}
      theme={resolvedTheme === "light" ? vscodeLight : vscodeDark}
      basicSetup={{ lineNumbers: false, foldGutter: false }}
    />
  );
}
