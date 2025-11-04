const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class DishonoredMomentumTracker
	extends HandlebarsApplicationMixin(ApplicationV2) {

	static DEFAULT_OPTIONS = {
		actions: {
			decrement: this._onDecrement,
			increment: this._onIncrement,
		},
		classes: ["dishonored"],
		form: {
			closeOnSubmit: false,
			submitOnChange: true,
			handler: DishonoredMomentumTracker._onSubmit,
		},
		tag: "form",
		window: {
			frame: false,
			resizable: false,
		},
	};


	static PARTS = {
		form: {
			template: templatePath("apps/momentum-tracker"),
			classes: ["momentum-tracker"],
		},
	};


	/**
	 * Change the counter of (type) by (value)
	 * @param diff  How much to change the counter
	 * @param type  Type of counter, "momentum" or "chaos"
	 */
	static async changeCounter(diff, type) {
		this.checkCounterUpdate(diff, type);

		const newValue = game.settings.get(SYSTEM_ID, type) + diff;
		await DishonoredMomentumTracker.setCounter(newValue, type);
	}


	// Check user entry. Rerender if error is detected to reset to the correct value
	static checkCounterUpdate(value, type) {
		const updateError = {
			counter: "Dishonored | Error updating Counter: Invalid Counter Type",
			value: "Dishonored | Error updating Counter: Invalid Value Type",
		};

		if (type !== "chaos" && type !== "momentum") {
			ui.notifications.error("Error updating Counter: Invalid Counter Type");
			dishonored.tracker.render(true);
			throw updateError.counter;
		}

		if (!value || Number.isNaN(value)) {
			ui.notifications.error("Error updating Counter: Invalid Value Type");
			dishonored.tracker.render(true);
			throw updateError.value;
		}
	}


	/**
	 * Set the counter of (type) to (value)
	 * @param value Value to set counter to
	 * @param type  Type of counter, "momentum" or "chaos"
	 */
	static async setCounter(value, type) {
		if (!game.user.isGM) {
			game.socket.emit(`system.${SYSTEM_ID}`, {
				type: "setCounter",
				payload: {value, type},
			});
			return;
		}

		value = Number.parseInt(value);

		value = Math.max(0, value);

		if (type === "momentum") {
			value = Math.min(6, value);
		}
		else {
			value = Math.min(99, value);
		}

		await game.settings.set(SYSTEM_ID, type, value);

		dishonored.tracker.render(true);

		// Emit socket event for users to rerender their counters
		game.socket.emit(`system.${SYSTEM_ID}`, {type: "updateCounter"});
	}


	static async _onDecrement(event, html) {
		const {resource} = event.target.parentElement?.dataset ?? undefined;

		if (resource) DishonoredMomentumTracker.changeCounter(-1, resource);
	}


	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);

		// Move the element into the ui-left stack.
		const uiBottom = document.querySelector("#ui-bottom");
		if (!uiBottom) {
			conan.error("Error: Could not find #ui-bottom!");
			return;
		}

		const hotbar = uiBottom.querySelector("#hotbar");
		if (!hotbar) {
			conan.warn(
				"Could not find hotbar HTML element, appending Momentum Tracker to end of ui-bottom."
			);
			uiBottom.appendChild(this.element);
			return;
		}

		uiBottom.insertBefore(this.element, hotbar);
	}


	static async _onIncrement(event, html) {
		const {resource} = event.target.parentElement?.dataset ?? undefined;

		if (resource) DishonoredMomentumTracker.changeCounter(1, resource);
	}


	static async _onSubmit(event, form, formData) {
		const {resource} = event.target.dataset ?? undefined;
		const value = event.target.value;
		DishonoredMomentumTracker.setCounter(value, resource);
	}


	get canEditChaos() {
		const chaosEditRole = game.settings.get(SYSTEM_ID, "chaosPermissionLevel");
		return game.user.isGM || game.user.hasRole(chaosEditRole);
	}


	get canEditMomentum() {
		const momentumEditRole = game.settings.get(SYSTEM_ID, "momentumPermissionLevel");
		return game.user.isGM || game.user.hasRole(momentumEditRole);
	}


	async _prepareContext(options={}) {
		const context = await super._prepareContext(options);

		context.canEditChaos = this.canEditChaos;
		context.canEditMomentum = this.canEditMomentum;

		context.chaos = game.settings.get(SYSTEM_ID, "chaos");
		context.momentum = game.settings.get(SYSTEM_ID, "momentum");

		return context;
	}
}
