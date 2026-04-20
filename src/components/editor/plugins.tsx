// import { useState } from "react"
import { useEffect } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  CONTROLLED_TEXT_INSERTION_COMMAND,
  PASTE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $getRoot,
} from "lexical"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ToolbarPlugin } from "./toolbar-plugin"
import ImagesPlugin from "./images-plugin"

function MaxLengthPlugin({ maxLength }: { maxLength: number }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const getCurrentLength = () =>
      $getRoot().getTextContent().replace(/\n/g, "").length

    const unregisterText = editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      () => getCurrentLength() >= maxLength,
      COMMAND_PRIORITY_CRITICAL,
    )

    const unregisterPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | null) => {
        const currentLength = getCurrentLength()
        if (currentLength >= maxLength) return true

        const pasteText = event?.clipboardData?.getData("text/plain") ?? ""
        const remaining = maxLength - currentLength
        if (pasteText.length <= remaining) return false

        // Truncate paste to fit within remaining budget
        editor.dispatchCommand(
          CONTROLLED_TEXT_INSERTION_COMMAND,
          pasteText.substring(0, remaining),
        )
        return true
      },
      COMMAND_PRIORITY_CRITICAL,
    )

    return () => {
      unregisterText()
      unregisterPaste()
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

export function Plugins({ placeholder = "Start typing ...", maxLength }: { placeholder?: string; maxLength?: number }) {


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
        {maxLength !== undefined && <MaxLengthPlugin maxLength={maxLength} />}
      </div>
    </div>
  )
}
