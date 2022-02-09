import {CSGO_EXECUTABLE_NAME, paintKit} from "./types";
import {ChangeEvent, FormEvent, useState} from "react";
import {FileManager} from "./FileManager";
import * as VDF from '@node-steam/vdf';
import * as path from "path";

const fs = require('fs');

const WeaponForm = () => {
    const [csgoInstallDir, setCsgoInstallDir] = useState<string>('')
    const [diffuseLabelText, setDiffuseLabelText] = useState<string>('Diffuse Map')
    const [diffuseLabelStyle, setDiffuseLabelStyle] = useState({color: '#888888'})
    const [normalLabelStyle, setNormalLabelStyle] = useState({color: '#888888'})
    const [normalLabelText, setNormalLabelText] = useState<string>('Normal Map')
    const [completeWeaponSkinArray, setCompleteWeaponSkinArray] = useState<Array<paintKit>>([])
    const [completeGloveSkinArray, setCompleteGloveSkinArray] = useState<Array<paintKit>>([])
    const [weaponArrayForDropdown, setWeaponArrayForDropdown] = useState<Array<string>>(["--Waiting for csgo.exe location--"])
    const [gloveArrayForDropdown, setGloveArrayForDropdown] = useState<Array<string>>(["--Waiting for csgo.exe location--"])
    const [jsonFromTextFile, setJsonFromTextFile] = useState<paintKit>()
    const [currentlySelectedWeaponSkin, setCurrentlySelectedWeaponSkin] = useState<paintKit>()
    const [currentlySelectedGloveToReplace, setCurrentlySelectedGloveToReplace] = useState<paintKit>()
    const [currentlySelectedGloveToReplaceWith, setCurrentlySelectedGloveToReplaceWith] = useState<paintKit>()
    const [customSkinName, setCustomSkinName] = useState<string>('')
    const [customSkinDescription, setCustomSkinDescription] = useState<string>('')
    const [inputDiffuseFile, setInputDiffuseFile] = useState<string>()
    const [inputNormalFile, setInputNormalFile] = useState<string>()
    const [fileManager, setFileManager] = useState<FileManager>()

    function setCsgoDirAndSkinArray(csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): FileManager | undefined {
        if (!csgoExeUpdateEvent.target.files) return undefined;
        if (csgoExeUpdateEvent.target.files[0]) {
            const csgoExeFilePath = csgoExeUpdateEvent.target.files[0].path.replace(CSGO_EXECUTABLE_NAME, '');
            const newFileManager = new FileManager(csgoExeFilePath);
            setCsgoInstallDir(csgoExeFilePath);
            return newFileManager
        }
        return undefined;
    }

    function sortAndSetWeaponPaintKitArray(newFileManager: FileManager): Array<paintKit> {
        const weaponPaintKitArray = newFileManager.getCompletePaintKitWeaponArray()
        setCompleteWeaponSkinArray(weaponPaintKitArray)
        return weaponPaintKitArray;
    }

    function sortAndSetGlovePaintKitArray(newFileManager: FileManager): Array<paintKit> {
        const glovePaintKitArray = newFileManager.getCompletePaintKitGloveArray()
        setCompleteGloveSkinArray(glovePaintKitArray)
        return glovePaintKitArray;
    }

    function onDiffuseFileUpload(diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void {
        if (!diffFileUploadEvent.target.files) return;
        setInputDiffuseFile(diffFileUploadEvent.target.files[0].path);
    }

    function onNormalFileUpload(normalFileUploadEvent: ChangeEvent<HTMLInputElement>): void {
        if (!normalFileUploadEvent.target.files) return;
        setInputNormalFile(normalFileUploadEvent.target.files[0].path);
    }

    function populateWeaponSkinDropdown(generatedWeaponPaintKitArray: Array<paintKit>, inputTextFile?: paintKit): void {
        if (generatedWeaponPaintKitArray.length !== 0) {
            let curatedWeaponDropDownArray = generatedWeaponPaintKitArray;
            if (inputTextFile) {
                curatedWeaponDropDownArray = curatedWeaponDropDownArray.filter((skinWeapon: paintKit) => skinWeapon.weaponId === inputTextFile?.dialog_config?.split(",")[0])
            }
            const arrayForWeaponDropdown: Array<string> = curatedWeaponDropDownArray.reduce<Array<string>>((prev, paintKit) => {
                if (paintKit.fullItemDisplayName) {
                    return [...prev, paintKit.fullItemDisplayName]
                }
                return prev
            }, [])
            arrayForWeaponDropdown.sort((displayNameA, displayNameB) => displayNameA > displayNameB ? 1 : -1);
            arrayForWeaponDropdown.unshift('--Please select a skin to replace--')
            setWeaponArrayForDropdown(arrayForWeaponDropdown);
        }
    }

    function populateGloveSkinDropdown(generatedGlovePaintKitArray: Array<paintKit>): void {
        if (generatedGlovePaintKitArray.length !== 0) {
            const arrayForGloveDropdown: Array<string> = generatedGlovePaintKitArray.reduce<Array<string>>((prev, paintKit) => {
                if (paintKit.fullItemDisplayName) {
                    return [...prev, paintKit.fullItemDisplayName]
                }
                return prev
            }, [])
            arrayForGloveDropdown.sort((gloveA, gloveB) => gloveA > gloveB ? 1 : -1);
            arrayForGloveDropdown.unshift('--Please select a glove skin--')
            setGloveArrayForDropdown(arrayForGloveDropdown);
        }
    }

    function fetchAndSetCurrentSelectedDropdownWeaponSkin(selectSkinEvent: ChangeEvent<HTMLSelectElement>): void {
        setCurrentlySelectedWeaponSkin(completeWeaponSkinArray.find((skinWeapon: paintKit) => skinWeapon.fullItemDisplayName === selectSkinEvent.target.value))
    }

    function fetchAndSetCurrentSelectedDropdownGloveSkinToReplace(selectSkinEvent: ChangeEvent<HTMLSelectElement>): void {
        setCurrentlySelectedGloveToReplace(completeGloveSkinArray.find((gloveSkin: paintKit) => gloveSkin.fullItemDisplayName === selectSkinEvent.target.value))
    }

    function fetchAndSetCurrentSelectedDropdownGloveSkinToReplaceWith(selectSkinEvent: ChangeEvent<HTMLSelectElement>): void {
        setCurrentlySelectedGloveToReplaceWith(completeGloveSkinArray.find((gloveSkin: paintKit) => gloveSkin.fullItemDisplayName === selectSkinEvent.target.value))
    }

    function readTextFileOnInput(textFileUpdatedEvent: ChangeEvent<HTMLInputElement>): void {
        if (!textFileUpdatedEvent.target.files) return;
        const textFileInput = textFileUpdatedEvent.target.files[0];
        const textFileReader = new FileReader();
        textFileReader.onload = function () {
            if (textFileReader.result) {
                const inputTextFile: paintKit = VDF.parse(textFileReader.result.toString())["workshop preview"]
                if (inputTextFile && inputTextFile.dialog_config) {
                    populateWeaponSkinDropdown(completeWeaponSkinArray, inputTextFile);
                    checkIfVtfsExist(inputTextFile);
                    setJsonFromTextFile(inputTextFile);
                } else {
                    alert('Cannot find skin parameters in text file, please make sure it is in the correct format or generate a new one from the workbench.');
                }
            }
        }
        textFileReader.readAsText(textFileInput)
    }


    //TODO - Find cleaner solution for letting the user know that files were found from the text file
    function checkIfVtfsExist(inputTextFile: paintKit): void {
        if (!inputTextFile) return;
        if (fs.existsSync(inputTextFile?.pattern)) {
            setDiffuseLabelText('Diffuse Map - using ' + path.parse(inputTextFile?.pattern as string).base);
            setDiffuseLabelStyle({color: '#009900'});
        } else {
            setDiffuseLabelText('Diffuse Map');
            setDiffuseLabelStyle({color: '#888888'});
        }
        if (inputTextFile.use_normal == '1') {
            // @ts-ignore
            document.getElementById('normalCheckBox').checked = true;
            if (fs.existsSync(inputTextFile.normal)) {
                setNormalLabelText('Normal Map - using ' + path.parse(inputTextFile?.normal as string).base);
                setNormalLabelStyle({color: '#009900'});
            } else {
                setNormalLabelText('Normal Map');
                setNormalLabelStyle({color: '#888888'}) ;
            }
        } else {
            // @ts-ignore
            document.getElementById('normalCheckBox').checked = false;
        }
    }

    function onCsgoDirUpdate(csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): void {
        if (!csgoExeUpdateEvent.target.files) return;
        if (csgoExeUpdateEvent.target.files[0]) {
            const newFileManager = setCsgoDirAndSkinArray(csgoExeUpdateEvent);
            if (newFileManager) {
                setFileManager(newFileManager);
                const weaponPaintKitArray = sortAndSetWeaponPaintKitArray(newFileManager);
                const glovePaintKitArray = sortAndSetGlovePaintKitArray(newFileManager);
                populateWeaponSkinDropdown(weaponPaintKitArray, undefined);
                populateGloveSkinDropdown(glovePaintKitArray);
            }
        }
    }

    function findAlternateMapsIfSelected(): void {
        if (!jsonFromTextFile) return;
        if (inputDiffuseFile) {
            jsonFromTextFile.pattern = inputDiffuseFile;
        }
        if (inputNormalFile) {
            jsonFromTextFile.normal = inputNormalFile;
        }
    }

    function saveAllVtfMapsToFolders(): void {
        if (!fileManager) return;
        if (jsonFromTextFile && jsonFromTextFile.pattern && jsonFromTextFile.style)
            if(fileManager.saveMapToFolder(jsonFromTextFile.pattern, jsonFromTextFile.style)){
                alert("Successfully copied pattern vtf file to paints folder!");
            } else {
                alert('Failed to copy pattern vtf to csgo folder!');
            }
        if (jsonFromTextFile && jsonFromTextFile.normal && jsonFromTextFile.style) {
            if(fileManager.saveMapToFolder(jsonFromTextFile.normal, jsonFromTextFile.style)){
                alert("Successfully copied normal vtf file to paints folder!");
            } else {
                alert('Failed to copy normal vtf to csgo folder!');
            }
        }
    }

    function submitWeaponForm(submitFormEvent: FormEvent<HTMLFormElement>): void {
        submitFormEvent.preventDefault();
        if (!fileManager) return;
        const selectedWeaponToReplace = currentlySelectedWeaponSkin;
        findAlternateMapsIfSelected()
        saveAllVtfMapsToFolders()
        if (jsonFromTextFile) {
            if (selectedWeaponToReplace) {
                if(fileManager.replaceSkinWithCustom(selectedWeaponToReplace, jsonFromTextFile)){
                    alert('Successfully added custom skin to text file!');
                } else {
                    alert('Failed to add custom skin to text file!');
                }
                if (customSkinName !== '' || customSkinDescription !== "") {
                    if(fileManager.addCustomNameAndDescription(csgoInstallDir, customSkinName, customSkinDescription, selectedWeaponToReplace)){
                        alert('Successfully added custom name and/or description to text file!');
                    } else {
                        alert('Failed to save custom skin name/description to text file!');
                    }
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
        if (fileManager && currentlySelectedGloveToReplace && currentlySelectedGloveToReplaceWith) {
            if(fileManager.replaceGloves(currentlySelectedGloveToReplace, currentlySelectedGloveToReplaceWith)) {
                alert('Successfully swapped glove textures!');
            } else {
                alert('Failed to swap glove textures!');
            }
        }
    }

    //TODO - Break the UI code into multiple components
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
                            <label id="weaponLabel" htmlFor="textFileInput" className="form-label mt-4">Text File</label>
                            <input className="form-control" type="file" id="textFileInput" accept=".txt" onChange={readTextFileOnInput}/>
                        </div>
                        <div id="inputDiv">
                            <label id="diffuseWeaponLabel" htmlFor="diffuseFileInput" className="form-label mt-4" style={diffuseLabelStyle}>{diffuseLabelText}</label>
                            <input className="form-control" type="file" id="diffuseFileInput" onChange={onDiffuseFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="normalCheckBox"/>
                                <label id="normalWeaponLabel" className="form-check-label" htmlFor="normalCheckBox" style={normalLabelStyle}>{normalLabelText}</label>
                            </div>
                            <input className="form-control" type="file" id="normalFileInput"
                                   onChange={onNormalFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="weaponDropDownDiv" className="form-label mt-4">Skin To
                                Replace</label>
                            <div className="dropdown" id="weaponDropDownDiv">
                                <select name="weaponSkinDropDown" id="weaponSkinDropDown" className="form-select"
                                        onChange={fetchAndSetCurrentSelectedDropdownWeaponSkin}>
                                    {weaponArrayForDropdown.map(skinName => (
                                        <option key={skinName} value={skinName}>{skinName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinNameInput">New Skin
                                Name</label>
                            <input className="form-control" placeholder="Custom Skin Name" id="newSkinNameInput"
                                   onChange={event => setCustomSkinName(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinDescription">New
                                Skin Description</label>
                            <textarea className="form-control" placeholder="Custom Skin Description"
                                      id="newSkinDescription" rows={3}
                                      onChange={event => setCustomSkinDescription(event.target.value)}/>
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
                                <select name="currentGloves" id="currentGloves" className="form-select"
                                        onChange={fetchAndSetCurrentSelectedDropdownGloveSkinToReplace}>
                                    {gloveArrayForDropdown.map(skinName => (
                                        <option key={skinName} value={skinName}>{skinName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="newGlovesDropdown" className="form-label mt-4">New
                                Gloves</label>
                            <div className="dropdown" id="newGlovesDropdown">
                                <select name="newGloves" id="newGloves" className="form-select"
                                        onChange={fetchAndSetCurrentSelectedDropdownGloveSkinToReplaceWith}>
                                    {gloveArrayForDropdown.map(skinName => (
                                        <option key={skinName} value={skinName}>{skinName}</option>))}
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