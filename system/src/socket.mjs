import DishonoredMomentumTracker from "./apps/DishonoredMomentumTracker.mjs";

export default function registerSocketEvents() {
	game.socket.on(`system.${SYSTEM_ID}`, event => {
		if (event.type === "setCounter" && game.user.isGM) {
			DishonoredMomentumTracker.setCounter(event.payload.value, event.payload.type);
		}

		if (event.type === "updateCounter") {
			dishonored.tracker.render(true);
		}
	});
}
