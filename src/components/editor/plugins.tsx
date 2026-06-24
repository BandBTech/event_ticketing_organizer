import { useEffect, useRef } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  RootNode,
} from "lexical"

import { $trimTextContentFromAnchor } from "@lexical/selection"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ToolbarPlugin } from "./toolbar-plugin"
import ImagesPlugin from "./images-plugin"

// Count characters the same way validation does: text content without newlines.
const $getTextLength = (): number =>
  $getRoot().getTextContent().replace(/\n/g, "").length

function MaxLengthPlugin({
  maxLength,
  onLengthChange,
}: {
  maxLength: number
  onLengthChange?: (length: number) => void
}) {
  const [editor] = useLexicalComposerContext()
  const onLengthChangeRef = useRef(onLengthChange)

  useEffect(() => {
    onLengthChangeRef.current = onLengthChange
  })

  useEffect(() => {
    // Atomic post-update enforcement via a RootNode transform. This runs
    // synchronously during the same update cycle as the change, so the
    // over-limit state is never committed or painted — handles typing, paste,
    // drag-drop, IME, and any other text-inserting command uniformly.
    const unregisterTransform = editor.registerNodeTransform(
      RootNode,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }

        const currentLength = $getTextLength()

        const delCount = currentLength - maxLength
        if (delCount <= 0) return

        // Trim the overflow characters backwards from the anchor (end of
        // the just-inserted content), keeping the portion that fits.
        $trimTextContentFromAnchor(editor, selection.anchor, delCount)
      },
    )

    // Report accurate length after every state commit so the UI counter
    // matches what the transform enforces.
    const unregisterListener = editor.registerUpdateListener(
      ({ editorState }) => {
        const length = editorState.read($getTextLength)
        onLengthChangeRef.current?.(length)
      },
    )

    return () => {
      unregisterTransform()
      unregisterListener()
    }
  }, [editor, maxLength])

  return null
}

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

const EMAIL_MATCHER =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text)
    if (match === null) {
      return null
    }
    const fullMatch = match[0]
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
    }
  },
  (text: string) => {
    const match = EMAIL_MATCHER.exec(text)
    if (match === null) {
      return null
    }
    const fullMatch = match[0]
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: `mailto:${fullMatch}`,
    }
  },
]

export function Plugins({
  placeholder = "Start typing ...",
  maxLength,
  onLengthChange,
}: {
  placeholder?: string
  maxLength?: number
  onLengthChange?: (length: number) => void
}) {
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      // setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative">
      <ToolbarPlugin />
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable placeholder={placeholder} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <HistoryPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <ImagesPlugin />
        {maxLength !== undefined && (
          <MaxLengthPlugin
            maxLength={maxLength}
            onLengthChange={onLengthChange}
          />
        )}
      </div>
    </div>
  )
}
