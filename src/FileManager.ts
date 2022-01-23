import {readFileSync, writeFileSync, copyFileSync, mkdirSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_STYLE_FOLDERS,
    ITEMS_GAME_FILE_PATH,
    MATERIALS_FOLDERS_PATH,
    PAINTABLE_WEAPON_ARRAY, paintableWeapon,
    paintKit,
    paintKitWeaponPairing, referencedLanguageString
} from "./types";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

class fileManager {

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
        const itemsTextObject: any = VDF.parse(itemsTextFile);
        let paintKitsJsonObject: any = itemsTextObject["items_game"]["paint_kits"];
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
        let clientLootListsJsonObject: any = itemsTextObject["items_game"]["client_loot_lists"];
        return this.buildSkinWeaponArray(clientLootListsJsonObject);
    }

    public getPaintKitNamesObject(csgoEnglishFile: string) {
        const csgoEnglishObject = VDF.parse(csgoEnglishFile);
        return csgoEnglishObject["lang"]["Tokens"]; //contains references for and display names and descriptions
    }

    public getObjectsFromText(): Array<paintKit> {

        const paintKitArray = this.getItemsTextPaintKits(this.itemsTextFile)
        const skinNamesWithWeaponsArray = this.getPaintKitWeaponPairingArray(this.itemsTextFile);
        const paintKitReferencesArray = this.getPaintKitNamesObject(this.csgoEnglishFile); //contains references for and display names and descriptions
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

            if(paintKitArray.find(paintKit => paintKit.name === skinWeaponPairing.paintKitName)){}
            let combinedPaintKit: paintKit | undefined = paintKitArray.find(paintKit => paintKit.name === skinWeaponPairing.paintKitName)

            if(combinedPaintKit !== undefined){
                const weaponForPaintKit : paintableWeapon = PAINTABLE_WEAPON_ARRAY.find(paintableWeapon => paintableWeapon.weaponShortName === skinWeaponPairing.weaponShortName)
                const paintKitDisplayName: referencedLanguageString = paintKitReferencesArray.find(referenceDisplayStringPairing => referenceDisplayStringPairing.referenceString === combinedPaintKit.description_tag?.replace("#",""))
                // const paintKitDisplayName = paintKitReferencesArray[combinedPaintKit['description_tag'].replace("#", "")]
                combinedPaintKit = {
                    ...combinedPaintKit,
                    weaponShortName: skinWeaponPairing['weapon'],
                    weaponDisplayName: weaponForPaintKit.displayName,
                    weaponId: weaponForPaintKit.weaponId,
                    skinDescription: paintKitReferencesArray[combinedPaintKit['description_string'].replace("#", "")],
                    skinDisplayName: paintKitDisplayName,
                    fullItemDisplayName: weaponForPaintKit.displayName + ' | ' + paintKitDisplayName
                }
                completeSkinArray.push(combinedPaintKit)
            }

        })
        return completeSkinArray;
    }

    //Returns Array of Json Object: [{ paintKitName: "PaintKitName", weapon: "Weapon" }, { paintKitName: "PaintKitName", weapon: "Weapon" }]
    public buildSkinWeaponArray(clientLootListsJsonObject: any) {
        const skinWeaponStringArray = Object.entries(clientLootListsJsonObject).map(([, value]) => {
            return Object.entries(value).map(([key]) => {
                return key
            })
        }).reduce((accumulator, arrayToAdd) => accumulator.concat(arrayToAdd), [])

        const skinWeaponJsonObjectArray = [];
        skinWeaponStringArray.forEach(skinWeapon => {
                const processedSkinWeaponJsonObject = this.createJsonObjectFromSkinWeapon(skinWeapon)
                if (processedSkinWeaponJsonObject) {
                    skinWeaponJsonObjectArray.push(processedSkinWeaponJsonObject)
                }
            }
        )
        return skinWeaponJsonObjectArray;
    }

    //If Input is a weapon, returns { paintKitName: "PaintKitName", weapon: "Weapon" }, else returns undefined
    public createJsonObjectFromSkinWeapon(skinWeapon) {
        if (skinWeapon.includes('weapon_')) {
            skinWeapon = skinWeapon.replace('\[', '');
            skinWeapon = skinWeapon.replace('weapon_', '');
            const skinWeaponArray = skinWeapon.split("]");
            return {
                paintKitName: skinWeaponArray[0],
                weapon: skinWeaponArray[1]
            };
        } else {
            return undefined;
        }
    }

    public getFileNameFromPath(texturePath) {
        let fileName = texturePath.split(['/', '\\']).pop();
        return path.parse(fileName).name;
    }



    public addCustomNameAndDescription(csgoInstallDir, customSkinName, customSkinDescription, skinToReplace) {
        let csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');

        csgoEnglishFile = csgoEnglishFile.replace(skinToReplace["skinDisplayName"], customSkinName);
        csgoEnglishFile = csgoEnglishFile.replace(skinToReplace["skinDescription"], customSkinDescription);

        try {
            writeFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, csgoEnglishFile, 'utf16le');
            alert('Successfully added custom name and/or description to text file!');
        } catch (e) {
            console.log(e)
            alert('Failed to save custom skin name/description to text file!');
        }
    }

    public saveMapToFolder(mapToSavePath: string, finishStyle: number) {
        if (FINISH_STYLE_FOLDERS.hasOwnProperty(finishStyle)) {
            const file_path = this.csgoInstallDir + MATERIALS_FOLDERS_PATH + FINISH_STYLE_FOLDERS[finishStyle].finishStyle;
            try {
                mkdirSync(file_path, {recursive: true});
            } catch (e) {
                console.log(e)
            }
            try {
                copyFileSync(mapToSavePath, file_path + "\\" + getFileNameFromPath(mapToSavePath) + ".vtf");
                const pathCopiedTo = file_path + "\\" + getFileNameFromPath(mapToSavePath) + ".vtf"
                alert("Successfully copied vtf file to " + pathCopiedTo);
            } catch (e) {
                console.log(e)
                alert('Failed to copy map to csgo folder!');
            }
        }
    }

    public replaceSkinWithCustom(csgoInstallDir, objectToReplace, customSkinString) {
        let itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');

        customSkinString["workshop preview"]["pattern"] = getFileNameFromPath(customSkinString["workshop preview"]["pattern"])
        if (customSkinString["workshop preview"]["normal"]) {
            customSkinString["workshop preview"]["normal"] = getFileNameFromPath(customSkinString["workshop preview"]["normal"])
        }
        delete customSkinString["workshop preview"]["dialog_config"]

        let stringToReplace = itemsTextFile.split(objectToReplace["description_tag"])[1]
        stringToReplace = stringToReplace.split("}")[0]
        itemsTextFile = itemsTextFile.replace(stringToReplace, "\"\n" + VDF.stringify(customSkinString["workshop preview"]))

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

    // public createGloveArray(paintKitInfoArray, paintKitNamesJsonObject) {
    //     let glovesArray = [];
    //     paintKitInfoArray.forEach(paintKitInfo => {
    //             if (paintKitInfo.hasOwnProperty("vmt_path")) {
    //                 if (paintKitInfo["vmt_path"].includes("materials/models/weapons/customization/paints_gloves/")) {
    //                     paintKitInfo = {
    //                         ...paintKitInfo,
    //
    //
    //                     }
    //                     glovesArray.push(paintKitInfo)
    //                 }
    //             }
    //         }
    //     )
    //
    // }

    public getGloveObjects(itemsTextFile: string) {
        const itemsTextObject = VDF.parse(itemsTextFile);
        let paintKitsJsonObject = itemsTextObject["items_game"]["items"];
    }


}

