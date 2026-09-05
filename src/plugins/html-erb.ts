import type { Parser, Printer, SupportLanguage } from 'prettier'

interface HtmlErbNode {
  text: string
  start?: number
  end?: number
}

// Placeholder parser/printer so we can override it with the Tailwind CSS transformer
export const languages: SupportLanguage[] = [
  {
    name: 'html-erb',
    parsers: ['html-erb'],
    extensions: ['.html.erb'],
    vscodeLanguageIds: ['erb'],
  },
]

export const parsers: Record<string, Parser<HtmlErbNode>> = {
  'html-erb': {
    preprocess: (text) => text,
    parse: (text) => {
      return { text }
    },
    astFormat: 'html-erb-text',
    locStart: (node) => node.start ?? 0,
    locEnd: (node) => node.end ?? 0,
  },
}

export const printers: Record<string, Printer<HtmlErbNode>> = {
  'html-erb-text': {
    print: (path) => path.getValue().text,
  },
}
