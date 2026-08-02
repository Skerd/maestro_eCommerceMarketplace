import { IProviderProfile } from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile";
import type { ProviderProfile } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto";
import {mapMedia, mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";
import {mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

export function providerProfileToDTO(
    profile: IProviderProfile | null,
    metrics?: { averageRating?: number; reviewCount?: number; completionRate?: number }
): ProviderProfile | null {
    if (!profile) return null;

    const portfolio = (profile.portfolio || []).map(mapMedia);
    const availability = (profile.availability || []).map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
    }));

    return {
        _id: profile._id?.toString?.(),
        user: mapPopulatedSimpleUser(profile.user),
        skills: profile.skills || [],
        bio: profile.bio,
        portfolio: portfolio.length ? portfolio : undefined,
        availability,
        averageRating: metrics?.averageRating,
        reviewCount: metrics?.reviewCount,
        completionRate: metrics?.completionRate,
        stripeAccountId: (profile as any).stripeAccountId || undefined,
        stripeChargesEnabled: !!(profile as any).stripeChargesEnabled,
        stripePayoutsEnabled: !!(profile as any).stripePayoutsEnabled,
        stripeDetailsSubmitted: !!(profile as any).stripeDetailsSubmitted,
        stripeAccountSyncedAt: (profile as any).stripeAccountSyncedAt
            ? new Date((profile as any).stripeAccountSyncedAt).toISOString()
            : undefined,
        ...mapLifeCycleToDTO(profile),
    };
}

export function providerProfilesToDTOArray(profiles: IProviderProfile[]): ProviderProfile[] {
    return profiles.map((profile) => providerProfileToDTO(profile)!).filter(Boolean);
}
