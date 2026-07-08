import type {ViewConfig} from "armonia/src/modules/core/api/auxiliary/private/viewConfig";

export const providerAvailabilitySheetView: ViewConfig = {
    model: "provideravailabilities",
    viewType: "sheet",
    accessModel: "provideravailabilities",
    apiUrl: "/api/eCommerceMarketplace/providerAvailability",
    header: {
        titleField: "dayOfWeek",
        subtitleKey: "providerAvailabilitySubtitle",
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
                            permissions: {read: "dayOfWeek"},
                            field: {
                                name: "dayOfWeek",
                                widget: "#SmallInfoCard",
                                label: "dayOfWeek",
                                widgetProps: {icon: "#Calendar", languageKeyCategory: "weekday"},
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
                                    valuePath: ["provider.fullName", "provider.name"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "startTime"},
                            field: {
                                name: "startTime",
                                widget: "#SmallInfoCard",
                                label: "startTime",
                                widgetProps: {icon: "#Clock"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "endTime"},
                            field: {
                                name: "endTime",
                                widget: "#SmallInfoCard",
                                label: "endTime",
                                widgetProps: {icon: "#Clock"},
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: {read: "timezone"},
                            field: {
                                name: "timezone",
                                widget: "#SmallInfoCard",
                                label: "timezone",
                                widgetProps: {icon: "#Globe"},
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

const availabilityFormFields: ViewConfig["nodes"] = [
    {
        render: "#FormGrid",
        props: {columns: 2},
        children: [
            {
                render: "#Field",
                field: {
                    name: "dayOfWeek",
                    widget: "#SimpleSelect",
                    label: "form.dayOfWeekLabel",
                    required: true,
                    widgetProps: {
                        options: [
                            {value: "0", label: "Sunday"},
                            {value: "1", label: "Monday"},
                            {value: "2", label: "Tuesday"},
                            {value: "3", label: "Wednesday"},
                            {value: "4", label: "Thursday"},
                            {value: "5", label: "Friday"},
                            {value: "6", label: "Saturday"},
                        ],
                    },
                },
            },
            {
                render: "#Field",
                field: {
                    name: "startTime",
                    widget: "#Input",
                    label: "form.startTimeLabel",
                    required: true,
                    widgetProps: {type: "time"},
                },
            },
            {
                render: "#Field",
                field: {
                    name: "endTime",
                    widget: "#Input",
                    label: "form.endTimeLabel",
                    required: true,
                    widgetProps: {type: "time"},
                },
            },
            {
                render: "#Field",
                field: {
                    name: "timezone",
                    widget: "#Input",
                    label: "form.timezoneLabel",
                },
            },
        ],
    },
];

export const providerAvailabilityCreateFormView: ViewConfig = {
    model: "provideravailabilities",
    viewType: "form",
    viewMode: "create",
    accessModel: "provideravailabilities",
    apiUrl: "/api/eCommerceMarketplace/providerAvailability",
    method: "PUT",
    nodes: availabilityFormFields,
};

export const providerAvailabilityEditFormView: ViewConfig = {
    model: "provideravailabilities",
    viewType: "form",
    viewMode: "edit",
    accessModel: "provideravailabilities",
    apiUrl: "/api/eCommerceMarketplace/providerAvailability",
    method: "PATCH",
    nodes: [
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
        ...availabilityFormFields,
    ],
};

export const providerAvailabilityViews: ViewConfig[] = [
    providerAvailabilitySheetView,
    providerAvailabilityCreateFormView,
    providerAvailabilityEditFormView,
];
