import { useRecaptchaStore } from '@/store/recaptchaStore';
import React, { useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Recaptcha: React.FC = () => {
    const { setRecaptchaToken } = useRecaptchaStore();
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    const handleRecaptchaChange = (token: string | null) => {
        setRecaptchaToken(token);
    };

    if (!siteKey) return <div>Error: ReCAPTCHA site key is missing!</div>;

    return (
        <ReCAPTCHA
            sitekey={siteKey}
            onChange={handleRecaptchaChange}
        />
    );
};

export default Recaptcha;
