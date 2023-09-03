import SwiftUI

@main
struct AppMain: App {
	var body: some Scene {
		WindowIfMacOS(Text("Refined GitHub"), id: "main") {
			MainScreen()
		}
			#if os(macOS)
			.windowStyle(.hiddenTitleBar)
			.windowResizability(.contentSize)
			.defaultPosition(.center)
			.commands {
				CommandGroup(replacing: .newItem) {}
				CommandGroup(replacing: .help) {
					Link("Website", destination: "https://github.com/refined-github/refined-github")
					Divider()
					RateAppLink(appStoreIdentifier: Constants.appStoreIdentifier)
					// TODO: Doesn't work. (macOS 13.4)
					// ShareAppLink(appStoreIdentifier: Constants.appStoreIdentifier)
				}
			}
			#endif
	}
}
