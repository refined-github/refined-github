import Cocoa
import SafariServices.SFSafariApplication
import SafariServices.SFSafariExtensionManager

let appName = "Refined GitHub"
let extensionBundleIdentifier = "com.sindresorhus.Refined-GitHub.Extension"

final class ViewController: NSViewController {
	@IBOutlet private var appNameLabel: NSTextField!

	override func viewDidLoad() {
		super.viewDidLoad()

		appNameLabel.stringValue = appName

		SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
			if let error = error {
				NSLog("%@", error.localizedDescription)
				DispatchQueue.main.async {
					NSApp.presentError(error)
				}
				return
			}

			guard let state = state else {
				// This should in theory not be hit.
				NSLog("Could not get state.")
				return
			}

			DispatchQueue.main.async {
				if state.isEnabled {
					self.appNameLabel.stringValue = "\(appName)'s extension is currently on."
				} else {
					self.appNameLabel.stringValue = "\(appName)'s extension is currently off. You can turn it on in Safari Extensions preferences."
				}

				self.appNameLabel.stringValue += "\n\n\nIf the extension doesn‘t show up in Safari, try running the below command in the terminal and restart your computer:\n\n/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Safari.app"
				self.appNameLabel.isSelectable = true
			}
		}
	}

	override func viewDidAppear() {
		super.viewDidAppear()

		if let window = view.window {
			window.title = appName
			window.level = .floating
			window.styleMask = [.titled]
			window.center()
		}

		NSApp.activate(ignoringOtherApps: true)
	}

	@IBAction
	private func openSafariExtensionPreferences(_ sender: AnyObject?) {
		SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
			if let error = error {
				NSLog("%@", error.localizedDescription)
				DispatchQueue.main.async {
					NSApp.presentError(error)
				}
				return
			}

			DispatchQueue.main.async {
				NSApp.terminate(nil)
			}
		}
	}
}
