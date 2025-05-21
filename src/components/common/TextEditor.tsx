import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { useState, useEffect } from 'react';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface TextEditorProps {
    value?: string;
    onChange?: (value: string | null) => void;
    onBlur?: () => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    height?: string;
}

const TextEditor = ({
    value = '',
    onChange,
    onBlur,
    error = false,
    helperText,
    required = false,
    disabled = false,
    label,
    height
}: TextEditorProps) => {

    const [editorState, setEditorState] = useState(() => {
        if (value) {
            try {
                const contentState = convertFromRaw(JSON.parse(value));
                return EditorState.createWithContent(contentState);
            } catch {
                return EditorState.createWithContent(ContentState.createFromText(value));
            }
        }
        return EditorState.createEmpty();
    });

    useEffect(() => {
        try {
            const currentContent = editorState.getCurrentContent();
            const newContent = value
                ? convertFromRaw(JSON.parse(value))
                : ContentState.createFromText("");

            if (JSON.stringify(convertToRaw(currentContent)) !== JSON.stringify(convertToRaw(newContent))) {
                setEditorState(EditorState.createWithContent(newContent));
            }
        } catch {
            setEditorState(EditorState.createWithContent(ContentState.createFromText(value || '')));
        }
    }, [value]);


    const handleEditorStateChange = (newEditorState: EditorState) => {
        setEditorState(newEditorState);
        if (onChange) {
            const contentState = newEditorState.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            onChange(JSON.stringify(rawContent));
        }
    };


    const handleBlur = () => {
        const contentState = editorState.getCurrentContent();
        const plainText = contentState.getPlainText().trim();
        if (onChange) {
            if (!plainText) {
                onChange(null);
            }
        }
        if (onBlur) onBlur();
    };

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-sm font-normal mb-1 ${error ? 'text-red-500' : 'text-secondary'}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-[6px] overflow-hidden`}>
                <Editor
                    editorState={editorState}
                    toolbarClassName="toolbarClassName border-b border-gray-300"
                    wrapperClassName="wrapperClassName"
                    editorClassName={`editorClassName px-4 py-2 ${disabled ? 'bg-gray-100' : ''}`}
                    onEditorStateChange={handleEditorStateChange}
                    readOnly={disabled}
                    editorStyle={{ minHeight: height, maxHeight: height }}
                    onBlur={handleBlur}
                />
            </div>
            {helperText && (
                <p className={`mt-1 ml-[2px] text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    )
}

export default TextEditor
