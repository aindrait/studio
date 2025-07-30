
"use client";

import React from 'react';
import { useQuill } from 'react-quilljs';
import ImageResize from 'quill-image-resize-module-ts';
import { FloatStyle } from 'quill-image-resize-module-ts';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { quill, quillRef, Quill } = useQuill({
    modules: {
        toolbar: [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
        imageResize: {
            modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
        }
    },
    formats: [
        "header", "font", "size",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "bullet", "indent", "align",
        "link", "image", "color", "background",
        "float", "height", "width"
    ],
    theme: 'snow'
  });

  React.useEffect(() => {
    if (Quill && !Quill.imports['modules/imageResize']) {
        Quill.register('modules/imageResize', ImageResize);
    }
     if (Quill && !Quill.imports['formats/float']) {
        Quill.register('formats/float', FloatStyle);
    }

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
  }, [quill, Quill, value, onChange]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={quillRef} />
    </div>
  );
}
