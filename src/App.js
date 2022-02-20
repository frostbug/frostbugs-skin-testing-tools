import React, {Component} from "react";
import "bootswatch/dist/minty/bootstrap.min.css";
import './App.css';
import WeaponForm from "./WeaponForm";
import * as electron from 'electron'

class App extends Component{
    render() {
        return (
            <div className="App">
                <WeaponForm />
            </div>
        );
    }
}
export default App;