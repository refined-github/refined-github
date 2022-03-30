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

@MainActor
final class ViewController: XViewController, WKNavigationDelegate, WKScriptMessageHandler {
	@IBOutlet var webView: WKWebView!

	override func viewDidLoad() {
		super.viewDidLoad()

		webView.navigationDelegate = self

		#if os(iOS)
		webView.scrollView.isScrollEnabled = false
		#endif

		#if os(macOS)
		webView.drawsBackground = false
		#endif

		webView.configuration.userContentController.add(self, name: "controller")

		webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)

		#if os(macOS)
		DispatchQueue.main.async { [self] in
			view.window?.titlebarAppearsTransparent = true
		}
		#endif
	}

	func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
		// TODO: Use `callAsyncJavaScript` when targeting macOS 12.
		#if os(iOS)
		webView.evaluateJavaScript("show('ios')")
		#elseif os(macOS)
		webView.evaluateJavaScript("show('mac')")

		Task {
			do {
				let state = try await SFSafariExtensionManager.stateOfSafariExtension(withIdentifier: extensionBundleIdentifier)

				if #available(macOS 12, iOS 15, *) {
					_ = try await webView.callAsyncJavaScript("show('mac', isEnabled)", arguments: ["isEnabled": state.isEnabled], contentWorld: .page)
				} else {
					_ = try await webView.evaluateJavaScript("show('mac', \(state.isEnabled)); 0") // The `0` works around a bug in `evaluateJavaScript`.
				}
			} catch {
				_ = await MainActor.run { // Required since `presentError` is not yet annotated with `@MainActor`.
					DispatchQueue.main.async {
						NSApp.presentError(error)
					}
				}
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

		Task {
			do {
				try await SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier)
				NSApplication.shared.terminate(nil)
			} catch {
				_ = await MainActor.run { // Required since `presentError` is not yet annotated with `@MainActor`.
					DispatchQueue.main.async {
						NSApp.presentError(error)
					}
				}
			}
		}
		#endif
	}
}
