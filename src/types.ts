export type Fetch = typeof globalThis.fetch;

export interface PaySharpConfig {
  token: string;
  baseUrl: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetch?: Fetch;
  userAgent?: string;
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface PaySharpEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaySharpErrorBody {
  code?: number;
  errorCode?: number | string;
  message?: string;
  [key: string]: unknown;
}

export type PaymentStatus = "PENDING" | "ON PROGRESS" | "SUCCESS" | "FAILED" | "EXPIRED";
export type RefundStatus = "PENDING" | "SUCCESS" | "FAILURE";

export interface OrderInput {
  orderId: string;
  amount: number;
  customerId: string;
  customerName?: string;
  customerMobileNo: string;
  customerEmail?: string;
  remarks: string;
}

export interface CollectRequestInput extends OrderInput { customerVPA: string; }

export interface OrderCreated extends OrderInput {
  paysharpReferenceNo: string;
  customerName: string;
  customerEmail: string;
}

export interface IntentOrder extends OrderCreated {
  intentUrl: string;
  phonepeUrl: string;
  gpayUrl: string;
}

export interface QrOrder extends OrderCreated { qrCode: string; }
export interface CollectOrder extends OrderCreated { customerVPA: string; }

export interface OrderStatus {
  orderId: string;
  customerId: string;
  customerVPA?: string;
  amount: number;
  fee?: number;
  tax?: number;
  totalFee?: number;
  netAmount?: number;
  paysharpReferenceNo: string;
  utrNumber?: string;
  transactionDate?: string | null;
  status: PaymentStatus;
  remarks: string;
  failureCode?: string;
  failureReason?: string;
  source?: string;
  linkPaymentId?: string;
}

export interface VpaValidation { isValid: boolean; customerVPA: string; customerName: string; }

export interface CreateRefundInput {
  paysharpReferenceNo: string;
  refundType: "FULL" | "PARTIAL";
  refundAmount?: number;
}

export interface RefundCreated extends CreateRefundInput { refundPaysharpReferenceNo: string; }
export interface RefundItem {
  refundPaysharpReferenceNo: string;
  refundType: "FULL" | "PARTIAL";
  refundAmount: number;
  fee?: number;
  tax?: number;
  totalFee?: number;
  refundUtrNumber?: string;
  refundDate?: string;
  mode: "UPI" | string;
  status: RefundStatus;
  isRecredited?: boolean;
}
export interface RefundHistory {
  orderId: string;
  customerId: string;
  paysharpReferenceNo: string;
  originalTransactionAmount: number;
  refunds: RefundItem[];
}
export interface RefundDetails extends RefundItem {
  orderId?: string;
  customerId?: string;
  paysharpReferenceNo: string;
  originalTransactionAmount?: number;
}

export interface CreateDisputeInput {
  complaintReceivedDate: string;
  holdAmount: number;
  complaintDetails: string;
  complaintReceivedFrom: string;
  paysharpRefNo?: string;
  complaintReceivedReferenceNo?: string;
  complaintEmail?: string;
  complaintContactNo?: string;
  city?: string;
  state?: string;
}
export interface Dispute extends CreateDisputeInput { holdId: string; complaintStatus: string; }

export interface CreatePaymentLinkInput {
  amount: number;
  remarks: string;
  validity: number;
  customerName: string;
  customerMobileNo: string;
  customerEmail?: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendWhatsApp?: boolean;
}
export interface PaymentLink {
  linkPaymentUrl: string;
  linkPaymentId: string;
  amount: number;
  fee?: number;
  tax?: number;
  totalFee?: number;
  netAmount?: number;
  paysharpReferenceNo?: string;
  utrNumber?: string;
  transactionDate?: string;
  status: "PENDING" | "SUCCESS" | "EXPIRED";
  remarks: string;
  validity: number;
  createdDate: string;
  expiredDate: string;
}
export interface ResendPaymentLinkInput {
  linkPaymentId: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendWhatsApp?: boolean;
}
export interface PaymentLinkResent extends Required<ResendPaymentLinkInput> { resentCount: number; }

export interface WhitelistedRemitter { accountName: string; accountNo: string; ifscCode: string; }
export interface CreateVirtualAccountInput {
  externalCustomerId: string;
  name?: string;
  mobileNo: string;
  email?: string;
  whitelistedRemitters?: WhitelistedRemitter[];
}
export interface UpdateVirtualAccountInput {
  name?: string;
  mobileNo: string;
  email?: string;
  whitelistedRemitters?: WhitelistedRemitter[];
}
export interface VirtualAccount {
  externalCustomerId: string;
  name: string;
  mobileNo: string;
  email: string;
  virtualAccountNo: string;
  ifscCode: string;
  beneficiaryName: string;
  bankName: string;
  whitelistedRemitters?: WhitelistedRemitter[];
}
export interface VirtualAccountTransaction {
  externalCustomerId: string;
  amount: number;
  fee: number;
  tax: number;
  totalFee: number;
  netAmount: number;
  paysharpReferenceNo: string;
  utrNumber: string;
  transactionDate: string;
  name: string;
  mobileNo: string;
  email: string;
  virtualAccountNo: string;
  ifscCode: string;
  beneficiaryName: string;
  bankName: string;
  remitterAccountNo?: string;
  remitterName?: string;
  remitterIfscCode?: string;
}

export interface Settlement {
  isSettlementFileReady: boolean;
  settlementProduct: "UPI" | "VIRTUAL_ACCOUNT" | string;
  settlementDate: string;
  settlementId: string;
  settlementAccountName: string;
  settlementAccountNo: string;
  settlementIFSCCode: string;
  settlementUTRNo: string;
  settlementMode: "NEFT" | "RTGS" | string;
  settlementStatus: "SUCCESS" | string;
  settlementAmount: number;
  totalTransactions: number;
  totalFee: number;
  totalTax: number;
  totalNetFee: number;
}
export interface SettlementFile { settlementId: string; isSettlementFileReady: boolean; settlementFileUrl?: string; }
export interface SettlementListItem {
  isSettlementFileReady: boolean;
  settlementDate: string;
  settlementId: string;
  settlementUTRNo: string;
  settlementStatus: "SUCCESS" | string;
  settlementAmount: number;
}

export interface PaymentWebhook extends OrderStatus { attemptCount: number; }
export interface RefundWebhook extends RefundDetails { attemptCount?: number; }
export interface SettlementWebhook extends Partial<Settlement> { settlementId: string; settlementDate: string; }
export interface VirtualAccountWebhook extends VirtualAccountTransaction { attemptCount: number; }
export type PaySharpWebhook = PaymentWebhook | RefundWebhook | SettlementWebhook | VirtualAccountWebhook;
