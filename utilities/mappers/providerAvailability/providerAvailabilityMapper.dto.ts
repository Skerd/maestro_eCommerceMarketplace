import { IProviderAvailability } from "@eCommerceMarketplaceModule/database/schemas/providerAvailability/providerAvailability";
import type { ProviderAvailability } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.dto";

function mapUserRef(user: any) {
    if (!user) return undefined;
    return {
        _id: (user._id ?? user)?.toString?.(),
        name: user.name,
        fullName: [user.name, user.surname].filter(Boolean).join(" ") || user.name || "",
    };
}

export function providerAvailabilityToDTO(av: IProviderAvailability | any): ProviderAvailability {
    return {
        _id: av._id.toString(),
        provider: mapUserRef(av.provider),
        dayOfWeek: av.dayOfWeek,
        startTime: av.startTime,
        endTime: av.endTime,
        timezone: av.timezone || "UTC",
    };
}

export function providerAvailabilitiesToDTO(avs: IProviderAvailability[]): ProviderAvailability[] {
    return avs.map(providerAvailabilityToDTO);
}
