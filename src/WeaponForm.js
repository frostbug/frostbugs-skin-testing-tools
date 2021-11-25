import {useRef} from "react";

const WeaponForm = () => {
    const inputCsgoInstall = useRef(null)
    const inputDiffuse = useRef(null)
    const inputNormal = useRef(null)
    const inputText = useRef(null)
    return (
            <div className="WeaponForm">
                <div>
                    <label htmlFor="csgoInstallFileInput" className="form-label mt-4">CSGO Install Root</label>
                    <input className="form-control" type="file" id="csgoInstallFileInput" ref={inputCsgoInstall}/>
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
                    <label htmlFor="textFileInput" className="form-label mt-4">Text File</label>
                    <input className="form-control" type="file" id="textFileInput" ref={inputText}/>
                </div>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Dropdown
                    </button>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <button className="dropdown-item" type="button">Action</button>
                        <button className="dropdown-item" type="button">Another action</button>
                        <button className="dropdown-item" type="button">Something else here</button>
                    </div>
                </div>
            </div>
    );
}
export default WeaponForm