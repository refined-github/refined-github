import WebKit

#if os(iOS)
import UIKit
typealias XViewController = UIViewController
#elseif os(macOS)
import Cocoa
import SafariServices
typealias XViewController = NSViewController
#endif

let extensionBundleIdentifier = "com.sindresorhus.Refined-GitHub.Extension"

final class ViewController: XViewController, WKNavigationDelegate, WKScriptMessageHandler {
	@IBOutlet var webView: WKWebView!

	override func viewDidLoad() {
		super.viewDidLoad()

		webView.navigationDelegate = self

		#if os(iOS)
		webView.scrollView.isScrollEnabled = false
		#endif

		webView.configuration.userContentController.add(self, name: "controller")

		webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
	}

	func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
		#if os(iOS)
		webView.evaluateJavaScript("show('ios')")
		#elseif os(macOS)
		webView.evaluateJavaScript("show('mac')")

		SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
			guard let state = state, error == nil else {
				DispatchQueue.main.async {
					NSApp.presentError(error!)
				}
				return
			}

			DispatchQueue.main.async {
				webView.evaluateJavaScript("show('mac', \(state.isEnabled)")
			}
		}
		#endif
	}

	func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
		#if os(macOS)
		guard let action = message.body as? String else {
			return
		}

		if action == "open-help" {
			NSWorkspace.shared.open(URL(string: "https://github.com/refined-github/refined-github/issues/4216#issuecomment-817097886")!)
			return
		}

		guard action == "open-preferences" else {
			return;
		}

		SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
			if let error = error {
				DispatchQueue.main.async {
					NSApp.presentError(error)
				}
				return
			}

			DispatchQueue.main.async {
				NSApplication.shared.terminate(nil)
			}
		}
		#endif
	}
}
