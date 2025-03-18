# v1.3.1

## Chores
- [#48] Added French as a supported i18n language
- [#49] Remove usage of deprecated `gridDistance` and `gridUnits` settings in `system.json`

*Many thanks to **Coukaratcha** for their work on the French translation*

---

# v1.3.0

## Chores
- [#42] Merged Spanish translation updates from Crowdin
- [#43] Remove support for Foundry v11
- [#44] Update node and package versions used during build process
- [#45] Update build scripts to use latest GitHub packages

**NOTE:** This release marks the end of support for FoundryVTT v11 and requires FoundryVTT v12

---

# v1.2.0

## Bugfixes
- [#26] Incorrect heading on Contacts list of Biography information

## Chores
- [#27] Ensure compatibility with Foundry v12
- [#29] globalThis.mergeObject must now be accessed via foundry.utils.mergeObject *(Foundry v12 compatibility)*
- [#30] Math.clamped is deprecated in favor of Math.clamp *(Foundry v12 compatibility)*
- [#34] CONST.CHAT_MESSAGE_STYLES.ROLL is deprecated in favor of defining rolls directly in ChatMessage#rolls *(Foundry v12 compatibility)*
- [#35] CONST.CHAT_MESSAGE_TYPES is deprecated in favor of CONST.CHAT_MESSAGE_STYLES *(Foundry v12 compatibility)*
- [#36] async option for Roll#evaluate has been removed *(Foundry v12 compatibility)*
- [#37] globalThis.duplicate must now be accessed via foundry.utils.duplicate *(Foundry v12 compatibility)*
- [#38] The {{select}} handlebars helper is deprecated in favor of using the {{selectOptions}} helper *(Foundry v12 compatibility)*

---

# v1.1.0

## Enhancements
- [#21] Added Italian as a supported i18n language

*Many thanks to Balian for their work on the Italian translation*

---

# v1.0.1

## Bugfixes
- [#19] Manifest path incorrect

---

# v1.0.0

## Bugfixes
- [#1] NPC sheet won't open
- [#2] Unable to edit Note sections on Items and Actors
- [#10] Status bar on abilities and belongings tabs of character sheet overflow the sheet

## Enhancements
- [#3] Remove Momentum/Chaos tracker permission requirements
- [#4] Remove unecessary code duplication
- [#5] Implement a more robust data migration process
- [#6] Display release notes when new version/world is launched for the first time
- [#8] Setup Crowdin translation project. https://crowdin.com/project/foundryvtt-dishonored
- [#11] Item compendiums added; containing Armor, Bonecharms, Item, Power, Talent and Weapon items.
- [#12] Switch all sheet note and description text editors to use ProseMirror
- [#13] Ensure all Note and Description text fields use enriched HTML for display

## Chores
- [#9] PixiJS Deprecation Warning: utils.rgb2hex is deprecated

## Notes
With the change of system developer/maintainer, the system has now been migrated to a new GitHub home and build process.

*Many thanks to KaitoR95 for all their hard work developing and maintaining the original system*

*Many thanks to Modiphius for allowing the inclusion of player facing item compendiums which contain various classes of item from the core rulebook.*
