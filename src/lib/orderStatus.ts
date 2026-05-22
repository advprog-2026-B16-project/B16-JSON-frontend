import type { OrderStatus } from '@/app/dashboard/orders/orderApi';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Waiting Payment',
  PAID: 'Paid',
  PURCHASED: 'Purchased',
  SHIPPED: 'On Delivery',
  COMPLETED: 'Delivered',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  PENDING: 'Waiting for the buyer to create or complete payment.',
  PAID: 'Payment is complete and the item is ready for Jastiper processing.',
  PURCHASED: 'The Jastiper has bought the item and is preparing shipment.',
  SHIPPED: 'The item is on the way to the buyer address.',
  COMPLETED: 'The item has been delivered. The buyer can confirm done or request refund before funds are released.',
  DONE: 'The buyer confirmed the order and escrow funds were released to the Jastiper.',
  CANCELLED: 'The order was cancelled and should not continue processing.',
};

export const ORDER_NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PURCHASED: 'Mark Purchased',
  SHIPPED: 'Mark Shipped',
  COMPLETED: 'Mark Delivered',
};
