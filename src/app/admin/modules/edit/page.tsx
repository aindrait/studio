"use client"; // Add this directive to make it a client component

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic for lazy loading

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import the styles

const EditModulePage = () => {
  const [editorContent, setEditorContent] = useState(''); // State to hold editor content

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <div className="p-4"> {/* Added some padding */}
      <h1 className="text-2xl font-bold mb-4">Edit Module Manual</h1> {/* Styled the heading */}
      <div className="h-96"> {/* Added a fixed height to the editor container */}
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
          theme="snow" // Use the 'snow' theme for a clean look
          placeholder="Write your module manual here..." // Add a placeholder
        />
      </div>
      {/* You can add a button here to save the content */}
      {/* <button onClick={() => console.log(editorContent)}>Save Content</button> */}
    </div>
  );
};

export default EditModulePage;