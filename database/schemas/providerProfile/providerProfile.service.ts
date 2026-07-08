/**
 * ProviderProfile Service
 *
 * CRUD service for ProviderProfile model.
 */

import { BaseCrudService } from "@coreModule/database/services/baseCrudService";
import ProviderProfile, {IProviderProfile} from "./providerProfile";

export class ProviderProfileService extends BaseCrudService<IProviderProfile, typeof ProviderProfile> {
    constructor() {
        super(ProviderProfile, "ProviderProfile");
    }
}

export const providerProfileService = new ProviderProfileService();
