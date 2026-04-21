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
  onLengthChange,
  placeholder = "Start typing ...",
  maxLength,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  initialHtml?: string
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onHtmlChange?: (html: string) => void
  onLengthChange?: (length: number) => void
  placeholder?: string
  maxLength?: number
}) {
  const onHtmlChangeRef = useRef(onHtmlChange)

  useEffect(() => {
    onHtmlChangeRef.current = onHtmlChange
  }, [onHtmlChange])

  return (
    <div className="bg-background overflow-hidden rounded-lg shadow">
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
          <Plugins
            placeholder={placeholder}
            maxLength={maxLength}
            onLengthChange={onLengthChange}
          />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState, editor) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
              if (onHtmlChangeRef.current) {
                editorState.read(() => {
                  const html = $generateHtmlFromNodes(editor, null)
                  onHtmlChangeRef.current?.(html)
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
import { useEffect, useRef } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

function HtmlInitPlugin({ initialHtml }: { initialHtml?: string }) {
  const [editor] = useLexicalComposerContext()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!initialHtml || hasInitialized.current) return

    // Mark as initialized to prevent re-running
    hasInitialized.current = true

    // Set the initial HTML content
    editor.update(() => {
      const root = $getRoot()
      // Clear existing content and set new content
      root.clear()
      const parser = new DOMParser()
      const dom = parser.parseFromString(initialHtml, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      root.select()
      $insertNodes(nodes)
    })
  }, [editor, initialHtml])

  return null
}
