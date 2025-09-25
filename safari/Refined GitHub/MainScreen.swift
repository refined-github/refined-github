import SwiftUI
import SafariServices
import StoreKit

struct MainScreen: View {
	@Environment(\.requestReview) private var requestReview
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
			VStack(spacing: 8) {
				statusView
				Text("You can turn it \(isEnabled ? "off" : "on") in the Safari extensions settings")
					.font(.subheadline)
					.foregroundStyle(.secondary)
			}
			VStack(spacing: 16) {
				Button("Open Safari Settings") {
					Task {
						await openSafariSetting()
					}
				}
				.buttonStyle(.borderedProminent)
				.controlSize(.large)
				Link("Does the extension not show up?", destination: "https://github.com/refined-github/refined-github/issues/4216#issuecomment-817097886")
					.controlSize(.small)
			}
			#else
			Link("Get Started", destination: URL(string: "x-safari-https://refined-github.github.io/ios/enable.html")!)
				.buttonStyle(.borderedProminent)
				.controlSize(.large)
				.font(.title3.weight(.medium))
			#endif
		}
		.frame(maxWidth: .infinity, maxHeight: .infinity)
		.padding()
		.offset(y: -20) // Looks better than fully center.
		.task {
			requestReviewIfNeeded()
		}
		.safeAreaInset(edge: .bottom) {
			Text("The app is just a container for the Safari extension and does not do anything.")
				.font(.subheadline)
				.foregroundStyle(.secondary)
				.multilineTextAlignment(.center)
				.padding()
				.padding(.horizontal)
		}
		#if os(macOS)
		.padding()
		.padding()
		.fixedSize()
		.task {
			await setExtensionStatus()
		}
		.windowLevel(.floating)
		.windowIsRestorable(false)
		.windowIsMinimizable(false)
		.windowIsStandardButtonHidden(.miniaturizeButton, .zoomButton)
		.windowIsMovableByWindowBackground()
		#endif
	}

	private var statusView: some View {
		Group {
			if isEnabled {
				(
					Text(Image(systemName: "checkmark.seal.fill"))
						.foregroundColor(.green)
							+ Text(" Enabled")
				)
			} else {
				(
					Text(Image(systemName: "xmark.seal.fill"))
						.foregroundColor(.red)
							+ Text(" Disabled")
				)
			}
		}
			.symbolRenderingMode(.multicolor)
			.font(.title3)
	}

	#if os(macOS)
	private func setExtensionStatus() async {
		do {
			isEnabled = try await SFSafariExtensionManager.stateOfSafariExtension(withIdentifier: Constants.extensionBundleIdentifier).isEnabled
		} catch {
			error.present()
		}
	}

	private func openSafariSetting() async {
		do {
			try await SFSafariApplication.showPreferencesForExtension(withIdentifier: Constants.extensionBundleIdentifier)
			NSApplication.shared.terminate(nil)
		} catch {
			error.present()
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
