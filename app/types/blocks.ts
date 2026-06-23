export interface WysiwygContent {
  type: 'wysiwyg'
  html: string
}

export interface ImageContent {
  type: 'image'
  url: string
  storagePath: string
  alt?: string
}

export interface GpxContent {
  type: 'gpx'
  url: string
  storagePath: string
  label?: string
}

// Un slot simple peut contenir wysiwyg, image ou gpx
export type SlotContent = WysiwygContent | ImageContent | GpxContent

export type DoubleSlotContent = WysiwygContent | ImageContent | GpxContent

export interface SingleBlock {
  id: string
  layout: 'single'
  content: SlotContent
}

export interface DoubleBlock {
  id: string
  layout: 'double'
  left: DoubleSlotContent
  right: DoubleSlotContent
}

export type Block = SingleBlock | DoubleBlock
export type BlockList = Block[]
