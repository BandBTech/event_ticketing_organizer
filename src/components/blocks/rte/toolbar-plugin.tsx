"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list"
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { $createParagraphNode, $getRoot } from "lexical"
import { useEffect, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  BoldIcon,
  Link as LinkIcon,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mergeRegister } from "@lexical/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUUpLeftIcon, ArrowUUpRightIcon, CodeBlockIcon, CodeIcon, LinkSimpleIcon, ListDashesIcon, ListNumbersIcon, QuotesIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, TextBolderIcon, TextHOneIcon, TextHTwoIcon, TextHThreeIcon, TextItalicIcon, TextStrikethroughIcon, TextTIcon, TextUnderlineIcon } from "@phosphor-icons/react"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState("paragraph")
  const [isLink, setIsLink] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"))
            setIsItalic(selection.hasFormat("italic"))
            setIsUnderline(selection.hasFormat("underline"))
            setIsStrikethrough(selection.hasFormat("strikethrough"))
            setIsCode(selection.hasFormat("code"))

            // Check if selection is on a link
            const node = selection.anchor.getNode()
            const parent = node.getParent()
            if ($isLinkNode(parent) || $isLinkNode(node)) {
              setIsLink(true)
            } else {
              setIsLink(false)
            }
          }
        })
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        1
      )
    )
  }, [editor])

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize))
        }
      })
    }
  }

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
    }
  }

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    }
  }

  return (
    <div className="flex items-center gap-1 border-b p-1 flex-wrap bg-gray-50">
      {/* Block Type Selector */}
      <Select value={blockType} onValueChange={(value) => {
        setBlockType(value)
        if (value === 'paragraph') formatParagraph()
        else if (value === 'h1') formatHeading('h1')
        else if (value === 'h2') formatHeading('h2')
        else if (value === 'h3') formatHeading('h3')
        else if (value === 'quote') formatQuote()
      }}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Normal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">
            <div className="flex items-center gap-2">
              <TextTIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>Paragraph</span>
            </div>
          </SelectItem>
          <SelectItem value="h1">
            <div className="flex items-center gap-2">
              <TextHOneIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>Heading 1</span>
            </div>
          </SelectItem>
          <SelectItem value="h2">
            <div className="flex items-center gap-2">
              <TextHTwoIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>Heading 2</span>
            </div>
          </SelectItem>
          <SelectItem value="h3">
            <div className="flex items-center gap-2">
              <TextHThreeIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>Heading 3</span>
            </div>
          </SelectItem>
          <SelectItem value="quote">
            <div className="flex items-center gap-2">
              <QuotesIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>Quote</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Formatting */}
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }}
        aria-label="Toggle bold"
      >
        <TextBolderIcon weight="bold" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }}
        aria-label="Toggle italic"
      >
        <TextItalicIcon weight="bold" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isUnderline}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
        }}
        aria-label="Toggle underline"
      >
        <TextUnderlineIcon weight="bold" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isStrikethrough}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }}
        aria-label="Toggle strikethrough"
      >
        <TextStrikethroughIcon weight="bold" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isCode}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
        }}
        aria-label="Toggle code"
      >
        <CodeIcon weight="bold" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link */}
      <Toggle
        size="sm"
        pressed={isLink}
        onPressedChange={() => {
          if (isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
          } else {
            setLinkDialogOpen(true)
          }
        }}
        aria-label="Insert link"
      >
        <LinkSimpleIcon weight="bold" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Alignment */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
        }}
        className="h-8 w-8 p-0"
        aria-label="Align left"
      >
        <TextAlignLeftIcon weight="bold" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
        }}
        className="h-8 w-8 p-0"
        aria-label="Align center"
      >
        <TextAlignCenterIcon weight="bold" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
        }}
        className="h-8 w-8 p-0"
        aria-label="Align right"
      >
        <TextAlignRightIcon weight="bold" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }}
        className="h-8 w-8 p-0"
        aria-label="Align justify"
      >
        <TextAlignJustifyIcon weight="bold" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
        aria-label="Bullet list"
      >
        <ListDashesIcon weight="bold" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
        aria-label="Numbered list"
      >
        <ListNumbersIcon weight="bold" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
        aria-label="Undo"
      >
        <ArrowUUpLeftIcon weight="bold" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
        aria-label="Redo"
      >
        <ArrowUUpRightIcon weight="bold" />
      </Button>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Enter the URL you want to link to
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleInsertLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLinkDialogOpen(false)
                setLinkUrl("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleInsertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function handleInsertLink() {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
      setLinkDialogOpen(false)
      setLinkUrl("")
    }
  }
}

