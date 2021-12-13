import {CSGO_EXECUTABLE_NAME} from "./constants";
import {Component} from "react";
import {getObjectsFromText} from "./fileUtils";
import * as util from "util";
import * as VDF from '@node-steam/vdf';

const fs = require('fs');

class WeaponForm extends Component {
    render() {
        window.fs = require('fs');

        let csgoInstallDir = "";
        let completeSkinArray = "";
        let jsonFromTextFile = "";

        const setCsgoDir = () => {
            const csgoExeFilePath = document.getElementById('csgoInstallFileInput').files[0].path;
            csgoInstallDir = csgoExeFilePath.replace(CSGO_EXECUTABLE_NAME, '');
            console.log('CSGO Installed at: ' + csgoInstallDir);

            let unsortedWeaponArray =  getObjectsFromText(csgoInstallDir)
            unsortedWeaponArray.sort((a, b) => a['fullItemDisplayName'] > b['fullItemDisplayName'] ? 1 : -1);
            return unsortedWeaponArray;
        }

        const populateSkinDropdown = () => {
            if (completeSkinArray !== ""){
                let arrayForDropdown = completeSkinArray;

                if (jsonFromTextFile !== ""){
                    arrayForDropdown = arrayForDropdown.filter(skinWeapon => skinWeapon["weaponId"] === jsonFromTextFile["workshop preview"]["dialog_config"].split(",")[0])
                }

                const dropDown = document.getElementById('weaponSkinDropDown');
                dropDown.innerText = null;

                const pleaseSelectOption = document.createElement("option");
                pleaseSelectOption.value = "--Please choose an option--";
                pleaseSelectOption.text = "--Please choose an option--";
                dropDown.appendChild(pleaseSelectOption);

                arrayForDropdown.forEach(skin => {
                    const dropDownElement = document.createElement("option");
                    dropDownElement.value = skin['fullItemDisplayName'];
                    dropDownElement.text = skin['fullItemDisplayName'];
                    dropDown.appendChild(dropDownElement);
                })
            }
        }

        function getCurrentSelectedDropdownSkin(){
            const weaponDropDownPicker = document.getElementById('weaponSkinDropDown');
            const selectedSkinWeapon = weaponDropDownPicker.options[weaponDropDownPicker.selectedIndex].value;
            console.log('Selected skinWeapon object is: ' + util.inspect(completeSkinArray.find(skinWeapon => skinWeapon['fullItemDisplayName'] === selectedSkinWeapon)));
        }

        const readTextFileOnInput = () => {
            const textFileInput = document.getElementById('textFileInput').files[0];
            const textFileReader = new FileReader();
            textFileReader.onload=function(){
                jsonFromTextFile = VDF.parse(textFileReader.result.toString());
                populateSkinDropdown();
                checkIfVtfsExist();
            }
            textFileReader.readAsText(textFileInput)
        }

        const checkIfVtfsExist = () => {
            if(fs.existsSync(jsonFromTextFile["workshop preview"]["pattern"])){
                document.getElementById('diffuseWeaponLabel').textContent = ('Diffuse Map - using ' + decodeURIComponent(getFileName(jsonFromTextFile["workshop preview"]["pattern"])));
                document.getElementById('diffuseWeaponLabel').style.color = "#009900";
            }else {
                document.getElementById('diffuseWeaponLabel').textContent = ('Diffuse Map')
                document.getElementById('diffuseWeaponLabel').style.color = "rgb(136,136,136)";
            }

            console.log(jsonFromTextFile["workshop preview"]["use_normal"])
            if(jsonFromTextFile["workshop preview"]["use_normal"] === 1){
                document.getElementById('normalCheckBox').checked = true;

                if(fs.existsSync(jsonFromTextFile["workshop preview"]["normal"])){
                    document.getElementById('normalWeaponLabel').textContent = ('Normal Map - using ' + decodeURIComponent(getFileName(jsonFromTextFile["workshop preview"]["normal"])));
                    document.getElementById('normalWeaponLabel').style.color = "#009900";
                }else {
                    document.getElementById('normalWeaponLabel').textContent = ('Normal Map')
                    document.getElementById('normalWeaponLabel').style.color = "rgb(136,136,136)";
                }
            } else {
                document.getElementById('normalCheckBox').checked = false;
            }

        }

        const getFileName = (fileName) => new URL(fileName).pathname.split("/").pop();

        const onCsgoDirUpdate = () => {
            completeSkinArray = setCsgoDir()
            populateSkinDropdown()
        }

        const submitWeaponForm = (evt) => {
            evt.preventDefault();
        }

        const submitGloveForm = (evt) => {
            evt.preventDefault();
        }

        return (
            <div>
                <div id="inputDiv">
                    <label id="weaponLabel" htmlFor="csgoInstallFileInput" className="form-label mt-4">csgo.exe
                        location</label>
                    <input className="form-control" type="file" id="csgoInstallFileInput" accept=".exe" onChange={onCsgoDirUpdate}/>
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
                                <label id="weaponLabel" htmlFor="textFileInput" className="form-label mt-4" >Text File</label>
                                <input className="form-control" type="file" id="textFileInput" accept=".txt" onChange={readTextFileOnInput}/>
                            </div>
                            <div id="inputDiv">
                                <label id="diffuseWeaponLabel" htmlFor="diffuseFileInput" className="form-label mt-4">Diffuse Map</label>
                                <input className="form-control" type="file" id="diffuseFileInput"/>
                            </div>
                            <div id="inputDiv">
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="normalCheckBox"/>
                                    <label id="normalWeaponLabel" className="form-check-label" htmlFor="normalCheckBox">Normal Map</label>
                                </div>
                                <input className="form-control" type="file" id="normalFileInput"/>
                            </div>
                            <div id="inputDiv">
                                <label id="weaponLabel" htmlFor="weaponDropDownDiv" className="form-label mt-4">Skin To Replace</label>
                                <div className="dropdown" id="weaponDropDownDiv">
                                    <select name="weaponSkinDropDown" id="weaponSkinDropDown" className="form-select" onChange={getCurrentSelectedDropdownSkin}>
                                            <option value="">--Please choose an option--</option>
                                    </select>
                                </div>
                            </div>
                            <div id="inputDiv">
                                <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinNameInput">New Skin Name</label>
                                <input className="form-control" placeholder="Weapon | Skin Name" id="newSkinNameInput"/>
                            </div>
                            <div id="inputDiv">
                                <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinDescription">New Skin Name</label>
                                <textarea className="form-control" placeholder="Custom Skin Description" id="newSkinDescription" rows="3"/>
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
                                <label id="weaponLabel" htmlFor="currentGlovesDropdown" className="form-label mt-4">Current Gloves</label>
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
                                <label id="weaponLabel" htmlFor="newGlovesDropdown" className="form-label mt-4">New Gloves</label>
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
                                <button id="replaceGloveTexturesBtn" type="submit" className="btn btn-primary">Replace Textures
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default WeaponForm