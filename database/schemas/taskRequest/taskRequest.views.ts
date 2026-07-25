import type { ViewConfig } from "armonia/src/modules/core/api/auxiliary/private/viewConfig";

export const taskRequestSheetView: ViewConfig = {
    model: "taskrequests",
    viewType: "sheet",
    accessModel: "taskRequests",
    apiUrl: "/api/eCommerceMarketplace/taskRequest",
    header: {
        titleField: "name",
        subtitleKey: "taskRequest",
        showCloseButton: true,
    },
    nodes: [
        {
            render: "#SheetGroup",
            props: { title: "section.generalInfo" },
            children: [
                {
                    render: "#SheetGrid",
                    props: { columns: 1 },
                    children: [
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "title" },
                            field: {
                                name: "title",
                                widget: "#SmallInfoCard",
                                label: "title",
                                widgetProps: { icon: "#Tag" },
                            },
                        },
                    ]
                },
                {
                    render: "#SheetGrid",
                    props: { columns: 2 },
                    children: [

                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "status" },
                            field: {
                                name: "status",
                                widget: "#SmallInfoCard",
                                label: "status",
                                widgetProps: { icon: "#Tag", languageKeyCategory: "taskRequestStatus" },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "category" },
                            field: {
                                name: "category",
                                widget: "#SmallInfoCard",
                                label: "category",
                                widgetProps: {
                                    icon: "#Folder",
                                    valuePath: ["category.name"],
                                    linkedRefPath: "category",
                                    linkedSheetModel: "listingCategories",
                                    linkedSheetWidget: "#CategorySheetView",
                                    linkedSheetEntityProp: "category",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "budgetMin" },
                            field: {
                                name: "budgetMin",
                                widget: "#SmallInfoCard",
                                label: "budgetMin",
                                widgetProps: {
                                    icon: "#DollarSign",
                                    format: "locale",
                                    valuePath: ["currency.symbol", "budgetMin"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "budgetMax" },
                            field: {
                                name: "budgetMax",
                                widget: "#SmallInfoCard",
                                label: "budgetMax",
                                widgetProps: {
                                    icon: "#DollarSign",
                                    format: "locale",
                                    valuePath: ["currency.symbol", "budgetMax"],
                                    joinSeparator: " ",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "currency" },
                            field: {
                                name: "currency",
                                widget: "#SmallInfoCard",
                                label: "currency",
                                widgetProps: {
                                    icon: "#DollarSign",
                                    format: "locale",
                                    valuePath: ["currency.symbol", "currency.name"],
                                    joinSeparator: " ",
                                    linkedRefPath: "currency",
                                    linkedSheetModel: "currencies",
                                    linkedSheetWidget: "#CurrencySheetView",
                                    linkedSheetEntityProp: "currency",
                                },
                            },
                        },
                        {
                            render: "#SmallInfoCard",
                            permissions: { read: "expiresAt" },
                            field: {
                                name: "expiresAt",
                                widget: "#SmallInfoCard",
                                label: "expiresAt",
                                widgetProps: { icon: "#Calendar", format: "date" },
                            },
                        },
                    ],
                },
            ],
        },

        {
            render: "#SheetGroup",
            props: { title: "address" },
            children: [
                {
                    render: "div",
                    props: { className: "space-y-2" },
                    children: [
                        {
                            render: "#SheetGrid",
                            props: { columns: 3 },
                            children: [
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.country.name",
                                        widget: "#SmallInfoCard",
                                        label: "country",
                                        widgetProps: {
                                            icon: "#Globe",
                                            linkedRefPath: "address.country",
                                            linkedSheetModel: "countries",
                                            linkedSheetWidget: "#CountrySheetView",
                                            linkedSheetEntityProp: "country",
                                        },
                                    },
                                },
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.state.name",
                                        widget: "#SmallInfoCard",
                                        label: "state",
                                        widgetProps: {
                                            icon: "#MapPin",
                                            linkedRefPath: "address.state",
                                            linkedSheetModel: "states",
                                            linkedSheetWidget: "#StateSheetView",
                                            linkedSheetEntityProp: "state",
                                        },
                                    },
                                },
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.city.name",
                                        widget: "#SmallInfoCard",
                                        label: "city",
                                        widgetProps: {
                                            icon: "#Building",
                                            linkedRefPath: "address.city",
                                            linkedSheetModel: "cities",
                                            linkedSheetWidget: "#CitySheetView",
                                            linkedSheetEntityProp: "city",
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            render: "#SheetGrid",
                            props: { columns: 1 },
                            children: [
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.street",
                                        widget: "#SmallInfoCard",
                                        label: "street",
                                        widgetProps: { icon: "#MapPin" },
                                    },
                                },
                            ],
                        },
                        {
                            render: "#SheetGrid",
                            props: { columns: 3 },
                            children: [
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.postalCode",
                                        widget: "#SmallInfoCard",
                                        label: "postalCode",
                                        widgetProps: { icon: "#Mail" },
                                    },
                                },
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.latitude",
                                        widget: "#SmallInfoCard",
                                        label: "latitude",
                                        widgetProps: { icon: "#IconMapPin", format: "locale" },
                                    },
                                },
                                {
                                    render: "#SmallInfoCard",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address.longitude",
                                        widget: "#SmallInfoCard",
                                        label: "longitude",
                                        widgetProps: { icon: "#IconMapPin", format: "locale" },
                                    },
                                },
                            ],
                        },
                        {
                            render: "div",
                            props: { className: "w-full pt-2" },
                            children: [
                                {
                                    render: "#SheetLocationMap",
                                    permissions: { read: "address" },
                                    field: {
                                        name: "address",
                                        widget: "#SheetLocationMap",
                                        widgetProps: {
                                            latitudeField: "address.latitude",
                                            longitudeField: "address.longitude",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        {
            render: "#SheetGroup",
            props: { title: "description" },
            children: [
                {
                    render: "div",
                    props: { className: "p-2 rounded-lg bg-muted/30 border border-border/50" },
                    children: [
                        {
                            render: "#ExpandableText",
                            permissions: { read: "description" },
                            field: {
                                name: "description",
                                widget: "#ExpandableText",
                                widgetProps: { className: "text-sm" },
                            },
                        },
                    ],
                },
            ],
        },
        {
            render: "#SheetGroup",
            props: { title: "gallery" },
            children: [
                {
                    render: "div",
                    props: { className: "p-4 rounded-lg bg-muted/30 border border-border/50 max-w-full" },
                    children: [
                        {
                            render: "#GalleryCarousel",
                            field: {
                                name: "mainImage",
                                widget: "#GalleryCarousel",
                                widgetProps: {
                                    imageGalleryField: "imageGallery",
                                    videoGalleryField: "videoGallery",
                                    showThumbnails: false,
                                    allowFullScreen: false,
                                    coverAfterFirst: false,
                                    showPreviews: true,
                                    previewLocation: "right",
                                },
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

/** Same shape as `edificeAddressWithMapLabels` in `edifice.views.ts` (keys under `form.*` via task request form JSON). */
const taskRequestAddressWithMapLabels = {
    country: "form.countryLabel",
    countryPlaceholder: "form.countryPlaceholder",
    state: "form.stateLabel",
    statePlaceholder: "form.statePlaceholder",
    city: "form.cityLabel",
    cityPlaceholder: "form.cityPlaceholder",
    street: "form.streetLabel",
    streetPlaceholder: "form.streetPlaceholder",
    postalCode: "form.postalCodeLabel",
    postalCodePlaceholder: "form.postalCodePlaceholder",
    latitude: "form.latitudeLabel",
    latitudePlaceholder: "form.latitudePlaceholder",
    longitude: "form.longitudeLabel",
    longitudePlaceholder: "form.longitudePlaceholder",
};

const taskRequestFormFields: ViewConfig["nodes"] = [
    {
        render: "#TitleWithCollapse",
        props: { title: "form.section.general" },
        children: [
            {
                render: "#FormGrid",
                props: { columns: 2 },
                children: [
                    {
                        render: "#Field",
                        field: {
                            name: "title",
                            widget: "#Input",
                            label: "form.titleLabel",
                            required: true,
                        },
                    },
                    {
                        render: "#Field",
                        field: {
                            name: "category",
                            widget: "#ApiSelect",
                            label: "form.categoryLabel",
                            widgetProps: { apiUrl: "/api/eCommerceMarketplace/listingCategory/select" },
                        },
                    },
                ],
            },
            {
                render: "#FormGrid",
                props: { columns: 1 },
                children: [
                    {
                        render: "#Field",
                        field: {
                            name: "description",
                            widget: "#Textarea",
                            label: "form.descriptionLabel",
                            placeholder: "form.descriptionPlaceholder",
                            widgetProps: { className: "resize-none max-h-[250px] overflow-y-auto" },
                        },
                    },
                ],
            },
        ],
    },
    {
        render: "#TitleWithCollapse",
        props: { title: "form.section.budget" },
        children: [
            {
                render: "#FormGrid",
                props: { columns: 3 },
                children: [
                    {
                        render: "#Field",
                        field: {
                            name: "budgetMin",
                            widget: "#Input",
                            label: "form.budgetMinLabel",
                            widgetProps: { type: "number", min: 0, step: "any" },
                        },
                    },
                    {
                        render: "#Field",
                        field: {
                            name: "budgetMax",
                            widget: "#Input",
                            label: "form.budgetMaxLabel",
                            widgetProps: { type: "number", min: 0, step: "any" },
                        },
                    },
                    {
                        render: "#Field",
                        field: {
                            name: "currency",
                            widget: "#ApiSelect",
                            label: "form.currencyLabel",
                            widgetProps: { apiUrl: "/api/finance/currency/select" },
                        },
                    },
                ],
            },
        ],
    },
    {
        render: "#TitleWithCollapse",
        props: { title: "address" },
        children: [
            {
                render: "div",
                props: {className: "grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"},
                children: [
                    {
                        render: "div",
                        props: {className: "lg:col-span-2 space-y-4 min-w-0"},
                        children: [
                            {
                                render: "#FormGrid",
                                props: {columns: 3},
                                children: [
                                    {
                                        render: "#Field",
                                        field: {
                                            name: "address.country",
                                            widget: "#ApiSelect",
                                            label: "form.countryLabel",
                                            placeholder: "form.countryPlaceholder",
                                            widgetProps: {
                                                apiUrl: "/api/auxiliary/country/select",
                                                method: "POST",
                                                pageSize: 50,
                                                cascadeClearFormFields: ["address.state", "address.city"],
                                            },
                                        },
                                    },
                                    {
                                        render: "#Field",
                                        field: {
                                            name: "address.state",
                                            widget: "#ApiSelect",
                                            label: "form.stateLabel",
                                            placeholder: "form.statePlaceholder",
                                            widgetProps: {
                                                apiUrl: "/api/auxiliary/state/select",
                                                method: "POST",
                                                pageSize: 50,
                                                postBodyFromFormFields: [{field: "address.country", paramName: "country"}],
                                                enableWhenFormFieldsNonEmpty: ["address.country"],
                                                cascadeClearFormFields: ["address.city"],
                                            },
                                        },
                                    },
                                    {
                                        render: "#Field",
                                        field: {
                                            name: "address.city",
                                            widget: "#ApiSelect",
                                            label: "form.cityLabel",
                                            placeholder: "form.cityPlaceholder",
                                            widgetProps: {
                                                apiUrl: "/api/auxiliary/city/select",
                                                method: "POST",
                                                pageSize: 50,
                                                postBodyFromFormFields: [
                                                    {field: "address.country", paramName: "country"},
                                                    {field: "address.state", paramName: "state"},
                                                ],
                                                enableWhenFormFieldsNonEmpty: ["address.country"],
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                render: "#FormGrid",
                                props: {columns: 2},
                                children: [
                                    {
                                        render: "#Field",
                                        field: {name: "address.street", widget: "#Input", label: "form.streetLabel", placeholder: "form.streetPlaceholder"},
                                    },
                                    {
                                        render: "#Field",
                                        field: {name: "address.postalCode", widget: "#Input", label: "form.postalCodeLabel", placeholder: "form.postalCodePlaceholder"},
                                    },
                                ],
                            },
                            {
                                render: "#FormGrid",
                                props: {columns: 2},
                                children: [
                                    {
                                        render: "#Field",
                                        field: {name: "address.latitude", widget: "#Input", label: "form.latitudeLabel", placeholder: "form.latitudePlaceholder", widgetProps: {type: "number", step: "0.000001"}},
                                    },
                                    {
                                        render: "#Field",
                                        field: {name: "address.longitude", widget: "#Input", label: "form.longitudeLabel", placeholder: "form.longitudePlaceholder", widgetProps: {type: "number", step: "0.000001"}},
                                    },
                                ],
                            },
                            {
                                render: "#FormGrid",
                                props: {columns: 1},
                                children: [
                                    {
                                        render: "#FormAlert",
                                        props: {message: "form.addressPrivacyAlert"},
                                    },
                                ],
                            }
                        ],
                    },
                    {
                        render: "div",
                        props: {className: "flex flex-col lg:col-span-1 w-full min-h-[220px] h-[220px] lg:h-full lg:min-h-[220px]"},
                        children: [
                            {
                                render: "#Field",
                                field: {
                                    name: "_addressMap",
                                    widget: "#FormMapPinPicker",
                                    skipWriteAccessGate: true,
                                    widgetProps: {fieldPrefix: "address", latField: "latitude", lngField: "longitude", defaultLat: 41.3275, defaultLng: 19.8189},
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        render: "#TitleWithCollapse",
        props: { title: "form.section.images" },
        permissions: { write: "mainImage" },
        children: [
            {
                render: "#FormGrid",
                props: { columns: 1 },
                children: [
                    {
                        render: "#Field",
                        field: {
                            name: "mainImage",
                            widget: "#MediaField",
                            label: "form.mainImageLabel",
                            widgetProps: { mediaType: "image", mode: "single" },
                        },
                    },
                    {
                        render: "#Field",
                        field: {
                            name: "imageGallery",
                            widget: "#MediaField",
                            label: "form.imageGalleryLabel",
                            widgetProps: { mediaType: "image", mode: "multiple", maxCount: 8 },
                        },
                    },
                ],
            },
        ],
    },
    {
        render: "#TitleWithCollapse",
        props: { title: "form.section.video" },
        permissions: { write: "videoGallery" },
        children: [
            {
                render: "#Field",
                field: {
                    name: "videoGallery",
                    widget: "#MediaField",
                    label: "form.videoGalleryLabel",
                    widgetProps: { mediaType: "video", mode: "multiple", maxCount: 3 },
                },
            },
        ],
    },
];

export const taskRequestCreateFormView: ViewConfig = {
    model: "taskrequests",
    viewType: "form",
    viewMode: "create",
    accessModel: "taskRequests",
    apiUrl: "/api/eCommerceMarketplace/taskRequest",
    method: "PUT",
    nodes: taskRequestFormFields,
};

export const taskRequestEditFormView: ViewConfig = {
    model: "taskrequests",
    viewType: "form",
    viewMode: "edit",
    accessModel: "taskRequests",
    apiUrl: "/api/eCommerceMarketplace/taskRequest",
    method: "PATCH",
    nodes: taskRequestFormFields,
};

export const taskRequestViews: ViewConfig[] = [taskRequestSheetView, taskRequestCreateFormView, taskRequestEditFormView];
