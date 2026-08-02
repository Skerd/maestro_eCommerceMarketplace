import {CurrencySimpleSnippet} from "@coreModule/database/schemas/currency/currency.snippets";

export const ListingPackageSimpleSnippet = {
    keys: {
        _id: {},
        name: {},
        description: {},
        order: {},
        deliveryDays: {},
        price: {
            keys: {
                amount: {},
                currency: CurrencySimpleSnippet,
            },
        },
    },
};
