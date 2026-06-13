// Each widget has its own filters and configurations. 
// This file contains the most common parameters for all widgets.

import type {
	FilterDef,
	FilterOption,
	WidgetDef,
	WidgetId,
	WidgetTheme,
} from "@/types";

const TRADINGVIEW_SCRIPT_BASE =
	"https://s3.tradingview.com/external-embedding/embed-widget-";

const commonLocale: FilterDef = {
	id: "locale",
	label: "Locale",
	type: "select",
	defaultValue: "en",
	options: [
		{ value: "en", label: "English" },
		{ value: "es", label: "Spanish" },
		{ value: "fr", label: "French" },
		{ value: "de", label: "German" },
		{ value: "it", label: "Italian" },
		{ value: "pt", label: "Portuguese" },
		{ value: "ja", label: "Japanese" },
		{ value: "zh_CN", label: "Chinese (Simplified)" },
	],
};

const intervalFilter: FilterDef = {
	id: "interval",
	label: "Interval",
	type: "select",
	defaultValue: "D",
	options: [
		{ value: "1", label: "1 minute" },
		{ value: "5", label: "5 minutes" },
		{ value: "15", label: "15 minutes" },
		{ value: "30", label: "30 minutes" },
		{ value: "60", label: "1 hour" },
		{ value: "240", label: "4 hours" },
		{ value: "D", label: "1 day" },
		{ value: "W", label: "1 week" },
		{ value: "M", label: "1 month" },
	],
};

const stockMarketDataSources: FilterOption[] = [
	{ value: "SPX500", label: "S&P 500" },
	{ value: "NASDAQ100", label: "NASDAQ 100" },
	{ value: "NASDAQCOMPOSITE", label: "NASDAQ Composite" },
	{ value: "DJDJI", label: "Dow Jones" },
	{ value: "DAX", label: "DAX" },
	{ value: "ASX200", label: "ASX 200" },
	{ value: "AllUSA", label: "All USA" },
];

const blockSizeOptions: FilterOption[] = [
	{ value: "market_cap_basic", label: "Market capitalization" },
	{ value: "volume", label: "Volume" },
	{ value: "number_of_employees", label: "Number of employees" },
	{ value: "dividend_yield_recent", label: "Dividend yield" },
];

const blockColorOptions: FilterOption[] = [
	{ value: "change", label: "Change %" },
	{ value: "Perf.W", label: "Performance (week)" },
	{ value: "Perf.1M", label: "Performance (1 month)" },
	{ value: "Perf.3M", label: "Performance (3 months)" },
	{ value: "Perf.6M", label: "Performance (6 months)" },
	{ value: "Perf.Y", label: "Performance (year)" },
	{ value: "Perf.YTD", label: "Performance (YTD)" },
];

const stockGroupingOptions: FilterOption[] = [
	{ value: "sector", label: "Sector" },
	{ value: "industry", label: "Industry" },
	{ value: "country", label: "Country" },
	{ value: "no_group", label: "None" },
];

const tickerDisplayModeOptions: FilterOption[] = [
	{ value: "adaptive", label: "Adaptive" },
	{ value: "regular", label: "Regular" },
	{ value: "compact", label: "Compact" },
];

const symbolOverviewChartTypes: FilterOption[] = [
	{ value: "area", label: "Area" },
	{ value: "line", label: "Line" },
	{ value: "bars", label: "Bars" },
	{ value: "candlesticks", label: "Candlesticks" },
];

const advancedChartStyles: FilterOption[] = [
	{ value: "1", label: "Bars" },
	{ value: "2", label: "Candles" },
	{ value: "3", label: "Line" },
	{ value: "8", label: "Heikin Ashi" },
	{ value: "9", label: "Hollow candles" },
	{ value: "10", label: "Baseline" },
];

const rangeOptions: FilterOption[] = [
	{ value: "1D", label: "1 day" },
	{ value: "5D", label: "5 days" },
	{ value: "1M", label: "1 month" },
	{ value: "3M", label: "3 months" },
	{ value: "6M", label: "6 months" },
	{ value: "YTD", label: "YTD" },
	{ value: "12M", label: "12 months" },
	{ value: "60M", label: "5 years" },
	{ value: "ALL", label: "All" },
];

