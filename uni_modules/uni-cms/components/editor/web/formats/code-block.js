// 代码块格式定义
const Quill = window.Quill

const Block = Quill.import('blots/block');

export default function(Quill) {
  const CodeBlock = {}; // 定义代码块格式
  
  CodeBlock.blotName = 'code-block';
  CodeBlock.tagName = 'pre';
  CodeBlock.className = 'ql-code-block';
  
  CodeBlock.create = function(value) {
    const node = document.createElement('pre');
    node.setAttribute('class', 'ql-code-block');
    if (value) {
      node.classList.add(value);
    }
    return node;
  };
  
  CodeBlock.value = function(domNode) {
    return domNode.textContent;
  };
  
  return CodeBlock;
}