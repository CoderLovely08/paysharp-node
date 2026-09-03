import { HttpClient, segment } from "./http.js";
import { maxLength, mobile, positive, required } from "./validation.js";
import type * as T from "./types.js";

function validateOrder(input: T.OrderInput): void {
  required(input.orderId, "orderId"); maxLength(input.orderId, 36, "orderId");
  positive(input.amount, "amount"); required(input.customerId, "customerId"); maxLength(input.customerId, 36, "customerId");
  required(input.customerMobileNo, "customerMobileNo"); mobile(input.customerMobileNo, "customerMobileNo");
  required(input.remarks, "remarks"); maxLength(input.remarks, 35, "remarks");
  maxLength(input.customerName, 100, "customerName"); maxLength(input.customerEmail, 100, "customerEmail");
}

export class UpiResource {
  constructor(private readonly http: HttpClient) {}
  createIntent(input: T.OrderInput, options?: T.RequestOptions) { validateOrder(input); return this.http.request<T.IntentOrder>({ method: "POST", path: "/order/intent", body: input, options }); }
  createQrCode(input: T.OrderInput, options?: T.RequestOptions) { validateOrder(input); return this.http.request<T.QrOrder>({ method: "POST", path: "/order/qrcode", body: input, options }); }
  createOfflineDynamicQr(input: T.OrderInput, options?: T.RequestOptions) { validateOrder(input); return this.http.request<T.QrOrder>({ method: "POST", path: "/order/dynamic-qrcode", body: input, options }); }
  createCollectRequest(input: T.CollectRequestInput, options?: T.RequestOptions) { validateOrder(input); required(input.customerVPA, "customerVPA"); maxLength(input.customerVPA, 255, "customerVPA"); return this.http.request<T.CollectOrder>({ method: "POST", path: "/order/request", body: input, options }); }
  getOrder(orderId: string, options?: T.RequestOptions) { required(orderId, "orderId"); return this.http.request<T.OrderStatus>({ method: "GET", path: `/order/${segment(orderId)}`, options }); }
  validateVpa(customerVPA: string, options?: T.RequestOptions) { required(customerVPA, "customerVPA"); return this.http.request<T.VpaValidation>({ method: "POST", path: "/vpa/validate", body: { customerVPA }, options }); }
}

export class RefundsResource {
  constructor(private readonly http: HttpClient) {}
  create(input: T.CreateRefundInput, options?: T.RequestOptions) {
    required(input.paysharpReferenceNo, "paysharpReferenceNo");
    if (input.refundType === "PARTIAL") positive(input.refundAmount!, "refundAmount");
    return this.http.request<T.RefundCreated>({ method: "POST", path: "/refunds", body: input, options });
  }
  list(paysharpReferenceNo: string, options?: T.RequestOptions) { return this.http.request<T.RefundHistory>({ method: "GET", path: `/refunds/${segment(paysharpReferenceNo)}`, options }); }
  get(paysharpReferenceNo: string, refundPaysharpReferenceNo: string, options?: T.RequestOptions) { return this.http.request<T.RefundDetails>({ method: "GET", path: `/refunds/${segment(paysharpReferenceNo)}/${segment(refundPaysharpReferenceNo)}`, options }); }
  createDispute(input: T.CreateDisputeInput, options?: T.RequestOptions) { positive(input.holdAmount, "holdAmount"); required(input.complaintReceivedDate, "complaintReceivedDate"); required(input.complaintDetails, "complaintDetails"); required(input.complaintReceivedFrom, "complaintReceivedFrom"); return this.http.request<T.Dispute>({ method: "POST", path: "/dispute", body: input, options }); }
  closeDispute(holdId: string, options?: T.RequestOptions) { required(holdId, "holdId"); return this.http.request<T.Dispute>({ method: "GET", path: `/close/${segment(holdId)}`, options }); }
}

export class PaymentLinksResource {
  constructor(private readonly http: HttpClient) {}
  create(input: T.CreatePaymentLinkInput, options?: T.RequestOptions) { positive(input.amount, "amount"); required(input.remarks, "remarks"); maxLength(input.remarks, 20, "remarks"); if (!Number.isInteger(input.validity) || input.validity < 1 || input.validity > 1440) throw new TypeError("validity must be an integer from 1 to 1440"); mobile(input.customerMobileNo, "customerMobileNo"); return this.http.request<T.PaymentLink>({ method: "POST", path: "/linkpayment", body: input, options }); }
  get(linkPaymentId: string, options?: T.RequestOptions) { return this.http.request<T.PaymentLink>({ method: "GET", path: `/linkpayment/${segment(linkPaymentId)}`, options }); }
  resend(input: T.ResendPaymentLinkInput, options?: T.RequestOptions) { if (!input.sendEmail && !input.sendSms && !input.sendWhatsApp) throw new TypeError("At least one resend channel must be true"); return this.http.request<T.PaymentLinkResent>({ method: "POST", path: "/linkpayment/resend", body: input, options }); }
}

export class VirtualAccountsResource {
  constructor(private readonly http: HttpClient) {}
  create(input: T.CreateVirtualAccountInput, options?: T.RequestOptions) { required(input.externalCustomerId, "externalCustomerId"); mobile(input.mobileNo); return this.http.request<T.VirtualAccount>({ method: "POST", path: "/customers", body: input, options }); }
  update(externalCustomerId: string, input: T.UpdateVirtualAccountInput, options?: T.RequestOptions) { mobile(input.mobileNo); return this.http.request<T.VirtualAccount>({ method: "PUT", path: `/customers/${segment(externalCustomerId)}`, body: input, options }); }
  get(externalCustomerId: string, options?: T.RequestOptions) { return this.http.request<T.VirtualAccount>({ method: "GET", path: `/customers/${segment(externalCustomerId)}`, options }); }
  deactivate(externalCustomerId: string, options?: T.RequestOptions) { return this.http.request<T.VirtualAccount>({ method: "DELETE", path: `/customers/${segment(externalCustomerId)}`, options }); }
  reactivate(externalCustomerId: string, options?: T.RequestOptions) { required(externalCustomerId, "externalCustomerId"); return this.http.request<T.VirtualAccount>({ method: "POST", path: "/customers/reactivate", body: { externalCustomerId }, options }); }
  getTransaction(paysharpReferenceNo: string, options?: T.RequestOptions) { return this.http.request<T.VirtualAccountTransaction>({ method: "GET", path: `/transactions/${segment(paysharpReferenceNo)}`, options }); }
}

export class SettlementsResource {
  constructor(private readonly http: HttpClient) {}
  get(settlementId: string, options?: T.RequestOptions) { return this.http.request<T.Settlement>({ method: "GET", path: `/settlements/${segment(settlementId)}`, options }); }
  getFile(settlementId: string, options?: T.RequestOptions) { return this.http.request<T.SettlementFile>({ method: "GET", path: `/settlements/${segment(settlementId)}/file`, options }); }
  listByDate(settlementDate: string, options?: T.RequestOptions) { return this.http.request<T.SettlementListItem[] | T.SettlementListItem>({ method: "GET", path: `/settlements/list/${segment(settlementDate)}`, options }); }
}
