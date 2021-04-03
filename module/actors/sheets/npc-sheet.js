import {
    DishonoredSharedActorFunctions
} from "../actor.js";

export class DishonoredNPCSheet extends ActorSheet {
    /** @override */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            classes: ["dishonored", "sheet", "actor", "npc"],
            width: 700,
            height: 700,
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "focuses"
            }],
            scrollY: [".focuses", ".abilities", ".belongings", ".biography", ".notes"],
            dragDrop: [{
                dragSelector: ".item-list .item",
                dropSelector: null
            }]
        });
    }

    /* -------------------------------------------- */

    // If the player is not a GM and has limited permissions - send them to the limited sheet, otherwise, continue as usual.
    /** @override */
    get template () {
        if (!game.user.isGM && this.actor.limited) return "systems/FVTT-Dishonored/templates/actors/limited-sheet.html";
        return "systems/FVTT-Dishonored/templates/actors/npc-sheet.html";
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const sheetData = this.object;
        //Ensure skill and style values don't weigh over the max of 8.
        if (sheetData.data.data.skills.fight.value > 8) sheetData.data.data.skills.fight.value = 8;
        if (sheetData.data.data.skills.move.value > 8) sheetData.data.data.skills.move.value = 8;
        if (sheetData.data.data.skills.study.value > 8) sheetData.data.data.skills.study.value = 8;
        if (sheetData.data.data.skills.survive.value > 8) sheetData.data.data.skills.survive.value = 8;
        if (sheetData.data.data.skills.talk.value > 8) sheetData.data.data.skills.talk.value = 8;
        if (sheetData.data.data.skills.tinker.value > 8) sheetData.data.data.skills.tinker.value = 8;
        if (sheetData.data.data.styles.boldly.value > 8) sheetData.data.data.styles.boldly.value = 8;
        if (sheetData.data.data.styles.carefully.value > 8) sheetData.data.data.styles.carefully.value = 8;
        if (sheetData.data.data.styles.cleverly.value > 8) sheetData.data.data.styles.cleverly.value = 8;
        if (sheetData.data.data.styles.forcefully.value > 8) sheetData.data.data.styles.forcefully.value = 8;
        if (sheetData.data.data.styles.quietly.value > 8) sheetData.data.data.styles.quietly.value = 8;
        if (sheetData.data.data.styles.swiftly.value > 8) sheetData.data.data.styles.swiftly.value = 8;

        // Checks if any values are larger than their relevant max, if so, set to max. 
        if (sheetData.data.data.stress.value > sheetData.data.data.stress.max) sheetData.data.data.stress.value = sheetData.data.data.stress.max;

        //Ensure skill and style values aren't lower than 4.
        if (sheetData.data.data.skills.fight.value < 4) sheetData.data.data.skills.fight.value = 4;
        if (sheetData.data.data.skills.move.value < 4) sheetData.data.data.skills.move.value = 4;
        if (sheetData.data.data.skills.study.value < 4) sheetData.data.data.skills.study.value = 4;
        if (sheetData.data.data.skills.survive.value < 4) sheetData.data.data.skills.survive.value = 4;
        if (sheetData.data.data.skills.talk.value < 4) sheetData.data.data.skills.talk.value = 4;
        if (sheetData.data.data.skills.tinker.value < 4) sheetData.data.data.skills.tinker.value = 4;
        if (sheetData.data.data.styles.boldly.value < 4) sheetData.data.data.styles.boldly.value = 4;
        if (sheetData.data.data.styles.carefully.value < 4) sheetData.data.data.styles.carefully.value = 4;
        if (sheetData.data.data.styles.cleverly.value < 4) sheetData.data.data.styles.cleverly.value = 4;
        if (sheetData.data.data.styles.forcefully.value < 4) sheetData.data.data.styles.forcefully.value = 4;
        if (sheetData.data.data.styles.quietly.value < 4) sheetData.data.data.styles.quietly.value = 4;
        if (sheetData.data.data.styles.swiftly.value < 4) sheetData.data.data.styles.swiftly.value = 4;

        // Checks if any values are below their theoretical minimum, if so set it to the very minimum.
        if (sheetData.data.data.stress.value < 0) sheetData.data.data.stress.value = 0;
        
        $.each(sheetData.data.items, (key, item) => {
            if (!item.img) item.img = "/systems/FVTT-Dishonored/icons/dishonoredlogo.webp";
        });

        return sheetData.data;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        
        // Sets up a declaration to be able to check the version easily.
        let versionInfo;
        if (game.world.data) versionInfo = game.world.data.coreVersion;
        else game.world.coreVersion;
        
        // Opens the class DishonoredSharedActorFunctions for access at various stages.
        let dishonoredActor = new DishonoredSharedActorFunctions();

        // If the player has limited access to the actor, there is nothing to see here. Return.
        if ( !game.user.isGM && this.actor.limited) return;

        // We use i alot in for loops. Best to assign it now for use later in multiple places.
        let i;

        // We use div alot to define text blocks. Define here.
        let div;

        // Here we are checking how many bonecharms, helmets and armors are equipped. 
        // The player can only have three bonecharms, and one of each armor type. As such, we will use this later.
        let armorNumber = 0;
        let bonecharmNumber = 0;
        let helmetNumber = 0;
        let stressTrackMax = 0;
        function armorCount(currentActor) {
            armorNumber = 0;
            helmetNumber = 0;
            currentActor.actor.items.forEach((values) => {
                if (values.type == "armor") {
                    if (values.data.data.helmet == true && values.data.data.equipped == true) helmetNumber+= 1;
                    if (values.data.data.helmet == false && values.data.data.equipped == true) armorNumber+= 1;
                }
            });
        }
        armorCount(this);
        // This creates a dynamic Stress tracker. It polls for the value of the survive skill, adds any protection from armor. 
        // With the total value, creates a new div for each and places it under a child called "bar-stress-renderer".
        function stressTrackUpdate() {
            stressTrackMax = parseInt(html.find("#survive")[0].value);
            let armor = html.find("[data-item-type=\"armor\"]");
            for (i = 0; i < armor.length; i++) {
                if (armor[i].getAttribute("data-item-equipped") == "true") {
                    stressTrackMax += parseInt($(armor[i]).children()[2].innerHTML);
                }
            }
            // This checks that the max-stress hidden field is equal to the calculated Max Stress value, if not it makes it so.
            if (html.find("#max-stress")[0].value != stressTrackMax)
            {
                html.find("#max-stress")[0].value = stressTrackMax;
            }
            html.find("#bar-stress-renderer").empty();
            for (i = 1; i <= stressTrackMax; i++) {
                div = document.createElement("DIV");
                div.className = "box";
                div.id = "stress-" + i;
                div.innerHTML = i;
                div.style = "width: calc(100% / " + html.find("#max-stress")[0].value + ");";
                html.find("#bar-stress-renderer")[0].appendChild(div);
            }
        }
        stressTrackUpdate();

        // Fires the function dishonoredRenderTracks as soon as the parameters exist to do so.
        dishonoredActor.dishonoredRenderTracks(html, stressTrackMax);

        // This allows for each item-edit image to link open an item sheet. This uses Simple Worldbuilding System Code.
        html.find(".control.edit").click(ev => {
            const li = $(ev.currentTarget).parents(".entry");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // This if statement checks if the form is editable, if not it hides control used by the owner, then aborts any more of the script.
        if (!this.options.editable) {
            // This hides the ability to Perform a Skill Test for the character.
            for (i = 0; i < html.find(".check-button").length; i++) {
                html.find(".check-button")[i].style.display = "none";
            }
            // This hides the ability to change the amount of Void Points the character has.
            for (i = 0; i < html.find(".voidchange").length; i++) {
                html.find(".voidchange")[i].style.display = "none";
            }
            // This hides all toggle, add and delete item images.
            for (i = 0; i < html.find(".control.create").length; i++) {
                html.find(".control.create")[i].style.display = "none";
            }
            for (i = 0; i < html.find(".control.delete").length; i++) {
                html.find(".control.delete")[i].style.display = "none";
            }
            for (i = 0; i < html.find(".control.toggle").length; i++) {
                html.find(".control.delete")[i].style.display = "none";
            }
            // This hides all skill and style check boxes (and titles)
            for (i = 0; i < html.find(".selector").length; i++) {
                html.find(".selector")[i].style.display = "none";
            }
            for (i = 0; i < html.find(".selector").length; i++) {
                html.find(".selector")[i].style.display = "none";
            }
            // Remove hover CSS from clickables that are no longer clickable.
            for (i = 0; i < html.find(".box").length; i++) {
                html.find(".box")[i].classList.add("unset-clickables");
            }
            for (i = 0; i < html.find(".rollable").length; i++) {
                html.find(".rollable")[i].classList.add("unset-clickables");
            }
            return;
        }

        // This toggles whether the item is equipped or not. Equipped items count towards item caps.
        html.find(".control.toggle").click(ev => {
            let itemType = $(ev.currentTarget).parents(".entry")[0].getAttribute("data-item-type");
            let itemId = $(ev.currentTarget).parents(".entry")[0].getAttribute("data-item-id");
            let item = this.actor.items.get(itemId);
            let itemData = item.data;
            if (itemType == "armor") var isHelmet = $(ev.currentTarget).parents(".entry")[0].getAttribute("data-item-helmet");
            if (this.actor.items.get(itemId).data.data.equipped == true) {
                itemData.data.equipped = false;
                $(ev.currentTarget).children()[0].classList.remove("fa-toggle-on");
                $(ev.currentTarget).children()[0].classList.add("fa-toggle-off");
                $(ev.currentTarget).parents(".entry")[0].setAttribute("data-item-equipped", "false");
            }
            else if (itemType == "bonecharm" && bonecharmNumber >= 3) {
                ui.notifications.error(game.i18n.localize("dishonored.notifications.tooManyBonecharms"));
            }
            else if (itemType == "armor" && isHelmet == "false" && armorNumber >= 1) {
                ui.notifications.error(game.i18n.localize("dishonored.notifications.armorAlreadyEquipped"));
            }
            else if (itemType == "armor" && isHelmet == "true" && helmetNumber >= 1) {
                ui.notifications.error(game.i18n.localize("dishonored.notifications.helmentAlreadyEquipped"));
            }
            else {
                itemData.data.equipped = true;
                $(ev.currentTarget).children()[0].classList.remove("fa-toggle-off");
                $(ev.currentTarget).children()[0].classList.add("fa-toggle-on");
                $(ev.currentTarget).parents(".entry")[0].setAttribute("data-item-equipped", "true");
            }
            item.update(itemData);
            stressTrackUpdate();
            dishonoredActor.dishonoredRenderTracks(html, stressTrackMax);
            this.submit();
        });

        // This allows for all items to be rolled, it gets the current targets type and id and sends it to the rollGenericItem function.
        html.find(".rollable").click(ev =>{
            let itemType = $(ev.currentTarget).parents(".entry")[0].getAttribute("data-item-type");
            let itemId = $(ev.currentTarget).parents(".entry")[0].getAttribute("data-item-id");
            dishonoredActor.rollGenericItem(ev, itemType, itemId, this.actor);
        });

        // Allows item-create images to create an item of a type defined individually by each button. This uses code found via the Foundry VTT System Tutorial.
        html.find(".control.create").click(ev => {
            ev.preventDefault();
            const header = ev.currentTarget;
            const type = header.dataset.type;
            const data = duplicate(header.dataset);
            const name = game.i18n.format("dishonored.actor.item.adjectiveNew") + " " + type.charAt(0).toUpperCase() + type.slice(1);
            if (type == "bonecharm" && bonecharmNumber >= 3) {
                ui.notifications.info(game.i18n.localize("dishonored.notifications.tooManyBonecharmsNew"));
                data.equipped = false;
            }
            if (type == "armor" && armorNumber >= 1) {
                ui.notifications.info(game.i18n.localize("dishonored.notifications.armorAlreadyEquippedNew"));
                data.equipped = false;
            }
            const itemData = {
                name: name,
                type: type,
                data: data
            };
            delete itemData.data["type"];
            stressTrackUpdate();
            // Check if we are using a Foundry version above 0.8.0, use new code.
            if (isNewerVersion(versionInfo,"0.8.-1")) return this.actor.createEmbeddedDocuments("Item",[(itemData)]);
            else return this.actor.createOwnedItem(itemData);
        });

        // Allows item-delete images to allow deletion of the selected item. This uses Simple Worldbuilding System Code.
        html.find(".control.delete").click(ev => {
            const li = $(ev.currentTarget).parents(".entry");
            console.log(this.actor);
            // Check if we are using a Foundry version above 0.8.0, use new code.
            if (isNewerVersion(versionInfo,"0.8.-1")) this.actor.deleteEmbeddedDocuments("Item",[li.data("itemId")]);
            else this.actor.deleteOwnedItem(li.data("itemId"));
            li.slideUp(200, () => this.render(false));
        });

        // Reads if a stress track box has been clicked, and if it has will either: set the value to the clicked box, or reduce the value by one.
        // See line 186-220 for a more detailed break down on the context of each scenario. Stress uses the same logic.
        html.find("[id^=\"stress\"]").click(ev => {
            let newTotalObject = $(ev.currentTarget)[0];
            let newTotal = newTotalObject.id.substring(7);
            let total;
            if (newTotalObject.getAttribute("data-selected") === "true") {
                let nextCheck = "stress-" + (parseInt(newTotal) + 1);
                if (!html.find("#"+nextCheck)[0] || html.find("#"+nextCheck)[0].getAttribute("data-selected") != "true") {
                    html.find("#total-stress")[0].value = html.find("#total-stress")[0].value - 1;
                    this.submit();
                } else {
                    total = html.find("#total-stress")[0].value;
                    if (total != newTotal) {
                        html.find("#total-stress")[0].value = newTotal;
                        this.submit();
                    }
                }
            } else {
                total = html.find("#total-stress")[0].value;
                if (total != newTotal) {
                    html.find("#total-stress")[0].value = newTotal;
                    this.submit();
                }
            }
        });


        // Turns the Skill checkboxes into essentially a radio button. It removes any other ticks, and then checks the new skill.
        // Finally a submit is required as data has changed.
        html.find(".selector.skill").click(ev => {
            for (i = 0; i <= 5; i++) {
                html.find(".selector.skill")[i].checked = false;
            }
            $(ev.currentTarget)[0].checked = true;
            this.submit();
        });

        // Turns the Style checkboxes into essentially a radio button. It removes any other ticks, and then checks the new style.
        // Finally a submit is required as data has changed.
        html.find(".selector.style").click(ev => {
            for (i = 0; i <= 5; i++) {
                html.find(".selector.style")[i].checked = false;
            }
            $(ev.currentTarget)[0].checked = true;
            this.submit();
        });

        // If the check-button is clicked it grabs the selected skill and the selected style and fires the method rollSkillTest. See actor.js for further info.
        html.find(".check-button").click(ev => {
            let selectedSkill;
            let selectedSkillValue;
            let selectedStyle;
            let selectedStyleValue;
            for (i = 0; i <= 5; i++) {
                if (html.find(".selector.skill")[i].checked === true) {
                    let selectedSkillHTML = html.find(".selector.skill")[i].id;
                    selectedSkill = selectedSkillHTML.slice(0, -9);
                    selectedSkillValue = html.find("#"+selectedSkill)[0].value;
                }
            }
            for (i = 0; i <= 5; i++) {
                if (html.find(".selector.style")[i].checked === true) {
                    let selectedStyleHTML = html.find(".selector.style")[i].id;
                    selectedStyle = selectedStyleHTML.slice(0, -9);
                    selectedStyleValue = html.find("#"+selectedStyle)[0].value;
                }
            }
            let checkTarget = parseInt(selectedSkillValue) + parseInt(selectedStyleValue);

            dishonoredActor.rollSkillTest(ev, checkTarget, selectedSkill, selectedStyle, this.actor);
        });
    }
}