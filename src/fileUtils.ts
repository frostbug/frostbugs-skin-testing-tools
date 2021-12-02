import { readFileSync } from 'fs';
import {ITEMS_GAME_FILE_PATH} from "./constants";
import * as VDF from '@node-steam/vdf';
import * as util from "util";

const fs = require('fs');

export function getObjectsFromText(csgoInstallDir: String) {
    const itemsTextFile = readFileSync(csgoInstallDir + ITEMS_GAME_FILE_PATH, 'ascii');
    console.log('File contents are: ' + itemsTextFile)
    const itemsTextObject = VDF.parse(itemsTextFile);
    //console.log('File is: ' + util.inspect(itemsTextObject,true,99999,true))
    fs.writeFileSync('C:\\Users\\matth\\Documents\\textFileExample.txt', JSON.stringify(itemsTextObject), 'ascii');
}

