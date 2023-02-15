import prettier from 'prettier'
import parserBabel from 'prettier/parser-babel'
import parserPostCss from 'prettier/parser-postcss'
import parserHtml from 'prettier/parser-html'

export default function codePrettier (content: string) {
  return prettier.format(content, { parser: 'babel', plugins: [parserBabel] })
}