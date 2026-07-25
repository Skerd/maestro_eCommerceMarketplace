import {ObjectId} from "mongodb";
import {type NotificationEvent, notificationEventBus, } from "@coreModule/domain/notifications/notificationEventBus";
import {NotificationEventCodes} from "@eCommerceMarketplaceModule/domain/notifications/notificationEventCodes";
import {createAndPushNotification} from "@coreModule/domain/notifications/notificationDomainService";
import {NotificationCategory} from "armonia/src/modules/core/api/user/private/notifications/notifications.enum";
import {NotificationImportance} from "@coreModule/database/schemas/notification/notification";

function langOpts(event: NotificationEvent) {
    return {languageCode: (event.payload.languageCode as string) ?? "en-US"};
}

export function registerECommerceNotificationHandlers(): void {
    notificationEventBus.on(NotificationEventCodes.BID_ACCEPTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);

        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.BID_ACCEPTED,
                        description: `Your bid has been accepted for: ${payload.taskRequestTitle as string}`,
                        content: {
                            bidId: payload.bidId,
                            taskRequestId: payload.taskRequestId,
                            taskRequestTitle: payload.taskRequestTitle,
                        },
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create BID_ACCEPTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.BID_REJECTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);

        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.BID_REJECTED,
                        description: `Your bid has been rejected for: ${payload.taskRequestTitle as string}`,
                        content: {
                            bidId: payload.bidId,
                            taskRequestId: payload.taskRequestId,
                            taskRequestTitle: payload.taskRequestTitle,
                        },
                        importance: NotificationImportance.MEDIUM,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create BID_REJECTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.TASK_REQUEST_CLOSED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.TASK_REQUEST_CLOSED,
                        description: `Task request has been closed: ${payload.taskRequestTitle as string}`,
                        content: {taskRequestId: payload.taskRequestId, taskRequestTitle: payload.taskRequestTitle},
                        importance: NotificationImportance.MEDIUM,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create TASK_REQUEST_CLOSED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_CREATED_FROM_LISTING, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_CREATED_FROM_LISTING,
                        description: `New order received for your listing: ${payload.listingTitle as string}`,
                        content: {orderId: payload.orderId, listingId: payload.listingId, listingTitle: payload.listingTitle},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_CREATED_FROM_LISTING notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_ACCEPTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_ACCEPTED,
                        description: `Your order has been accepted: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_ACCEPTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_STARTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_STARTED,
                        description: `Work has started on your order: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName},
                        importance: NotificationImportance.MEDIUM,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_STARTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_CANCELLED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_CANCELLED,
                        description: `Order has been cancelled: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName, cancelledBy: payload.cancelledBy},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_CANCELLED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_EXTENDED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_EXTENDED,
                        description: `Delivery deadline extended by ${payload.additionalDays as number} days for order: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName, additionalDays: payload.additionalDays},
                        importance: NotificationImportance.MEDIUM,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_EXTENDED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_DELIVERY_SUBMITTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_DELIVERY_SUBMITTED,
                        description: `Delivery submitted for your order: ${payload.orderName as string}. Please review and accept or request a revision.`,
                        content: {orderId: payload.orderId, orderName: payload.orderName},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_DELIVERY_SUBMITTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_DELIVERY_ACCEPTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_DELIVERY_ACCEPTED,
                        description: `Delivery accepted! Order completed: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_DELIVERY_ACCEPTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.ORDER_REVISION_REQUESTED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);
        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.ORDER_REVISION_REQUESTED,
                        description: `Revision requested for order: ${payload.orderName as string}`,
                        content: {orderId: payload.orderId, orderName: payload.orderName, reason: payload.reason},
                        importance: NotificationImportance.HIGH,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create ORDER_REVISION_REQUESTED notification for ${receiverId}:`, e);
            }
        }
    });

    notificationEventBus.on(NotificationEventCodes.TASK_REQUEST_CREATED, async (event: NotificationEvent) => {
        const {receiverIds, payload} = event;
        const opts = langOpts(event);

        for (const receiverId of receiverIds) {
            try {
                await createAndPushNotification(
                    {
                        receiver: new ObjectId(receiverId),
                        company: new ObjectId(payload.companyId as string),
                        code: NotificationEventCodes.TASK_REQUEST_CREATED,
                        description: `A new task request matching your listing has been posted: ${payload.taskRequestTitle as string}`,
                        content: {
                            taskRequestId: payload.taskRequestId,
                            taskRequestTitle: payload.taskRequestTitle,
                            categoryId: payload.categoryId,
                            cityId: payload.cityId,
                        },
                        importance: NotificationImportance.MEDIUM,
                        category: NotificationCategory.SYSTEM,
                    },
                    opts,
                );
            } catch (e) {
                console.error(`Failed to create TASK_REQUEST_CREATED notification for ${receiverId}:`, e);
            }
        }
    });
}
