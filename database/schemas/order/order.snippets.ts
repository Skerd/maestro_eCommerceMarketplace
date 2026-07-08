import {CurrencySimpleSnippet} from "@coreModule/database/schemas/currency/currency.snippets";
import {TaskRequestSimpleSnippet} from "@eCommerceMarketplaceModule/database/schemas/taskRequest/taskRequest.snippets";
import {ListingSimpleSnippet} from "@eCommerceMarketplaceModule/database/schemas/listing/listing.snippets";

export const OrderSimpleSnippet = {
    keys: {
        _id: {},
        status: {},
        amount: {},
    },
};

export const OrderWithTaskOrListingSnippet = {
    keys: {
        name: {},
        status: {},
        amount: {},
        currency: CurrencySimpleSnippet,
        taskRequest: TaskRequestSimpleSnippet,
        listing: ListingSimpleSnippet
    }
}