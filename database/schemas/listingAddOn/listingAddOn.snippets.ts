import {CurrencySimpleSnippet} from "@coreModule/database/schemas/currency/currency.snippets";

export const ListingAddOnSimpleSnippet = {
    keys: {
        _id: {},
        name: {},
        deliveryDays: {},
        price: {
            keys: {
                amount: {},
                currency: CurrencySimpleSnippet,
            },
        },
    },
};
