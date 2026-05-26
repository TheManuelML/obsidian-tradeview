import { Notice } from "obsidian";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState, type ReactNode } from "react";
import { X, Settings, RefreshCcw, RotateCcw } from "lucide-react";

import TradingViewWidget from "@/widgets/widget-renderer";
import { getAllWidgets, getDefaultFiltersFor, getWidgetDef } from "@/widgets/widget-configs";
import type { FilterDef, StockViewState, WidgetId, WidgetTheme } from "@/types";


export interface StockViewUIHandle {
	toggleSettingsPanel: () => void;
	refresh: () => Promise<void>;
}

interface StockViewUIProps {
	getInitialViewState: () => StockViewState;
	checkConnectivity: () => Promise<boolean>;
}

type LoadStatus = "loading" | "ready" | "offline" | "widget-error";


function SettingsSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="stock-view-panel-section">
			<div className="stock-view-panel-section-title">{title.toUpperCase()}</div>
			<div className="stock-view-panel-section-content">{children}</div>
		</div>
	);
}

function FilterControl({
	filter,
	value,
	onChange,
}: {
	filter: FilterDef;
	value: string;
	onChange: (value: string) => void;
}) {
	if (filter.type === "select" && filter.options) {
		return (
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				{filter.options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		);
	}

	return (
		<TextFilterInput value={value} onCommit={onChange} />
	);
}

function TextFilterInput({
	value,
	onCommit,
	placeholder,
}: {
	value: string;
	onCommit: (value: string) => void;
	placeholder?: string;
}) {
	const [draft, setDraft] = useState(value);

	useEffect(() => {
		setDraft(value);
	}, [value]);

	const commit = () => {
		const trimmed = draft.trim();
		if (trimmed !== value) onCommit(trimmed);
	};

	return (
		<input
			type="text"
			value={draft}
			placeholder={placeholder}
			onChange={(e) => setDraft(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Enter") commit();
			}}
		/>
	);
}

function SettingsPanel({
	state,
	visible,
	onClose,
	onRestoreDefaults,
	onWidgetChange,
	onSymbolChange,
	onThemeChange,
	onFilterChange,
}: {
	state: StockViewState;
	visible: boolean;
	onClose: () => void;
	onRestoreDefaults: () => void;
	onWidgetChange: (widget: WidgetId) => void;
	onSymbolChange: (symbol: string) => void;
	onThemeChange: (theme: WidgetTheme) => void;
	onFilterChange: (filterId: string, value: string) => void;
}) {
	const def = getWidgetDef(state.widget);

	return (
		<div
			className="stock-view-settings-panel"
			style={{ display: visible ? "flex" : "none" }}
		>
			<div className="stock-view-panel-header">
				<span className="stock-view-panel-title">Widget settings</span>
				<div className="stock-view-panel-header-btns">	
					<button
						type="button"
						aria-label="Restore defaults"
						onClick={onRestoreDefaults}
						style={{ padding: "0px", width: "30px", height: "25px", backgroundColor: "transparent", boxShadow: "none" }}
					>
						<RotateCcw size={16} />
					</button>
					
					<button
						type="button"
						aria-label="Close settings"
						onClick={onClose}
						style={{ padding: "0px", width: "30px", height: "25px", backgroundColor: "transparent", boxShadow: "none" }}
					>
						<X size={20} />
					</button>
				</div>
			</div>

			<div className="stock-view-panel-body">
				<SettingsSection title="Widget">
					<select
						value={state.widget}
						onChange={(e) => onWidgetChange(e.target.value as WidgetId)}
					>
						{getAllWidgets().map((w) => (
							<option key={w.id} value={w.id}>
								{w.label}
							</option>
						))}
					</select>
				</SettingsSection>

				{def.supportsSymbol && (
					<SettingsSection title="Symbol">
						<TextFilterInput
							value={state.symbol}
							placeholder="e.g. NASDAQ:AAPL"
							onCommit={onSymbolChange}
						/>
					</SettingsSection>
				)}

				<SettingsSection title="Appearance">
					<div className="stock-view-panel-row">
						<span className="stock-view-row-label">Theme</span>
						<select
							value={state.theme}
							onChange={(e) => onThemeChange(e.target.value as WidgetTheme)}
						>
							<option value="dark">Dark</option>
							<option value="light">Light</option>
						</select>
					</div>
				</SettingsSection>

				{def.filters.length > 0 && (
					<SettingsSection title="Filters">
						{def.filters.map((filter) => (
							<div key={filter.id} className="stock-view-panel-row">
								<span className="stock-view-row-label">{filter.label}</span>
								<FilterControl
									filter={filter}
									value={state.filters[filter.id] ?? filter.defaultValue}
									onChange={(value) => onFilterChange(filter.id, value)}
								/>
							</div>
						))}
					</SettingsSection>
				)}
			</div>
		</div>
	);
}

const StockViewUI = forwardRef<StockViewUIHandle, StockViewUIProps>(
	function StockViewUI({ getInitialViewState, checkConnectivity }, ref) {
		const [state, setState] = useState<StockViewState>(getInitialViewState);
		const [settingsVisible, setSettingsVisible] = useState(false);
		const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");

		const loadWidget = useCallback(async () => {
			setLoadStatus("loading");

			const ok = await checkConnectivity();
			if (!ok) {
				setLoadStatus("offline");
				return;
			}

			setLoadStatus("ready");
		}, [checkConnectivity]);

		useEffect(() => {
			void loadWidget();
		}, [state, loadWidget]);

		useImperativeHandle(
			ref,
			() => ({
				toggleSettingsPanel: () => setSettingsVisible((v) => !v),
				refresh: loadWidget,
			}),
			[loadWidget]
		);

		const handleWidgetChange = (widget: WidgetId) => {
			setState((prev) => ({
				...prev,
				widget,
				filters: getDefaultFiltersFor(widget),
			}));
			setSettingsVisible(true);
		};

		const handleRestoreDefaults = () => {
			setState(getInitialViewState());
			setSettingsVisible(true);
		};

		const handleWidgetError = () => {
			new Notice(
				"Stock view: the TradingView widget failed to load. Try reloading."
			);
			setLoadStatus("widget-error");
		};

		let chartContent: ReactNode;
		if (loadStatus === "loading") {
			chartContent = (
				<div className="stock-view-status-msg">Loading widget…</div>
			);
		} else if (loadStatus === "offline") {
			chartContent = (
				<div className="stock-view-status-msg sv-status-error">
					Could not reach the TradingView service. Check your internet
					connection and try reloading.
				</div>
			);
		} else if (loadStatus === "widget-error") {
			chartContent = (
				<div className="stock-view-status-msg sv-status-error">
					Could not load the widget. Try reloading.
				</div>
			);
		} else {
			chartContent = (
				<TradingViewWidget
					state={state}
					onLoad={() => {}}
					onError={handleWidgetError}
				/>
			);
		}

		return (
			<>
				<div className="stock-view-chart-area">
					<div className="stock-view-chart-toolbar">
						<button
							type="button"
							aria-label="Open settings"
							onClick={() => setSettingsVisible((v) => !v)}
							style={{ padding: "0px", width: "30px", height: "25px" }}
						>
							<Settings size={16} />
						</button>
						<button
							type="button"
							aria-label="Reload widget"
							onClick={loadWidget}
							style={{ padding: "0px", width: "30px", height: "25px" }}
						>
							<RefreshCcw size={16} />
						</button>
					</div>
					<div className="stock-view-chart-container">{chartContent}</div>
				</div>
	
				<SettingsPanel
					state={state}
					visible={settingsVisible}
					onClose={() => setSettingsVisible(false)}
					onRestoreDefaults={handleRestoreDefaults}
					onWidgetChange={handleWidgetChange}
					onSymbolChange={(symbol) =>
						setState((prev) => ({ ...prev, symbol }))
					}
					onThemeChange={(theme) =>
						setState((prev) => ({ ...prev, theme }))
					}
					onFilterChange={(filterId, value) =>
						setState((prev) => ({
							...prev,
							filters: { ...prev.filters, [filterId]: value },
						}))
					}
				/>
			</>
		);
	}
);

export default StockViewUI;
