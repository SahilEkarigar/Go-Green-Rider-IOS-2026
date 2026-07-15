import { PluginListenerHandle } from '@capacitor/core';

declare module '@capacitor-community/fcm' {
  export interface FCMPlugin {
    getToken(): Promise<{ token: string }>;
    deleteToken(): Promise<void>;
    subscribeTo({ topic }: { topic: string }): Promise<{ message: string }>;
    unsubscribeFrom({ topic }: { topic: string }): Promise<{ message: string }>;
    addListener(
      eventName: 'tokenRefreshed',
      listenerFunc: (data: { token: string }) => void,
    ): PluginListenerHandle;
  }
}
