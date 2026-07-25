import {ObjectId} from "mongodb";
import {action} from "@coreModule/api/actionDecorator";
import {validateSingleForm} from "armonia/src/modules/core/utilities/zod/shared.validator";
import {extendOrderFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/extendOrder.form.validator";
import {submitOrderDeliveryFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/submitOrderDelivery.form.validator";
import {createOrderFromListingFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/createOrderFromListing.form.validator";
import {requestRevisionFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/requestRevision.form.validator";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import SchemaGuard from "@coreModule/database/security/schemaGuard";
import OrderDelivery from "@eCommerceMarketplaceModule/database/schemas/orderDelivery/orderDelivery";
import OrderRevision from "@eCommerceMarketplaceModule/database/schemas/orderRevision/orderRevision";
import {orderDeliveryService} from "@eCommerceMarketplaceModule/database/schemas/orderDelivery/orderDelivery.service";
import {orderRevisionService} from "@eCommerceMarketplaceModule/database/schemas/orderRevision/orderRevision.service";
import {disputeService} from "@eCommerceMarketplaceModule/database/schemas/dispute/dispute.service";
import {listingService} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.service";
import {listingPackageService} from "@eCommerceMarketplaceModule/database/schemas/listingPackage/listingPackage.service";
import {listingAddOnService} from "@eCommerceMarketplaceModule/database/schemas/listingAddOn/listingAddOn.service";
import {providerProfileService} from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile.service";
import {orderService} from "@eCommerceMarketplaceModule/database/schemas/order/order.service";
import {createEscrowHold, createEscrowRefund, createEscrowReleaseAndFee} from "@financeModule/utilities/escrowHelper";
import {emitNotificationEvent} from "@coreModule/domain/notifications/notificationEventBus";
import {NotificationEventCodes} from "@eCommerceMarketplaceModule/domain/notifications/notificationEventCodes";
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types";

const MAX_REVISIONS = 3;

export class OrderActions {
    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 20},
        transaction: true,
        schema: createOrderFromListingFormSchema,
    })
    async createFromListing(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, listingId, packageId, addOnIds, note} = params;

        logger.start(`Creating order from listing: ${listingId}...`);

        const listing = await listingService.findOneOrThrow(
            {_id: new ObjectId(listingId), status: "active", company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (listing as any).provider?._id || (listing as any).provider;
        if (providerId?.toString?.() === actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("provider_cannot_order_own_listing", null, null, languageCode);
        }

        let amount = (listing as any).price ?? 0;
        let currencyId = (listing as any).priceCurrency?._id || (listing as any).priceCurrency;
        let deliveryDays = (listing as any).deliveryDays ?? 1;

        if (packageId) {
            const pkg = await listingPackageService.findOneOrThrow(
                {_id: new ObjectId(packageId), listing: listing._id, company: company._id},
                {session, logger, languageCode},
            );
            amount = (pkg as any).price?.amount ?? amount;
            currencyId = (pkg as any).price?.currency?._id || (pkg as any).price?.currency || currencyId;
            deliveryDays = (pkg as any).deliveryDays ?? deliveryDays;
        }

        if (addOnIds?.length) {
            const addOns = await listingAddOnService.find(
                {_id: {$in: addOnIds.map((id: string) => new ObjectId(id))}, listing: listing._id, company: company._id},
                {session, logger, languageCode},
                null,
                "_id price deliveryDays",
            );
            for (const addOn of addOns) {
                amount += (addOn as any).price?.amount ?? 0;
                deliveryDays += (addOn as any).deliveryDays ?? 0;
            }
        }

        if (!currencyId) {
            throw apiValidationException("listing_has_no_currency", null, null, languageCode);
        }

        const deliveryDueDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);

        const order = await orderService.create(
            {
                listing: listing._id,
                customer: new ObjectId(actionUserCtx.userId),
                provider: providerId,
                amount,
                currency: currencyId,
                status: "pending",
                company: company._id,
                deliveryDueDate,
            } as any,
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const listingTitle = (listing as any).title ?? "";
        const providerIdStr = providerId?.toString?.() ?? "";

        if (providerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_CREATED_FROM_LISTING, {
                receiverIds: [providerIdStr],
                payload: {
                    companyId: company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    listingId: listing._id.toString(),
                    listingTitle,
                },
            });
        }

        logger.finish(`Successfully created order from listing: ${listingId}`);

        return {message: "Order created successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 30},
        transaction: true,
        schema: validateSingleForm,
    })
    async accept(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id} = params;

        logger.start(`Accepting order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        if (providerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_provider_can_accept", null, null, languageCode);
        }

        if ((order as any).status !== "pending") {
            throw apiValidationException("order_not_pending", null, null, languageCode);
        }

        await orderService.updateByIdOrThrow(
            order._id,
            {$set: {status: "accepted"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const orderAmount = typeof (order as any).amount === "number"
            ? (order as any).amount
            : parseFloat(String((order as any).amount || 0));
        const currencyId = (order as any).currency?._id || (order as any).currency;
        const companyId = (order as any).company?._id || (order as any).company;

        if (orderAmount > 0 && currencyId && companyId) {
            await createEscrowHold(order._id, orderAmount, currencyId, companyId, {session, logger, languageCode, auditUserId: actionUserCtx.userId});
        }

        const customerId = (order as any).customer?._id || (order as any).customer;
        const customerIdStr = customerId?.toString?.() ?? "";
        if (customerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_ACCEPTED, {
                receiverIds: [customerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                },
            });
        }

        logger.finish(`Successfully accepted order: ${_id}`);

        return {message: "Order accepted successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 30},
        transaction: true,
        schema: validateSingleForm,
    })
    async start(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id} = params;

        logger.start(`Starting order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        if (providerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_provider_can_start", null, null, languageCode);
        }

        if ((order as any).status !== "accepted") {
            throw apiValidationException("order_must_be_accepted_first", null, null, languageCode);
        }

        await orderService.updateByIdOrThrow(
            order._id,
            {$set: {status: "in_progress"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const customerId = (order as any).customer?._id || (order as any).customer;
        const customerIdStr = customerId?.toString?.() ?? "";
        const companyId = (order as any).company?._id || (order as any).company;
        if (customerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_STARTED, {
                receiverIds: [customerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                },
            });
        }

        logger.finish(`Successfully started order: ${_id}`);

        return {message: "Order started successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 30},
        transaction: true,
        schema: validateSingleForm,
    })
    async cancel(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id} = params;

        logger.start(`Cancelling order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        const customerId = (order as any).customer?._id || (order as any).customer;
        const isProvider = providerId?.toString?.() === actionUserCtx.userId?.toString?.();
        const isCustomer = customerId?.toString?.() === actionUserCtx.userId?.toString?.();

        if (!isProvider && !isCustomer) {
            throw apiValidationException("only_parties_can_cancel", null, null, languageCode);
        }

        const currentStatus = (order as any).status;
        if (currentStatus === "completed" || currentStatus === "cancelled") {
            throw apiValidationException("order_already_final", null, null, languageCode);
        }

        await orderService.updateByIdOrThrow(
            order._id,
            {$set: {status: "cancelled"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const orderAmount = typeof (order as any).amount === "number"
            ? (order as any).amount
            : parseFloat(String((order as any).amount || 0));
        const currencyId = (order as any).currency?._id || (order as any).currency;
        const companyId = (order as any).company?._id || (order as any).company;

        if (["accepted", "in_progress"].includes(currentStatus) && orderAmount > 0 && currencyId && companyId) {
            await createEscrowRefund(order._id, orderAmount, currencyId, companyId, {session, logger, languageCode, auditUserId: actionUserCtx.userId});
        }

        const cancelledBy = isProvider ? "provider" : "customer";
        const otherPartyId = isProvider
            ? (customerId?.toString?.() ?? "")
            : (providerId?.toString?.() ?? "");

        if (otherPartyId) {
            emitNotificationEvent(NotificationEventCodes.ORDER_CANCELLED, {
                receiverIds: [otherPartyId],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                    cancelledBy,
                },
            });
        }

        logger.finish(`Successfully cancelled order: ${_id}`);

        return {message: "Order cancelled successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 10},
        transaction: true,
        schema: extendOrderFormSchema,
    })
    async extend(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id, additionalDays} = params;

        logger.start(`Extending order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        if (providerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_provider_can_extend", null, null, languageCode);
        }

        const status = (order as any).status;
        if (status === "completed" || status === "cancelled") {
            throw apiValidationException("cannot_extend_final_order", null, null, languageCode);
        }

        const baseDate = (order as any).deliveryDueDate || (order as any).createdAt || new Date();
        const currentDue = baseDate instanceof Date ? baseDate : new Date(baseDate);
        const newDue = new Date(currentDue);
        newDue.setDate(newDue.getDate() + additionalDays);

        await orderService.updateByIdOrThrow(
            order._id,
            {$set: {deliveryDueDate: newDue}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const customerId = (order as any).customer?._id || (order as any).customer;
        const customerIdStr = customerId?.toString?.() ?? "";
        const companyId = (order as any).company?._id || (order as any).company;
        if (customerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_EXTENDED, {
                receiverIds: [customerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                    additionalDays,
                },
            });
        }

        logger.finish(`Successfully extended order: ${_id}`);

        return {message: "Order extended successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 20},
        transaction: true,
        schema: submitOrderDeliveryFormSchema,
    })
    async submitDelivery(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id, message, attachmentIds} = params;

        logger.start(`Submitting delivery for order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        if (providerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_provider_can_deliver", null, null, languageCode);
        }

        if ((order as any).status !== "in_progress") {
            throw apiValidationException("order_not_in_progress", null, null, languageCode);
        }

        const existingDelivery = await orderDeliveryService.findOne(
            {order: order._id, status: "submitted", company: company._id},
            {session, logger, languageCode},
        );
        if (existingDelivery) {
            throw apiValidationException("delivery_already_submitted", null, null, languageCode);
        }

        SchemaGuard.checkModelPermission(OrderDelivery, "create", actionUserCtx, languageCode);

        await orderDeliveryService.create(
            {
                order: order._id,
                company: company._id,
                message: message?.trim?.() || "",
                attachments: (attachmentIds || []).map((id: string) => new ObjectId(id)),
                status: "submitted",
            },
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const customerId = (order as any).customer?._id || (order as any).customer;
        const customerIdStr = customerId?.toString?.() ?? "";
        const companyId = (order as any).company?._id || (order as any).company;
        if (customerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_DELIVERY_SUBMITTED, {
                receiverIds: [customerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                },
            });
        }

        logger.finish(`Successfully submitted delivery for order: ${_id}`);

        return {message: "Delivery submitted successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 20},
        transaction: true,
        schema: validateSingleForm,
    })
    async acceptDelivery(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id} = params;

        logger.start(`Accepting delivery for order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
            "currency",
            "_id amount currency company status customer provider name",
        );

        const customerId = (order as any).customer?._id || (order as any).customer;
        if (customerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_customer_can_accept_delivery", null, null, languageCode);
        }

        if ((order as any).status !== "in_progress") {
            throw apiValidationException("order_not_in_progress", null, null, languageCode);
        }

        // Block acceptance if an open dispute exists
        const openDispute = await disputeService.findOne(
            {order: order._id, status: {$in: ["open", "under_review"]}, company: company._id},
            {session, logger, languageCode},
            null,
            "_id status",
        );
        if (openDispute) {
            throw apiValidationException("cannot_accept_delivery_with_open_dispute", null, null, languageCode);
        }

        const delivery = await orderDeliveryService.findOne(
            {order: order._id, status: "submitted", company: company._id},
            {session, logger, languageCode},
            null,
            "_id status",
        );
        if (!delivery) {
            throw apiValidationException("no_pending_delivery", null, null, languageCode);
        }

        await orderDeliveryService.updateByIdOrThrow(
            delivery._id,
            {$set: {status: "accepted"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        await orderService.updateByIdOrThrow(
            order._id,
            {$set: {status: "completed"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const orderAmount = typeof (order as any).amount === "number"
            ? (order as any).amount
            : parseFloat(String((order as any).amount || 0));
        const currencyId = (order as any).currency?._id || (order as any).currency;
        const companyId = (order as any).company?._id || (order as any).company;
        const releaseProviderId = (order as any).provider?._id || (order as any).provider;

        if (orderAmount > 0 && currencyId && companyId) {
            const providerStripeAccountId = releaseProviderId
                ? await providerProfileService.getPayoutAccountId(releaseProviderId, companyId, {session, logger, languageCode})
                : undefined;
            await createEscrowReleaseAndFee(
                order._id,
                orderAmount,
                currencyId,
                companyId,
                {session, logger, languageCode, auditUserId: actionUserCtx.userId},
                {providerStripeAccountId},
            );
        }

        const providerId = (order as any).provider?._id || (order as any).provider;
        const providerIdStr = providerId?.toString?.() ?? "";
        if (providerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_DELIVERY_ACCEPTED, {
                receiverIds: [providerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                },
            });
        }

        logger.finish(`Successfully accepted delivery for order: ${_id}`);

        return {message: "Order completed successfully"};
    }

    @action({
        auth: "private",
        rateLimit: {windowMs: 60000, max: 10},
        transaction: true,
        schema: requestRevisionFormSchema,
    })
    async requestRevision(params: Record<string, any>): Promise<ActionMessage> {
        const {logger, languageCode, session, company, actionUserCtx, _id, reason} = params;

        logger.start(`Requesting revision for order: ${_id}...`);

        const order = await orderService.findOneOrThrow(
            {_id: new ObjectId(_id), company: company._id},
            {session, logger, languageCode},
        );

        const customerId = (order as any).customer?._id || (order as any).customer;
        if (customerId?.toString?.() !== actionUserCtx.userId?.toString?.()) {
            throw apiValidationException("only_customer_can_request_revision", null, null, languageCode);
        }

        if ((order as any).status !== "in_progress") {
            throw apiValidationException("order_not_in_progress", null, null, languageCode);
        }

        const delivery = await orderDeliveryService.findOne(
            {order: order._id, status: "submitted", company: company._id},
            {session, logger, languageCode},
            null,
            "_id status",
        );
        if (!delivery) {
            throw apiValidationException("no_pending_delivery", null, null, languageCode);
        }

        const revisionCount = await orderRevisionService.count(
            {order: order._id, company: company._id},
            {session, logger, languageCode},
        );
        if (revisionCount >= MAX_REVISIONS) {
            throw apiValidationException("max_revisions_reached", null, null, languageCode);
        }

        SchemaGuard.checkModelPermission(OrderRevision, "create", actionUserCtx, languageCode);

        await orderDeliveryService.updateByIdOrThrow(
            delivery._id,
            {$set: {status: "revision_requested"}},
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        await orderRevisionService.create(
            {
                order: order._id,
                delivery: delivery._id,
                company: company._id,
                requestedBy: new ObjectId(actionUserCtx.userId),
                reason: reason.trim(),
                status: "pending",
            } as any,
            {session, logger, languageCode, auditUserId: actionUserCtx.userId},
        );

        const providerId = (order as any).provider?._id || (order as any).provider;
        const providerIdStr = providerId?.toString?.() ?? "";
        const companyId = (order as any).company?._id || (order as any).company;
        if (providerIdStr) {
            emitNotificationEvent(NotificationEventCodes.ORDER_REVISION_REQUESTED, {
                receiverIds: [providerIdStr],
                payload: {
                    companyId: companyId?.toString?.() ?? company._id.toString(),
                    languageCode,
                    orderId: order._id.toString(),
                    orderName: (order as any).name ?? "",
                    reason,
                },
            });
        }

        logger.finish(`Successfully requested revision for order: ${_id}`);

        return {message: "Revision requested successfully"};
    }
}
