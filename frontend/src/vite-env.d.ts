/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_STAGE?: 'development' | 'staging' | 'production';
	readonly VITE_STACKS_NETWORK?: 'mainnet' | 'testnet';
	readonly VITE_STACKS_API_URL?: string;
	readonly VITE_CONTRACT_ADDRESS?: string;
	readonly VITE_CONTRACT_NAME?: string;
	readonly VITE_APP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
