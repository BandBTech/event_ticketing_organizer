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
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
  RootNode,
} from "lexical"

import { $trimTextContentFromAnchor } from "@lexical/selection"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ToolbarPlugin } from "./toolbar-plugin"
import ImagesPlugin from "./images-plugin"

// Count characters the same way validation does: text content without newlines.
const $getTextLength = (): number =>
  $getRoot().getTextContent().replace(/\n/g, "").length

/**
 * Gets the number of characters that the current selection spans (to account
 * for the fact that selected text will be replaced by the paste).
 */
const $getSelectedTextLength = (): number => {
  const selection = $getSelection()
  if (!$isRangeSelection(selection) || selection.isCollapsed()) return 0
  return selection.getTextContent().replace(/\n/g, "").length
}

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
    // ── Paste interceptor ──────────────────────────────────────────────
    // Intercept paste at HIGH priority (before Lexical's default handler).
    // If the pasted content would exceed maxLength, we extract the plain
    // text from the clipboard, slice it to the remaining character budget,
    // and insert only that truncated portion. This gives a smooth UX
    // where partial paste is allowed up to exactly the limit.
    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event instanceof ClipboardEvent
          ? event.clipboardData
          : null

        if (!clipboardData) return false

        const pastedText = clipboardData.getData("text/plain")
        if (!pastedText) return false // let Lexical handle non-text pastes (images, etc.)

        // Calculate how many characters we can still accept
        const currentLength = editor.getEditorState().read($getTextLength)
        const selectedLength = editor.getEditorState().read($getSelectedTextLength)
        // Selected text will be replaced, so it frees up that many characters
        const effectiveLength = currentLength - selectedLength
        const remaining = maxLength - effectiveLength

        if (remaining <= 0) {
          // Already at or over the limit — block the paste entirely
          event.preventDefault()
          return true
        }

        // Strip newlines from pasted text to match our counting method
        const pastedClean = pastedText.replace(/\n/g, "")

        if (pastedClean.length <= remaining) {
          // The paste fits within budget — let Lexical handle it normally.
          // The RootNode transform below acts as a safety net.
          return false
        }

        // Paste would overflow — truncate to fit and insert manually
        event.preventDefault()

        // Take only `remaining` chars from the original pasted text
        // (preserving newlines in the slice for natural line breaks)
        let charsCollected = 0
        let cutIndex = 0
        for (let i = 0; i < pastedText.length && charsCollected < remaining; i++) {
          if (pastedText[i] !== "\n") {
            charsCollected++
          }
          cutIndex = i + 1
        }
        const truncated = pastedText.slice(0, cutIndex)

        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            selection.insertRawText(truncated)
          }
        })

        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    // ── Safety-net transform ───────────────────────────────────────────
    // Atomic post-update enforcement via a RootNode transform. This runs
    // synchronously during the same update cycle as the change, so the
    // over-limit state is never committed or painted — handles typing,
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
      unregisterPaste()
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
