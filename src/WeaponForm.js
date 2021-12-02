import {CSGO_EXECUTABLE_NAME} from "./constants";

function WeaponForm() {

    window.fs = require('fs');

    let csgoInstallDir = "";
    const diffMap = "";
    const normMap = "";
    const textFile = "";
    const skinName = "";
    const skinDesc = "";

    const setCsgoDir = () => {
        const csgoExeFilePath = document.getElementById('csgoInstallFileInput').files[0].path;
        csgoInstallDir = csgoExeFilePath.replace(CSGO_EXECUTABLE_NAME,'');
        console.log(csgoInstallDir);
    }

    const submitWeaponForm = (evt) => {
        evt.preventDefault();
    }

    const submitGloveForm = (evt) => {
        evt.preventDefault();
    }

    return (
        <div>
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
                    <form onSubmit={submitWeaponForm} >
                        <div>
                            <label id="weaponLabel" htmlFor="csgoInstallFileInput" className="form-label mt-4">csgo.exe location</label>
                            <input className="form-control" type="file" id="csgoInstallFileInput" onChange={setCsgoDir} />
                        </div>
                        <div>
                            <label id="weaponLabel" htmlFor="textFileInput" className="form-label mt-4">Text
                                File</label>
                            <input className="form-control" type="file" id="textFileInput" />
                        </div>
                        <div>
                            <label id="weaponLabel" htmlFor="diffuseFileInput" className="form-label mt-4">Diffuse
                                Map</label>
                            <input className="form-control" type="file" id="diffuseFileInput" />
                        </div>
                        <div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                <label id="weaponLabel" className="form-check-label" htmlFor="flexSwitchCheckDefault">Normal
                                    Map</label>
                            </div>
                            <input className="form-control" type="file" id="normalFileInput" />
                        </div>
                        <div>
                            <label id="weaponLabel" htmlFor="weaponDropDown" className="form-label mt-4">Skin To
                                Replace</label>
                            <div className="dropdown" id="weaponDropDown">
                                <select name="weaponSkin" id="weaponSkin" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="ak forty sevem">ak forty sevem</option>
                                    <option value="em four">em four</option>
                                    <option value="em pee five">em pee five</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinNameInput">New Skin
                                Name</label>
                            <input className="form-control" placeholder="Weapon | Skin Name" id="newSkinNameInput" />
                        </div>
                        <div>
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinDescription">New
                                Skin Name</label>
                            <textarea className="form-control" placeholder="Custom Skin Description"
                                id="newSkinDescription" rows="3" />
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
                        <div>
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
                        <div>
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