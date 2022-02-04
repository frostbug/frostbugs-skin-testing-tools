import {readFileSync, writeFileSync, copyFileSync, mkdirSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_STYLE_FOLDERS, icon,
    ITEMS_GAME_FILE_PATH,
    MATERIALS_FOLDERS_PATH,
    PAINTABLE_WEAPON_ARRAY, paintKit,
    paintKitItemPairing, referencedLanguageString, textFileItem
} from "./types";
import * as VDF from '@node-steam/vdf';
import * as path from "path";
import * as util from "util";

export class FileManager {

    csgoInstallDir: string = "";
    itemsTextFile: string = "";
    csgoEnglishFile: string = "";
    completePaintKitWeaponArray: Array<paintKit> = [];
    completePaintKitGloveArray: Array<paintKit> = [];

    constructor(csgoInstallDir: string) {
        this.csgoInstallDir = csgoInstallDir;
        console.log(csgoInstallDir)
        if (csgoInstallDir.includes("Counter-Strike Global Offensive")) {
            try {
                this.itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
            } catch (e) {
                alert("Failed to read items.txt file!")
                console.error(e)
            }
            try {
                this.csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
            } catch (e) {
                alert("Failed to read csgo_english.txt file!")
                console.error(e)
            }
            this.getObjectsFromText()
        } else {
            alert("Selected file is not in Counter-Strike Global Offensive folder!")
        }
    }

    public getItemsTextPaintKits(itemsTextFile: string): Array<paintKit> {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
        return this.convertPaintKitsObjectToArray(paintKitsJsonObject)
    }

    public convertPaintKitsObjectToArray(paintKitJsonObject: ArrayLike<unknown>): Array<paintKit> {
        const itemsArray: Array<paintKit> = [];
        Object.entries(paintKitJsonObject).map(([paintKitId, paintKitValue]) => itemsArray.push(this.addPaintKitIdToPaintKitObject(<paintKit>paintKitValue, paintKitId)));
        return itemsArray;
    }

    public addPaintKitIdToPaintKitObject(paintKitObject: paintKit, paintKitId: string): paintKit {
        paintKitObject.paintKitId = paintKitId;
        return paintKitObject;
    }

    public addItemIdToItem(textFileObject: textFileItem, textFileId: string): textFileItem {
        textFileObject.itemId = textFileId;
        return textFileObject;
    }

    public getPaintKitWeaponPairingArray(itemsTextFile: string): Array<paintKitItemPairing> {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
        return this.buildSkinWeaponArray(clientLootListsJsonObject);
    }

    public getPaintKitNamesObject(csgoEnglishFile: string): Array<referencedLanguageString> {
        const csgoEnglishObject = VDF.parse(csgoEnglishFile)["lang"]["Tokens"];
        return Object.keys(csgoEnglishObject).map(stringKey => {
            const stringPair: referencedLanguageString = {
                referenceString: stringKey,
                displayedString: csgoEnglishObject[stringKey]
            };
            return stringPair;
        })
    }

