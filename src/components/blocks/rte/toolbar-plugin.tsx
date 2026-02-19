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
  ImageIcon,
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
import { INSERT_IMAGE_COMMAND } from "./images-plugin"
import { toast } from "sonner"
import { useLanguageStore } from "@/store/languageStore"
import { useTranslation } from "@/hooks/useTranslation"

const RTE_IMAGE_MAX_SIZE_MB = 1
const RTE_IMAGE_MAX_WIDTH = 1000
const RTE_IMAGE_MAX_HEIGHT = 1000
const RTE_IMAGE_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

export function ToolbarPlugin() {
  const { locale } = useLanguageStore()
  const { t } = useTranslation(locale)
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
              <span>{t("rte.toolbar.paragraph", "Paragraph")}</span>
            </div>
          </SelectItem>
          <SelectItem value="h1">
            <div className="flex items-center gap-2">
              <TextHOneIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>{t("rte.toolbar.heading_1", "Heading 1")}</span>
            </div>
          </SelectItem>
          <SelectItem value="h2">
            <div className="flex items-center gap-2">
              <TextHTwoIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>{t("rte.toolbar.heading_2", "Heading 2")}</span>
            </div>
          </SelectItem>
          <SelectItem value="h3">
            <div className="flex items-center gap-2">
              <TextHThreeIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>{t("rte.toolbar.heading_3", "Heading 3")}</span>
            </div>
          </SelectItem>
          <SelectItem value="quote">
            <div className="flex items-center gap-2">
              <QuotesIcon weight="bold" className="h-4 w-4 text-gray-500" />
              <span>{t("rte.toolbar.quote", "Quote")}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Formatting */}
      <Toggle
        type="button"
        size="sm"
        pressed={isBold}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }}
        aria-label={t("rte.toolbar.toggle_bold", "Toggle bold")}
      >
        <TextBolderIcon weight="bold" />
      </Toggle>
      <Toggle
        type="button"
        size="sm"
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }}
        aria-label={t("rte.toolbar.toggle_italic", "Toggle italic")}
      >
        <TextItalicIcon weight="bold" />
      </Toggle>
      <Toggle
        type="button"
        size="sm"
        pressed={isUnderline}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
        }}
        aria-label={t("rte.toolbar.toggle_underline", "Toggle underline")}
      >
        <TextUnderlineIcon weight="bold" />
      </Toggle>
      <Toggle
        type="button"
        size="sm" 
        pressed={isStrikethrough}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }}
        aria-label={t("rte.toolbar.toggle_strikethrough", "Toggle strikethrough")}
      >
        <TextStrikethroughIcon weight="bold" />
      </Toggle>
      <Toggle
        type="button"
        size="sm"
        pressed={isCode}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
        }}
        aria-label={t("rte.toolbar.toggle_code", "Toggle code")}
      >
        <CodeIcon weight="bold" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link */}
      <Toggle
        type="button"
        size="sm"
        pressed={isLink}
        onPressedChange={() => {
          if (isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
          } else {
            setLinkDialogOpen(true)
          }
        }}
        aria-label={t("rte.toolbar.insert_link", "Insert link")}
      >
        <LinkSimpleIcon weight="bold" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Alignment */}
      <Button
        type="button"
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
        type="button"
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
        type="button"
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
        type="button"
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
        type="button"
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
        type="button"
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

      {/* Image Upload */}
      <div className="relative">
        <input
          type="file"
          accept={RTE_IMAGE_ACCEPTED_TYPES.join(",")}
          className="hidden"
          id="rte-image-upload"
          onChange={(e) => {
            const file = e.target.files?.[0]
            // Reset so the same file can be re-selected
            e.target.value = ""
            if (!file) return

            // Validate file type
            if (!RTE_IMAGE_ACCEPTED_TYPES.includes(file.type)) {
              toast.error(t("rte.image.invalid_type", "Invalid image type. Please upload PNG, JPG, WebP, or GIF."))
              return
            }

            // Validate file size
            if (file.size > RTE_IMAGE_MAX_SIZE_MB * 1024 * 1024) {
              toast.error(t("rte.image.size_exceeded", `Image size exceeds ${RTE_IMAGE_MAX_SIZE_MB}MB limit.`, { value: RTE_IMAGE_MAX_SIZE_MB }))
              return
            }

            // Validate dimensions then insert
            const objectUrl = URL.createObjectURL(file)
            const img = new window.Image()
            img.onload = () => {
              URL.revokeObjectURL(objectUrl)
              if (img.width > RTE_IMAGE_MAX_WIDTH || img.height > RTE_IMAGE_MAX_HEIGHT) {
                toast.error(t("rte.image.dimensions_exceeded", `Image dimensions exceed ${RTE_IMAGE_MAX_WIDTH}×${RTE_IMAGE_MAX_HEIGHT}px.`, { width: RTE_IMAGE_MAX_WIDTH, height: RTE_IMAGE_MAX_HEIGHT }))
                return
              }
              // All checks passed — read and insert
              const reader = new FileReader()
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: file.name,
                    src: reader.result,
                    width: img.width,
                    height: img.height,
                  })
                }
              }
              reader.readAsDataURL(file)
            }
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl)
              toast.error(t("rte.image.failed_to_load", "Failed to load image. Please try a different file."))
            }
            img.src = objectUrl
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            document.getElementById("rte-image-upload")?.click()
          }}
          className="h-8 w-8 p-0"
          aria-label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo */}
      <Button
        type="button"
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
        type="button"
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
            <DialogTitle>{t("rte.toolbar.insert_link", "Insert Link")}</DialogTitle>
            <DialogDescription>
              {t("rte.toolbar.insert_link_description", "Enter the URL you want to link to")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">{t("rte.toolbar.url", "URL")}</Label>
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
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleInsertLink}>{t("rte.toolbar.insert_link", "Insert Link")}</Button>
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

