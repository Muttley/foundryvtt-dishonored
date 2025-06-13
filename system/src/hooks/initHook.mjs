import { DISHONORED, SYSTEM_ID, SYSTEM_NAME } from "../config.mjs";

import * as documents from "../documents/_module.mjs";
import * as sheets from "../sheets/_module.mjs";

import { DishonoredHooks } from "../system/DishonoredHooks.mjs";
import { DishonoredRoll } from "../system/DishonoredRoll.mjs";

import DishonoredMomentumTracker from "../apps/DishonoredMomentumTracker.mjs";
import DishonoredRollDialog from "../apps/DishonoredRollDialog.mjs";
import DishonoredUtils from "../utils/DishonoredUtils.mjs";
import Logger from "../utils/Logger.mjs";

import installTokenBarShim from "../tokens.mjs";
import preloadTemplates from "../templates.mjs";
import registerSettings from "../settings.mjs";
import registerHandlebarsHelpers from "../handlebars.mjs";

export async function initHook() {
	console.debug(`${SYSTEM_NAME} | Running init hook`);

	CONFIG.DISHONORED = DISHONORED;

	globalThis.SYSTEM_ID = SYSTEM_ID;
	globalThis.SYSTEM_NAME = SYSTEM_NAME;

	globalThis.dishonored = {
		logger: Logger,
		roll: new DishonoredRoll(),
		rollDialog: DishonoredRollDialog,
		tracker: new DishonoredMomentumTracker(),
		utils: DishonoredUtils,
	};

	CONFIG.Combat.initiative = {
		formula: "@styles.swiftly.value",
		decimals: 0,
	};

	registerDocumentClasses();
	registerDocumentSheets();

	registerSettings();
	registerHandlebarsHelpers();

	preloadTemplates();
	installTokenBarShim();

	DishonoredHooks.attach();
}

function registerDocumentClasses() {
	CONFIG.Actor.documentClass = documents.DishonoredActor;
	CONFIG.Item.documentClass = documents.DishonoredItem;
}

function registerDocumentSheets() {
	foundry.documents.collections.Actors.registerSheet(
		"dishonored",
		sheets.DishonoredCharacterSheet,
		{
			types: ["character"],
			makeDefault: true,
		}
	);

	foundry.documents.collections.Actors.registerSheet(
		"dishonored",
		sheets.DishonoredNPCSheet,
		{ types: ["npc"] }
	);

	foundry.documents.collections.Items.registerSheet(
		"dishonored",
		sheets.DishonoredItemSheet,
		{ makeDefault: true }
	);
}
