import type {ViewConfig} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";

export const orderSheetView: ViewConfig = {
    model: "orders",
    viewType: "sheet",
    accessModel: "orders",
    apiUrl: "/api/eCommerceMarketplace/order",
    header: {
        titleField: "listing.title",
        subtitleKey: "order",
        showCloseButton: true,
    },
    nodes: [
        {
            render: "#SheetGroup",
            props: {title: "overview"},
            children: [
                {
                    render: "#SheetGrid",
                    props: {columns: 2},
                    children: [
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "status"},
                            field: {
                                name: "status",
                                widget: "#SmallInfoCard",
                                label: "status",
                                widgetProps: {icon: "#Tag", languageKeyCategory: "orderStatus"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "amount"},
                            field: {
                                name: "amount",
                                widget: "#SmallInfoCard",
                                label: "amount",
                                widgetProps: {
                                    icon: "#DollarSign",
                                    format: "locale",
                                    valuePath: ["currency.symbol", "amount"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "customer"},
                            field: {
                                name: "customer",
                                widget: "#SmallInfoCard",
                                label: "customer",
                                widgetProps: {
                                    icon: "#User",
                                    valuePath: ["customer.name", "customer.surname"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "provider"},
                            field: {
                                name: "provider",
                                widget: "#SmallInfoCard",
                                label: "provider",
                                widgetProps: {
                                    icon: "#User",
                                    valuePath: ["provider.name", "provider.surname"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "deliveryDueDate"},
                            field: {
                                name: "deliveryDueDate",
                                widget: "#SmallInfoCard",
                                label: "deliveryDueDate",
                                widgetProps: {icon: "#Calendar", format: "date"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "currency"},
                            field: {
                                name: "currency",
                                widget: "#SmallInfoCard",
                                label: "currency",
                                widgetProps: {
                                    icon: "#Coins",
                                    valuePath: ["currency.symbol", "currency.name"],
                                    joinSeparator: " ",
                                    linkedRefPath: "currency",
                                    linkedSheetModel: "currencies",
                                    linkedSheetWidget: "#CurrencySheetView",
                                    linkedSheetEntityProp: "currency",
                                    linkedSheetValueField: "name",
                                },
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "references"},
            children: [
                {
                    render: "#SheetGrid",
                    props: {columns: 2},
                    children: [
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "listing"},
                            field: {
                                name: "listing",
                                widget: "#SmallInfoCard",
                                label: "listingLabel",
                                widgetProps: {
                                    icon: "#Package",
                                    valuePath: ["listing.title"],
                                    linkedRefPath: "listing",
                                    linkedSheetModel: "listings",
                                    linkedSheetWidget: "#ListingSheetView",
                                    linkedSheetEntityProp: "listing",
                                    linkedSheetValueField: "title",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "taskRequest"},
                            field: {
                                name: "taskRequest",
                                widget: "#SmallInfoCard",
                                label: "taskRequest",
                                widgetProps: {
                                    icon: "#Briefcase",
                                    valuePath: ["taskRequest.title"],
                                    linkedRefPath: "taskRequest",
                                    linkedSheetModel: "taskRequests",
                                    linkedSheetWidget: "#TaskRequestSheetView",
                                    linkedSheetEntityProp: "entity",
                                    linkedSheetValueField: "title",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "bid"},
                            field: {
                                name: "bid",
                                widget: "#SmallInfoCard",
                                label: "bid",
                                widgetProps: {
                                    icon: "#FileText",
                                    valuePath: ["bid.name"],
                                    linkedRefPath: "bid",
                                    linkedSheetModel: "marketplacebids",
                                    linkedSheetWidget: "#BidSheetView",
                                    linkedSheetEntityProp: "bid",
                                    linkedSheetValueField: "name",
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const orderViews: ViewConfig[] = [orderSheetView];
