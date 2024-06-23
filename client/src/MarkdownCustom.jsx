import React from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'


const MarkdownCustom = ({val}) => {
  return (
    <ReactMarkdown remarkPlugins={remarkGfm}>{val}</ReactMarkdown>
  )
}

export default MarkdownCustom