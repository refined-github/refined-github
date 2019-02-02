// This type was built by cherry picking some types from @types/chrome

declare namespace browser.events {
	/** An object which allows the addition and removal of listeners for a Chrome event. */
	export interface Event<T extends () => void> {
		/**
		 * Registers an event listener callback to an event.
		 * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
		 * The callback parameter should be a function that looks like this:
		 * function() {...};
		 */
		addListener(callback: T): void;
		/**
		 * Returns currently registered rules.
		 * @param callback Called with registered rules.
		 * The callback parameter should be a function that looks like this:
		 * function(array of Rule rules) {...};
		 * Parameter rules: Rules that were registered, the optional parameters are filled with values.
		 */
		hasListener(callback: T): boolean;
		/**
		 * Deregisters an event listener callback from an event.
		 * @param callback Listener that shall be unregistered.
		 * The callback parameter should be a function that looks like this:
		 * function() {...};
		 */
		removeListener(callback: T): void;
		hasListeners(): boolean;
	}
}

declare namespace browser.tabs {	// eslint-disable-line no-redeclare
	export interface Tab {
	/**
	 * Optional.
	 * Either loading or complete.
	 */
		status?: string;
		/** The zero-based index of the tab within its window. */
		index: number;
		/**
	 * Optional.
	 * The ID of the tab that opened this tab, if any. This property is only present if the opener tab still exists.
	 * @since Chrome 18.
	 */
		openerTabId?: number;
		/**
	 * Optional.
	 * The title of the tab. This property is only present if the extension's manifest includes the "tabs" permission.
	 */
		title?: string;
		/**
	 * Optional.
	 * The URL the tab is displaying. This property is only present if the extension's manifest includes the "tabs" permission.
	 */
		url?: string;
		/**
	 * Whether the tab is pinned.
	 * @since Chrome 9.
	 */
		pinned: boolean;
		/**
	 * Whether the tab is highlighted.
	 * @since Chrome 16.
	 */
		highlighted: boolean;
		/** The ID of the window the tab is contained within. */
		windowId: number;
		/**
	 * Whether the tab is active in its window. (Does not necessarily mean the window is focused.)
	 * @since Chrome 16.
	 */
		active: boolean;
		/**
	 * Optional.
	 * The URL of the tab's favicon. This property is only present if the extension's manifest includes the "tabs" permission. It may also be an empty string if the tab is loading.
	 */
		favIconUrl?: string;
		/**
	 * Optional.
	 * The ID of the tab. Tab IDs are unique within a browser session. Under some circumstances a Tab may not be assigned an ID, for example when querying foreign tabs using the sessions API, in which case a session ID may be present. Tab ID can also be set to chrome.tabs.TAB_ID_NONE for apps and devtools windows.
	 */
		id?: number;
		/** Whether the tab is in an incognito window. */
		incognito: boolean;
		/**
	 * Whether the tab is selected.
	 * @deprecated since Chrome 33. Please use tabs.Tab.highlighted.
	 */
		selected: boolean;
		/**
	 * Optional.
	 * Whether the tab has produced sound over the past couple of seconds (but it might not be heard if also muted). Equivalent to whether the speaker audio indicator is showing.
	 * @since Chrome 45.
	 */
		audible?: boolean;
		/**
	 * Whether the tab is discarded. A discarded tab is one whose content has been unloaded from memory, but is still visible in the tab strip. Its content gets reloaded the next time it's activated.
	 * @since Chrome 54.
	 */
		discarded: boolean;
		/**
	 * Whether the tab can be discarded automatically by the browser when resources are low.
	 * @since Chrome 54.
	 */
		autoDiscardable: boolean;
		/**
	 * Optional.
	 * Current tab muted state and the reason for the last state change.
	 * @since Chrome 46. Warning: this is the current Beta channel.
	 */
		mutedInfo?: MutedInfo;
		/**
	 * Optional. The width of the tab in pixels.
	 * @since Chrome 31.
	 */
		width?: number;
		/**
	 * Optional. The height of the tab in pixels.
	 * @since Chrome 31.
	 */
		height?: number;
		/**
	 * Optional. The session ID used to uniquely identify a Tab obtained from the sessions API.
	 * @since Chrome 31.
	 */
		sessionId?: string;
	}

	export interface CreateProperties {
		/** Optional. The position the tab should take in the window. The provided value will be clamped to between zero and the number of tabs in the window. */
		index?: number;
		/**
		 * Optional.
		 * The ID of the tab that opened this tab. If specified, the opener tab must be in the same window as the newly created tab.
		 * @since Chrome 18.
		 */
		openerTabId?: number;
		/**
		 * Optional.
		 * The URL to navigate the tab to initially. Fully-qualified URLs must include a scheme (i.e. 'http://www.google.com', not 'www.google.com'). Relative URLs will be relative to the current page within the extension. Defaults to the New Tab Page.
		 */
		url?: string;
		/**
		 * Optional. Whether the tab should be pinned. Defaults to false
		 * @since Chrome 9.
		 */
		pinned?: boolean;
		/** Optional. The window to create the new tab in. Defaults to the current window. */
		windowId?: number;
		/**
		 * Optional.
		 * Whether the tab should become the active tab in the window. Does not affect whether the window is focused (see windows.update). Defaults to true.
		 * @since Chrome 16.
		 */
		active?: boolean;
		/**
		 * Optional. Whether the tab should become the selected tab in the window. Defaults to true
		 * @deprecated since Chrome 33. Please use active.
		 */
		selected?: boolean;
	}

