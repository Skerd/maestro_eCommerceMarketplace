import type {ViewConfig} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";

export const providerProfileSheetView: ViewConfig = {
    model: "providerprofiles",
    viewType: "sheet",
    accessModel: "providerprofiles",
    apiUrl: "/api/eCommerceMarketplace/providerProfile",
    header: {
        titleField: "user.fullName",
        subtitleKey: "providerProfileSubtitle",
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
                            permissions: {read: "user"},
                            field: {
                                name: "user",
                                widget: "#SmallInfoCard",
                                label: "user",
                                widgetProps: {
                                    icon: "#User",
                                    valuePath: ["user.fullName", "user.name"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            field: {
                                name: "averageRating",
                                widget: "#SmallInfoCard",
                                label: "rating",
                                widgetProps: {icon: "#Star", format: "locale"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            field: {
                                name: "reviewCount",
                                widget: "#SmallInfoCard",
                                label: "ratingCount",
                                widgetProps: {icon: "#MessageSquare", format: "locale"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            field: {
                                name: "completionRate",
                                widget: "#SmallInfoCard",
                                label: "completionRate",
                                widgetProps: {icon: "#CheckCircle", format: "locale"},
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "skills"},
            children: [
                {
                    render: "#SheetGrid",
                    props: {columns: 1},
                    children: [
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "skills"},
                            field: {
                                name: "skills",
                                widget: "#SmallInfoCard",
                                label: "skills",
                                widgetProps: {icon: "#Tag", valueType: "stringBadgeList"},
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "bio"},
            children: [
                {
                    render: "div",
                    props: {className: "p-2 rounded-lg bg-muted/30 border border-border/50"},
                    children: [
                        {
                            render: "#ExpandableText",
                            permissions: {read: "bio"},
                            field: {
                                name: "bio",
                                widget: "#ExpandableText",
                                label: "bio",
                                widgetProps: {className: "text-sm"},
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: {title: "portfolio"},
            children: [
                {
                    render: "div",
                    props: {className: "p-4 rounded-lg bg-muted/30 border border-border/50 max-w-full"},
                    children: [
                        {
                            render: "#SheetMediaFilesStrip",
                            permissions: {read: "portfolio"},
                            field: {
                                name: "portfolio",
                                widget: "#SheetMediaFilesStrip",
                                label: "portfolio",
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export const providerProfileEditFormView: ViewConfig = {
    model: "providerprofiles",
    viewType: "form",
    viewMode: "edit",
    accessModel: "providerprofiles",
    apiUrl: "/api/eCommerceMarketplace/providerProfile",
    method: "PATCH",
    nodes: [
        {
            render: "#FormGrid",
            props: {columns: 1},
            children: [
                {
                    render: "#Field",
                    field: {
                        name: "bio",
                        widget: "#Textarea",
                        label: "form.bioLabel",
                        widgetProps: {className: "min-h-[140px]"},
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "skills",
                        widget: "#StringArrayField",
                        label: "form.skillsLabel",
                    },
                },
                {
                    render: "#Field",
                    field: {
                        name: "portfolio",
                        widget: "#MediaField",
                        label: "form.portfolioLabel",
                        widgetProps: {
                            mediaType: "file",
                            mode: "multiple",
                            maxCount: 20,
                        },
                    },
                },
            ],
        },
    ],
};

export const providerProfileViews: ViewConfig[] = [providerProfileSheetView, providerProfileEditFormView];
