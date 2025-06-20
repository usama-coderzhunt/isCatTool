import { CircularProgress } from '@mui/material';
import { Typography } from '@mui/material';
import CustomLogo from '@/@core/components/mui/LogoUpload';

interface LogoUploadWrapperProps {
  type: 'light_logo' | 'dark_logo' | 'favicon';
  title: string;
  imageUrl?: string;
  isLoading: boolean;
  isUploading: boolean;
  onUpload: (id: number, type: string, file: File) => void;
  logoId?: number;
}

const LogoUploadWrapper = ({ 
  type, 
  title,
  imageUrl,
  isLoading,
  isUploading,
  onUpload,
  logoId = 1
}: LogoUploadWrapperProps) => (
  <div className='flex flex-col items-center gap-4 mb-4'>
    <div className='relative'>
      {(isLoading || isUploading) && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg z-10'>
          <CircularProgress size={30} />
        </div>
      )}
      <CustomLogo 
        variant='rounded' 
        size={200}
        src={imageUrl}
        onUpload={(file) => {
          const formData = new FormData();
          const fileName = file.name || 'logo.png';
          const newFile = new File([file], fileName, { type: file.type });
          
          formData.append(type, newFile);
          onUpload(logoId, type, newFile);
        }}
        sx={{ 
          '& .MuiAvatar-img': {
            objectFit: 'none'
          },
          border: '2px solid #e0e0e0'
        }}
      />
    </div>
    <Typography variant='h6'>{title}</Typography>
  </div>
);

export default LogoUploadWrapper; 