const parseSymbolList = (raw: string, fallback: string[]): string[] => {
	const parts = raw
		.split(/[\n,;]+/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	return parts.length > 0 ? parts : fallback;
};

const buildSymbolList = (raw: string, fallback: string[]) =>
	parseSymbolList(raw, fallback).map((s) => ({
		description: s,
		proName: s,
	}));

const themeColor = (theme: WidgetTheme) => theme;

const widgetDefs: WidgetDef[] = [
	{
		id: "stock-heatmap",
		label: "Stock heatmap",
		description: "Macro view of stocks grouped by sector or country.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}stock-heatmap.js`,
		supportsSymbol: false,
		filters: [
			{
				id: "dataSource",
				label: "Market",
				type: "select",
				defaultValue: "SPX500",
				options: stockMarketDataSources,
			},
			{
				id: "blockSize",
				label: "Block size",
				type: "select",
				defaultValue: "market_cap_basic",
				options: blockSizeOptions,
			},
			{
				id: "blockColor",
				label: "Block color",
				type: "select",
				defaultValue: "change",
				options: blockColorOptions,
			},
			{
				id: "grouping",
				label: "Group by",
				type: "select",
				defaultValue: "sector",
				options: stockGroupingOptions,
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			exchanges: [],
			dataSource: filters.dataSource ?? "SPX500",
			grouping: filters.grouping ?? "sector",
			blockSize: filters.blockSize ?? "market_cap_basic",
			blockColor: filters.blockColor ?? "change",
			locale: filters.locale ?? "en",
			symbolUrl: "",
			colorTheme: themeColor(state.theme),
			isDataSetEnabled: true,
			isZoomEnabled: true,
			hasSymbolTooltip: true,
			isMonoSize: false,
			width: "100%",
			height: "100%",
		}),
	},
	{
		id: "crypto-coins-heatmap",
		label: "Crypto heatmap",
		description: "Heatmap of crypto coins sized by market cap or volume.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}crypto-coins-heatmap.js`,
		supportsSymbol: false,
		filters: [
			{
				id: "dataSource",
				label: "Source",
				type: "select",
				defaultValue: "Crypto",
				options: [
					{ value: "Crypto", label: "All crypto" },
					{ value: "Crypto100", label: "Top 100 crypto" },
				],
			},
			{
				id: "blockSize",
				label: "Block size",
				type: "select",
				defaultValue: "market_cap_calc",
				options: [
					{ value: "market_cap_calc", label: "Market capitalization" },
					{ value: "24h_vol_cmc", label: "24h volume" },
				],
			},
			{
				id: "blockColor",
				label: "Block color",
				type: "select",
				defaultValue: "24h_close_change|5",
				options: [
					{ value: "24h_close_change|5", label: "24h change %" },
					{ value: "7d_close_change|5", label: "7d change %" },
					{ value: "30d_close_change|5", label: "30d change %" },
				],
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			dataSource: filters.dataSource ?? "Crypto",
			blockSize: filters.blockSize ?? "market_cap_calc",
			blockColor: filters.blockColor ?? "24h_close_change|5",
			locale: filters.locale ?? "en",
			symbolUrl: "",
			colorTheme: themeColor(state.theme),
			isDataSetEnabled: true,
			isZoomEnabled: true,
			hasSymbolTooltip: true,
			isMonoSize: false,
			width: "100%",
			height: "100%",
		}),
	},
	{
		id: "forex-heat-map",
		label: "Forex heatmap",
		description: "Heatmap of forex currency pairs.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}forex-heat-map.js`,
		supportsSymbol: false,
		filters: [
			{
				id: "currencies",
				label: "Currencies (comma separated)",
				type: "text",
				defaultValue: "EUR,USD,JPY,GBP,CHF,AUD,CAD,NZD",
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			currencies: parseSymbolList(
				filters.currencies ?? "",
				["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"]
			),
			isTransparent: false,
			colorTheme: themeColor(state.theme),
			locale: filters.locale ?? "en",
			width: "100%",
			height: "100%",
		}),
	},
	{
		id: "ticker-tape",
		label: "Ticker tape",
		description: "Scrolling ticker tape for many symbols.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}ticker-tape.js`,
		supportsSymbol: false,
		filters: [
			{
				id: "symbols",
				label: "Symbols (comma separated)",
				type: "text",
				defaultValue:
					"FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FX_IDC:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD",
			},
			{
				id: "displayMode",
				label: "Display mode",
				type: "select",
				defaultValue: "adaptive",
				options: tickerDisplayModeOptions,
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			symbols: buildSymbolList(filters.symbols ?? "", [
				"FOREXCOM:SPXUSD",
				"FOREXCOM:NSXUSD",
			]),
			showSymbolLogo: true,
			isTransparent: false,
			displayMode: filters.displayMode ?? "adaptive",
			colorTheme: themeColor(state.theme),
			locale: filters.locale ?? "en",
			width: "100%",
		}),
	},
	{
		id: "single-quote",
		label: "Single quote",
		description: "Large numeric quote for a single symbol.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}single-quote.js`,
		supportsSymbol: true,
		filters: [commonLocale],
		buildConfig: (state, filters) => ({
			symbol: state.symbol || "NASDAQ:AAPL",
			width: "100%",
			isTransparent: false,
			colorTheme: themeColor(state.theme),
			locale: filters.locale ?? "en",
		}),
	},
	{
		id: "symbol-info",
		label: "Symbol info",
		description: "Key statistics and fundamental data for a symbol.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}symbol-info.js`,
		supportsSymbol: true,
		filters: [commonLocale],
		buildConfig: (state, filters) => ({
			symbol: state.symbol || "NASDAQ:AAPL",
			width: "100%",
			locale: filters.locale ?? "en",
			colorTheme: themeColor(state.theme),
			isTransparent: false,
		}),
	},
	{
		id: "symbol-overview",
		label: "Symbol summary",
		description: "Mini chart and summary for one or more symbols.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}symbol-overview.js`,
		supportsSymbol: true,
		filters: [
			{
				id: "chartType",
				label: "Chart type",
				type: "select",
				defaultValue: "area",
				options: symbolOverviewChartTypes,
			},
			{
				id: "dateRange",
				label: "Date range",
				type: "select",
				defaultValue: "12M",
				options: rangeOptions,
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			symbols: [
				[state.symbol || "NASDAQ:AAPL", state.symbol || "NASDAQ:AAPL|1D"],
			],
			chartOnly: false,
			width: "100%",
			height: "100%",
			locale: filters.locale ?? "en",
			colorTheme: themeColor(state.theme),
			autosize: true,
			showVolume: false,
			showMA: false,
			hideDateRanges: false,
			hideMarketStatus: false,
			hideSymbolLogo: false,
			scalePosition: "right",
			scaleMode: "Normal",
			fontFamily:
				"-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
			fontSize: "10",
			noTimeScale: false,
			valuesTracking: "1",
			changeMode: "price-and-percent",
			chartType: filters.chartType ?? "area",
			dateRanges: [
				"1d|1",
				"1m|30",
				"3m|60",
				"12m|1D",
				"60m|1W",
				"all|1M",
			],
			dateRange: filters.dateRange ?? "12M",
		}),
	},
	{
		id: "advanced-chart",
		label: "Advanced chart",
		description: "Full-featured chart with indicators and drawing tools.",
		scriptUrl: `${TRADINGVIEW_SCRIPT_BASE}advanced-chart.js`,
		supportsSymbol: true,
		filters: [
			intervalFilter,
			{
				id: "style",
				label: "Style",
				type: "select",
				defaultValue: "1",
				options: advancedChartStyles,
			},
			{
				id: "timezone",
				label: "Timezone",
				type: "select",
				defaultValue: "Etc/UTC",
				options: [
					{ value: "Etc/UTC", label: "UTC" },
					{ value: "America/New_York", label: "New York" },
					{ value: "America/Los_Angeles", label: "Los Angeles" },
					{ value: "Europe/London", label: "London" },
					{ value: "Europe/Madrid", label: "Madrid" },
					{ value: "Europe/Berlin", label: "Berlin" },
					{ value: "Asia/Tokyo", label: "Tokyo" },
					{ value: "Asia/Shanghai", label: "Shanghai" },
				],
			},
			commonLocale,
		],
		buildConfig: (state, filters) => ({
			autosize: true,
			symbol: state.symbol || "NASDAQ:AAPL",
			interval: filters.interval ?? "D",
			timezone: filters.timezone ?? "Etc/UTC",
			theme: themeColor(state.theme),
			style: filters.style ?? "1",
			locale: filters.locale ?? "en",
			allow_symbol_change: true,
			calendar: false,
			support_host: "https://www.tradingview.com",
		}),
	},
];

const widgetMap: Map<WidgetId, WidgetDef> = new Map(
	widgetDefs.map((w) => [w.id, w])
);

export const getAllWidgets = (): WidgetDef[] => widgetDefs;

export const getWidgetDef = (id: WidgetId): WidgetDef => {
	const def = widgetMap.get(id);
	if (!def) {
		throw new Error(`Unknown widget id: ${id}`);
	}
	return def;
};

export const getDefaultFiltersFor = (
	id: WidgetId
): Record<string, string> => {
	const def = getWidgetDef(id);
	const out: Record<string, string> = {};
	for (const f of def.filters) {
		out[f.id] = f.defaultValue;
	}
	return out;
};
