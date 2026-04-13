import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAppStateContext } from '@/app/state';
import { parseWalletInteractionState } from './linking';

export function useWalletDeepLinking() {
  const { setPreview, setWalletInteraction } = useAppStateContext();

  useEffect(() => {
    let isMounted = true;

    const handleUrl = (url: string) => {
      const walletInteraction = parseWalletInteractionState(url);

      if (!walletInteraction) {
        return;
      }

      setWalletInteraction(walletInteraction);

      if (walletInteraction.preview) {
        setPreview(walletInteraction.preview);
      }
    };

    const hydrateFromInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (!isMounted || !initialUrl) {
        return;
      }

      handleUrl(initialUrl);
    };

    void hydrateFromInitialUrl();

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [setPreview, setWalletInteraction]);
}
