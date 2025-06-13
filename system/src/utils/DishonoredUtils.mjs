export default class DishonoredUtils {

	static clampValue(value, min=0, max=1) {
		return Math.max(min, Math.min(max, value));
	}

	static foundryMinVersion(version) {
		const majorVersion = parseInt(game.version.split(".")[0]);
		return majorVersion >= version;
	}

	static getMessageStyles() {
		const messageStyles = this.foundryMinVersion(12)
			? CONST.CHAT_MESSAGE_STYLES
			: CONST.CHAT_MESSAGE_TYPES;

		return messageStyles;
	}

	// If this is a new release, show the release notes to the GM the first time
	// they login
	static async showNewReleaseNotes() {
		if (game.user.isGM) {
			const savedVersion = game.settings.get(SYSTEM_ID, "systemVersion");
			const systemVersion = game.system.version;

			if (systemVersion !== savedVersion) {
				foundry.applications.ui.Hotbar.toggleDocumentSheet(
					CONFIG.DISHONORED.JOURNAL_UUIDS.releaseNotes
				);

				game.settings.set(SYSTEM_ID, "systemVersion", systemVersion);
			}
		}
	}
}
