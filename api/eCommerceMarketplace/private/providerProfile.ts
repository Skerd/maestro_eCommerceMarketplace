import {ObjectId} from "mongodb";
import {createCrudRouter} from "@coreModule/api/crudRouterFactory";
import {apiValidationException} from "armonia/src/modules/core/helpers/exceptions";
import {createProviderProfileFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/createProviderProfile.form.validator";
import {editProviderProfileFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/editProviderProfile.form.validator";
import {providerProfileListFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfileList.form.validator";
import ProviderProfile from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile";
import {providerProfileService} from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile.service";
import {ProviderProfileActions} from "@eCommerceMarketplaceModule/database/schemas/providerProfile/providerProfile.actions";
import {
    providerProfileToDTO,
    providerProfilesToDTOArray,
} from "@eCommerceMarketplaceModule/utilities/mappers/providerProfile/providerProfileMapper.dto";
import {loadProviderProfileMetrics} from "@eCommerceMarketplaceModule/utilities/mappers/providerProfile/providerProfileMetrics";

export const basePath = "/api/eCommerceMarketplace/providerProfile";
export const {router} = createCrudRouter({
    collectionName: "providerprofiles",
    model: ProviderProfile,
    service: providerProfileService,
    entityName: "ProviderProfile",
    defaultSort: {createdAt: -1},
    listSchema: providerProfileListFormSchema,
    createSchema: createProviderProfileFormSchema,
    editSchema: editProviderProfileFormSchema,
    toDTO: (doc) => providerProfileToDTO(doc)!,
    toDTOArray: providerProfilesToDTOArray,
    toSelect: (docs) =>
        docs.map((doc) => {
            const user = doc.user as any;
            const label = [user?.name, user?.surname].filter(Boolean).join(" ") || user?.name || doc._id.toString();
            return {value: doc._id.toString(), label};
        }),
    documentFilter: async ({company, actionUserCtx, languageCode}) => {
        const base: Record<string, unknown> = {company: company._id};
        if (actionUserCtx?.isAdmin) {
            return base;
        }
        const userId = actionUserCtx?.userId;
        if (!userId) {
            throw apiValidationException("unauthorized", null, null, languageCode);
        }
        return {...base, user: new ObjectId(userId)};
    },
    extraListFilter: async ({actionUserCtx}) => {
        if (actionUserCtx?.isAdmin) {
            return {};
        }
        const userId = actionUserCtx?.userId;
        return userId ? {user: new ObjectId(userId)} : {};
    },
    buildCreateData: async ({skills, bio, portfolio, actionUserCtx, languageCode}) => {
        const userId = actionUserCtx?.userId;
        if (!userId) {
            throw apiValidationException("unauthorized", null, null, languageCode);
        }
        return {
            user: new ObjectId(userId),
            skills: skills ?? [],
            bio: bio?.trim() || "",
            portfolio: (portfolio ?? []).map((id: string) => new ObjectId(id)),
        };
    },
    buildUpdateData: async ({skills, bio, portfolio}, writeFields) => {
        const update: Record<string, unknown> = {};
        if (skills !== undefined && writeFields.skills) update.skills = skills;
        if (bio !== undefined && writeFields.bio) update.bio = bio?.trim() || "";
        if (portfolio !== undefined && writeFields.portfolio) {
            update.portfolio = portfolio.map((id: string) => new ObjectId(id));
        }
        return update;
    },
    enrichSingle: async (doc, params) => {
        const metrics = await loadProviderProfileMetrics(doc.user?._id ?? doc.user, params.company._id, params);
        return providerProfileToDTO(doc, metrics)!;
    },
    enrichUpdate: async (doc, params) => {
        const metrics = await loadProviderProfileMetrics(doc.user?._id ?? doc.user, params.company._id, params);
        return providerProfileToDTO(doc, metrics)!;
    },
    rateLimits: {read: 60, write: 30, delete: 20},
    // Stripe Connect onboarding: POST /api/eCommerceMarketplace/providerProfile/{createAccountLink|refreshAccountStatus}
    actions: ProviderProfileActions,
});
