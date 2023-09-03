import SwiftUI

@main
struct AppMain: App {
	var body: some Scene {
		// TODO
		// WindowIfMacOS(Text("Refined GitHub"), id: "main") {
		WindowGroup {
			MainScreen()
		}
			#if os(macOS)
			.windowStyle(.hiddenTitleBar)
//			.windowResizability(.contentSize)
//			.defaultPosition(.center)
			.commands {
				CommandGroup(replacing: .newItem) {}
				CommandGroup(replacing: .help) {
					Link("Website", destination: "https://github.com/refined-github/refined-github")
					Divider()
					Link("Rate App", destination: "macappstore://apps.apple.com/app/id1545870783?action=write-review")
					// TODO: Doesn't work. (macOS 13.4)
					// ShareLink("Share App", item: "https://apps.apple.com/app/id1545870783")
				}
			}
			#endif
	}
}
