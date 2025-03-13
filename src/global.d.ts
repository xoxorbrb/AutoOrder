export {};

declare global {
  interface Window {
    electronAPI: {
      sendFormData: (formData: any) => void;
      exitApp: () => void;
      logMessage: (message: string) => void;
    };
  }
}
