import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_STYLE_FOLDERS,
    icon,
    ITEMS_GAME_FILE_PATH,
    PAINTABLE_WEAPON_ARRAY,
    paintKit,
    paintKitItemPairing,
    sprayKit,
    stickerKit,
    stickerKitItemPairing,
    stickerRarity,
    STICKER_MATERIALS_FOLDERS_PATH,
    STICKER_MATERIALS_IN_VMT_FOLDERS_PATH,
    STICKER_RARITY_FOLDERS,
    textFileItem,
    weaponDecal,
    WEAPON_SKIN_MATERIALS_FOLDERS_PATH
} from "./types";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

export class FileManager {

    csgoInstallDir: string = "";
    itemsTextFile: string = "";
    csgoEnglishFile: string = "";
    completePaintKitWeaponArray: paintKit[] = [];
    completePaintKitGloveArray: paintKit[] = [];
    completeStickerKitArray: stickerKit[] = [];
    glovesItemArray: textFileItem[] = [];

    stickerSignaturesToggleValue: boolean = false;
    stickerTeamLogosToggleValue: boolean = false;

    currentStickerRaritySet: string = 'Standard';

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
            this.buildCompleteStickerKitArrays()
        } else {
            // alert("Selected file is not in Counter-Strike Global Offensive folder!")
        }
    }

    private getItemsTextPaintKits(itemsTextFile: string): paintKit[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
        return this.convertPaintKitsObjectToArray(paintKitsJsonObject)
    }

    private getItemsTextStickerKits(itemsTextFile: string): stickerKit[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const stickerKitsJsonObject = itemsTextObject["items_game"]["sticker_kits"];
        return this.convertStickerKitsObjectToArray(stickerKitsJsonObject)
    }

    /*private getItemsTextSprayKits(itemsTextFile: string): sprayKit[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const sprayKitsJsonObject = itemsTextObject["items_game"]["sticker_kits"]; // sprays are still under stricker_kits
        return this.convertSprayKitsObjectToArray(sprayKitsJsonObject)
    }*/

    private convertPaintKitsObjectToArray(paintKitJsonObject: ArrayLike<unknown>): paintKit[] {
        return Object.entries(paintKitJsonObject).map(([paintKitId, paintKitValue]) => FileManager.addPaintKitIdToPaintKitObject(paintKitValue as paintKit, paintKitId));
    }

    private convertStickerKitsObjectToArray(stickerKitJsonObject: ArrayLike<unknown>): stickerKit[] {
        return Object.entries(stickerKitJsonObject).map(([stickerKitId, stickerKitValue]) => FileManager.addStickerKitIdToStickerKitObject(stickerKitValue as stickerKit, stickerKitId));
    }

    private static addPaintKitIdToPaintKitObject(paintKitObject: paintKit, paintKitId: string): paintKit {
        paintKitObject.paintKitId = paintKitId;
        return paintKitObject;
    }

    private static addStickerKitIdToStickerKitObject(stickerKitObject: stickerKit, stickerKitId: string): stickerKit {
        stickerKitObject.stickerKitId = stickerKitId;
        return stickerKitObject;
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
        const stringObject =  VDF.parse(csgoEnglishFile)["lang"]["Tokens"];
        for (const key in stringObject) {
            if (stringObject.hasOwnProperty(key)) {
                stringObject[key.toUpperCase()] = stringObject[key];
                delete stringObject[key];
            }
        }
        return stringObject
    }

    private static getStickerKitStickerPairingArray(itemsTextFile: string, stickerSignaturesToggleValue: boolean, stickerTeamLogosToggleValue: boolean, currentStickerRaritySet: string): stickerKitItemPairing[] {
        const itemsTextObject = VDF.parse(itemsTextFile);
        const clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
        return FileManager.buildStickerArray(clientLootListsJsonObject, stickerSignaturesToggleValue, stickerTeamLogosToggleValue, currentStickerRaritySet);
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

    public buildCompletePaintKitArrays(): void {
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

    public buildCompleteStickerKitArrays(): void {
        const stickerKitArray = this.getItemsTextStickerKits(this.itemsTextFile)
        const paintKitReferencesObject = FileManager.getPaintKitNamesObject(this.csgoEnglishFile);
        const stickerNamesArray = FileManager.getStickerKitStickerPairingArray(this.itemsTextFile, this.stickerSignaturesToggleValue, this.stickerTeamLogosToggleValue, this.currentStickerRaritySet);
        this.completeStickerKitArray = this.createCompleteStickerArray(stickerKitArray, stickerNamesArray, paintKitReferencesObject);
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
                const glovesName = iconNameObject.icon_path.slice(0, -6).split('/').pop();
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

    public getcompleteStickerKitArray(): stickerKit[] {
        return this.completeStickerKitArray;
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
                const paintKitDescriptionReference = combinedPaintKit?.description_string?.replace("#", "").toUpperCase()
                const paintKitNameReference = combinedPaintKit?.description_tag?.replace("#", "").toUpperCase()
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

    private createCompleteStickerArray(stickerKitArray: stickerKit[], stickerKitStickerPairingArray: stickerKitItemPairing[], stickerKitReferencesObject: any): stickerKit[] {
        const completeStickersArray: stickerKit[] = [];
        stickerKitStickerPairingArray.forEach(stickerPairing => {
            let combinedStickerKit = stickerKitArray.find(stickerKit => stickerKit.name === stickerPairing.stickerKitName && stickerKit.item_rarity?.toLowerCase() === stickerPairing.stickerRarity.stickerRarityName.toLowerCase())
            if (combinedStickerKit !== undefined) {
                const stickerKitDescriptionReference = combinedStickerKit?.description_string?.replace("#", "").toUpperCase()
                const stickerKitNameReference = combinedStickerKit?.item_name?.replace("#", "").toUpperCase()
                let stickerDescription = '';
                let stickerDisplayName = '';
                if(stickerKitDescriptionReference && stickerKitDescriptionReference in stickerKitReferencesObject){
                    stickerDescription = stickerKitReferencesObject[stickerKitDescriptionReference]
                }
                if(stickerKitNameReference && stickerKitNameReference in stickerKitReferencesObject){
                    stickerDisplayName = stickerKitReferencesObject[stickerKitNameReference]
                }
                const stickerKitName = stickerPairing.stickerKitName;
                if (stickerKitName.includes('phase')) {
                    stickerDisplayName = stickerDisplayName + (' Phase ' + stickerKitName.split('phase')[1].charAt(0))
                }
                combinedStickerKit = {
                    ...combinedStickerKit,
                    itemDisplayName: stickerPairing?.stickerCollectionName,
                    stickerDescription: stickerDescription,
                    stickerDisplayName: stickerDisplayName,
                    fullItemDisplayName: stickerPairing?.stickerCollectionName + ' | ' + stickerDisplayName
                }
                completeStickersArray.push(combinedStickerKit)
            }
        })
        return completeStickersArray;
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

    private static buildStickerArray(clientLootListsJsonObject: ArrayLike<unknown>, stickerSignaturesToggleValue: boolean, stickerTeamLogosToggleValue: boolean, currentStickerRaritySet: string): stickerKitItemPairing[] {
        const stickerKitStickerPairingArray = []
        let keyNumInArray = 0;
        for (const value of Object.values(clientLootListsJsonObject)) {
            // @ts-ignore - clientLootListObject is raw VDF and it or it's contents cannot be typed yet
            for (const key of Object.keys(value)) {
                const processedStickerJsonObject = FileManager.createJsonObjectFromSticker(Object.keys(clientLootListsJsonObject)[keyNumInArray], key, stickerSignaturesToggleValue, stickerTeamLogosToggleValue, currentStickerRaritySet);
                if (processedStickerJsonObject) {
                    stickerKitStickerPairingArray.push(processedStickerJsonObject)
                }
            }

            keyNumInArray++;
        }
        return stickerKitStickerPairingArray;
    }

    private static createJsonObjectFromSkinWeapon(skinWeaponPairingString: string): paintKitItemPairing | undefined {
        if (skinWeaponPairingString.includes('weapon_')) {
            skinWeaponPairingString = skinWeaponPairingString.replace('[', '');
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

    private static createJsonObjectFromSticker(stickerCollectionName: string, stickerPairingString: string, stickerSignaturesToggleValue: boolean, stickerTeamLogosToggleValue: boolean, currentStickerRaritySet: string): stickerKitItemPairing | undefined {
        if (stickerPairingString.includes('sticker')) {
            var stickerString = stickerPairingString.replace('[', '').split("]")[0];
            const stickerRarityId = stickerCollectionName.toLowerCase().includes('foil') || stickerString.toLowerCase().includes('foil') || stickerCollectionName.toLowerCase().includes('legendary') || stickerString.toLowerCase().includes('legendary')
                ? 4
                : (stickerCollectionName.toLowerCase().includes('holo') || stickerString.toLowerCase().includes('holo') || stickerCollectionName.toLowerCase().includes('mythical') || stickerString.toLowerCase().includes('mythical')
                    ? 3
                    : 0)
            const stickerRarityName = stickerRarityId === 4 ? 'Legendary' : (stickerRarityId === 3 ? 'Mythical' : 'Rare')
            const stickerRarityDisplayName = stickerRarityId === 4 ? 'Foil' : (stickerRarityId === 3 ? 'Holo' : 'Standard')

            if (stickerRarityDisplayName.toLowerCase() !== currentStickerRaritySet.toLowerCase())
                return undefined

            if (stickerCollectionName)
            {
                if (!stickerSignaturesToggleValue && stickerString.includes('signature')) {
                    return undefined
                }
                if (!stickerTeamLogosToggleValue &&
                    (stickerString.toLowerCase().includes('dh2013') || // did this major have stickers ??
                    stickerString.toLowerCase().includes('kat2014') ||
                    stickerString.toLowerCase().includes('cologne2014') ||
                    stickerString.toLowerCase().includes('dhw2014') ||
                    stickerString.toLowerCase().includes('eslkatowice2015') ||
                    stickerString.toLowerCase().includes('eslcologne2015') ||
                    stickerString.toLowerCase().includes('cluj2015') ||
                    stickerString.toLowerCase().includes('columbus2016') ||
                    stickerString.toLowerCase().includes('cologne2016') ||
                    stickerString.toLowerCase().includes('atlanta2017') ||
                    stickerString.toLowerCase().includes('krakow2017') ||
                    stickerString.toLowerCase().includes('boston2018') ||
                    stickerString.toLowerCase().includes('london2018') ||
                    stickerString.toLowerCase().includes('katowice2019') ||
                    stickerString.toLowerCase().includes('berlin2019') ||
                    stickerString.toLowerCase().includes('rmr2020') ||
                    stickerString.toLowerCase().includes('stockh2021') ||
                    stickerString.toLowerCase().includes('antwerp2022'))) {
                        return undefined
                    }

                return {
                    stickerKitName: stickerString,
                    stickerCollectionName: stickerCollectionName,
                    stickerRarity: {
                        stickerRarityId: stickerRarityId,
                        stickerRarityName: stickerRarityName,
                        stickerRarityDisplayName: stickerRarityDisplayName
                    }
                };
            }
            else
            {
                return {
                    stickerKitName: stickerString,
                    stickerCollectionName: 'other',
                    stickerRarity: {
                        stickerRarityId: stickerRarityId,
                        stickerRarityName: stickerRarityName,
                        stickerRarityDisplayName: stickerRarityDisplayName
                    }
                };
            }
        } else {
            return undefined;
        }
    }

    public setStickerSignaturesToggleValue = (enabled: boolean) => {
        this.stickerSignaturesToggleValue = enabled;
    }

    public setStickerTeamLogosToggleValue = (enabled: boolean) => {
        this.stickerTeamLogosToggleValue = enabled;
    }

    public addCustomNameAndDescription(csgoInstallDir: string, customItemName: string, customItemDescription: string, skinToReplace: paintKit): boolean {
        let csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
        if (skinToReplace.skinDisplayName) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDisplayName, customItemName);
        }
        if (skinToReplace.skinDescription) {
            csgoEnglishFile = csgoEnglishFile.replace(skinToReplace.skinDescription, customItemDescription);
        }
        try {
            writeFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, csgoEnglishFile, 'utf16le');
            return true;
        } catch (e) {
            console.error(e)
            return false;
        }
    }

    public saveWeaponSkinMapToFolder(mapToSavePath: string, paintKitFinishStyleId: string): boolean {
        const finishStyleName = FINISH_STYLE_FOLDERS.find(finishStyle => finishStyle.finishStyleId === paintKitFinishStyleId.toString())?.finishStyleName
        if (finishStyleName !== undefined) {
            const file_path = this.csgoInstallDir + WEAPON_SKIN_MATERIALS_FOLDERS_PATH + finishStyleName;
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

    public saveStickerMapToFolder(mapToSavePath: string, stickerKitFinishStyleId: string): boolean {
        if (stickerKitFinishStyleId !== undefined) {
            const file_path = this.csgoInstallDir + STICKER_MATERIALS_FOLDERS_PATH + stickerKitFinishStyleId;
            try {
                mkdirSync(file_path, {recursive: true});
            } catch (e) {
                console.log(stickerKitFinishStyleId + ' folder already exists!');
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

    public saveStickerVmtToFolder(vmtToSavePath: string, stickerKitFinishStyleId: string): boolean {
        if (stickerKitFinishStyleId !== undefined) {
            const file_path = this.csgoInstallDir + STICKER_MATERIALS_FOLDERS_PATH + stickerKitFinishStyleId;
            try {
                mkdirSync(file_path, {recursive: true});
            } catch (e) {
                console.log(stickerKitFinishStyleId + ' folder already exists!');
            }
            try {
                const pathToCopyTo = path.join(file_path, path.basename(vmtToSavePath));
                copyFileSync(vmtToSavePath, pathToCopyTo);
                console.log("Successfully copied vmt file to " + pathToCopyTo);

                let newVmtFileContents = readFileSync(pathToCopyTo, 'ascii');
                const newVmtFileText: weaponDecal = VDF.parse(newVmtFileContents)["WeaponDecal"];
                if (!newVmtFileText ||
                    !newVmtFileText.$basetexture ||
                    (stickerKitFinishStyleId === 'Foil' && !newVmtFileText.$normalmap) ||
                    (stickerKitFinishStyleId === 'Holo' && !newVmtFileText.$holomask)) {
                    console.log('Could not change vmt paths to point to vtfs in csgo files.');
                } else {
                    newVmtFileContents = newVmtFileContents.replace(newVmtFileText.$basetexture, STICKER_MATERIALS_IN_VMT_FOLDERS_PATH + stickerKitFinishStyleId + "\\" + path.parse(newVmtFileText.$basetexture).name);
                    if (newVmtFileText.$phongexponenttexture)
                        newVmtFileContents = newVmtFileContents.replace(newVmtFileText.$phongexponenttexture, STICKER_MATERIALS_IN_VMT_FOLDERS_PATH + stickerKitFinishStyleId + "\\" + path.parse(newVmtFileText.$phongexponenttexture).name);
                    if (stickerKitFinishStyleId === 'Foil' && newVmtFileText.$normalmap)
                        newVmtFileContents = newVmtFileContents.replace(newVmtFileText.$normalmap, STICKER_MATERIALS_IN_VMT_FOLDERS_PATH + stickerKitFinishStyleId + "\\" + path.parse(newVmtFileText.$normalmap).name);
                    if (stickerKitFinishStyleId === 'Holo' && newVmtFileText.$holomask)
                        newVmtFileContents = newVmtFileContents.replace(newVmtFileText.$holomask, STICKER_MATERIALS_IN_VMT_FOLDERS_PATH + stickerKitFinishStyleId + "\\" + path.parse(newVmtFileText.$holomask).name);
                    writeFileSync(pathToCopyTo, newVmtFileContents, 'ascii');
                    console.log('Changed vmt path to point to vtf in csgo files.');
                }

                return true;
            } catch (e) {
                console.error(e)
                return false;
            }
        }
        return false
    }

    public replaceSkinWithCustom(objectToReplace: paintKit, customSkinString: paintKit, normalMapToggle: boolean): boolean {
        let skinToAdd: paintKit = JSON.parse(JSON.stringify(customSkinString))
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
        if (skinToAdd.pattern) {
            skinToAdd.pattern = path.parse(skinToAdd.pattern).name
        }
        if (skinToAdd.normal) {
            skinToAdd.normal = path.parse(skinToAdd.normal).name
        }
        delete skinToAdd.dialog_config;
        if(!normalMapToggle){
            delete skinToAdd.normal;
            delete skinToAdd.use_normal;
        }
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

    public replaceStickerWithCustom(objectToReplace: stickerKit, customStickerString: weaponDecal, customItemName: string, customItemDescription: string, vmtName: string): boolean {
        let stickerToAdd: weaponDecal = JSON.parse(JSON.stringify(customStickerString))
        let itemsTextFile = readFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
        if (objectToReplace.item_name !== undefined) {
            let stringSplit = itemsTextFile.split(objectToReplace.item_name)
            itemsTextFile = stringSplit[0] + customItemName + stringSplit[1]
        }
        if (objectToReplace.description_string !== undefined) {
            let stringSplit = itemsTextFile.split(objectToReplace.description_string)
            itemsTextFile = stringSplit[0] + customItemDescription + stringSplit[1]
        }
        if (objectToReplace.item_rarity !== undefined && objectToReplace.sticker_material !== undefined) {
            let stringSplit = itemsTextFile.split(objectToReplace.sticker_material)
            const rarityFolderName = objectToReplace.item_rarity.toLowerCase() === 'legendary' ? 'Foil' : (objectToReplace.item_rarity.toLowerCase() === 'mythical' ? 'Holo' : 'Standard')
            itemsTextFile = stringSplit[0] + rarityFolderName + "/" + vmtName + stringSplit[1]
        }
        try {
            writeFileSync(this.csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    private static getGlovePaintKitStringFromTextFile(glovePaintKit: paintKit, itemsText: string): string {
        let selectedSubstring = '';
        if (glovePaintKit.description_tag !== undefined) {
            selectedSubstring = itemsText.split(glovePaintKit.description_tag)[1];
            selectedSubstring = selectedSubstring.split("}")[0];
            if (glovePaintKit.vmt_overrides) {
                selectedSubstring = selectedSubstring + "\n}";
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
        return Object.entries(itemsListJsonObject).map(([itemId, ItemAttributes]) => FileManager.addItemIdToItem(ItemAttributes as paintKit, itemId));
    }

    private createGloveArray(glovesPaintKitsOnlyArray: paintKit[], skinNamesWithGlovesArray: string[], paintKitReferencesObject: any): paintKit[] {
        const completedGlovesArray: paintKit[] = []
        glovesPaintKitsOnlyArray.forEach(glovePaintKit => {
            skinNamesWithGlovesArray.forEach(gloveSkinName => {
                if (gloveSkinName.includes(glovePaintKit.name as string) && !gloveSkinName.split(glovePaintKit.name as string)[1]) {
                    const gloveModelForPaintKit = this.glovesItemArray.find(gloveItem => gloveItem.name === gloveSkinName.replace("_" + glovePaintKit.name, ""))
                    const gloveModelReferenceName = gloveModelForPaintKit?.item_name?.replace("#", "").toUpperCase();
                    let gloveModelDisplayName = '';
                    if (gloveModelReferenceName && gloveModelReferenceName in paintKitReferencesObject){
                        gloveModelDisplayName = paintKitReferencesObject[gloveModelReferenceName]
                    }
                    const glovePaintKitReferenceName = glovePaintKit?.description_tag?.replace("#", "").toUpperCase();
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

    public setCurrentStickerRaritySet = (rarity: string) => this.currentStickerRaritySet = rarity;
}
