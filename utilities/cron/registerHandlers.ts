import {registerCronHandler} from "@coreModule/cronjobs/registry/handlerRegistry";
import {runOrderAutoComplete} from "@eCommerceMarketplaceModule/utilities/cronJobs/orderAutoCompleteJob";
import {runTaskRequestExpiry} from "@eCommerceMarketplaceModule/utilities/cronJobs/taskRequestExpiryJob";

export function registerECommerceMarketplaceCronHandlers(): void {
    registerCronHandler({
        code: "eCommerce.orderAutoComplete",
        handler: async ctx => {
            await runOrderAutoComplete(ctx.logger);
        },
        version: "1",
    });

    registerCronHandler({
        code: "eCommerce.taskRequestExpiry",
        handler: async ctx => {
            await runTaskRequestExpiry(ctx.logger);
        },
        version: "1",
    });
}
