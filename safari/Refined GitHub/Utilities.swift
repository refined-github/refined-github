import SwiftUI


enum SSApp {
	static let isFirstLaunch: Bool = {
		let key = "SS_hasLaunched"

		if UserDefaults.standard.bool(forKey: key) {
			return false
		}

		UserDefaults.standard.set(true, forKey: key)
		return true
	}()
}


struct ShareAppLink: View {
	let appStoreIdentifier: String

	var body: some View {
		ShareLink("Share App", item: "https://apps.apple.com/app/id\(appStoreIdentifier)")
	}
}


struct RateAppLink: View {
	#if os(macOS)
	private static let urlScheme = "macappstore"
	#else
	private static let urlScheme = "itms-apps"
	#endif

	let appStoreIdentifier: String

	var body: some View {
		Link("Rate App", destination: URL(string: "\(Self.urlScheme)://apps.apple.com/app/id\(appStoreIdentifier)?action=write-review")!)
	}
}


#if os(macOS)
typealias WindowIfMacOS = Window
#else
typealias WindowIfMacOS = WindowGroup
#endif


extension URL: ExpressibleByStringLiteral {
	/**
	Example:

	```
	let url: URL = "https://sindresorhus.com"
	```
	*/
	public init(stringLiteral value: StaticString) {
		self.init(string: "\(value)")!
	}
}


extension URL {
	/**
	Example:

	```
	URL("https://sindresorhus.com")
	```
	*/
	init(_ staticString: StaticString) {
		self.init(string: "\(staticString)")!
	}
}


extension SetAlgebra {
	/**
	Insert the `value` if it doesn't exist, otherwise remove it.
	*/
	mutating func toggleExistence(_ value: Element) {
		if contains(value) {
			remove(value)
		} else {
			insert(value)
		}
	}

	/**
	Insert the `value` if `shouldExist` is true, otherwise remove it.
	*/
	mutating func toggleExistence(_ value: Element, shouldExist: Bool) {
		if shouldExist {
			insert(value)
		} else {
			remove(value)
		}
	}
}


#if os(macOS)
private struct WindowAccessor: NSViewRepresentable {
	@MainActor
	private final class WindowAccessorView: NSView {
		@Binding var windowBinding: NSWindow?

		init(binding: Binding<NSWindow?>) {
			self._windowBinding = binding
			super.init(frame: .zero)
		}

		override func viewDidMoveToWindow() {
			super.viewDidMoveToWindow()
			windowBinding = window
		}

		@available(*, unavailable)
		required init?(coder: NSCoder) {
			fatalError() // swiftlint:disable:this fatal_error_message
		}
	}

	@Binding var window: NSWindow?

	init(_ window: Binding<NSWindow?>) {
		self._window = window
	}

	func makeNSView(context: Context) -> NSView {
		WindowAccessorView(binding: $window)
	}

	func updateNSView(_ nsView: NSView, context: Context) {}
}

extension View {
	/**
	Bind the native backing-window of a SwiftUI window to a property.
	*/
	func bindHostingWindow(_ window: Binding<NSWindow?>) -> some View {
		background(WindowAccessor(window))
	}
}

private struct WindowViewModifier: ViewModifier {
	@State private var window: NSWindow?

	let onWindow: (NSWindow?) -> Void

	func body(content: Content) -> some View {
		onWindow(window)

		return content
			.bindHostingWindow($window)
	}
}

extension View {
	/**
	Access the native backing-window of a SwiftUI window.
	*/
	@MainActor
	func accessHostingWindow(_ onWindow: @escaping (NSWindow?) -> Void) -> some View {
		modifier(WindowViewModifier(onWindow: onWindow))
	}

	@MainActor
	func windowLevel(_ level: NSWindow.Level) -> some View {
		accessHostingWindow {
			$0?.level = level
		}
	}

	@MainActor
	func windowIsMinimizable(_ isMinimizable: Bool = true) -> some View {
		accessHostingWindow {
			$0?.styleMask.toggleExistence(.miniaturizable, shouldExist: isMinimizable)
		}
	}

	@MainActor
	func windowIsResizable(_ isResizable: Bool = true) -> some View {
		accessHostingWindow {
			$0?.styleMask.toggleExistence(.resizable, shouldExist: isResizable)
		}
	}

	@MainActor
	func windowIsRestorable(_ isRestorable: Bool = true) -> some View {
		accessHostingWindow {
			$0?.isRestorable = isRestorable
		}
	}

	@MainActor
	func windowIsMovableByWindowBackground(_ isMovableByWindowBackground: Bool = true) -> some View {
		accessHostingWindow {
			$0?.isMovableByWindowBackground = isMovableByWindowBackground
		}
	}

	@MainActor
	func windowIsStandardButtonHidden(
		isHidden: Bool = true,
		_ buttonTypes: NSWindow.ButtonType...
	) -> some View {
		accessHostingWindow {
			for buttonType in buttonTypes {
				$0?.standardWindowButton(buttonType)?.isHidden = isHidden
			}
		}
	}
}
#endif


#if os(macOS)
extension Error {
	@MainActor
	func present() {
		// Required since `presentError` is not yet annotated with `@MainActor`. (macOS 13.5)
		DispatchQueue.main.async {
			NSApp.presentError(self)
		}
	}
}
#endif
