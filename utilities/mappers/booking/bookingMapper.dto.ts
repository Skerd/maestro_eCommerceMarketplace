import {IBooking} from "@eCommerceMarketplaceModule/database/schemas/booking/booking";
import type {Booking} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/booking/booking.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapPopulatedSimpleUser} from "@coreModule/utilities/mappers/common.mapper";

export function bookingToDTO(b: IBooking): Booking {
    return {
        _id: b._id.toString(),
        order: b.order ? {
            _id: b.order._id?.toString(),
            status: b.order.status
        } : undefined,
        provider: mapPopulatedSimpleUser(b.provider),
        startAt: b.startAt,
        endAt: b.endAt,
        timezone: b.timezone || "UTC",
        ...mapOwnershipToDTO(b),
        ...mapSoftDeleteToDTO(b),
        ...mapLifeCycleToDTO(b),
    };
}

export function bookingsToDTOArray(bs: (IBooking)[]): Booking[] {
    return bs.map(bookingToDTO);
}

/** @deprecated Use bookingsToDTOArray */
export function bookingsToDTO(bs: (IBooking)[]): Booking[] {
    return bookingsToDTOArray(bs);
}
