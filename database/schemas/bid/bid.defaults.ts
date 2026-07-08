import type {HydratedDocument} from "mongoose";
import Bid, {type IBid, type BidStatus} from "./bid";
import {getLogger, serverLogger} from "@coreModule/loggers/serverLog";
import {ICompany} from "@coreModule/database/schemas/company/company";
import {IUser} from "@coreModule/database/schemas/user/user";
import {ICurrency} from "@coreModule/database/schemas/currency/currency";
import {demoSeedName} from "@eCommerceMarketplaceModule/database/demo/demoSeed";
import type {CreateTaskRequestsResult} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.defaults";

export type BidSeed = {
    seedKey: string;
    taskRequestSeedKey: string;
    amount: number;
    proposal: string;
    deliveryDays: number;
    status: BidStatus;
};

export const defaultBidSeeds: readonly BidSeed[] = [
    {
        seedKey: "bid-01-mobile-app",
        taskRequestSeedKey: "task-01-mobile-app",
        amount: 3500,
        proposal: "I have 5 years of React Native experience and shipped two fitness apps. I can deliver in 6 weeks.",
        deliveryDays: 42,
        status: "pending",
    },
    {
        seedKey: "bid-02-social-graphics",
        taskRequestSeedKey: "task-02-social-graphics",
        amount: 150,
        proposal: "I can create 10 Instagram templates and 5 story frames in 1 week with two revision rounds.",
        deliveryDays: 7,
        status: "accepted",
    },
    {
        seedKey: "bid-03-ecommerce-setup",
        taskRequestSeedKey: "task-03-ecommerce-setup",
        amount: 1200,
        proposal: "Certified Shopify partner. I will configure payments, shipping zones, and a custom theme section library.",
        deliveryDays: 14,
        status: "pending",
    },
    {
        seedKey: "bid-04-seo-audit",
        taskRequestSeedKey: "task-04-seo-audit",
        amount: 280,
        proposal: "Full crawl, Core Web Vitals review, and a prioritized spreadsheet of fixes with effort estimates.",
        deliveryDays: 5,
        status: "pending",
    },
    {
        seedKey: "bid-05-product-video",
        taskRequestSeedKey: "task-05-product-video",
        amount: 950,
        proposal: "Includes script consultation, one shoot day, and two edit revisions with licensed music.",
        deliveryDays: 21,
        status: "rejected",
    },
    {
        seedKey: "bid-06-podcast-editing",
        taskRequestSeedKey: "task-06-podcast-editing",
        amount: 320,
        proposal: "Monthly retainer for four episodes with 48-hour turnaround and audiogram clips for social.",
        deliveryDays: 2,
        status: "pending",
    },
    {
        seedKey: "bid-07-business-plan",
        taskRequestSeedKey: "task-07-business-plan",
        amount: 650,
        proposal: "Former VC analyst. Deliverable includes 3-year model, TAM/SAM/SOM, and pitch deck outline.",
        deliveryDays: 10,
        status: "accepted",
    },
    {
        seedKey: "bid-08-wordpress-migration",
        taskRequestSeedKey: "task-08-wordpress-migration",
        amount: 880,
        proposal: "Migrate posts, authors, categories, and media with 301 redirect map and staging QA.",
        deliveryDays: 12,
        status: "pending",
    },
    {
        seedKey: "bid-09-brand-identity",
        taskRequestSeedKey: "task-09-brand-identity",
        amount: 520,
        proposal: "Three logo directions, palette, type pairings, and a 12-page mini brand book in PDF.",
        deliveryDays: 9,
        status: "pending",
    },
    {
        seedKey: "bid-10-data-dashboard",
        taskRequestSeedKey: "task-10-data-dashboard",
        amount: 420,
        proposal: "Looker Studio dashboard with Shopify + GA4 connectors, filters, and handoff documentation.",
        deliveryDays: 6,
        status: "rejected",
    },
];

export type CreateBidsResult = {
    bids: HydratedDocument<IBid>[];
    bySeedKey: Record<string, HydratedDocument<IBid>>;
};

export async function createBids(
    parentLogger: serverLogger,
    company: ICompany,
    bidder: IUser,
    currency: ICurrency,
    taskRequests: CreateTaskRequestsResult,
): Promise<CreateBidsResult> {
    const logger = getLogger("mongoDbInitialization-createBids", parentLogger);
    logger.start("Creating bids...");

    const bids: HydratedDocument<IBid>[] = [];
    const bySeedKey: Record<string, HydratedDocument<IBid>> = {};

    try {
        for (const seed of defaultBidSeeds) {
            const taskRequest = taskRequests.bySeedKey[seed.taskRequestSeedKey];
            if (!taskRequest) {
                logger.warn(`Skipping bid "${seed.seedKey}": task "${seed.taskRequestSeedKey}" not found`);
                continue;
            }

            let existing = await Bid.findOne({
                company: company._id,
                name: demoSeedName(seed.seedKey),
            });

            const payload = {
                name: demoSeedName(seed.seedKey),
                taskRequest: taskRequest._id,
                bidder: bidder._id,
                amount: seed.amount,
                currency: currency._id,
                proposal: seed.proposal,
                deliveryDays: seed.deliveryDays,
                status: seed.status,
                company: company._id,
                createdBy: bidder._id,
            };

            if (!existing) {
                existing = await Bid.create(payload);
                logger.debug(`Successfully created bid '${seed.seedKey}'`);
            } else {
                existing.set(payload);
                await existing.save();
                logger.debug(`Bid '${seed.seedKey}' already exists; updated fields`);
            }

            bids.push(existing);
            bySeedKey[seed.seedKey] = existing;
        }

        logger.finish("Finished creating bids!", defaultBidSeeds.length);
        return {bids, bySeedKey};
    }
    catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(e);
        logger.err(`Error creating bids: ${message}`);
        logger.fail("Failed to create bids!");
        return {bids: [], bySeedKey: {}};
    }
}
