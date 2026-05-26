import type { StockViewState } from "@/types";
import { getWidgetDef } from "@/widgets/widget-configs";

interface Props {
	state: StockViewState;
	onLoad: () => void;
	onError: () => void;
}

const EMBED_BASE = "https://s.tradingview.com/embed-widget/";

function extractSlug(scriptUrl: string): string {
	// Maps "…/embed-widget-stock-heatmap.js" → "stock-heatmap".
	const match = scriptUrl.match(/embed-widget-([^/]+?)\.js(?:[?#].*)?$/);
	return match?.[1] ?? "";
}

function buildEmbedUrl(scriptUrl: string, config: Record<string, unknown>): string {
	const slug = extractSlug(scriptUrl);
	const params = new URLSearchParams();

	const locale = typeof config.locale === "string" ? config.locale : "en";
	params.set("locale", locale);

	// Some widgets (e.g. symbol-info) require `symbol` as a query param to
	// reliably honor the configured ticker.
	if (typeof config.symbol === "string" && config.symbol) {
		params.set("symbol", config.symbol);
	}

	const hash = encodeURIComponent(JSON.stringify(config));
	return `${EMBED_BASE}${slug}/?${params.toString()}#${hash}`;
}

function stateKey(state: StockViewState): string {
	return `${state.widget}|${state.symbol}|${state.theme}|${JSON.stringify(state.filters)}`;
}

export default function TradingViewWidget({ state, onLoad, onError }: Props) {
	const def = getWidgetDef(state.widget);
	const config = def.buildConfig(state, state.filters);

	return (
		<iframe
			key={stateKey(state)}
			className="stock-view-iframe"
			src={buildEmbedUrl(def.scriptUrl, config)}
			onLoad={onLoad}
			onError={onError}
			sandbox="allow-scripts allow-same-origin allow-popups"
			title="TradingView widget"
		/>
	);
}
