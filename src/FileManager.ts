import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_STYLE_FOLDERS,
    icon,
    ITEMS_GAME_FILE_PATH,
    MATERIALS_FOLDERS_PATH,
    PAINTABLE_WEAPON_ARRAY,
    paintKit,
    paintKitItemPairing,
    textFileItem
} from "./types";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

export class FileManager {

    csgoInstallDir: string = "";
    itemsTextFile: string = "";
    csgoEnglishFile: string = "";
    completePaintKitWeaponArray: paintKit[] = [];
    completePaintKitGloveArray: paintKit[] = [];
    glovesItemArray: textFileItem[] = [];

    constructor(csgoInstallDir: string) {
        this.csgoInstallDir = csgoInstallDir;
        this.initializeFileManager();
    }

    public initializeFileManager(): void {
        if (this.csgoInstallDir.includes("Counter-Strike Global Offensive")) {
            try {
                this.itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
            } catch (e) {
                // alert("Failed to read items.txt file!")
                console.error(e)
            }
            try {
                this.csgoEnglishFile = readFileSync(this.csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
            } catch (e) {
                // alert("Failed to read csgo_english.txt file!")
                console.error(e)
            }
            this.buildCompletePaintKitArrays()
        } else {
            // alert("Selected file is not in Counter-Strike Global Offensive folder!")
        }
    }

    private getItemsTextPaintKits(itemsTextFile: string): paintKit[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
        return this.convertPaintKitsObjectToArray(paintKitsJsonObject)
    }

    private convertPaintKitsObjectToArray(paintKitJsonObject: ArrayLike<unknown>): paintKit[] {
        return Object.entries(paintKitJsonObject).map(([paintKitId, paintKitValue]) => FileManager.addPaintKitIdToPaintKitObject(<paintKit>paintKitValue, paintKitId));
    }

    private static addPaintKitIdToPaintKitObject(paintKitObject: paintKit, paintKitId: string): paintKit {
        paintKitObject.paintKitId = paintKitId;
        return paintKitObject;
    }

    private static addItemIdToItem(textFileObject: textFileItem, textFileId: string): textFileItem {
        textFileObject.itemId = textFileId;
        return textFileObject;
    }

    private static getPaintKitWeaponPairingArray(itemsTextFile: string): paintKitItemPairing[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
        return FileManager.buildSkinWeaponArray(clientLootListsJsonObject);
    }

    private static getPaintKitNamesObject(csgoEnglishFile: string): unknown {
        return VDF.parse(csgoEnglishFile)["lang"]["Tokens"];
    }

    private setGloveItemsArrayFromItemArray(unfilteredItemsArray: textFileItem[], paintKitReferencesObject: any): void {
        const filteredGloveArray = unfilteredItemsArray.filter(item => FileManager.checkIfGlove(item))
        filteredGloveArray.forEach(gloveItem => {
            if(gloveItem && gloveItem.item_name){
                const gloveItemName: string = gloveItem.item_name.replace("#", "");
                if(gloveItemName in paintKitReferencesObject){
                    const gloveDisplayName: string = paintKitReferencesObject[gloveItemName]
                    if (gloveDisplayName) {
                        gloveItem.itemDisplayName = gloveDisplayName;
                    }
                }
            }
        })
        this.glovesItemArray = filteredGloveArray;
    }

    private buildCompletePaintKitArrays(): void {
        const paintKitArray = this.getItemsTextPaintKits(this.itemsTextFile)
        const skinNamesWithWeaponsArray = FileManager.getPaintKitWeaponPairingArray(this.itemsTextFile);
        const paintKitReferencesObject = FileManager.getPaintKitNamesObject(this.csgoEnglishFile);
        const itemsObjectsArray = this.getItemsArray(this.itemsTextFile);
        this.setGloveItemsArrayFromItemArray(itemsObjectsArray, paintKitReferencesObject)
        const skinNamesWithGlovesArray = FileManager.getPaintKitGlovesPairingArray(this.itemsTextFile)
        const glovesPaintKitsOnlyArray = this.getGlovesOnlyPaintKits(paintKitArray)
        this.completePaintKitWeaponArray = this.createCompleteSkinArray(paintKitArray, skinNamesWithWeaponsArray, paintKitReferencesObject);
        this.completePaintKitGloveArray = this.createGloveArray(glovesPaintKitsOnlyArray, skinNamesWithGlovesArray, paintKitReferencesObject)
    }

    private getGlovesOnlyPaintKits(paintKitArray: paintKit[]): paintKit[] {
        return paintKitArray.filter(paintKit => FileManager.isGlovePaintKit(paintKit))
    }

    private static isGlovePaintKit(paintKit: paintKit): boolean {
        return !!(paintKit?.vmt_path && paintKit?.vmt_path.includes('paints_gloves'));
    }

    private static getPaintKitGlovesPairingArray(itemsTextFile: string): string[] {
        const paintKitGlovesPairingArray: string[] = []
        const itemsTextObject = VDF.parse(itemsTextFile);
        const iconsListObject: icon[] = itemsTextObject["items_game"]["alternate_icons2"]["weapon_icons"];
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

    public getCompletePaintKitWeaponArray(): paintKit[] {
        return this.completePaintKitWeaponArray;
    }

    public getCompletePaintKitGloveArray(): paintKit[] {
        return this.completePaintKitGloveArray;
    }


    private static checkIfGlove(itemsObject: textFileItem): boolean {
        return !!(itemsObject.prefab && itemsObject.prefab === "hands_paintable");

    }

    private createCompleteSkinArray(paintKitArray: paintKit[], paintKitWeaponPairingArray: paintKitItemPairing[], paintKitReferencesObject: any): paintKit[] {
        const completeSkinArray: paintKit[] = [];
        paintKitWeaponPairingArray.forEach(skinWeaponPairing => {
            let combinedPaintKit = paintKitArray.find(paintKit => paintKit.name === skinWeaponPairing.paintKitName)
            if (combinedPaintKit !== undefined) {
                const weaponForPaintKit = PAINTABLE_WEAPON_ARRAY.find(paintableWeapon => paintableWeapon.weaponShortName === skinWeaponPairing.itemShortName)
                const paintKitDescriptionReference = combinedPaintKit?.description_string?.replace("#", "")
                const paintKitNameReference = combinedPaintKit?.description_tag?.replace("#", "")
                let skinDescription = '';
                let skinDisplayName = '';
                if(paintKitDescriptionReference && paintKitDescriptionReference in paintKitReferencesObject){
                    skinDescription = paintKitReferencesObject[paintKitDescriptionReference]
                }
                if(paintKitNameReference && paintKitNameReference in paintKitReferencesObject){
                    skinDisplayName = paintKitReferencesObject[paintKitNameReference]
                }
                const paintKitName = skinWeaponPairing.paintKitName;
                if (paintKitName.includes('phase')) {
                    skinDisplayName = skinDisplayName + (' Phase ' + paintKitName.split('phase')[1].charAt(0))
                }
                combinedPaintKit = {
                    ...combinedPaintKit,    
                    itemShortName: skinWeaponPairing.itemShortName,
                    itemDisplayName: weaponForPaintKit?.weaponDisplayName,
                    weaponId: weaponForPaintKit?.weaponId,
                    skinDescription: skinDescription,
                    skinDisplayName: skinDisplayName,
                    fullItemDisplayName: weaponForPaintKit?.weaponDisplayName + ' | ' + skinDisplayName
                }
                completeSkinArray.push(combinedPaintKit)
            }
        })
        return completeSkinArray;
    }

    private static buildSkinWeaponArray(clientLootListsJsonObject: ArrayLike<unknown>): paintKitItemPairing[] {
        const paintKitWeaponPairingArray = []
        for (const value of Object.values(clientLootListsJsonObject)) {
            // @ts-ignore - clientLootListObject is raw VDF and it or it's contents cannot be typed yet
            for (const key of Object.keys(value)) {
                const processedSkinWeaponJsonObject = FileManager.createJsonObjectFromSkinWeapon(key);
                if (processedSkinWeaponJsonObject) {
                    paintKitWeaponPairingArray.push(processedSkinWeaponJsonObject)
                }
            }
        }
        return paintKitWeaponPairingArray;
    }

    private static createJsonObjectFromSkinWeapon(skinWeaponPairingString: string): paintKitItemPairing | undefined {
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

    public addCustomNameAndDescription(csgoInstallDir: string, customSkinName: string, customSkinDescription: string, skinToReplace: paintKit): boolean {
        let csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
        if (skinToReplace.skinDisplayName) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDisplayName, customSkinName);
        }
        if (skinToReplace.skinDescription) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDescription, customSkinDescription);
        }
        try {
            writeFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, csgoEnglishFile, 'utf16le');
            return true;
        } catch (e) {
            console.error(e)
            return false;
        }
    }

    public saveMapToFolder(mapToSavePath: string, paintKitFinishStyleId: string): boolean {
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
                console.log("Successfully copied vtf file to " + pathToCopyTo);
                return true;
            } catch (e) {
                console.error(e)
                return false;
            }
        }
        return false
    }

    public replaceSkinWithCustom(objectToReplace: paintKit, customSkinString: paintKit): boolean {
        let skinToAdd = JSON.parse(JSON.stringify(customSkinString))
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
        if (skinToAdd.pattern) {
            skinToAdd.pattern = path.parse(skinToAdd.pattern).name
        }
        if (skinToAdd.normal) {
            skinToAdd.normal = path.parse(skinToAdd.normal).name
        }
        delete skinToAdd.dialog_config;
        if (objectToReplace.description_tag !== undefined) {
            let stringToReplace = itemsTextFile.split(objectToReplace.description_tag)[1]
            stringToReplace = stringToReplace.split("}")[0]
            itemsTextFile = itemsTextFile.replace(stringToReplace, "\"\n" + VDF.stringify((skinToAdd)))
        }
        try {
            writeFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public replaceGloves(gloveToReplace: paintKit, gloveToReplaceWith: paintKit): boolean {
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
        let stringToReplace = FileManager.getGlovePaintKitStringFromTextFile(gloveToReplace, itemsTextFile)
        let stringToReplaceWith = FileManager.getGlovePaintKitStringFromTextFile(gloveToReplaceWith, itemsTextFile)
        if (stringToReplace && stringToReplaceWith) {
            itemsTextFile = itemsTextFile.replace(stringToReplace, stringToReplaceWith)
        }
        if (gloveToReplace.itemShortName && gloveToReplaceWith.itemShortName && gloveToReplace.itemShortName !== gloveToReplaceWith.itemShortName) {
            let gloveItemStringToReplace = FileManager.getGloveItemFromTextFile(gloveToReplace.itemShortName, itemsTextFile);
            let gloveItemStringToReplaceWith = FileManager.getGloveItemFromTextFile(gloveToReplaceWith.itemShortName, itemsTextFile);
            if (gloveItemStringToReplace && gloveItemStringToReplaceWith) {
                if(gloveToReplaceWith.description_tag && gloveToReplace.description_tag && gloveToReplaceWith.description_string && gloveToReplace.description_string) {
                    const gloveModelToReplace = this.glovesItemArray.find(gloveItem => gloveItem.name === gloveToReplace.itemShortName?.replace("_" + gloveToReplace.name, ""))
                    const gloveModelToReplaceWith = this.glovesItemArray.find(gloveItem => gloveItem.name === gloveToReplaceWith.itemShortName?.replace("_" + gloveToReplaceWith.name, ""))
                    if(gloveModelToReplaceWith && gloveModelToReplaceWith.item_name && gloveModelToReplaceWith.item_description && gloveModelToReplace && gloveModelToReplace.item_name && gloveModelToReplace.item_description) {
                        gloveItemStringToReplaceWith = gloveItemStringToReplaceWith.replace(gloveModelToReplaceWith.item_description, gloveModelToReplace.item_description);
                        gloveItemStringToReplaceWith = gloveItemStringToReplaceWith.replace(gloveModelToReplaceWith.item_name, gloveModelToReplace.item_name);
                        itemsTextFile = itemsTextFile.replace(gloveItemStringToReplace, gloveItemStringToReplaceWith)
                    }
                }
            }
        }
        try {
            writeFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            return true;
        } catch (e) {
            console.error(e)
            return false;
        }
    }

    private static getGlovePaintKitStringFromTextFile(glovePaintKit: paintKit, itemsText: string): string {
        let selectedSubstring = '';
        if (glovePaintKit.description_tag !== undefined) {
            selectedSubstring = itemsText.split(glovePaintKit.description_tag)[1];
            selectedSubstring = selectedSubstring.split("}")[0];
            if (glovePaintKit.vmt_overrides) {
                selectedSubstring = selectedSubstring + "\n" + "}";
            }
        }
        return selectedSubstring;
    }

    private static getGloveItemFromTextFile(gloveItemShortName: string, itemsText: string): string {
        let selectedSubstring = '';
        if (gloveItemShortName !== undefined) {
            selectedSubstring = itemsText.split("\"name\"\t\t\"" + gloveItemShortName + "\"")[1];
            selectedSubstring = selectedSubstring.split("\"MirrorPattern\"")[0]
        }
        return selectedSubstring;
    }

    private getItemsArray(itemsTextFile: string): textFileItem[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const itemsListJsonObject = itemsTextObject["items_game"]["items"];
        return Object.entries(itemsListJsonObject).map(([itemId, ItemAttributes]) => FileManager.addItemIdToItem(<paintKit>ItemAttributes, itemId));
    }

    private createGloveArray(glovesPaintKitsOnlyArray: paintKit[], skinNamesWithGlovesArray: string[], paintKitReferencesObject: any): paintKit[] {
        const completedGlovesArray: paintKit[] = []
        glovesPaintKitsOnlyArray.forEach(glovePaintKit => {
            skinNamesWithGlovesArray.forEach(gloveSkinName => {
                if (gloveSkinName.includes(<string>glovePaintKit.name) && !gloveSkinName.split(<string>glovePaintKit.name)[1]) {
                    const gloveModelForPaintKit = this.glovesItemArray.find(gloveItem => gloveItem.name === gloveSkinName.replace("_" + glovePaintKit.name, ""))
                    const gloveModelReferenceName = gloveModelForPaintKit?.item_name?.replace("#", "");
                    let gloveModelDisplayName = '';
                    if (gloveModelReferenceName && gloveModelReferenceName in paintKitReferencesObject){
                        gloveModelDisplayName = paintKitReferencesObject[gloveModelReferenceName]
                    }
                    const glovePaintKitReferenceName = glovePaintKit?.description_tag?.replace("#", "");
                    let paintKitDisplayName = '';
                    if (glovePaintKitReferenceName && glovePaintKitReferenceName in paintKitReferencesObject){
                        paintKitDisplayName = paintKitReferencesObject[glovePaintKitReferenceName]
                    }
                    const updatedGlovePaintKit = {
                        ...glovePaintKit,
                        itemShortName: gloveModelForPaintKit?.name,
                        itemDisplayName: gloveModelDisplayName,
                        skinDisplayName: paintKitDisplayName,
                        fullItemDisplayName: gloveModelDisplayName + ' | ' + paintKitDisplayName
                    }
                    completedGlovesArray.push(updatedGlovePaintKit)
                }
            })
        })
        return completedGlovesArray;
    }
}
