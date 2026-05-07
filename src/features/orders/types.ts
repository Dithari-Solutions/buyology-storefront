export type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PACKAGING"
    | "IN_COURIER"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED"
    // Legacy values (kept so historical orders still render)
    | "PROCESSING"
    | "COURIER_ASSIGNED"
    | "PICKED_UP"
    | "SHIPPED";

export type DeliveryMethod = "EXPRESS" | "REGULAR";

export type ActorRole = "SYSTEM" | "ADMIN" | "COURIER";

export interface OrderSummary {
    id: string;
    userId: string;
    deliveryMethod: DeliveryMethod;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    countryCode: string;
    trackingCode: string | null;
    carrierName: string | null;
    recipientFirstName: string;
    recipientLastName: string;
    city: string;
    country: string;
    paidAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    variantId: string;
    storeId: string;
    productSku: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: string;
}

export interface TrackingEvent {
    id: string;
    status: OrderStatus;
    notes: string | null;
    latitude: number | null;
    longitude: number | null;
    locationDescription: string | null;
    proofImageUrl?: string | null;
    actorId: string;
    actorRole: ActorRole;
    createdAt: string;
}

export interface OrderDetail extends OrderSummary {
    authCredentialId: string;
    cartId: string;
    paymentTransactionId: string;
    deliveryOrderId: string | null;
    courierName?: string | null;
    courierPhone?: string | null;
    recipientPhone: string;
    addressLine1: string;
    addressLine2: string | null;
    state: string | null;
    postalCode: string | null;
    deliveryLatitude: number | null;
    deliveryLongitude: number | null;
    storeLatitude: number | null;
    storeLongitude: number | null;
    subtotal: number;
    shippingFee: number;
    discount: number;
    /** B2B credit applied to this order (in {@link creditCurrency}). */
    creditApplied?: number | null;
    creditCurrency?: string | null;
    couponCode: string | null;
    /** Human-readable estimate, e.g. "Within 30 minutes" or "2–3 business days" */
    estimatedDeliveryTime: string | null;
    shippedAt: string | null;
    cancelledAt: string | null;
    items: OrderItem[];
    trackingHistory: TrackingEvent[];
}

export type MessageType = "TEXT" | "CALL_START" | "CALL_END" | "CALL_REJECTED" | "CALL_MISSED";
export type SenderType = "CUSTOMER" | "COURIER";

export interface ChatMsg {
    messageId: string;
    deliveryOrderId: string;
    ecommerceOrderId: string;
    senderId: string;
    senderType: SenderType;
    messageType: MessageType;
    content: string;
    sentAt: string;
    deliveredAt: string | null;
    readAt: string | null;
}

export interface PaginatedChat {
    content: ChatMsg[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface CreateOrderPayload {
    cartId: string;
    addressId: string;
    deliveryMethod: DeliveryMethod;
    shippingFee?: number;
    couponCode?: string;
    notes?: string;
}

export interface PaginatedOrders {
    content: OrderSummary[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}
