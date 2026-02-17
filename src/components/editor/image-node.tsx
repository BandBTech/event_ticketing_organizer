import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import {
  $applyNodeReplacement,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection"
import { mergeRegister } from "@lexical/utils"
import * as React from "react"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

export interface ImagePayload {
  altText: string
  caption?: string
  height?: number
  key?: NodeKey
  maxWidth?: number
  src: string
  width?: number
}

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createImageNode({ altText, height, src, width })
    return { node }
  }
  return null
}

export type SerializedImageNode = Spread<
  {
    altText: string
    caption?: string
    height?: number
    maxWidth?: number
    src: string
    width?: number
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string
  __altText: string
  __width: "inherit" | number
  __height: "inherit" | number
  __maxWidth: number

  static getType(): string {
    return "image"
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__key
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, maxWidth, src, width } = serializedNode
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
    })
    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img")
    element.setAttribute("src", this.__src)
    element.setAttribute("alt", this.__altText)
    if (this.__width !== "inherit") {
      element.setAttribute("width", this.__width.toString())
    }
    if (this.__height !== "inherit") {
      element.setAttribute("height", this.__height.toString())
    }
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span")
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    key?: NodeKey
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width || "inherit"
    this.__height = height || "inherit"
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: "image",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
    }
  }

  setWidthAndHeight(
    width: "inherit" | number,
    height: "inherit" | number
  ): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  decorate(): React.ReactNode {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
        />
      </Suspense>
    )
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, key)
  )
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode
}

// --------------- ImageComponent with Resize ---------------

type Direction = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

function ImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth,
  nodeKey,
}: {
  src: string
  altText: string
  width: "inherit" | number
  height: "inherit" | number
  maxWidth: number
  nodeKey: NodeKey
}) {
  const [editor] = useLexicalComposerContext()
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)

  // Local dimensions for live drag feedback (avoids editor.update during drag)
  const [localWidth, setLocalWidth] = useState<number | null>(null)
  const [localHeight, setLocalHeight] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Click to select
  const onClick = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node)
      ) {
        if (!event.shiftKey) {
          clearSelection()
        }
        setSelected(true)
        return true
      }
      return false
    },
    [clearSelection, setSelected]
  )

  // Delete on backspace/delete when selected
  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      const selection = $getSelection()
      if ($isNodeSelection(selection) && selection.has(nodeKey)) {
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if (node) {
          node.remove()
        }
        return true
      }
      return false
    },
    [nodeKey]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, onClick, onDelete])

  // Resize: use local state during drag, commit to editor on mouseup
  const onResizeStart = useCallback(
    (direction: Direction) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const img = imageRef.current
      if (!img) return

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = img.offsetWidth
      const startHeight = img.offsetHeight
      const aspectRatio = startWidth / startHeight

      setIsDragging(true)
      setLocalWidth(startWidth)
      setLocalHeight(startHeight)

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        let newWidth = startWidth
        let newHeight = startHeight

        if (direction.includes("e")) newWidth = Math.max(50, startWidth + dx)
        if (direction.includes("w")) newWidth = Math.max(50, startWidth - dx)
        if (direction.includes("s")) newHeight = Math.max(50, startHeight + dy)
        if (direction.includes("n")) newHeight = Math.max(50, startHeight - dy)

        // Maintain aspect ratio for corner handles
        if (direction.length === 2) {
          if (direction.includes("e") || direction.includes("w")) {
            newHeight = Math.round(newWidth / aspectRatio)
          } else {
            newWidth = Math.round(newHeight * aspectRatio)
          }
        }

        setLocalWidth(newWidth)
        setLocalHeight(newHeight)
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)

        // Commit final dimensions to the Lexical node
        const finalW = img.offsetWidth
        const finalH = img.offsetHeight

        setIsDragging(false)
        setLocalWidth(null)
        setLocalHeight(null)

        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            node.setWidthAndHeight(finalW, finalH)
          }
        })
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [editor, nodeKey]
  )

  const isFocused = isSelected || isDragging

  // During drag, use local dimensions; otherwise use node dimensions
  const displayWidth = localWidth ?? (width === "inherit" ? "auto" : width)
  const displayHeight = localHeight ?? (height === "inherit" ? "auto" : height)

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    background: "#3b82f6",
    border: "1px solid white",
    borderRadius: 2,
    zIndex: 10,
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        outline: isFocused ? "2px solid #3b82f6" : "none",
        outlineOffset: 2,
        userSelect: "none",
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={{
          display: "block",
          maxWidth: "100%",
          width: displayWidth,
          height: displayHeight,
          cursor: "default",
        }}
        draggable={false}
      />
      {isFocused && (
        <>
          {/* Corner handles */}
          <div
            onMouseDown={onResizeStart("nw")}
            style={{ ...handleStyle, top: -4, left: -4, cursor: "nw-resize" }}
          />
          <div
            onMouseDown={onResizeStart("ne")}
            style={{ ...handleStyle, top: -4, right: -4, cursor: "ne-resize" }}
          />
          <div
            onMouseDown={onResizeStart("sw")}
            style={{
              ...handleStyle,
              bottom: -4,
              left: -4,
              cursor: "sw-resize",
            }}
          />
          <div
            onMouseDown={onResizeStart("se")}
            style={{
              ...handleStyle,
              bottom: -4,
              right: -4,
              cursor: "se-resize",
            }}
          />
          {/* Edge handles */}
          <div
            onMouseDown={onResizeStart("n")}
            style={{
              ...handleStyle,
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "n-resize",
            }}
          />
          <div
            onMouseDown={onResizeStart("s")}
            style={{
              ...handleStyle,
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "s-resize",
            }}
          />
          <div
            onMouseDown={onResizeStart("w")}
            style={{
              ...handleStyle,
              top: "50%",
              left: -4,
              transform: "translateY(-50%)",
              cursor: "w-resize",
            }}
          />
          <div
            onMouseDown={onResizeStart("e")}
            style={{
              ...handleStyle,
              top: "50%",
              right: -4,
              transform: "translateY(-50%)",
              cursor: "e-resize",
            }}
          />
        </>
      )}
    </div>
  )
}
