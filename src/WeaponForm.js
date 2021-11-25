import {useRef} from "react";
import './App.css';

const WeaponForm = () => {
    const inputDiffuse = useRef(null)
    const inputNormal = useRef(null)
    const inputText = useRef(null)
    return (
        <div className="WeaponForm">
            <div className="diffuseDiv">
                <label className="btn">Diffuse Map</label>
                <input type='file' id='diffuseFileInput' ref={inputDiffuse}/>
            </div>
            <div className="normalDiv">
                <input type='file' id='normalFileInput' ref={inputNormal}/>
            </div>
            <div className="textDiv">
                <input type='file' id='textFileInput' ref={inputText}/>
            </div>
        </div>
    );
}

export default WeaponForm