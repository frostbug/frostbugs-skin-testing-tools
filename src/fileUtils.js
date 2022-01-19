import {readFileSync, writeFileSync, copyFileSync, mkdirSync} from 'fs';
import {
    CSGO_ENGLISH_FILE_PATH,
    FINISH_FOLDERS,
    ITEMS_GAME_FILE_PATH,
    MATERIALS_FOLDERS_PATH,
    WEAPON_LIST
} from "./constants";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

class fileUtils{

}
const csgoInstalldir = ""

function fileUtils(csgoInstallDir){
    this.csgoInstallDir = csgoInstallDir
    const itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
    const csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');
}

function getPaintKitInfoArray(itemsTextFile) {
    const itemsTextObject = VDF.parse(itemsTextFile);
    let paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
    return buildPaintKitsArray(paintKitsJsonObject)
}

function getSkinNamesWeaponArray(itemsTextFile) {
    const itemsTextObject = VDF.parse(itemsTextFile);
    let clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
    return buildSkinWeaponArray(clientLootListsJsonObject);
}

function getPaintKitNamesObject(csgoEnglishFile){
    const csgoEnglishObject = VDF.parse(csgoEnglishFile);
    return csgoEnglishObject["lang"]["Tokens"]; //contains references for and display names and descriptions
}

function getGloveObjects(itemsTextFile){
    const itemsTextObject = VDF.parse(itemsTextFile);
    let paintKitsJsonObject = itemsTextObject["items_game"]["items"];
}

export function getObjectsFromText(csgoInstallDir) {
    const itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
    const csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');

    const paintKitInfoArray = getPaintKitInfoArray(itemsTextFile)
    const skinNamesWithWeaponsArray = getSkinNamesWeaponArray(itemsTextFile);
    const paintKitNamesJsonObject = getPaintKitNamesObject(csgoEnglishFile); //contains references for and display names and descriptions
    const baseGloveObjects = getGloveObjects(itemsTextFile)

    let itemLists = {
        weaponSkinArray: createCompleteSkinArray(paintKitInfoArray, skinNamesWithWeaponsArray, paintKitNamesJsonObject),
        gloveSkinArray: createGloveArray(paintKitInfoArray, paintKitNamesJsonObject)
    }
    return createCompleteSkinArray(paintKitInfoArray, skinNamesWithWeaponsArray, paintKitNamesJsonObject)
}

function createCompleteSkinArray(paintKitInfoArray, skinNamesWithWeaponsArray, paintKitNamesJsonObject){
    const completeSkinArray = [];
    skinNamesWithWeaponsArray.forEach(skinWeapon => {
        let combinedSkinItem = paintKitInfoArray.find(paintKit => paintKit.name === skinWeapon.paintKitName)
        const weaponForPaintKit = WEAPON_LIST[skinWeapon['weapon']];
        const textureDisplayName = paintKitNamesJsonObject[combinedSkinItem['description_tag'].replace("#", "")]
        combinedSkinItem = {...combinedSkinItem,
            weaponShortName: skinWeapon['weapon'],
            weaponDisplayName: weaponForPaintKit.displayName,
            weaponId: weaponForPaintKit.weaponId,
            skinDescription: paintKitNamesJsonObject[combinedSkinItem['description_string'].replace("#", "")],
            skinDisplayName: textureDisplayName,
            fullItemDisplayName: weaponForPaintKit.displayName + ' | ' + textureDisplayName
        }
        completeSkinArray.push(combinedSkinItem)
    })
    return completeSkinArray;
}

function createGloveArray(paintKitInfoArray, paintKitNamesJsonObject){
    let glovesArray = [];
    paintKitInfoArray.forEach(paintKitInfo => {
        if(paintKitInfo.hasOwnProperty("vmt_path")){
                if(paintKitInfo["vmt_path"].includes("materials/models/weapons/customization/paints_gloves/")){
                    paintKitInfo = {...paintKitInfo,


                    }
                    glovesArray.push(paintKitInfo)
                }
            }
        }
    )

}

function buildPaintKitsArray(paintKitJsonObject) {
    const itemsArray = []
    Object.entries(paintKitJsonObject).map(([key , value]) => itemsArray.push({...value, textFileKey: key}))
    return itemsArray;
}

