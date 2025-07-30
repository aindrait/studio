
"use client";

import React from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }, { 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'header', 'blockquote', 'code-block',
  'list', 'indent',
  'direction', 'align',
  'link', 'image'
];


export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { quill, quillRef } = useQuill({
    modules: modules,
    formats: formats,
    theme: 'snow'
  });

  React.useEffect(() => {
    if (quill) {
      if (value && value !== quill.root.innerHTML) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }
      quill.on('text-change', (_delta, _oldDelta, source) => {
        if (source === 'user') {
            onChange(quill.root.innerHTML);
        }
      });
    }
  }, [quill, value, onChange]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={quillRef} />
    </div>
  );
}
