"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState, SerializedEditorState } from "lexical"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  initialHtml,
  onChange,
  onSerializedChange,
  onHtmlChange,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  initialHtml?: string
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onHtmlChange?: (html: string) => void
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),

        }}
      >
        {/* We need to handle initialHtml separately because initialConfig.editorState as function is tricky if we need imports.
            Better to use a plugin for initialization if initialHtml is present.
        */}
        <HtmlInitPlugin initialHtml={initialHtml} />

        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState, editor) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
              if (onHtmlChange) {
                editorState.read(() => {
                  const html = $generateHtmlFromNodes(editor, null)
                  onHtmlChange(html)
                })
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}

import { $getRoot, $insertNodes } from "lexical"
import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

function HtmlInitPlugin({ initialHtml }: { initialHtml?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!initialHtml) return

    // We only want to set this once on mount.
    // But LexicalComposer handles initialConfig.
    // If we do it here, we might overwrite user changes if we are not careful.
    // But this is "Initial" html.

    // Check if editor is empty?
    editor.update(() => {
      const root = $getRoot()
      if (root.isEmpty()) {
        const parser = new DOMParser()
        const dom = parser.parseFromString(initialHtml, "text/html")
        const nodes = $generateNodesFromDOM(editor, dom)
        root.select()
        $insertNodes(nodes)
      }
    })
  }, [editor, initialHtml]) // Only run if initialHtml changes? Or just once?
  // Usually initialHtml is static.

  return null
}
