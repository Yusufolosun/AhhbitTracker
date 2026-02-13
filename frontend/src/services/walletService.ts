import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

export const walletService = {
  /**
   * Connect wallet
   */
  connect: (onFinish?: (payload: any) => void) => {
    showConnect({
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: (payload) => {
        if (onFinish) {
          onFinish(payload);
        }
      },
      userSession,
    });
  },

  /**
   * Disconnect wallet
   */
  disconnect: () => {
    userSession.signUserOut();
  },

  /**
   * Check if user is signed in
   */
  isSignedIn: (): boolean => {
    return userSession.isUserSignedIn();
  },

  /**
   * Get user address
   */
  getAddress: (): string | null => {
    if (!userSession.isUserSignedIn()) return null;
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.mainnet;
  },

  /**
   * Get user session
   */
  getUserSession: () => userSession,

  /**
   * Get network
   */
  getNetwork: () => network,
};