//Returns Array of Json Object: [{ paintKitName: "PaintKitName", weapon: "Weapon" }, { paintKitName: "PaintKitName", weapon: "Weapon" }]
function buildSkinWeaponArray(clientLootListsJsonObject) {
    const skinWeaponStringArray = Object.entries(clientLootListsJsonObject).map(([, value]) => {
        return Object.entries(value).map(([key]) => {
            return key
        })
    }).reduce((accumulator, arrayToAdd) => accumulator.concat(arrayToAdd), [])

    const skinWeaponJsonObjectArray = [];
    skinWeaponStringArray.forEach(skinWeapon => {
            const processedSkinWeaponJsonObject = createJsonObjectFromSkinWeapon(skinWeapon)
            if(processedSkinWeaponJsonObject) {
                skinWeaponJsonObjectArray.push(processedSkinWeaponJsonObject)
            }
        }
    )
    return skinWeaponJsonObjectArray;
}

//If Input is a weapon, returns { paintKitName: "PaintKitName", weapon: "Weapon" }, else returns undefined
function createJsonObjectFromSkinWeapon(skinWeapon) {
    if (skinWeapon.includes('weapon_')) {
        skinWeapon = skinWeapon.replace('\[', '');
        skinWeapon = skinWeapon.replace('weapon_', '');
        const skinWeaponArray = skinWeapon.split("]");
        return {
            paintKitName: skinWeaponArray[0],
            weapon: skinWeaponArray[1]
        };
    }else{
        return undefined;
    }
}

function getFileNameFromPath(texturePath){
    let fileName = texturePath.split(['/','\\']).pop();
    return path.parse(fileName).name;
}

export function replaceSkinWithCustom(csgoInstallDir, objectToReplace, customSkinString){
    let itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');

    customSkinString["workshop preview"]["pattern"] = getFileNameFromPath(customSkinString["workshop preview"]["pattern"])
    if(customSkinString["workshop preview"]["normal"]){
        customSkinString["workshop preview"]["normal"] = getFileNameFromPath(customSkinString["workshop preview"]["normal"])
    }
    delete customSkinString["workshop preview"]["dialog_config"]

    let stringToReplace = itemsTextFile.split(objectToReplace["description_tag"])[1]
    stringToReplace = stringToReplace.split("}")[0]
    itemsTextFile = itemsTextFile.replace(stringToReplace,"\"\n" + VDF.stringify(customSkinString["workshop preview"]))

    try{
        mkdirSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, { recursive: true });
    }catch (e){
        console.log(e)
    }

    try {
        writeFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, itemsTextFile, 'ascii');
        alert('Successfully added custom skin to text file!');
    }
    catch(e) {
        console.log(e)
        alert('Failed to add custom skin to text file!');
    }
}

export function addCustomNameAndDescription(csgoInstallDir, customSkinName, customSkinDescription, skinToReplace) {
    let csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');

    csgoEnglishFile = csgoEnglishFile.replace(skinToReplace["skinDisplayName"], customSkinName);
    csgoEnglishFile = csgoEnglishFile.replace(skinToReplace["skinDescription"], customSkinDescription);

    try {
        writeFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, csgoEnglishFile, 'utf16le');
        alert('Successfully added custom name and/or description to text file!');
    }
    catch(e) {
        console.log(e)
        alert('Failed to save custom skin name/description to text file!');
    }
}

export function saveMapToFolder(mapToSavePath, finishStyle, csgoInstallDir){
    if(FINISH_FOLDERS[finishStyle]){
        const file_path = csgoInstallDir + MATERIALS_FOLDERS_PATH + FINISH_FOLDERS[finishStyle].finishStyle;
        try{
            mkdirSync(file_path, { recursive: true });
        }catch (e){
            console.log(e)
        }
        try{
            copyFileSync(mapToSavePath, file_path + "\\" + getFileNameFromPath(mapToSavePath) + ".vtf");
            const pathCopiedTo = file_path + "\\" + getFileNameFromPath(mapToSavePath) + ".vtf"
            alert("Successfully copied vtf file to " + pathCopiedTo);
        }
        catch(e) {
            console.log(e)
            alert('Failed to copy map to csgo folder!');
        }
    }
}

