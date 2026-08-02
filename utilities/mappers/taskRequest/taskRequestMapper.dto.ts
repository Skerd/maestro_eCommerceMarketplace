import { ITaskRequest } from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest";
import { TaskRequest } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto";
import {mapOwnershipToDTO, mapSoftDeleteToDTO, mapLifeCycleToDTO} from "@coreModule/utilities/mappers/plugin/pluginMappers.dto";
import {mapMedia, mapPopulatedRef, mapPopulatedSimpleCurrency, mapPopulatedUserWithPhoto,} from "@coreModule/utilities/mappers/common.mapper";

export function taskRequestToDTO(taskRequest: ITaskRequest, bidCount?: number): TaskRequest {
    return {
        _id: taskRequest._id.toString(),
        requester: mapPopulatedUserWithPhoto(taskRequest.requester),
        name: taskRequest.name,
        title: taskRequest.title,
        description: taskRequest.description,
        category: mapPopulatedRef(taskRequest.category),
        budgetMin: taskRequest.budgetMin,
        budgetMax: taskRequest.budgetMax,
        currency: mapPopulatedSimpleCurrency(taskRequest.currency),
        address: taskRequest.address ? {
            street: taskRequest.address?.street,
            postalCode: taskRequest.address?.postalCode,
            country: mapPopulatedRef(taskRequest.address?.country),
            state: taskRequest.address?.state ? mapPopulatedRef(taskRequest.address?.state) : undefined,
            city: mapPopulatedRef(taskRequest.address?.city),
            latitude: taskRequest.address?.latitude,
            longitude: taskRequest.address?.longitude
        }: undefined,
        expiresAt: taskRequest.expiresAt ? new Date(taskRequest.expiresAt).toISOString() : undefined,
        status: taskRequest.status,
        mainImage: taskRequest.mainImage ? mapMedia(taskRequest.mainImage) : undefined,
        imageGallery: !!taskRequest.imageGallery ? taskRequest.imageGallery?.map(mapMedia) : undefined,
        videoGallery: !!taskRequest.videoGallery ? taskRequest.videoGallery?.map(mapMedia) : undefined,
        bidCount,
        ...mapSoftDeleteToDTO(taskRequest),
        ...mapOwnershipToDTO(taskRequest),
        ...mapLifeCycleToDTO(taskRequest),
    };
}

export function taskRequestsToDTO(items: ITaskRequest[], bidCounts?: Map<string, number>): TaskRequest[] {
    return items.map((tr) => taskRequestToDTO(tr, bidCounts?.get(tr._id.toString())));
}
