import * as Linking from 'expo-linking';
import { APP_LINK_SCHEME } from '@/core/config';
import { ContractCallPreview } from '@/core/types';
import {
  WalletInteractionState,
  WalletInteractionRouteParams,
  WalletPreviewLinkPayload,
  WalletReturnLinkPayload,
  WalletReturnStatus,
} from './types';

const PREVIEW_ROUTE = 'preview';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isContractCallPreview(value: unknown): value is ContractCallPreview {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const preview = value as Partial<ContractCallPreview>;

  return (
    typeof preview.contractAddress === 'string' &&
    typeof preview.contractName === 'string' &&
    typeof preview.functionName === 'string' &&
    isStringArray(preview.functionArgsHex) &&
    typeof preview.postConditionMode === 'string' &&
    isStringArray(preview.postConditions)
  );
}

function encodePayload<T extends object>(payload: T): string {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodePayload<T>(value: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

function buildDeepLink(path: string, queryParams: Record<string, string | undefined>): string {
  const baseUrl = Linking.createURL(path);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const serializedQuery = searchParams.toString();
  return serializedQuery ? `${baseUrl}?${serializedQuery}` : baseUrl;
}

export function buildWalletPreviewLink(preview: ContractCallPreview): string {
  return buildDeepLink(PREVIEW_ROUTE, {
    payload: encodePayload<WalletPreviewLinkPayload>({
      version: 1,
      preview,
    }),
  });
}

export function buildWalletReturnLink(
  txId: string,
  status: WalletReturnStatus,
  functionName?: ContractCallPreview['functionName'],
): string {
  return buildDeepLink(PREVIEW_ROUTE, {
    result: encodePayload<WalletReturnLinkPayload>({
      version: 1,
      txId,
      status,
      functionName,
    }),
  });
}

export function parseWalletInteractionState(url: string): WalletInteractionState | null {
  const parsed = Linking.parse(url);

  if (parsed.scheme && parsed.scheme !== APP_LINK_SCHEME && parsed.scheme !== 'exp') {
    return null;
  }

  const payloadValue = parsed.queryParams?.payload;
  if (typeof payloadValue === 'string') {
    const payload = decodePayload<WalletPreviewLinkPayload>(payloadValue);

    if (payload?.version === 1 && isContractCallPreview(payload.preview)) {
      return {
        preview: payload.preview,
        previewLink: url,
        returnLink: null,
        txId: null,
        status: null,
        functionName: payload.preview.functionName,
      };
    }
  }

  const resultValue = parsed.queryParams?.result;
  if (typeof resultValue === 'string') {
    const payload = decodePayload<WalletReturnLinkPayload>(resultValue);

    if (
      payload?.version === 1 &&
      typeof payload.txId === 'string' &&
      typeof payload.status === 'string'
    ) {
      return {
        preview: null,
        previewLink: null,
        returnLink: url,
        txId: payload.txId,
        status: payload.status,
        functionName: payload.functionName ?? null,
      };
    }
  }

  return null;
}

export function parseWalletInteractionParams(
  params: WalletInteractionRouteParams | undefined,
): WalletInteractionState | null {
  if (!params) {
    return null;
  }

  if (typeof params.payload === 'string') {
    const payload = decodePayload<WalletPreviewLinkPayload>(params.payload);

    if (payload?.version === 1 && isContractCallPreview(payload.preview)) {
      return {
        preview: payload.preview,
        previewLink: null,
        returnLink: null,
        txId: null,
        status: null,
        functionName: payload.preview.functionName,
      };
    }
  }

  if (typeof params.result === 'string') {
    const payload = decodePayload<WalletReturnLinkPayload>(params.result);

    if (
      payload?.version === 1 &&
      typeof payload.txId === 'string' &&
      typeof payload.status === 'string'
    ) {
      return {
        preview: null,
        previewLink: null,
        returnLink: null,
        txId: payload.txId,
        status: payload.status,
        functionName: payload.functionName ?? null,
      };
    }
  }

  return null;
}

export function hasWalletInteractionPayload(url: string): boolean {
  return parseWalletInteractionState(url) !== null;
}
