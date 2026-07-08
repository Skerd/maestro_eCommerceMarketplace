import { Schema } from "mongoose";

export function applyListingPackageIndexes(ListingPackageSchema: Schema) {
    ListingPackageSchema.index({ company: 1, listing: 1 });
    ListingPackageSchema.index({ listing: 1, order: 1 });
}
