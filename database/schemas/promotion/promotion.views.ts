import type {ViewConfig} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";
import {lifecycleSheetGroup} from "@coreModule/database/schemas/shared/lifecycleSheetGroup";

export const promotionSheetView: ViewConfig = {
    model: "promotions",
    viewType: "sheet",
    accessModel: "promotions",
    apiUrl: "/api/eCommerceMarketplace/promotion",
    header: {
        titleField: "name",
        subtitleKey: "promotion",
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
                            permissions: {read: "name"},
                            field: {
                                name: "name",
                                widget: "#SmallInfoCard",
                                label: "name",
                                widgetProps: {icon: "#Tag"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "listing"},
                            field: {
                                name: "listing",
                                widget: "#SmallInfoCard",
                                label: "listing",
                                widgetProps: {
                                    icon: "#LayoutList",
                                    parent: "listing",
                                    valuePath: ["name", "status"],
                                    joinSeparator: " · ",
                                    languageKeyCategoriesByPath: {status: "listingStatus"},
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
                            permissions: {read: "type"},
                            field: {
                                name: "type",
                                widget: "#SmallInfoCard",
                                label: "type",
                                widgetProps: {
                                    icon: "#Tag",
                                    languageKeyCategory: "type_values",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "lifecycleStatus"},
                            field: {
                                name: "lifecycleStatus",
                                widget: "#SmallInfoCard",
                                label: "lifecycleStatus",
                                widgetProps: {
                                    icon: "#PlayerPause",
                                    languageKeyCategory: "lifecycleStatuses",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "startAt"},
                            field: {
                                name: "startAt",
                                widget: "#SmallInfoCard",
                                label: "startAt",
                                widgetProps: {icon: "#Calendar"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "endAt"},
                            field: {
                                name: "endAt",
                                widget: "#SmallInfoCard",
                                label: "endAt",
                                widgetProps: {icon: "#Calendar"},
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "stopReasonSection"},
            dependent: "stopReason",
            permissions: {read: "stopReason"},
            children: [
                {
                    render: "div",
                    props: {className: "p-2 rounded-lg bg-muted/30 border border-border/50"},
                    children: [
                        {
                            render: "#ExpandableText",
                            permissions: {read: "stopReason"},
                            field: {
                                name: "stopReason",
                                widget: "#ExpandableText",
                                label: "stopReason",
                                widgetProps: {className: "text-sm", maxLength: 400},
                            },
                        },
                    ],
                },
            ],
        },
        lifecycleSheetGroup,
    ],
};

const promotionFormFields: ViewConfig["nodes"] = [
    {
        render: "#FormGrid",
        props: {columns: 2},
        children: [
            {
                render: "#Field",
                field: {
                    name: "listing",
                    widget: "#ApiSelect",
                    label: "form.listingLabel",
                    placeholder: "form.listingPlaceholder",
                    required: true,
                    widgetProps: {
                        apiUrl: "/api/eCommerceMarketplace/listing/select",
                        postBody: {activeOnly: true},
                    },
                },
            },
            {
                render: "#Field",
                field: {
                    name: "type",
                    widget: "#SimpleSelect",
                    label: "form.promotionTypeLabel",
                    placeholder: "form.promotionTypePlaceholder",
                    required: true,
                    widgetProps: {
                        options: [
                            {value: "featured", label: "form.promotionTypeFeatured"},
                            {value: "sponsored", label: "form.promotionTypeSponsored"},
                        ],
                        className: "grow w-full",
                    },
                },
            },
            {
                render: "#Field",
                field: {
                    name: "startAt",
                    widget: "#DateInput",
                    label: "form.startAtLabel",
                    placeholder: "form.startAtPlaceholder",
                    required: true,
                    widgetProps: {valueFormat: "yyyy-MM-dd HH:mm"},
                },
            },
            {
                render: "#Field",
                field: {
                    name: "endAt",
                    widget: "#DateInput",
                    label: "form.endAtLabel",
                    placeholder: "form.endAtPlaceholder",
                    required: true,
                    widgetProps: {valueFormat: "yyyy-MM-dd HH:mm"},
                },
            },
        ],
    },
];

export const promotionCreateFormView: ViewConfig = {
    model: "promotions",
    viewType: "form",
    viewMode: "create",
    accessModel: "promotions",
    apiUrl: "/api/eCommerceMarketplace/promotion",
    method: "PUT",
    nodes: promotionFormFields
};

export const promotionViews: ViewConfig[] = [promotionSheetView, promotionCreateFormView];
