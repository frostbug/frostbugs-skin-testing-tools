import {useRef} from "react";

const WeaponForm = () => {



    const inputCsgoInstall = useRef(null)
    const inputText = useRef(null)
    const inputDiffuse = useRef(null)
    const inputNormal = useRef(null)
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
                <div id="weaponTab" className="tab-content">
                    <div className="tab-pane active" id="weapon">
                        <div>
                            <label htmlFor="csgoInstallFileInput" className="form-label mt-4">CSGO Install Root</label>
                            <input className="form-control" type="file" id="csgoInstallFileInput" ref={inputCsgoInstall}/>
                        </div>
                        <div>
                            <label htmlFor="textFileInput" className="form-label mt-4">Text File</label>
                            <input className="form-control" type="file" id="textFileInput" ref={inputText}/>
                        </div>
                        <div>
                            <label htmlFor="diffuseFileInput" className="form-label mt-4">Diffuse Map</label>
                            <input className="form-control" type="file" id="diffuseFileInput" ref={inputDiffuse}/>
                        </div>
                        <div>
                            <label htmlFor="normalFileInput" className="form-label mt-4">Normal Map</label>
                            <input className="form-control" type="file" id="normalFileInput" ref={inputNormal}/>
                        </div>
                        <div>
                            <label htmlFor="weaponDropDown" className="form-label mt-4">Skin To Replace</label>
                            <div className="dropdown" id="weaponDropDown">
                                <select name="weaponSkin" id="weaponSkin" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="ak forty sevem">ak forty sevem</option>
                                    <option value="em four">em four</option>
                                    <option value="em pee five">em pee five</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane" id="gloves">
                        <div>
                            <label htmlFor="glovesToReplaceDropdown" className="form-label mt-4">Gloves To Replace</label>
                            <div className="dropdown" id="glovesToReplaceDropdown">
                                <select name="glovesToReplace" id="glovesToReplace" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="gluvvy">gluvvy</option>
                                    <option value="wuvvy">wuvvy</option>
                                    <option value="fisto">fisto</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newGlovesDropdown" className="form-label mt-4">New Gloves</label>
                            <div className="dropdown" id="newGlovesDropdown">
                                <select name="newGloves" id="newGloves" className="form-select">
                                    <option value="">--Please choose an option--</option>
                                    <option value="gluvvy">gluvvy</option>
                                    <option value="wuvvy">wuvvy</option>
                                    <option value="fisto">fisto</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}
export default WeaponForm