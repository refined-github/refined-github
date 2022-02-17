import Foundation
import WebKit

extension WKWebView {
	/**
	Whether the web view should have a background. Set to `false` to make it transparent.
	*/
	@available(iOS, unavailable)
	var drawsBackground: Bool {
		get {
			value(forKey: "drawsBackground") as? Bool ?? true
		}
		set {
			setValue(newValue, forKey: "drawsBackground")
		}
	}
}
