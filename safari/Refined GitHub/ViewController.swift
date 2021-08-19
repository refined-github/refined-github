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

extension NSButton {
	@objc // Using this so it's possible to override the init in subclasses.
	convenience init(title: String) {
		self.init(title: title, target: nil, action: nil)
	}
}

@IBDesignable
class LinkButton: NSButton { // swiftlint:disable:this final_class
	@IBInspectable fileprivate var url: String!

	convenience init(title: String, url: String) {
		self.init(title: title)
		self.url = url
		setup()
	}

	override func awakeFromNib() {
		super.awakeFromNib()
		setup()
	}

	override func resetCursorRects() {
		discardCursorRects()
		addCursorRect(bounds, cursor: .pointingHand)
	}

	private func setup() {
		wantsLayer = true
		isBordered = false
		contentTintColor = .linkColor
		focusRingType = .none

		onAction { [weak self] _ in
			guard let self = self else {
				return
			}

			NSWorkspace.shared.open(URL(string: self.url)!)
		}
	}
}

private var controlActionClosureProtocolAssociatedObjectKey: UInt8 = 0

protocol ControlActionClosureProtocol: NSObjectProtocol {
	var target: AnyObject? { get set }
	var action: Selector? { get set }
}

private final class ActionTrampoline<T>: NSObject {
	let action: (T) -> Void

	init(action: @escaping (T) -> Void) {
		self.action = action
	}

	@objc
	func action(sender: AnyObject) {
		// This is safe as it can only be `T`.
		// swiftlint:disable:next force_cast
		action(sender as! T)
	}
}

extension ControlActionClosureProtocol {
	func onAction(_ action: @escaping (Self) -> Void) {
		let trampoline = ActionTrampoline(action: action)
		target = trampoline
		self.action = #selector(ActionTrampoline<Self>.action(sender:))
		objc_setAssociatedObject(self, &controlActionClosureProtocolAssociatedObjectKey, trampoline, .OBJC_ASSOCIATION_RETAIN)
	}
}

extension NSControl: ControlActionClosureProtocol {}
extension NSMenuItem: ControlActionClosureProtocol {}
extension NSToolbarItem: ControlActionClosureProtocol {}
extension NSGestureRecognizer: ControlActionClosureProtocol {}
