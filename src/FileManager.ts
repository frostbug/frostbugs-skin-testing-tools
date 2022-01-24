import {readFileSync, writeFileSync, copyFileSync, mkdirSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_STYLE_FOLDERS,
    ITEMS_GAME_FILE_PATH,
    MATERIALS_FOLDERS_PATH,
    PAINTABLE_WEAPON_ARRAY, paintKit,
    paintKitWeaponPairing, referencedLanguageString
} from "./types";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

export class FileManager {

    csgoInstallDir: string = ""
    itemsTextFile: string = ""
    csgoEnglishFile: string = ""

    constructor(csgoInstallDir: string) {
        this.csgoInstallDir = csgoInstallDir;
        if (csgoInstallDir.includes("Counter-Strike Global Offensive")) {
            try {
                this.itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
            } catch (e) {
                alert("Failed to read items.txt file!")
                console.log(e)
            }
            try {
                this.csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
            } catch (e) {
                alert("Failed to read csgo_english.txt file!")
                console.log(e)
            }
        } else {
            alert("Selected file is not in Counter-Strike Global Offensive folder!")
        }
    }

    public getItemsTextPaintKits(itemsTextFile: string): Array<paintKit> {
        const itemsTextObject = VDF.parse(itemsTextFile);
        let paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
        return this.convertPaintKitsObjectToArray(paintKitsJsonObject)
    }

    public convertPaintKitsObjectToArray(paintKitJsonObject: any): Array<paintKit> {
        const itemsArray: Array<paintKit> = [];
        Object.entries(paintKitJsonObject).map(([paintKitId, paintKitValue]) => itemsArray.push(this.addPaintKitIdToPaintKitObject(<paintKit>paintKitValue, paintKitId)));
        return itemsArray;
    }

    public addPaintKitIdToPaintKitObject(paintKitObject: paintKit, paintKitId: string): paintKit {
        paintKitObject.paintKitId = paintKitId;
        return paintKitObject;
    }

    public getPaintKitWeaponPairingArray(itemsTextFile: string): Array<paintKitWeaponPairing> {
        const itemsTextObject = VDF.parse(itemsTextFile);
        let clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
        return this.buildSkinWeaponArray(clientLootListsJsonObject);
    }

    public getPaintKitNamesObject(csgoEnglishFile: string) {
        const csgoEnglishObject = VDF.parse(csgoEnglishFile);
        return csgoEnglishObject["lang"]["Tokens"]; //contains references for and display names and descriptions
    }

    public getObjectsFromText(): Array<paintKit> {

        const paintKitArray = this.getItemsTextPaintKits(this.itemsTextFile)
        const skinNamesWithWeaponsArray = this.getPaintKitWeaponPairingArray(this.itemsTextFile);
        const paintKitReferencesArray = this.getPaintKitNamesObject(this.csgoEnglishFile); //contains references for and display of names and descriptions
        //const baseGloveObjects = this.getGloveObjects(this.itemsTextFile)
        // let itemLists = {
        //     weaponSkinArray: this.createCompleteSkinArray(paintKitArray, skinNamesWithWeaponsArray, paintKitReferencesArray),
        //     gloveSkinArray: this.createGloveArray(paintKitArray, paintKitReferencesArray)
        // }
        return this.createCompleteSkinArray(paintKitArray, skinNamesWithWeaponsArray, paintKitReferencesArray)
    }

