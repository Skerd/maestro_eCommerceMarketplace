import type {ViewConfig} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";

export const listingFlagSheetView: ViewConfig = {
    model: "listingflags",
    viewType: "sheet",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    header: {
        titleField: "status",
        subtitleKey: "eCommerce.listingFlag",
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
                            permissions: {read: "listing"},
                            field: {
                                name: "listing",
                                widget: "#SmallInfoCard",
                                label: "listing",
                                widgetProps: {icon: "#Package", valuePath: ["listing", "title"]},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "reason"},
                            field: {
                                name: "reason",
                                widget: "#SmallInfoCard",
                                label: "reason",
                                widgetProps: {icon: "#Flag"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "user"},
                            field: {
                                name: "user",
                                widget: "#SmallInfoCard",
                                label: "user",
                                widgetProps: {icon: "#User", valuePath: ["user", "fullName"]},
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "details"},
            children: [
                {
                    render: "#ExpandableText",
                    permissions: {read: "comment"},
                    field: {
                        name: "comment",
                        widget: "#ExpandableText",
                        label: "comment",
                    },
                },
                {
                    render: "#ExpandableText",
                    dependent: "resolution",
                    permissions: {read: "resolution"},
                    field: {
                        name: "resolution",
                        widget: "#ExpandableText",
                        label: "resolution",
                    },
                },
            ],
        },
    ],
};

export const listingFlagCreateFormView: ViewConfig = {
    model: "listingflags",
    viewType: "form",
    viewMode: "create",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    method: "PUT",
    nodes: [
        {
            render: "#FormGrid",
            props: {columns: 1},
            children: [
                {
                    render: "#Field",
                    field: {
                        name: "listingId",
                        widget: "#ApiSelect",
                        label: "form.listingIdLabel",
                        required: true,
                        widgetProps: {apiUrl: "/api/eCommerceMarketplace/listing/select"},
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "reason",
                        widget: "#SimpleSelect",
                        label: "form.reasonLabel",
                        required: true,
                        widgetProps: {
                            options: [
                                {value: "inappropriate", label: "inappropriate"},
                                {value: "spam", label: "spam"},
                                {value: "misleading", label: "misleading"},
                                {value: "other", label: "other"},
                            ],
                        },
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "comment",
                        widget: "#Textarea",
                        label: "form.commentLabel",
                        widgetProps: {className: "min-h-[100px]"},
                    },
                },
            ],
        },
    ],
};

export const listingFlagEditFormView: ViewConfig = {
    model: "listingflags",
    viewType: "form",
    viewMode: "edit",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    method: "PATCH",
    nodes: [
        {
            render: "#FormGrid",
            props: {columns: 1},
            children: [
                {
                    render: "#Field",
                    field: {
                        name: "_id",
                        widget: "#Input",
                        label: "form.idLabel",
                        required: true,
                        widgetProps: {type: "hidden"},
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "status",
                        widget: "#SimpleSelect",
                        label: "form.statusLabel",
                        required: true,
                        widgetProps: {
                            options: [
                                {value: "pending", label: "pending"},
                                {value: "reviewed", label: "reviewed"},
                                {value: "dismissed", label: "dismissed"},
                            ],
                        },
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "resolution",
                        widget: "#Textarea",
                        label: "form.resolutionLabel",
                        widgetProps: {className: "min-h-[100px]"},
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "listingAction",
                        widget: "#SimpleSelect",
                        label: "form.listingActionLabel",
                        widgetProps: {
                            options: [
                                {value: "none", label: "none"},
                                {value: "deactivate", label: "deactivate"},
                            ],
                        },
                    },
                },
            ],
        },
    ],
};

export const listingFlagViews: ViewConfig[] = [
    listingFlagSheetView,
    listingFlagCreateFormView,
    listingFlagEditFormView,
];
