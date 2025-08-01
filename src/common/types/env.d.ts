namespace NodeJS {
  interface ProcessEnv {
    //Application
    PORT: number;
    //Database
    DB_PORT: number;
    DB_NAME: string;
    DB_HOST: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    //secrets
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    EMAIL_TOKEN_SECRET: string;
    PHONE_TOKEN_SECRET: string;
    //kavenegar
    SEND_SMS_URL: string;
    //google
    GOOGLE_CLIENT_ID: string;
    GOOGLE_SECRET_ID: string;
  }
}