    public createCompleteSkinArray(paintKitArray: Array<paintKit>, paintKitWeaponPairingArray: Array<paintKitWeaponPairing>, paintKitReferencesArray: Array<referencedLanguageString>): Array<paintKit> {
        const completeSkinArray: Array<paintKit> = [];
        paintKitWeaponPairingArray.forEach(skinWeaponPairing => {
            let combinedPaintKit: paintKit | undefined = paintKitArray.find(paintKit => paintKit.name === skinWeaponPairing.paintKitName)
            if(combinedPaintKit !== undefined){
                const weaponForPaintKit = PAINTABLE_WEAPON_ARRAY.find(paintableWeapon => paintableWeapon.weaponShortName === skinWeaponPairing.weaponShortName)
                const paintKitDisplayNameReferenceObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === combinedPaintKit?.description_tag?.replace("#",""))
                const paintKitDescriptionReferenceObject = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === combinedPaintKit?.description_string?.replace("#",""))
                combinedPaintKit = {
                    ...combinedPaintKit,
                    weaponShortName: skinWeaponPairing.weaponShortName,
                    weaponDisplayName: weaponForPaintKit?.weaponDisplayName,
                    weaponId: weaponForPaintKit?.weaponId,
                    skinDescription: paintKitDisplayNameReferenceObject?.displayedString,
                    skinDisplayName: paintKitDescriptionReferenceObject?.displayedString,
                    fullItemDisplayName: weaponForPaintKit?.weaponDisplayName + ' | ' + paintKitDescriptionReferenceObject?.displayedString
                }
                completeSkinArray.push(combinedPaintKit)
            }
        })
        return completeSkinArray;
    }

    public buildSkinWeaponArray(clientLootListsJsonObject: any): Array<paintKitWeaponPairing> {
        const paintKitWeaponPairingArray = []

        for (const value of Object.values(clientLootListsJsonObject)){
            // @ts-ignore - clientLootListObject is raw VDF and it or it's contents cannot be typed yet
            for (const key of Object.keys(value)){
                const processedSkinWeaponJsonObject = this.createJsonObjectFromSkinWeapon(key);

                if (processedSkinWeaponJsonObject){
                    paintKitWeaponPairingArray.push(processedSkinWeaponJsonObject)
                }
            }
        }
        return paintKitWeaponPairingArray;
    }

    public createJsonObjectFromSkinWeapon(skinWeaponPairingString: string): paintKitWeaponPairing | undefined {
        if (skinWeaponPairingString.includes('weapon_')) {
            skinWeaponPairingString = skinWeaponPairingString.replace('\[', '');
            skinWeaponPairingString = skinWeaponPairingString.replace('weapon_', '');
            const skinWeaponArray = skinWeaponPairingString.split("]");
            return {
                paintKitName: skinWeaponArray[0],
                weaponShortName: skinWeaponArray[1]
            };
        } else {
            return undefined;
        }
    }

    public addCustomNameAndDescription(csgoInstallDir: string, customSkinName: string, customSkinDescription: string, skinToReplace: paintKit) {
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
            console.log(e)
            alert('Failed to save custom skin name/description to text file!');
        }
    }

    public saveMapToFolder(mapToSavePath: string, paintKitFinishStyleId: string) {
        const finishStyleName = FINISH_STYLE_FOLDERS.find(finishStyle => finishStyle.finishStyleId === paintKitFinishStyleId)?.finishStyleName
        if (finishStyleName !== undefined) {
            const file_path = this.csgoInstallDir + MATERIALS_FOLDERS_PATH + finishStyleName;
            try {
                mkdirSync(file_path, {recursive: true});
            } catch (e) {
                console.log(e)
            }
            try {
                const pathToCopyTo = file_path + "\\" + path.basename(mapToSavePath);
                copyFileSync(mapToSavePath, pathToCopyTo);
                alert("Successfully copied vtf file to " + pathToCopyTo);
            } catch (e) {
                console.log(e)
                alert('Failed to copy map to csgo folder!');
            }
        }
    }

    public replaceSkinWithCustom(csgoInstallDir: string, objectToReplace: paintKit, customSkinString: paintKit) {
        let itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');

        if (customSkinString.pattern) {
            customSkinString.pattern = path.parse(customSkinString.pattern).name
        }
        if (customSkinString.normal) {
            customSkinString.normal = path.parse(customSkinString.normal).name
        }
        delete customSkinString.dialog_config;

        if(objectToReplace.description_tag !== undefined){
            let stringToReplace = itemsTextFile.split(objectToReplace.description_tag)[1]
            stringToReplace = stringToReplace.split("}")[0]
            itemsTextFile = itemsTextFile.replace(stringToReplace, "\"\n" + VDF.stringify(JSON.stringify(customSkinString)))
        }

        try {
            mkdirSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, {recursive: true});
        } catch (e) {
            console.log(e)
        }

        try {
            writeFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
            alert('Successfully added custom skin to text file!');
        } catch (e) {
            console.log(e)
            alert('Failed to add custom skin to text file!');
        }
    }

    public getGloveObjects(itemsTextFile: string) {
        const itemsTextObject = VDF.parse(itemsTextFile);
        let paintKitsJsonObject = itemsTextObject["items_game"]["items"];
    }
}