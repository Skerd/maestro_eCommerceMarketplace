import { IProviderProfile } from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile";
import type { ProviderProfile } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto";

function mapUserRef(user: any) {
    if (!user) return { _id: "", name: "", surname: "", fullName: "" };
    return {
        _id: (user._id ?? user)?.toString?.() ?? "",
        name: user.name,
        surname: user.surname,
        fullName: [user.name, user.surname].filter(Boolean).join(" ") || user.name || "",
    };
}

export function providerProfileToDTO(
    profile: IProviderProfile | null,
    metrics?: { averageRating?: number; reviewCount?: number; completionRate?: number }
): ProviderProfile | null {
    if (!profile) return null;

    const portfolio = (profile.portfolio || []).map((p: any) => ({
        _id: (p._id ?? p)?.toString?.(),
        url: p.url,
        originalName: p.originalName,
    }));

    return {
        _id: profile._id?.toString?.(),
        user: mapUserRef(profile.user),
        skills: profile.skills || [],
        bio: profile.bio,
        portfolio: portfolio.length ? portfolio : undefined,
        averageRating: metrics?.averageRating,
        reviewCount: metrics?.reviewCount,
        completionRate: metrics?.completionRate,
    };
}

export function providerProfilesToDTOArray(profiles: IProviderProfile[]): ProviderProfile[] {
    return profiles.map((profile) => providerProfileToDTO(profile)!).filter(Boolean);
}
