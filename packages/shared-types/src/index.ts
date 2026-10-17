/**
 * Mercadal Digital 360 — Shared Domain Types
 * Shared across Storefront B2C, Storefront B2B, and testing suites.
 */

export type BrandId = 'pampa_novus' | 'talabarteria_mercadal';

export type SalesChannelCode = 'sc_pampa_novus_b2c' | 'sc_talabarteria_b2b';

export interface VolumeTierPrice {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number; // in ARS cents or standard currency units
  currencyCode: 'ARS';
}

export interface MasterProductVariant {
  id: string;
  sku: string;
  title: string;
  barcode?: string;
  weight?: number; // in grams
  retailPrice: number; // Price in ARS for Pampa Novus (B2C)
  wholesalePriceBase: number; // Base price in ARS for Talabartería (B2B)
  wholesaleVolumeTier?: VolumeTierPrice;
  inventoryQuantity: number; // Digital shared inventory pool
}

export interface MasterProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  handle: string;
  salesChannels: SalesChannelCode[];
  variants: MasterProductVariant[];
  images: string[];
}

export interface B2BCompanyCustomer {
  customerId: string;
  companyId: string;
  role: 'admin' | 'buyer';
  spendingLimit?: number;
  status: 'active' | 'pending_approval' | 'rejected';
}

export interface B2BQuoteRequest {
  id: string;
  companyId: string;
  requesterCustomerId: string;
  status: 'draft' | 'pending_merchant' | 'pending_customer' | 'accepted' | 'rejected';
  items: Array<{
    sku: string;
    quantity: number;
    proposedUnitPrice?: number;
  }>;
  merchantNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Definition of the 10 PoC test products
 */
export interface PoCTestProductSeed {
  sku: string;
  title: string;
  initialStock: number;
  retailPriceARS: number;
  wholesaleBasePriceARS: number;
  wholesaleTierMinQty: number;
  wholesaleTierMaxQty?: number;
  wholesaleTierPriceARS: number;
}
