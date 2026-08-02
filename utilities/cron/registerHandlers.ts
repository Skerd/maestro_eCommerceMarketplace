import {registerCronHandler} from "@coreModule/cronjobs/registry/handlerRegistry";
import {runOrderAutoComplete} from "@eCommerceMarketplaceModule/utilities/cronJobs/orderAutoCompleteJob";
import {runTaskRequestExpiry} from "@eCommerceMarketplaceModule/utilities/cronJobs/taskRequestExpiryJob";

const GLOBAL_CRON = {
    type: "cron" as const,
    timezone: "UTC",
    singleton: true,
    executionStrategy: "distributed" as const,
    scope: "global" as const,
};

export function registerECommerceMarketplaceCronHandlers(): void {
    registerCronHandler({
        code: "eCommerceMarketplace.orderAutoComplete",
        handler: async ctx => {
            await runOrderAutoComplete(ctx.logger);
        },
        version: "1",
        defaultJob: {
            name: "Order auto-complete",
            ...GLOBAL_CRON,
            cronExpression: "0 0 * * * *",
            priority: 20,
        },
    });

    registerCronHandler({
        code: "eCommerceMarketplace.taskRequestExpiry",
        handler: async ctx => {
            await runTaskRequestExpiry(ctx.logger);
        },
        version: "1",
        defaultJob: {
            name: "Task request expiry",
            ...GLOBAL_CRON,
            cronExpression: "0 0 * * * *",
            priority: 20,
        },
    });
}
