declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
    NODE_ENV: 'development' | 'production' | 'test';
    PROJECT_DOMAIN?: string;
    COZE_PROJECT_DOMAIN_DEFAULT?: string;
    DEPLOY_RUN_PORT?: string;
    TARO_APP_WEAPP_APPID?: string;
    TARO_APP_TT_APPID?: string;
    TARO_APP_TT_EMAIL?: string;
    TARO_APP_TT_PASSWORD?: string;
    PORT?: string;
  }
}
