import type {HydratedDocument} from "mongoose";
import ProviderAvailability, {type IProviderAvailability} from "./providerAvailability";
import {getLogger, serverLogger} from "@coreModule/loggers/serverLog";
import {ICompany} from "@coreModule/database/schemas/company/company";
import {IUser} from "@coreModule/database/schemas/user/user";
import {demoSeedTag} from "@eCommerceMarketplaceModule/database/demo/demoSeed";

export type ProviderAvailabilitySeed = {
    seedKey: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
};

export const defaultProviderAvailabilitySeeds: readonly ProviderAvailabilitySeed[] = [
    {seedKey: "availability-monday", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "Europe/Tirane"},
    {seedKey: "availability-tuesday", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "Europe/Tirane"},
    {seedKey: "availability-wednesday", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", timezone: "Europe/Tirane"},
    {seedKey: "availability-thursday", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", timezone: "Europe/Tirane"},
    {seedKey: "availability-friday", dayOfWeek: 5, startTime: "09:00", endTime: "17:00", timezone: "Europe/Tirane"},
];

export type CreateProviderAvailabilitiesResult = {
    providerAvailabilities: HydratedDocument<IProviderAvailability>[];
    bySeedKey: Record<string, HydratedDocument<IProviderAvailability>>;
};

export async function createProviderAvailabilities(
    parentLogger: serverLogger,
    company: ICompany,
    provider: IUser,
): Promise<CreateProviderAvailabilitiesResult> {
    const logger = getLogger("mongoDbInitialization-createProviderAvailabilities", parentLogger);
    logger.start("Creating provider availability slots...");

    const providerAvailabilities: HydratedDocument<IProviderAvailability>[] = [];
    const bySeedKey: Record<string, HydratedDocument<IProviderAvailability>> = {};

    for (const seed of defaultProviderAvailabilitySeeds) {
        try {
            const seedTag = demoSeedTag(seed.seedKey);
            let existing = await ProviderAvailability.findOne({
                company: company._id,
                provider: provider._id,
                dayOfWeek: seed.dayOfWeek,
            });

            const payload = {
                provider: provider._id,
                company: company._id,
                dayOfWeek: seed.dayOfWeek,
                startTime: seed.startTime,
                endTime: seed.endTime,
                timezone: seed.timezone,
                createdBy: provider._id,
            };

            if (!existing) {
                existing = await ProviderAvailability.create(payload);
                logger.debug(`Successfully created availability slot (${seedTag})`);
            } else {
                existing.set(payload);
                await existing.save();
                logger.debug(`Availability slot (${seedTag}) already exists; updated fields`);
            }

            providerAvailabilities.push(existing);
            bySeedKey[seed.seedKey] = existing;
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            logger.err(`Error creating provider availability '${seed.seedKey}': ${message}`);
        }
    }

    if (providerAvailabilities.length === 0) {
        logger.fail("Failed to create provider availability slots!");
    } else {
        logger.finish("Finished creating provider availability slots!", providerAvailabilities.length);
    }

    return {providerAvailabilities, bySeedKey};
}
