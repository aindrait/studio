"use client";

import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function QuillEditor({ value, onChange }: QuillEditorProps) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    return (
        <ReactQuill
            value={value}
            onChange={onChange}
            theme="snow"
            modules={modules}
            placeholder="Write your module manual here..."
            className="h-full"
        />
    );
}
