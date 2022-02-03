import {CSGO_EXECUTABLE_NAME} from "./types";
import {ChangeEvent, FormEvent, useState} from "react";
import {FileManager} from "./FileManager";
import * as util from "util";
import * as VDF from '@node-steam/vdf';
import * as path from "path";
import {paintKit} from "./types";

const fs = require('fs');

const WeaponForm = () => {
    const [csgoInstallDir, setCsgoInstallDir] = useState<string>('')
    const [completeWeaponSkinArray, setCompleteWeaponSkinArray] = useState<Array<paintKit>>([])
    const [completeGloveSkinArray, setCompleteGloveSkinArray] = useState<Array<paintKit>>([])
    const [arrayForDropdown, setArrayForDropdown] = useState<Array<string>>(["--Please choose an option--"])
    const [jsonFromTextFile, setJsonFromTextFile] = useState<paintKit>()
    const [currentlySelectedSkin, setCurrentlySelectedSkin] = useState<paintKit>()
    const [customSkinName, setCustomSkinName] = useState<string>('')
    const [customSkinDescription, setCustomSkinDescription] = useState<string>('')
    const [inputDiffuseFile, setInputDiffuseFile] = useState<File>()
    const [inputNormalFile, setInputNormalFile] = useState<File>()
    const [fileManager, setFileManager] = useState<FileManager>()

    function setCsgoDirAndSkinArray (csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): Array<paintKit> {
        if (!csgoExeUpdateEvent.target.files) return [];
        if (csgoExeUpdateEvent.target.files[0]) {

            const csgoExeFilePath = csgoExeUpdateEvent.target.files[0].path.replace(CSGO_EXECUTABLE_NAME, '');
            const newFileManager = new FileManager(csgoExeFilePath);
            const weaponPaintKitArray = newFileManager.getCompletePaintKitWeaponArray()
            const glovePaintKitArray = newFileManager.getCompletePaintKitGloveArray()
            // @ts-ignore
            weaponPaintKitArray.sort((a, b) => a.fullItemDisplayName > b.fullItemDisplayName ? 1 : -1);
            // @ts-ignore
            glovePaintKitArray.sort((a, b) => a.fullItemDisplayName > b.fullItemDisplayName ? 1 : -1);
            setCsgoInstallDir(csgoExeFilePath);
            setCompleteGloveSkinArray(glovePaintKitArray)
            setCompleteWeaponSkinArray(weaponPaintKitArray)
            setFileManager(newFileManager)
            return weaponPaintKitArray
        }
        return [];
    }

    function onDiffuseFileUpload(diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void {
        if (!diffFileUploadEvent.target.files) return;
        setInputDiffuseFile(diffFileUploadEvent.target.files[0]);
    }

    function onNormalFileUpload(normalFileUploadEvent: ChangeEvent<HTMLInputElement>): void {
        if (!normalFileUploadEvent.target.files) return;
        setInputNormalFile(normalFileUploadEvent.target.files[0]);
    }

    const populateSkinDropdown = (generatedPaintKitArray: Array<paintKit>, inputTextFile?: paintKit): void => {
        if (generatedPaintKitArray.length !== 0) {
            let curatedDropDownArray = generatedPaintKitArray;
            if(inputTextFile){
                curatedDropDownArray = curatedDropDownArray.filter((skinWeapon: paintKit) => skinWeapon.weaponId === inputTextFile?.dialog_config?.split(",")[0])
            }
            const arrayForDropdown: Array<string> = curatedDropDownArray.map(paintKit => paintKit.fullItemDisplayName as string)
            arrayForDropdown.unshift('--Please choose an option--');
            setArrayForDropdown(arrayForDropdown);
        }
    }

    function fetchAndSetCurrentSelectedDropdownSkin(selectSkinEvent: ChangeEvent<HTMLSelectElement>): void {
        setCurrentlySelectedSkin(completeWeaponSkinArray.find((skinWeapon: paintKit) => skinWeapon.fullItemDisplayName === selectSkinEvent.target.value))
    }

    function readTextFileOnInput(textFileUpdatedEvent: ChangeEvent<HTMLInputElement>): void {
        if (!textFileUpdatedEvent.target.files) return;
        const textFileInput = textFileUpdatedEvent.target.files[0];
        const textFileReader = new FileReader();
        textFileReader.onload = function () {
            if (textFileReader.result) {
                const inputTextFile: paintKit = VDF.parse(textFileReader.result.toString())["workshop preview"]
                if (inputTextFile && inputTextFile.dialog_config) {
                    populateSkinDropdown(completeWeaponSkinArray, inputTextFile);
                    checkIfVtfsExist(inputTextFile);
                    setJsonFromTextFile(inputTextFile);
                } else {
                    alert('Cannot find skin parameters in text file, please make sure it is in the correct format or generate a new one from the workbench.');
                }
            }
        }
        textFileReader.readAsText(textFileInput)
    }

    function checkIfVtfsExist(inputTextFile: paintKit): void {
        if (!inputTextFile) return;
        if (fs.existsSync(inputTextFile?.pattern)) {
            // @ts-ignore
            document.getElementById('diffuseWeaponLabel').textContent = ('Diffuse Map - using ' + path.parse(inputTextFile?.pattern as string).base);
            // @ts-ignore
            document.getElementById('diffuseWeaponLabel').style.color = "#009900";
        } else {
            // @ts-ignore
            document.getElementById('diffuseWeaponLabel').textContent = ('Diffuse Map')
            // @ts-ignore
            document.getElementById('diffuseWeaponLabel').style.color = "rgb(136,136,136)";
        }

        if (inputTextFile.use_normal == '1') {
            // @ts-ignore
            document.getElementById('normalCheckBox').checked = true;

            if (fs.existsSync(inputTextFile.normal)) {
                // @ts-ignore
                document.getElementById('normalWeaponLabel').textContent = ('Normal Map - using ' + path.parse(inputTextFile?.normal as string).base);
                // @ts-ignore
                document.getElementById('normalWeaponLabel').style.color = "#009900";
            } else {
                // @ts-ignore
                document.getElementById('normalWeaponLabel').textContent = ('Normal Map')
                // @ts-ignore
                document.getElementById('normalWeaponLabel').style.color = "rgb(136,136,136)";
            }
        } else {
            // @ts-ignore
            document.getElementById('normalCheckBox').checked = false;
        }

    }

    function onCsgoDirUpdate(csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): void {
        const brandNewPaintKitArray = setCsgoDirAndSkinArray(csgoExeUpdateEvent);
        populateSkinDropdown(brandNewPaintKitArray,undefined )
    }

    function findAlternateMapsIfSelected(): void {
        if (!jsonFromTextFile) return;
        if (inputDiffuseFile) {
            jsonFromTextFile.pattern = inputDiffuseFile.path;
        }
        if (inputNormalFile) {
            jsonFromTextFile.normal = inputNormalFile.path;
        }
    }

    function saveAllVtfMapsToFolders(): void {
        if (!fileManager) return;
        if (jsonFromTextFile && jsonFromTextFile.pattern && jsonFromTextFile.style)
            fileManager.saveMapToFolder(jsonFromTextFile.pattern, jsonFromTextFile.style)
        if (jsonFromTextFile && jsonFromTextFile.normal && jsonFromTextFile.style) {
            fileManager.saveMapToFolder(jsonFromTextFile.normal, jsonFromTextFile.style)
        }
    }

    function submitWeaponForm(submitFormEvent: FormEvent<HTMLFormElement>): void {
        submitFormEvent.preventDefault();
        if (!fileManager) return;
        const selectedWeaponToReplace = currentlySelectedSkin;
        findAlternateMapsIfSelected()
        saveAllVtfMapsToFolders()
        if (jsonFromTextFile) {
            if (selectedWeaponToReplace) {
                fileManager.replaceSkinWithCustom(selectedWeaponToReplace, jsonFromTextFile);
                if (customSkinName !== '' || customSkinDescription !== "") {
                    fileManager.addCustomNameAndDescription(csgoInstallDir, customSkinName, customSkinDescription, selectedWeaponToReplace)
                }
            } else {
                alert('Please select a skin to replace with your custom skin!')
            }
        } else {
            alert("Please upload text file for your custom skin!")
        }

    }

    const submitGloveForm = (submitFormEvent: FormEvent<HTMLFormElement>) => {
        submitFormEvent.preventDefault();
    }

    return (
        <div>
            <div id="inputDiv">
                <label id="weaponLabel" htmlFor="csgoInstallFileInput" className="form-label mt-4">csgo.exe
                    location</label>
                <input className="form-control" type="file" id="csgoInstallFileInput" accept=".exe"
                       onChange={onCsgoDirUpdate}/>
            </div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <a className="nav-link active" data-bs-toggle="tab" href="#weapon">Weapon</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#gloves">Gloves</a>
                </li>
            </ul>
            <div id="windowTabs" className="tab-content">
                {/*<----------------------------------------------------Weapon Tab---------------------------------------------------->*/}
                <div className="tab-pane active" id="weapon">
                    <form onSubmit={submitWeaponForm}>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="textFileInput" className="form-label mt-4">Text
                                File</label>
                            <input className="form-control" type="file" id="textFileInput" accept=".txt"
                                   onChange={readTextFileOnInput}/>
                        </div>
                        <div id="inputDiv">
                            <label id="diffuseWeaponLabel" htmlFor="diffuseFileInput" className="form-label mt-4">Diffuse
                                Map</label>
                            <input className="form-control" type="file" id="diffuseFileInput"
                                   onChange={onDiffuseFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="normalCheckBox"/>
                                <label id="normalWeaponLabel" className="form-check-label" htmlFor="normalCheckBox">Normal
                                    Map</label>
                            </div>
                            <input className="form-control" type="file" id="normalFileInput" onChange={onNormalFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="weaponDropDownDiv" className="form-label mt-4">Skin To
                                Replace</label>
                            <div className="dropdown" id="weaponDropDownDiv">
                                <select name="weaponSkinDropDown" id="weaponSkinDropDown" className="form-select"
                                        onChange={fetchAndSetCurrentSelectedDropdownSkin}>
                                    {arrayForDropdown.map(skinName => (<option key={skinName} value={skinName}>{skinName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinNameInput">New Skin
                                Name</label>
                            <input className="form-control" placeholder="Custom Skin Name" id="newSkinNameInput"
                                   onChange={event => setCustomSkinDescription(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinDescription">New
                                Skin Description</label>
                            <textarea className="form-control" placeholder="Custom Skin Description"
                                      id="newSkinDescription" rows={3}
                                      onChange={event => setCustomSkinName(event.target.value)}/>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceWeaponTexturesBtn" type="submit" className="btn btn-primary">Replace
                                Textures
                            </button>
                        </div>
                    </form>
                </div>
                {/*<----------------------------------------------------Gloves Tab---------------------------------------------------->*/}
                <div className="tab-pane" id="gloves">
                    <form onSubmit={submitGloveForm}>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="currentGlovesDropdown" className="form-label mt-4">Current
                                Gloves</label>
                            <div className="dropdown" id="currentGlovesDropdown">
                                <select name="currentGloves" id="currentGloves" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="gluvvy">gluvvy</option>
                                    <option value="wuvvy">wuvvy</option>
                                    <option value="fisto">fisto</option>
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="newGlovesDropdown" className="form-label mt-4">New
                                Gloves</label>
                            <div className="dropdown" id="newGlovesDropdown">
                                <select name="newGloves" id="newGloves" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="gluvvy">gluvvy</option>
                                    <option value="wuvvy">wuvvy</option>
                                    <option value="fisto">fisto</option>
                                </select>
                            </div>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceGloveTexturesBtn" type="submit" className="btn btn-primary">Replace
                                Textures
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default WeaponForm