    private getGlovesFromItemArray(unfilteredItemsArray: Array<textFileItem>, paintKitReferencesArray: Array<referencedLanguageString>): Array<textFileItem> {
        const filteredGloveArray = unfilteredItemsArray.filter(item => this.checkIfGlove(item))
        filteredGloveArray.forEach(gloveItem => {
            const gloveDisplayName = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === gloveItem.item_name?.replace("#", ""))?.displayedString
            if (gloveDisplayName) {
                gloveItem.itemDisplayName = gloveDisplayName;
            }
        })
        return filteredGloveArray;
    }

    public getObjectsFromText(): void {

        const paintKitArray = this.getItemsTextPaintKits(this.itemsTextFile)
        const skinNamesWithWeaponsArray = this.getPaintKitWeaponPairingArray(this.itemsTextFile);
        const paintKitReferencesArray = this.getPaintKitNamesObject(this.csgoEnglishFile);

        const itemsObjectsArray = this.getItemsArray(this.itemsTextFile);
        const glovesItemArray = this.getGlovesFromItemArray(itemsObjectsArray, paintKitReferencesArray)
        const skinNamesWithGlovesArray = this.getPaintKitGlovesPairingArray(this.itemsTextFile)
        const glovesPaintKitsOnlyArray = this.getGlovesOnlyPaintKits(paintKitArray)

        this.completePaintKitWeaponArray = this.createCompleteSkinArray(paintKitArray, skinNamesWithWeaponsArray, paintKitReferencesArray);
        this.completePaintKitGloveArray = this.createGloveArray(glovesPaintKitsOnlyArray, skinNamesWithGlovesArray, glovesItemArray, paintKitReferencesArray)
    }

    private getGlovesOnlyPaintKits(paintKitArray: Array<paintKit>): Array<paintKit> {
        return paintKitArray.filter(paintKit => this.isGlovePaintKit(paintKit))
    }

    private isGlovePaintKit(paintKit: paintKit): boolean {
        return !!(paintKit.vmt_path && paintKit.vmt_path.includes('paints_gloves'));
    }

    private getPaintKitGlovesPairingArray(itemsTextFile: string): Array<string> {
        const paintKitGlovesPairingArray: Array<string> = []
        const itemsTextObject = VDF.parse(itemsTextFile);
        const iconsListObject: Array<icon> = itemsTextObject["items_game"]["alternate_icons2"]["weapon_icons"];
        for (const iconNameObject of Object.values(iconsListObject)) {
            if (iconNameObject.icon_path.endsWith('_light')) {
                const glovesName = iconNameObject.icon_path.replace('_light', '').split('/').pop();
                if (glovesName) {
                    paintKitGlovesPairingArray.push(glovesName)
                }
            }
        }
        return paintKitGlovesPairingArray;
    }

    public getCompletePaintKitWeaponArray(): Array<paintKit> {
        return this.completePaintKitWeaponArray;
    }

    public getCompletePaintKitGloveArray(): Array<paintKit> {
        return this.completePaintKitGloveArray;
    }

    public checkIfGlove(itemsObject: textFileItem): boolean {
        return !!(itemsObject.prefab && itemsObject.prefab === "hands_paintable");

    }

    public createCompleteSkinArray(paintKitArray: Array<paintKit>, paintKitWeaponPairingArray: Array<paintKitItemPairing>, paintKitReferencesArray: Array<referencedLanguageString>): Array<paintKit> {
        const completeSkinArray: Array<paintKit> = [];
        paintKitWeaponPairingArray.forEach(skinWeaponPairing => {
            let combinedPaintKit: paintKit | undefined = paintKitArray.find(paintKit => paintKit.name === skinWeaponPairing.paintKitName)
            if (combinedPaintKit !== undefined) {
                const weaponForPaintKit = PAINTABLE_WEAPON_ARRAY.find(paintableWeapon => paintableWeapon.weaponShortName === skinWeaponPairing.itemShortName)
                const paintKitDescriptionReferenceObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === combinedPaintKit?.description_string?.replace("#", ""))
                const paintKitDisplayNameReferenceObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === combinedPaintKit?.description_tag?.replace("#", ""))

                const paintKitName = skinWeaponPairing.paintKitName;
                let skinDisplayName = paintKitDisplayNameReferenceObject?.displayedString
                if (paintKitName.includes('phase')) {
                    skinDisplayName = skinDisplayName + (' Phase ' + paintKitName.split('phase')[1].charAt(0))
                }

                combinedPaintKit = {
                    ...combinedPaintKit,
                    itemShortName: skinWeaponPairing.itemShortName,
                    itemDisplayName: weaponForPaintKit?.weaponDisplayName,
                    weaponId: weaponForPaintKit?.weaponId,
                    skinDescription: paintKitDescriptionReferenceObject?.displayedString,
                    skinDisplayName: skinDisplayName,
                    fullItemDisplayName: weaponForPaintKit?.weaponDisplayName + ' | ' + skinDisplayName
                }
                completeSkinArray.push(combinedPaintKit)
            }
        })
        return completeSkinArray;
    }

    public buildSkinWeaponArray(clientLootListsJsonObject: ArrayLike<unknown>): Array<paintKitItemPairing> {
        const paintKitWeaponPairingArray = []

        for (const value of Object.values(clientLootListsJsonObject)) {
            // @ts-ignore - clientLootListObject is raw VDF and it or it's contents cannot be typed yet
            for (const key of Object.keys(value)) {
                const processedSkinWeaponJsonObject = this.createJsonObjectFromSkinWeapon(key);

                if (processedSkinWeaponJsonObject) {
                    paintKitWeaponPairingArray.push(processedSkinWeaponJsonObject)
                }
            }
        }
        return paintKitWeaponPairingArray;
    }

    public createJsonObjectFromSkinWeapon(skinWeaponPairingString: string): paintKitItemPairing | undefined {
        if (skinWeaponPairingString.includes('weapon_')) {
            skinWeaponPairingString = skinWeaponPairingString.replace('\[', '');
            skinWeaponPairingString = skinWeaponPairingString.replace('weapon_', '');
            const skinWeaponArray = skinWeaponPairingString.split("]");
            return {
                paintKitName: skinWeaponArray[0],
                itemShortName: skinWeaponArray[1]
            };
        } else {
            return undefined;
        }
    }

    public addCustomNameAndDescription(csgoInstallDir: string, customSkinName: string, customSkinDescription: string, skinToReplace: paintKit): void {
        let csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
        if (skinToReplace.skinDisplayName) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDisplayName, customSkinName);
        }
        if (skinToReplace.skinDescription) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDescription, customSkinDescription);
        }
        try {
            writeFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, csgoEnglishFile, 'utf16le');
            alert('Successfully added custom name and/or description to text file!');
        } catch (e) {
            console.error(e)
            alert('Failed to save custom skin name/description to text file!');
        }
    }

    public saveMapToFolder(mapToSavePath: string, paintKitFinishStyleId: string): void {
        const finishStyleName = FINISH_STYLE_FOLDERS.find(finishStyle => finishStyle.finishStyleId === paintKitFinishStyleId.toString())?.finishStyleName
        if (finishStyleName !== undefined) {
            const file_path = this.csgoInstallDir + MATERIALS_FOLDERS_PATH + finishStyleName;
            try {
                mkdirSync(file_path, {recursive: true});
            } catch (e) {
                console.log(finishStyleName + ' folder already exists!');
            }
            try {
                const pathToCopyTo = path.join(file_path, path.basename(mapToSavePath));
                copyFileSync(mapToSavePath, pathToCopyTo);
                alert("Successfully copied vtf file to " + pathToCopyTo);
            } catch (e) {
                console.error(e)
                alert('Failed to copy map to csgo folder!');
            }
        }
    }

    public replaceSkinWithCustom(objectToReplace: paintKit, customSkinString: paintKit): void {
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');

        if (customSkinString.pattern) {
            customSkinString.pattern = path.parse(customSkinString.pattern).name
        }
        if (customSkinString.normal) {
            customSkinString.normal = path.parse(customSkinString.normal).name
        }
        delete customSkinString.dialog_config;

        if (objectToReplace.description_tag !== undefined) {
            let stringToReplace = itemsTextFile.split(objectToReplace.description_tag)[1]
            stringToReplace = stringToReplace.split("}")[0]
            itemsTextFile = itemsTextFile.replace(stringToReplace, "\"\n" + VDF.stringify((customSkinString)))
        }
        try {
            writeFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            alert('Successfully added custom skin to text file!');
        } catch (e) {
            console.error(e)
            alert('Failed to add custom skin to text file!');
        }
    }


    public replaceGloves(gloveToReplace: paintKit, gloveToReplaceWith: paintKit): void {
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
        let stringToReplace = this.getGlovePaintKitStringFromTextFile(gloveToReplace, itemsTextFile)
        let stringToReplaceWith = this.getGlovePaintKitStringFromTextFile(gloveToReplaceWith, itemsTextFile)

        if (stringToReplace && stringToReplaceWith) {
            itemsTextFile = itemsTextFile.replace(stringToReplace, stringToReplaceWith)
        }

        if (gloveToReplace.itemShortName && gloveToReplaceWith.itemShortName && gloveToReplace.itemShortName !== gloveToReplaceWith.itemShortName) {
            let gloveItemStringToReplace = this.getGloveItemFromTextFile(gloveToReplace.itemShortName, itemsTextFile);
            let gloveItemStringToReplaceWith = this.getGloveItemFromTextFile(gloveToReplaceWith.itemShortName, itemsTextFile);
            if (gloveItemStringToReplace && gloveItemStringToReplaceWith) {
                itemsTextFile = itemsTextFile.replace(gloveItemStringToReplace, gloveItemStringToReplaceWith)
            }
        }

        try {
            writeFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            alert('Successfully swapped glove textures!');
        } catch (e) {
            console.error(e)
            alert('Failed to swap glove textures!');
        }
    }

    private getGlovePaintKitStringFromTextFile(glovePaintKit: paintKit, itemsText: string) {
        let selectedSubstring = '';
        if (glovePaintKit.description_tag !== undefined) {
            selectedSubstring = itemsText.split(glovePaintKit.description_tag)[1];
            if (glovePaintKit.vmt_overrides) {
                selectedSubstring = selectedSubstring.split("}\n" + "      }")[0] + "}\n";
            } else {
                selectedSubstring = selectedSubstring.split("}")[0];
            }
        }
        return selectedSubstring;
    }

    private getGloveItemFromTextFile(gloveItemShortName: string, itemsText: string) {
        let selectedSubstring = '';
        if (gloveItemShortName !== undefined) {
            selectedSubstring = itemsText.split("\"name\"\t\t\"" + gloveItemShortName + "\"")[1];
            selectedSubstring = selectedSubstring.split("\"MirrorPattern\"")[0]
        }
        console.log(selectedSubstring)
        return selectedSubstring;
    }

    public getItemsArray(itemsTextFile: string): Array<textFileItem> {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const itemsListJsonObject = itemsTextObject["items_game"]["items"];
        const itemsArray: Array<textFileItem> = [];
        Object.entries(itemsListJsonObject).map(([itemId, ItemAttributes]) => itemsArray.push(this.addItemIdToItem(<paintKit>ItemAttributes, itemId)));
        return itemsArray;
    }

    private createGloveArray(glovesPaintKitsOnlyArray: Array<paintKit>, skinNamesWithGlovesArray: Array<string>, glovesItemArray: Array<textFileItem>, paintKitReferencesArray: Array<referencedLanguageString>): Array<paintKit> {
        const completedGlovesArray: Array<paintKit> = []
        glovesPaintKitsOnlyArray.forEach(glovePaintKit => {
            skinNamesWithGlovesArray.forEach(gloveSkinName => {
                if (gloveSkinName.includes(<string>glovePaintKit.name) && !gloveSkinName.split(<string>glovePaintKit.name)[1]) {
                    const gloveModelForPaintKit = glovesItemArray.find(gloveItem => gloveItem.name === gloveSkinName.replace("_" + glovePaintKit.name, ""))
                    const gloveModelNameRefObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === gloveModelForPaintKit?.item_name?.replace("#", ""))
                    const gloveSkinNameRefObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === glovePaintKit?.description_tag?.replace("#", ""))
                    const updatedGlovePaintKit = {
                        ...glovePaintKit,
                        itemShortName: gloveModelForPaintKit?.name,
                        itemDisplayName: gloveModelNameRefObject?.displayedString,
                        skinDisplayName: gloveSkinNameRefObject?.displayedString,
                        fullItemDisplayName: gloveModelNameRefObject?.displayedString + ' | ' + gloveSkinNameRefObject?.displayedString
                    }
                    completedGlovesArray.push(updatedGlovePaintKit)
                }
            })
        })
        return completedGlovesArray;
    }
}
