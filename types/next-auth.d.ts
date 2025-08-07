import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      token?: string;
      stripeAccount?: string;
      logo?: string;
      widget_token?: string;
      tutorial_step: number;
      tutorial_complete: number;
      permissionChecks?: {
        teams?: {
          [key: string]: boolean;
        };
      };
    };
  }

  interface CredentialsInputs {
    email: string;
    password: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    user: {
      id?: any;
      email?: string;
      name?: string;
      token?: string;
      image?: string;
      stripeAccount?: string;
      admin?: boolean;
      logo?: string;
      shifts?: any;
      currentEmployee?: any;
      permissionChecks?: any;
      widget_token?: string;
    };
  }
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
