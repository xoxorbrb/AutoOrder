export {};

declare global {
  interface Window {
    electronAPI: {
      sendFormData: (formData: any) => void;
      exitApp: () => void;
      logMessage: (message: string) => void;
      scrapeAndAutoInput: (data: any) => Promise<void>;
      stopScrapping: () => void;
      receiveLogMessage: (
        callback: (event: any, message: string) => void
      ) => void;
      onErrorSound: (callback: () => void) => void;
    };
  }
}
