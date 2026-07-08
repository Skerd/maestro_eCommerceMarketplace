/**
 * ProviderAvailability Service
 *
 * CRUD service for ProviderAvailability model.
 */

import { BaseCrudService } from "@coreModule/database/services/baseCrudService";
import ProviderAvailability, {IProviderAvailability} from "./providerAvailability";

export class ProviderAvailabilityService extends BaseCrudService<IProviderAvailability, typeof ProviderAvailability> {
    constructor() {
        super(ProviderAvailability, "ProviderAvailability");
    }
}

export const providerAvailabilityService = new ProviderAvailabilityService();
