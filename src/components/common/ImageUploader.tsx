import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
interface ImageUploaderProps {
    onChange: (file: File | null) => void;
    value?: File | null | string;
    label?: string;
    error?: boolean;
    helperText?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onChange, value, label, error, helperText }) => {
    const { t } = useTranslation('global')
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (value) {
            if (value instanceof File) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(value);
            } else if (typeof value === 'string') {
                setPreviewUrl(value);
            }
        } else {
            setPreviewUrl(undefined);
        }
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onChange(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-sm font-medium mb-2 ${error ? 'text-red-500' : 'text-gray-700'}`}>
                    {label} <span className='text-red-500'>*</span>
                </label>
            )}
            <div
                className={`relative group cursor-pointer transition-all duration-300 bg-white w-full
                    border-2 rounded-lg ${error
                        ? 'border-red-500'
                        : 'border-gray-200 hover:border-primary focus-within:border-primary'}`}
                onClick={() => inputRef.current?.click()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
                {previewUrl ? (
                    <div className="relative h-[200px] overflow-hidden rounded-md">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain bg-gray-50"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center
                            bg-black/25 backdrop-blur-[1px]
                            transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="text-white text-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <div className="bg-white/30 p-2 rounded-full backdrop-blur-sm mb-2 inline-block 
                                    group-hover:bg-white/40 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-white/90">Click to change image</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[200px] border-2 border-dashed border-gray-300 rounded-md 
                        bg-gradient-to-b from-gray-50 to-white group-hover:from-gray-100 group-hover:to-gray-50 
                        transition-all duration-300">
                        <div className="h-full flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center 
                                group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-medium text-gray-700 mb-1">
                                    {t('imageUploader.selectFile')}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {t('imageUploader.dragDrop')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {helperText && (
                <p className={`mt-2 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default ImageUploader; 
