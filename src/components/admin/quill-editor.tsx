
"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

// This is a workaround for the findDOMNode is not a function error
// See: https://github.com/zenoamaro/react-quill/issues/893
function Editor(props: QuillEditorProps) {
    const ReactQuill = useMemo(
        () => dynamic(() => import('react-quill'), { ssr: false }),
        []
    );

    return (
        <ReactQuill
            value={props.value}
            onChange={props.onChange}
            theme="snow"
            placeholder="Write your module manual here..."
            className="h-full"
        />
    );
}


export function QuillEditor(props: QuillEditorProps) {
    return <Editor {...props} />;
}
