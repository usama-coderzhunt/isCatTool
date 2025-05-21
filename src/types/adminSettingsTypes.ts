export interface GeneralSettings {
    id: number;
    main_title: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface LogoSettings {
    id: number;
    light_logo: string;
    dark_logo: string;
    favicon: string;
  }
  
  export interface FinanceSettings {
    id: number;
    currency_name: string;
    currency_symbol: string;
    currency_code: string;
    // created_at: string;
    // updated_at: string;
    // created_by: number;
    // updated_by: number;
  }
  
  export interface APITokenSettings {
    id: number;
    twilio_sid: string;
    twilio_number: string;
    openai_key: string;
    google_api_key: string;
  }
  
  export interface SocialTrackingSettings {
    id: number;
    google_analytics_code: string;
    facebook_pixel_code: string;
  }
  
  export interface SocialLinkSettings {
    id: number;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    pinterest: string;
    tiktok: string;
    facebook_image: string | null;
    instagram_image: string | null;
    twitter_image: string | null;
    linkedin_image: string | null;
    youtube_image: string | null;
    pinterest_image: string | null;
    tik_tok_image: string | null;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    tiktok_image: string | null;
  }
  
  export interface SEOSettings {
    id: number;
    meta_title: string;
    tagline: string;
    meta_description: string;
    seo_keywords: string;
  }
  
  export interface PaymentSettings {
    id: number;
    client_id: string;
    client_secret: string;
    active: boolean;
    mode: 'sandbox' | 'live';
    webhook_id: string;
  }
  
  export interface FooterSettings {
    id: number;
    copyright_text: string;
    created_at: string;
    updated_at: string;
    created_by: number | null;
    updated_by: number | null;
  }
  
  // Add these interfaces
  export interface PayPalSettings {
    id: number;
    client_id: string;
    client_secret: string;
    active: boolean;
    paypal_mode: 'sandbox' | 'live';
    paypal_webhook_id: string;
  }
  
  export interface StripeSettings {
    id: number;
    publish_key: string;
    secret_key: string;
    active: boolean;
    stripe_mode: 'test' | 'live';
    stripe_webhook_secret: string;
    stripe_webhook_url: string;
    stripe_webhook_id: string;
  }
  
  export interface ManualPaymentSettings {
    id: number;
    name: string;
    instructions: string;
    active: boolean;
  }
  