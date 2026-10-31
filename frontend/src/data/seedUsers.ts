// Pre-seeded Shopkeeper Accounts for Demonstration
// Enforces 100% strict data separation between independent merchants

import { BUSINESS_IDS } from './seedConstants';
import { UserAccount } from '../services/types';

export const SEED_USERS: UserAccount[] = [
  {
    id: 'usr_ramesh',
    name: 'Ramesh Patel',
    email: 'ramesh@lakshmikirana.in',
    phone: '9876543210',
    password: 'password123',
    businessIds: [BUSINESS_IDS.A_LAKSHMI_KIRANA],
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'usr_priya',
    name: 'Priya Sharma',
    email: 'priya@rangolibazaar.in',
    phone: '9823012345',
    password: 'password123',
    businessIds: [BUSINESS_IDS.B_RANGOLI_BAZAAR],
    createdAt: '2025-03-20T00:00:00Z',
  },
  {
    id: 'usr_sunita',
    name: 'Sunita Gupta',
    email: 'sunita@sunitavariety.in',
    phone: '9811098765',
    password: 'password123',
    businessIds: [BUSINESS_IDS.C_SUNITA_VARIETY],
    createdAt: '2025-05-10T00:00:00Z',
  },
];

