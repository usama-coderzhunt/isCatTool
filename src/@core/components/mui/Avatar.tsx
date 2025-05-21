'use client'

// React Imports
import { forwardRef, useState, useEffect } from 'react'

// MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, styled } from '@mui/material/styles'
import type { AvatarProps } from '@mui/material/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
  size?: number
  onUpload?: (file: File) => void; // Callback for file upload
}

const AvatarContainer = styled('div')({
  position: 'relative',
  display: 'inline-block',
});

const Avatar = styled(MuiAvatar)<CustomAvatarProps>(({ skin, color, size = 40, theme }) => {
  return {
    ...(color &&
      skin === 'light' && {
        backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'light-static' && {
        backgroundColor: lighten(theme.palette[color as ThemeColor].main, 0.84),
        color: `var(--mui-palette-${color}-main)`
      }),
    ...(color &&
      skin === 'filled' && {
        backgroundColor: `var(--mui-palette-${color}-main)`,
        color: `var(--mui-palette-${color}-contrastText)`
      }),
    height: size, // Apply the height directly
    width: size,  // Apply the width directly
    borderRadius: '50%'
  }
});

const Overlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 1,
  },
});

const CustomAvatar = forwardRef<HTMLDivElement, CustomAvatarProps>((props: CustomAvatarProps, ref) => {
  const { color, skin = 'filled', size, onUpload, src, ...rest } = props; // Destructure src from props
  const [image, setImage] = useState<string | null>(null); // State to hold the uploaded image

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a URL for the uploaded image
      setImage(imageUrl); // Update the state with the image URL
      if (onUpload) {
        onUpload(file); // Call the upload callback
      }
    }
  };

  // Cleanup blob URL when the component unmounts or when a new image is uploaded
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return (
    <AvatarContainer>
      <Avatar
        color={color}
        skin={skin}
        ref={ref}
        src={image || src || undefined} // Use the uploaded image or the src from props
        size={size} // Ensure size is passed to the Avatar
        {...rest}
      >
        {!image && !src && ( // Show message if no image is uploaded and no src is provided
          <div className="flex flex-col items-center justify-center h-full hover:hidden">
            <i className='tabler-upload' />
          </div>
        )}
      </Avatar>
      <Overlay>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-logo"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-logo">
          <div className="flex hover:cursor-pointer items-center justify-center p-2 bg-opacity-70 rounded-full">
          <i className='tabler-upload text-white' />
          </div>
        </label>
      </Overlay>
    </AvatarContainer>
  );
});

export default CustomAvatar;