	/**
	 * Creates a new tab.
	 * Parameter tab: Details about the created tab. Will contain the ID of the new tab.
	 */
	export function create(createProperties: CreateProperties): Promise<void>;
}

declare namespace browser.runtime {	// eslint-disable-line no-redeclare
	export interface MessageSender {
		/** The ID of the extension or app that opened the connection, if any. */
		id?: string;
		/** The tabs.Tab which opened the connection, if any. This property will only be present when the connection was opened from a tab (including content scripts), and only if the receiver is an extension, not an app. */
		tab?: Tab;
		/**
		 * The frame that opened the connection. 0 for top-level frames, positive for child frames. This will only be set when tab is set.
		 * @since Chrome 41.
		 */
		frameId?: number;
		/**
		 * The URL of the page or frame that opened the connection. If the sender is in an iframe, it will be iframe's URL not the URL of the page which hosts it.
		 * @since Chrome 28.
		 */
		url?: string;
		/**
		 * The TLS channel ID of the page or frame that opened the connection, if requested by the extension or app, and if available.
		 * @since Chrome 32.
		 */
		tlsChannelId?: string;
	}

	export function sendMessage<TMessage>(message: TMessage): Promise<any>;

	export function getBackground(): Promise<Window>;

	export const onMessage: ExtensionMessageEvent;

	export const onInstalled: ExtensionMessageEvent;

	// Keeping the empty interface as per the Chrome extension types.
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	export interface ExtensionMessageEvent extends browser.events.Event<(message: any, sender: MessageSender, sendResponse: (response: any) => void) => void> { }
}

declare namespace browser.management	{	// eslint-disable-line no-redeclare
	export interface ExtensionInfo {
		/**
			 * Optional.
			 * A reason the item is disabled.
			 * @since Chrome 17.
			 */
		disabledReason?: string;
		/** Optional. The launch url (only present for apps). */
		appLaunchUrl?: string;
		/**
			 * The description of this extension, app, or theme.
			 * @since Chrome 9.
			 */
		description: string;
		/**
			 * Returns a list of API based permissions.
			 * @since Chrome 9.
			 */
		permissions: string[];
		/**
			 * Optional.
			 * A list of icon information. Note that this just reflects what was declared in the manifest, and the actual image at that url may be larger or smaller than what was declared, so you might consider using explicit width and height attributes on img tags referencing these images. See the manifest documentation on icons for more details.
			 */
		icons?: IconInfo[];
		/**
			 * Returns a list of host based permissions.
			 * @since Chrome 9.
			 */
		hostPermissions: string[];
		/** Whether it is currently enabled or disabled. */
		enabled: boolean;
		/**
			 * Optional.
			 * The URL of the homepage of this extension, app, or theme.
			 * @since Chrome 11.
			 */
		homepageUrl?: string;
		/**
			 * Whether this extension can be disabled or uninstalled by the user.
			 * @since Chrome 12.
			 */
		mayDisable: boolean;
		/**
			 * How the extension was installed.
			 * @since Chrome 22.
			 */
		installType: string;
		/** The version of this extension, app, or theme. */
		version: string;
		/** The extension's unique identifier. */
		id: string;
		/**
			 * Whether the extension, app, or theme declares that it supports offline.
			 * @since Chrome 15.
			 */
		offlineEnabled: boolean;
		/**
			 * Optional.
			 * The update URL of this extension, app, or theme.
			 * @since Chrome 16.
			 */
		updateUrl?: string;
		/**
			 * The type of this extension, app, or theme.
			 * @since Chrome 23.
			 */
		type: string;
		/** The url for the item's options page, if it has one. */
		optionsUrl: string;
		/** The name of this extension, app, or theme. */
		name: string;
		/**
			 * A short version of the name of this extension, app, or theme.
			 * @since Chrome 31.
			 */
		shortName: string;
		/**
			 * True if this is an app.
			 * @deprecated since Chrome 33. Please use management.ExtensionInfo.type.
			 */
		isApp: boolean;
		/**
			 * Optional.
			 * The app launch type (only present for apps).
			 * @since Chrome 37.
			 */
		launchType?: string;
		/**
			 * Optional.
			 * The currently available launch types (only present for apps).
			 * @since Chrome 37.
			 */
		availableLaunchTypes?: string[];
	}
	/** Information about an icon belonging to an extension, app, or theme. */
	export interface IconInfo {
		/** The URL for this icon image. To display a grayscale version of the icon (to indicate that an extension is disabled, for example), append ?grayscale=true to the URL. */
		url: string;
		/** A number representing the width and height of the icon. Likely values include (but are not limited to) 128, 48, 24, and 16. */
		size: number;
	}
	/**
		* Returns information about the calling extension, app, or theme. Note: This function can be used without requesting the 'management' permission in the manifest.
		* @since Chrome 39.
		*/
	export function getSelf(): Promise<ExtensionInfo>;
}

declare namespace browser.storage {	// eslint-disable-line no-redeclare
	export interface StorageArea {
		/**
		 * Sets multiple items.
		 * @param items An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
		 * Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).
		 */
		set<TItems>(items: TItems): Promise<void>;
		/**
		 * Gets one or more items from storage.
		 * @param keys A single key to get, list of keys to get, or a dictionary specifying default values.
		 * An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
		 */
		get<T=unknown>(keys: string | string[] | object | null): Promise<T>;
	}

	export interface LocalStorageArea extends StorageArea {
		/** The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the unlimitedStorage permission. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
		QUOTA_BYTES: number;
	}

	export const local: LocalStorageArea;
}
