import { Schema } from "mongoose";

export function applyProviderAvailabilityIndexes(ProviderAvailabilitySchema: Schema): void {
    ProviderAvailabilitySchema.index({ provider: 1, company: 1, dayOfWeek: 1 });
    ProviderAvailabilitySchema.index({ company: 1 });
}
