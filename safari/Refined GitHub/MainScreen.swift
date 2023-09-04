import SwiftUI
import SafariServices

struct MainScreen: View {
	@State private var isEnabled = false

	var body: some View {
		VStack(spacing: 32) {
			VStack {
				Image(decorative: "LargeIcon")
					.resizable()
					.scaledToFit()
					.frame(height: 100)
				Text("Refined GitHub")
					.font(.title)
			}
			#if os(macOS)
			VStack(spacing: 8) {
				statusView
				Text("You can turn it \(isEnabled ? "off" : "on") in the Safari extensions settings")
					.font(.subheadline)
					.foregroundStyle(.secondary)
			}
			VStack(spacing: 16) {
				Button("Open Safari Settings…") {
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
			Text("You can turn on the Safari extension in “Settings › Safari”")
				.font(.subheadline)
				.foregroundStyle(.secondary)
				.multilineTextAlignment(.center)
			#endif
		}
			.padding()
			.offset(y: -12) // Looks better than fully center.
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
			await error.present()
		}
	}

	private func openSafariSetting() async {
		do {
			try await SFSafariApplication.showPreferencesForExtension(withIdentifier: Constants.extensionBundleIdentifier)
			await NSApplication.shared.terminate(nil)
		} catch {
			await error.present()
		}
	}
	#endif
}

struct MainScreen_Previews: PreviewProvider {
	static var previews: some View {
		MainScreen()
	}
}
