// ShareService interface & Local implementation
// NOTE: In a future cloud architecture, a RemoteShareService would create cryptographic
// bearer tokens, store grants in Redis/DynamoDB with TTL, and enforce rate limits.

import { ShareGrant } from './types';
import { useArthSetuStore } from '../store/useArthSetuStore';

export interface CreateShareParams {
  sections: string[];
  durationDays: 7 | 30 | 90;
  recipientLabel: string;
}

export interface IShareService {
  createShare(params: CreateShareParams): Promise<ShareGrant>;
  getShareByToken(token: string): ShareGrant | undefined;
  listActiveShares(): ShareGrant[];
  revokeShare(token: string): Promise<void>;
  generateWhatsAppLink(token: string, recipientName?: string): string;
}

class LocalShareService implements IShareService {
  async createShare(params: CreateShareParams): Promise<ShareGrant> {
    const token = 'ashare_' + Math.random().toString(36).substring(2, 10);
    const now = new Date();
    const expires = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

    const grant: ShareGrant = {
      token,
      sections: params.sections,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      recipientLabel: params.recipientLabel || 'Financial Institution Officer',
    };

    useArthSetuStore.getState().addShareGrant(grant);
    return grant;
  }

  getShareByToken(token: string): ShareGrant | undefined {
    return useArthSetuStore.getState().shares.find((s) => s.token === token);
  }

  listActiveShares(): ShareGrant[] {
    const now = new Date().toISOString();
    return useArthSetuStore
      .getState()
      .shares.filter((s) => !s.revokedAt && s.expiresAt > now);
  }

  async revokeShare(token: string): Promise<void> {
    useArthSetuStore.getState().revokeShareGrant(token);
  }

  generateWhatsAppLink(token: string, recipientName?: string): string {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/institution/${token}`;
    const businessName = useArthSetuStore.getState().business.name;
    const greeting = recipientName ? `Namaste ${recipientName}, ` : 'Namaste, ';
    const text = encodeURIComponent(
      `${greeting}here is the Financial Visibility Passport for ${businessName} (provided voluntarily as supplementary information):\n\n${shareUrl}\n\nThis view shows our recorded sales, continuity, and evidence summary.`
    );
    return `https://wa.me/?text=${text}`;
  }
}

export const shareService: IShareService = new LocalShareService();

