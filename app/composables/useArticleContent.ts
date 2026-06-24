import type { BlockList, SingleBlock, DoubleBlock, WysiwygContent } from '~/types/blocks'

export interface TocEntry {
  id: string
  label: string
  level: 2 | 3
}

function collectWysiwygHtml(blocks: BlockList): string[] {
  const parts: string[] = []
  for (const block of blocks) {
    if (block.layout === 'single') {
      const b = block as SingleBlock
      if (b.content.type === 'wysiwyg') parts.push((b.content as WysiwygContent).html)
    } else if (block.layout === 'double') {
      const b = block as DoubleBlock
      if (b.left.type === 'wysiwyg') parts.push((b.left as WysiwygContent).html)
      if (b.right.type === 'wysiwyg') parts.push((b.right as WysiwygContent).html)
    }
  }
  return parts
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractHeadingsAndInjectIds(htmlParts: string[]) {
  const toc: TocEntry[] = []
  const processedHtml = new Map<string, string>()
  const usedIds = new Set<string>()

  for (const html of htmlParts) {
    const processed = html.replace(
      /<(h[23])([^>]*)>(.*?)<\/\1>/gi,
      (_match, tag: string, attrs: string, content: string) => {
        const textContent = content
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&[a-z]+;/gi, '')
          .trim()
        if (!textContent) return `<${tag}${attrs}>${content}</${tag}>`

        let id = slugify(textContent)
        if (usedIds.has(id)) {
          let counter = 2
          while (usedIds.has(`${id}-${counter}`)) counter++
          id = `${id}-${counter}`
        }
        usedIds.add(id)

        const level = tag.toLowerCase() === 'h2' ? 2 : 3 as 2 | 3
        toc.push({ id, label: textContent, level })

        if (/id="[^"]*"/.test(attrs)) {
          attrs = attrs.replace(/id="[^"]*"/, `id="${id}"`)
        } else {
          attrs = ` id="${id}"${attrs}`
        }
        return `<${tag}${attrs}>${content}</${tag}>`
      },
    )
    processedHtml.set(html, processed)
  }

  return { toc, processedHtml }
}

export function useArticleContent(blocks: Ref<BlockList | null>) {
  const extracted = computed(() => {
    if (!blocks.value || blocks.value.length === 0) {
      return { toc: [] as TocEntry[], processedHtml: new Map<string, string>() }
    }
    const htmlParts = collectWysiwygHtml(blocks.value)
    return extractHeadingsAndInjectIds(htmlParts)
  })

  const toc = computed(() => extracted.value.toc)

  function getProcessedHtml(originalHtml: string): string {
    return extracted.value.processedHtml.get(originalHtml) ?? originalHtml
  }

  const readingTimeMinutes = computed(() => {
    if (!blocks.value || blocks.value.length === 0) return 0
    const allText = collectWysiwygHtml(blocks.value)
      .join(' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .trim()
    const wordCount = allText.split(/\s+/).filter(w => w.length > 0).length
    return Math.max(1, Math.round(wordCount / 200))
  })

  return { toc, getProcessedHtml, readingTimeMinutes }
}
