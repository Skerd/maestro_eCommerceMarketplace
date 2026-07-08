import {IBooking} from "@eCommerceMarketplaceModule/database/schemas/booking/booking";
import type {Booking} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/booking/booking.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";

function mapUserRef(user: any) {
    if (!user) return undefined;
    return {
        _id: (user._id ?? user)?.toString?.(),
        name: user.name,
        fullName: [user.name, user.surname].filter(Boolean).join(" ") || user.name || "",
    };
}

export function bookingToDTO(b: IBooking | any): Booking {
    return {
        _id: b._id.toString(),
        order: b.order ? {_id: (b.order._id ?? b.order).toString(), status: b.order.status} : undefined,
        provider: mapUserRef(b.provider),
        startAt: b.startAt,
        endAt: b.endAt,
        timezone: b.timezone || "UTC",
        ...mapOwnershipToDTO(b),
        ...mapSoftDeleteToDTO(b),
    };
}

export function bookingsToDTOArray(bs: (IBooking | any)[]): Booking[] {
    return bs.map(bookingToDTO);
}

/** @deprecated Use bookingsToDTOArray */
export function bookingsToDTO(bs: (IBooking | any)[]): Booking[] {
    return bookingsToDTOArray(bs);
}
