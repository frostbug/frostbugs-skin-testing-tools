import {readFileSync} from 'fs';
import {CSGO_ENGLISH_FILE_PATH, ITEMS_GAME_FILE_PATH, WEAPON_LIST} from "./constants";
import * as VDF from '@node-steam/vdf';
import * as util from "util";
import * as Console from "console";

const fs = require('fs');

export function getObjectsFromText(csgoInstallDir) {
    const itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
    const csgoEnglishFile = readFileSync(csgoInstallDir + CSGO_ENGLISH_FILE_PATH, 'utf16le');

    const itemsTextObject = VDF.parse(itemsTextFile);
    const csgoEnglishObject = VDF.parse(csgoEnglishFile);

    let paintKitsJsonObject = itemsTextObject["items_game"]["paint_kits"];
    const paintKitInfoArray = buildPaintKitsArray(paintKitsJsonObject)

    let clientLootListsJsonObject = itemsTextObject["items_game"]["client_loot_lists"];
    const skinNamesWithWeaponsArray = buildSkinWeaponArray(clientLootListsJsonObject);

    let paintKitNamesJsonObject = csgoEnglishObject["lang"]["Tokens"]; //contains references for and display names and descriptions
    const completeSkinArray = createCompleteSkinArray(paintKitInfoArray, skinNamesWithWeaponsArray, paintKitNamesJsonObject)

    findSkinByNameAndWeapon(completeSkinArray, "Wildfire", "AWP");

}

function createCompleteSkinArray(paintKitInfoArray, skinNamesWithWeaponsArray, paintKitNamesJsonObject){
    const completeSkinArray = [];
    skinNamesWithWeaponsArray.forEach(skinWeapon => {
        let combinedSkinItem = paintKitInfoArray.find(paintKit => paintKit.name === skinWeapon.paintKitName)
        const weaponForPaintKit = WEAPON_LIST[skinWeapon['weapon']];
        combinedSkinItem = {...combinedSkinItem,
            weaponShortName: skinWeapon['weapon'],
            weaponDisplayName: weaponForPaintKit.displayName,
            weaponId: weaponForPaintKit.weaponId,
            skinDescription: paintKitNamesJsonObject[combinedSkinItem['description_string'].replace("#", "")],
            skinDisplayName: paintKitNamesJsonObject[combinedSkinItem['description_tag'].replace("#", "")]
        }
        completeSkinArray.push(combinedSkinItem)
    })

    return completeSkinArray;
}

function buildPaintKitsArray(paintKitJsonObject) {
    const itemsArray = []
    Object.entries(paintKitJsonObject).map(([, value]) => itemsArray.push(value))
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

function findSkinByNameAndWeapon(completeSkinArray, skinDisplayName, weaponDisplayName){
    console.log(completeSkinArray.find(skin => skin.skinDisplayName === skinDisplayName && skin.weaponDisplayName === weaponDisplayName))
}

// fs.writeFileSync('C:\\Users\\matth\\Documents\\textFileExample.json', JSON.stringify(itemsTextObject), 'ascii');
//console.log(paintKitNamesJsonObject['PaintKit_cu_p2000_hunter_Tag'])