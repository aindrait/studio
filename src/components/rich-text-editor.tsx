
"use client";

import React from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { quill, quillRef } = useQuill({
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link'],
            ['clean']
        ],
    },
    formats: [
        "bold", "italic", "underline", "strike",
        "list", "indent", 
        "link",
    ],
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
