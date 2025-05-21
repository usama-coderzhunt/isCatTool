"use client"
// React Imports
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
import { FieldError, FieldErrorsImpl, Merge, UseFormRegisterReturn } from 'react-hook-form'

interface FileUploaderSingleProps {
    files: File[];
    setFiles: (files: File[]) => void;
    register?: UseFormRegisterReturn;
    resetFiles: () => void;
    errorMessage: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
    existingFile?: any;
    documentName?: string;
    isEditMode?: boolean;
}

const FileUploaderSingle: React.FC<FileUploaderSingleProps> = ({ files, setFiles, register, resetFiles, errorMessage, existingFile, documentName, isEditMode }) => {
    const { t } = useTranslation()

    // States
    const [localFiles, setLocalFiles] = useState<File[]>(files);
    const [isNewFileSelected, setIsNewFileSelected] = useState(false);

    useEffect(() => {
        if (existingFile && !files.length && !isNewFileSelected) {
            const fileWithName = {
                ...existingFile,
                name: documentName || 'Document',
                isExisting: true
            };
            setLocalFiles([fileWithName]);
        } else {
            setLocalFiles(files);
        }
    }, [files, existingFile, documentName, isNewFileSelected]);

    // Hooks
    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        maxSize: 5 * 1024 * 1024,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg"],
            "application/pdf": [".pdf"],
            "application/msword": [".doc", ".docx"],
        },
        onDrop: (acceptedFiles) => {
            const newFiles = acceptedFiles.map((file) => Object.assign(file));
            setLocalFiles(newFiles);
            setFiles(newFiles);
            setIsNewFileSelected(true);
        },
    })

    const removeFile = (fileName: string) => {
        const filteredFiles = localFiles.filter(file => file.name !== fileName);
        setLocalFiles(filteredFiles);
        setFiles(filteredFiles);
        setIsNewFileSelected(false);
    };

    const getDisplayName = (file: any) => {
        if (isEditMode) {
            if (isNewFileSelected) {
                return file.name;
            }
            return documentName || 'Document';
        }
        return file.name;
    };

    return (
        <Box {...getRootProps({ className: "dropzone" })} sx={{ height: "auto" }}>
            <input id='fileUpload' type='file' {...register} {...getInputProps()} />
            {localFiles.length ? (
                localFiles.map((file: any) => (
                    <div className='w-full p-3 border border-solid border-[#e0e0e0] rounded-lg flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-200'>
                        <div className='flex items-center gap-2'>
                            <i className="tabler-file text-primary text-base" />
                            <Typography variant="body2" className="text-textPrimary truncate max-w-[200px]">
                                {getDisplayName(file)}
                            </Typography>
                        </div>
                        {!isEditMode && !file.isExisting && (
                            <span
                                className='w-6 h-6 bg-transparent flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-200 transition-colors duration-200'
                                onClick={(e) => { e.stopPropagation(); removeFile(file.name); resetFiles() }}
                            >
                                <i className="tabler-x text-[12px] text-gray-500" />
                            </span>
                        )}
                    </div>
                ))
            ) : (
                <>
                    <div className="flex items-center flex-col p-3 border-2 border-dashed border-[#e0e0e0] rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <Avatar variant="rounded" className="bs-10 is-10 mbe-1 bg-primaryLighter">
                            <i className="tabler-upload text-primary text-base" />
                        </Avatar>
                        <Typography className='text-textPrimary text-center text-sm'>
                            {t('documents.selectFile')}
                            <span className="text-red-500 ml-1">*</span>
                        </Typography>
                    </div>
                    {errorMessage && (
                        <span className="text-[#ff4c51] text-[12px] leading-[12px] mt-1 font-normal">
                            {String(errorMessage)}
                        </span>
                    )}
                </>
            )}
        </Box>
    )
}

export default FileUploaderSingle
