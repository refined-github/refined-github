import SwiftUI
import SafariServices
import StoreKit

struct MainScreen: View {
	@Environment(\.requestReview) private var requestReview
	@Environment(\.scenePhase) private var scenePhase
	@AppStorage("hasRequestedReview") private var hasRequestedReview = false
	@State private var isEnabled = false

	var body: some View {
		VStack(spacing: 40) {
			VStack {
				Image(.largeIcon)
					.resizable()
					.scaledToFit()
					.frame(height: 140)
					.accessibilityHidden(true)
				Text("Refined GitHub")
					.font(.largeTitle.bold())
					#if os(macOS)
					.padding(.top, 8)
					#endif
			}
			#if os(macOS)
			.padding(.top)
			#endif
			#if os(macOS)
			extensionStatusView
			VStack(spacing: 16) {
				Button("Open Safari Settings") {
					Task {
						await openExtensionSettings()
					}
				}
				.buttonStyle(.borderedProminent)
				.controlSize(.large)
				Link("Does the extension not show up?", destination: "https://github.com/refined-github/refined-github/issues/4216#issuecomment-817097886")
					.controlSize(.small)
			}
			#else
			if #available(iOS 26.2, visionOS 26.2, *) {
				extensionStatusView
				Button(isEnabled ? "Extension Settings" : "Enable Extension") {
					Task {
						await openExtensionSettings()
					}
				}
				.buttonStyle(.borderedProminent)
				.controlSize(.large)
				.font(.title3.weight(.medium))
			} else {
				Link("Get Started", destination: URL(string: "x-safari-https://refined-github.github.io/ios/enable.html")!)
					.buttonStyle(.borderedProminent)
					.controlSize(.large)
					.font(.title3.weight(.medium))
			}
			#endif
		}
		.frame(maxWidth: .infinity, maxHeight: .infinity)
		.padding()
		.offset(y: -20) // Looks better than fully center.
		.safeAreaInset(edge: .bottom) {
			Text("The app is just a container for the Safari extension and does not do anything.")
				.font(.subheadline)
				.foregroundStyle(.secondary)
				.multilineTextAlignment(.center)
				.padding()
				.padding(.horizontal)
		}
		.task {
			requestReviewIfNeeded()
			await updateExtensionStatus()
		}
		.onChange(of: scenePhase) { newScenePhase in
			guard newScenePhase == .active else {
				return
			}

			Task {
				await updateExtensionStatus()
			}
		}
		#if os(macOS)
		.padding()
		.padding()
		.fixedSize()
		.windowLevel(.floating)
		.windowIsRestorable(false)
		.windowIsMinimizable(false)
		.windowIsStandardButtonHidden(.miniaturizeButton, .zoomButton)
		.windowIsMovableByWindowBackground()
		#endif
	}

	private var extensionStatusView: some View {
		VStack(spacing: 8) {
			Group {
				if isEnabled {
					Text(Image(systemName: "checkmark.seal.fill"))
						.foregroundColor(.green)
						+ Text(" Enabled")
				} else {
					Text(Image(systemName: "xmark.seal.fill"))
						.foregroundColor(.red)
						+ Text(" Disabled")
				}
			}
			.symbolRenderingMode(.multicolor)
			.font(.title3)
			Text("You can turn it \(isEnabled ? "off" : "on") in the Safari extensions settings")
				.font(.subheadline)
				.foregroundStyle(.secondary)
		}
	}

	private func updateExtensionStatus() async {
		#if os(macOS)
		do {
			isEnabled = try await SafariExtension.isEnabled(forIdentifier: Constants.extensionBundleIdentifier)
		} catch {
			error.present()
		}
		#else
		guard #available(iOS 26.2, visionOS 26.2, *) else {
			return
		}

		do {
			isEnabled = try await SafariExtension.isEnabled(forIdentifier: Constants.extensionBundleIdentifier)
		} catch {
			print(error)
		}
		#endif
	}

	#if os(macOS)
	private func openExtensionSettings() async {
		do {
			try await SafariExtension.openSettings(forIdentifier: Constants.extensionBundleIdentifier)
			NSApplication.shared.terminate(nil)
		} catch {
			error.present()
		}
	}
	#else
	@available(iOS 26.2, visionOS 26.2, *)
	private func openExtensionSettings() async {
		do {
			try await SafariExtension.openSettings(forIdentifier: Constants.extensionBundleIdentifier)
		} catch {
			print(error)
		}
	}
	#endif

	private func requestReviewIfNeeded() {
		guard
			!SSApp.isFirstLaunch,
			!hasRequestedReview
		else {
			return
		}

		requestReview()
		hasRequestedReview = true
	}
}

#Preview {
	MainScreen()
}
