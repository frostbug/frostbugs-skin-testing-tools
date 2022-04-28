import {CSGO_EXECUTABLE_NAME, paintKit, screenshotScript, stickerKit, sprayKit, weaponDecal} from "./types";
import {ChangeEvent, FormEvent, useState} from "react";
import {FileManager} from "./FileManager";
import * as VDF from '@node-steam/vdf';
import * as path from "path";
// Needed for `files[0].path.`
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as electron from 'electron'
import { ItemType } from "./ItemType";

const fs = require('fs');

const WeaponForm = () => {
    const [csgoInstallDir, setCsgoInstallDir] = useState<string>('')

    const [diffuseSkinLabelText, setDiffuseSkinLabelText] = useState<string>('Diffuse Map')
    const [diffuseSkinLabelStyle, setDiffuseSkinLabelStyle] = useState({color: '#888888'})
    const [normalLabelText, setNormalLabelText] = useState<string>('Normal Map')
    const [normalLabelStyle, setNormalLabelStyle] = useState({color: '#888888'})
    const [diffuseStickerLabelText, setDiffuseStickerLabelText] = useState<string>('Standard Diffuse Map')
    const [diffuseStickerLabelStyle, setDiffuseStickerLabelStyle] = useState({color: '#888888'})
    const [diffuseStickerExponentLabelText, setDiffuseStickerExponentLabelText] = useState<string>('Exponent Diffuse Map')
    const [diffuseStickerExponentLabelStyle, setDiffuseStickerExponentLabelStyle] = useState({color: '#888888'})
    const [diffuseStickerHoloLabelText, setDiffuseStickerHoloLabelText] = useState<string>('Holo Diffuse Map')
    const [diffuseStickerHoloLabelStyle, setDiffuseStickerHoloLabelStyle] = useState({color: '#888888'})
    const [diffuseStickerFoilLabelText, setDiffuseStickerFoilLabelText] = useState<string>('Foil Diffuse Map')
    const [diffuseStickerFoilLabelStyle, setDiffuseStickerFoilLabelStyle] = useState({color: '#888888'})
    const [diffuseStickerGoldLabelText, setDiffuseStickerGoldLabelText] = useState<string>('Gold Diffuse Map')
    const [diffuseStickerGoldLabelStyle, setDiffuseStickerGoldLabelStyle] = useState({color: '#888888'})
    const [diffuseSprayLabelText, setDiffuseSprayLabelText] = useState<string>('Diffuse Map')
    const [diffuseSprayLabelStyle, setDiffuseSprayLabelStyle] = useState({color: '#888888'})
    const [stickerRarityLabelText, setStickerRarityLabelText] = useState<string>('Select Rarity')
    const [stickerRarityLabelStyle, setStickerRarityLabelStyle] = useState({color: '#888888'})
    const [sprayRarityLabelText, setSprayRarityLabelText] = useState<string>('Select Rarity')
    const [sprayRarityLabelStyle, setSprayRarityLabelStyle] = useState({color: '#888888'})
    const [stickerSignaturesLabelText, setStickerSignaturesLabelText] = useState<string>('Show Player Signatures')
    const [stickerSignaturesLabelStyle, setStickerSignaturesLabelStyle] = useState({color: '#888888'})
    const [stickerTeamLogosLabelText, setStickerTeamLogosLabelText] = useState<string>('Show Team Logos')
    const [stickerTeamLogosLabelStyle, setStickerTeamLogosLabelStyle] = useState({color: '#888888'})


    const [completeWeaponSkinArray, setCompleteWeaponSkinArray] = useState<paintKit[]>([])
    const [weaponArrayForDropdown, setWeaponArrayForDropdown] = useState<string[]>(["--Waiting for csgo.exe location--"])
    const [currentlySelectedWeaponSkin, setCurrentlySelectedWeaponSkin] = useState<paintKit>()

    const [completeGloveSkinArray, setCompleteGloveSkinArray] = useState<paintKit[]>([])
    const [gloveArrayForDropdown, setGloveArrayForDropdown] = useState<string[]>(["--Waiting for csgo.exe location--"])
    const [currentlySelectedGloveToReplace, setCurrentlySelectedGloveToReplace] = useState<paintKit>()
    const [currentlySelectedGloveToReplaceWith, setCurrentlySelectedGloveToReplaceWith] = useState<paintKit>()

    const [completeStickerArray, setCompleteStickerArray] = useState<stickerKit[]>([])
    const [stickerArrayForDropdown, setStickerArrayForDropdown] = useState<string[]>(["--Waiting for csgo.exe location--"])
    const [currentlySelectedSticker, setCurrentlySelectedSticker] = useState<stickerKit>()

    const [completeSprayArray, setCompleteSprayArray] = useState<sprayKit[]>([])
    const [sprayArrayForDropdown, setSprayArrayForDropdown] = useState<string[]>(["--Waiting for csgo.exe location--"])
    const [currentlySelectedSpray, setCurrentlySelectedSpray] = useState<sprayKit>()

    const [jsonFromTextFile, setJsonFromTextFile] = useState<paintKit>()
    const [jsonFromStickerVmtFile, setJsonFromStickerVmtFile] = useState<weaponDecal>()
    const [inputDiffuseFile, setInputDiffuseFile] = useState<string>()
    const [normalMapToggle, setNormalMapToggle] = useState<boolean>(false)
    const [inputNormalFile, setInputNormalFile] = useState<string>()

    const [inputStickerDiffuseFile, setInputStickerDiffuseFile] = useState<string>()
    const [inputStickerExponentDiffuseFile, setInputStickerExponentDiffuseFile] = useState<string>()
    const [inputStickerHoloDiffuseFile, setInputStickerHoloDiffuseFile] = useState<string>()
    const [inputStickerFoilDiffuseFile, setInputStickerFoilDiffuseFile] = useState<string>()
    const [inputStickerGoldDiffuseFile, setInputStickerGoldDiffuseFile] = useState<string>()

    const [inputSprayDiffuseFile, setInputSprayDiffuseFile] = useState<string>()

    const [vmtFilepathSticker, setVmtFilepathSticker] = useState<string>()

    const [customItemName, setCustomItemName] = useState<string>('')
    const [customItemDescription, setCustomItemDescription] = useState<string>('')

    const [stickerSignaturesToggle, setStickerSignaturesToggle] = useState<boolean>(false)
    const [stickerTeamLogosToggle, setStickerTeamLogosToggle] = useState<boolean>(false)
    const [stickerRarityRadio, setStickerRarityRadio] = useState<string>('Standard')

    const [sprayRarityRadio, setSprayRarityRadio] = useState<string>('Common')

    const [fileManager, setFileManager] = useState<FileManager>()
    const [consoleLogText, setConsoleLogText] = useState<string>('')

    const onCsgoDirUpdate = (csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!csgoExeUpdateEvent.target.files || !csgoExeUpdateEvent.target.files.length) return;
        if (csgoExeUpdateEvent.target.files[0]) {
            const newFileManager = setCsgoDirAndSkinArray(csgoExeUpdateEvent);
            if (newFileManager) {
                setFileManager(newFileManager);
                initializeDropDownArrays(newFileManager)
            }
        }
    }

    const setCsgoDirAndSkinArray = (csgoExeUpdateEvent: ChangeEvent<HTMLInputElement>): FileManager | undefined => {
        if (!csgoExeUpdateEvent.target.files) return undefined;
        if (csgoExeUpdateEvent.target.files[0]) {
            const csgoExeFilePath = csgoExeUpdateEvent.target.files[0].path.replace(CSGO_EXECUTABLE_NAME, '');
            const newFileManager = new FileManager(csgoExeFilePath);
            setCsgoInstallDir(csgoExeFilePath);
            return newFileManager
        }
        return undefined;
    }

    const initializeDropDownArrays = (newFileManager:FileManager): void => {
        const weaponPaintKitArray = sortAndSetWeaponPaintKitArray(newFileManager);
        const glovePaintKitArray = sortAndSetGlovePaintKitArray(newFileManager);
        const stickerKitArray = sortAndSetStickerKitArray(newFileManager);
        const sprayKitArray = sortAndSetSprayKitArray(newFileManager);
        populateWeaponSkinDropdown(weaponPaintKitArray, jsonFromTextFile);
        populateGloveSkinDropdown(glovePaintKitArray);
        populateStickerDropdown(stickerKitArray);
        populateSprayDropdown(sprayKitArray);
    }

    const populateWeaponSkinDropdown = (generatedWeaponPaintKitArray: paintKit[],  textFilePaintKit?: paintKit): void => {
        if (generatedWeaponPaintKitArray.length !== 0) {
            let curatedWeaponDropDownArray = generatedWeaponPaintKitArray;
            if (textFilePaintKit) {
                curatedWeaponDropDownArray = curatedWeaponDropDownArray.filter((skinWeapon: paintKit) => skinWeapon.weaponId === textFilePaintKit?.dialog_config?.split(",")[0])
            }
            const arrayForWeaponDropdown: string[] = curatedWeaponDropDownArray.reduce<string[]>((prev, paintKit) => {
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

    const populateGloveSkinDropdown = (generatedGlovePaintKitArray: paintKit[]): void => {
        if (generatedGlovePaintKitArray.length !== 0) {
            const arrayForGloveDropdown = generatedGlovePaintKitArray.reduce<string[]>((prev, paintKit) => {
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

    const populateStickerDropdown = (generatedStickerKitArray: stickerKit[]): void => {
        if (generatedStickerKitArray.length !== 0) {
            let curatedStickerDropDownArray = generatedStickerKitArray;
            const arrayForStickerDropdown: string[] = curatedStickerDropDownArray.reduce<string[]>((prev, stickerKit) => {
                if (stickerKit.fullItemDisplayName) {
                    return [...prev, stickerKit.fullItemDisplayName]
                }
                return prev
            }, [])
            arrayForStickerDropdown.sort((displayNameA, displayNameB) => displayNameA > displayNameB ? 1 : -1);
            arrayForStickerDropdown.unshift('--Please select a sticker to replace--')
            setStickerArrayForDropdown(arrayForStickerDropdown);
        }
    }

    const populateSprayDropdown = (generatedSprayKitArray: sprayKit[]): void => {
        if (generatedSprayKitArray.length !== 0) {
            let curatedSprayDropDownArray = generatedSprayKitArray;
            const arrayForSprayDropdown: string[] = curatedSprayDropDownArray.reduce<string[]>((prev, sprayKit) => {
                if (sprayKit.fullItemDisplayName) {
                    return [...prev, sprayKit.fullItemDisplayName]
                }
                return prev
            }, [])
            arrayForSprayDropdown.sort((displayNameA, displayNameB) => displayNameA > displayNameB ? 1 : -1);
            arrayForSprayDropdown.unshift('--Please select a spray to replace--')
            setSprayArrayForDropdown(arrayForSprayDropdown);
        }
    }

    const sortAndSetWeaponPaintKitArray = (newFileManager: FileManager): paintKit[] => {
        const weaponPaintKitArray = newFileManager.getCompletePaintKitWeaponArray()
        setCompleteWeaponSkinArray(weaponPaintKitArray)
        return weaponPaintKitArray;
    }

    const sortAndSetGlovePaintKitArray = (newFileManager: FileManager): paintKit[] => {
        const glovePaintKitArray = newFileManager.getCompletePaintKitGloveArray()
        setCompleteGloveSkinArray(glovePaintKitArray)
        return glovePaintKitArray;
    }

    const sortAndSetStickerKitArray = (newFileManager: FileManager): stickerKit[] => {
        const stickerPaintKitArray = newFileManager.getCompleteStickerKitArray()
        setCompleteStickerArray(stickerPaintKitArray)
        return stickerPaintKitArray;
    }

    const sortAndSetSprayKitArray = (newFileManager: FileManager): sprayKit[] => {
        const sprayPaintKitArray = newFileManager.getCompleteSprayKitArray()
        setCompleteSprayArray(sprayPaintKitArray)
        return sprayPaintKitArray;
    }

    const readTextFileOnInputWeaponSkin = (textFileUpdatedEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!textFileUpdatedEvent.target.files || !textFileUpdatedEvent.target.files.length) return;
        const textFileInput = textFileUpdatedEvent.target.files[0];
        const textFileReader = new FileReader();
        textFileReader.onload = function() {
            if (textFileReader.result) {
                let newTextFile: paintKit;
                try {
                    const newTextFileTemp: paintKit = VDF.parse(textFileReader.result.toString())["workshop preview"]
                    newTextFile = newTextFileTemp
                } catch {
                    setConsoleLogText('Failed to parse txt file.')
                    return;
                }
                if (newTextFile && newTextFile.dialog_config) {
                    populateWeaponSkinDropdown(completeWeaponSkinArray, newTextFile);
                    checkIfVtfsExistWeaponSkin(newTextFile);
                    setJsonFromTextFile(newTextFile);
                    setConsoleLogText('Text file read successfully!');
                } else {
                    setConsoleLogText('Cannot find skin parameters in text file, please make sure it is in the correct format or generate a new one from the workbench.');
                }
            }
        }
        textFileReader.readAsText(textFileInput)
    }

    const readVmtFileOnInputSticker = (vmtFileUpdatedEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!vmtFileUpdatedEvent.target.files || !vmtFileUpdatedEvent.target.files.length) return;
        const vmtFileInput = vmtFileUpdatedEvent.target.files[0];
        setVmtFilepathSticker(vmtFileInput.path);
        const vmtFileReader = new FileReader();
        vmtFileReader.onload = function() {
            if (vmtFileReader.result) {
                let newVmtFile: weaponDecal;
                try {
                    const newVmtFileText: weaponDecal = VDF.parse(vmtFileReader.result.toString().toLowerCase())["weapondecal"]
                    newVmtFile = newVmtFileText
                } catch {
                    setConsoleLogText('Failed to parse vmt file.')
                    return;
                }
                if (newVmtFile) {
                    populateStickerDropdown(completeStickerArray);
                    checkIfVtfsExistSticker(newVmtFile);
                    setJsonFromStickerVmtFile(newVmtFile);
                    setConsoleLogText('VMT file read successfully!');
                } else {
                    setConsoleLogText('Cannot find sticker parameters in VMT file, please make sure it is in the correct format.');
                }
            }
        }
        vmtFileReader.readAsText(vmtFileInput)
    }

    //TODO - Find cleaner solution for letting the user know that files were found from the text file
    const checkIfVtfsExistWeaponSkin = (inputTextFile: paintKit): void => {
        if (!inputTextFile) return;
        if (fs.existsSync(inputTextFile?.pattern)) {
            setDiffuseSkinLabelText('Diffuse Map - using ' + path.parse(inputTextFile?.pattern as string).base);
            setDiffuseSkinLabelStyle({color: '#009900'});
        } else {
            setDiffuseSkinLabelText('Diffuse Map');
            setDiffuseSkinLabelStyle({color: '#888888'});
        }
        if (inputTextFile?.use_normal?.toString() === "1") {
            // @ts-ignore
            setNormalMapToggle(true)
            if (fs.existsSync(inputTextFile.normal)) {
                setNormalLabelText('Normal Map - using ' + path.parse(inputTextFile?.normal as string).base);
                setNormalLabelStyle({color: '#009900'});
            } else {
                setNormalLabelText('Normal Map');
                setNormalLabelStyle({color: '#888888'}) ;
            }
        } else {
            // @ts-ignore
            setNormalMapToggle(false)
        }
    }

    //TODO - Find cleaner solution for letting the user know that files were found from the text file
    const checkIfVtfsExistSticker = (inputVmtFile: weaponDecal): void => {
        if (!inputVmtFile) return;
        switch (stickerRarityRadio)
        {
            case "Standard":
                if (fs.existsSync(inputVmtFile?.$basetexture)) {
                    setDiffuseStickerLabelText('Standard Diffuse Map - using ' + path.parse(inputVmtFile?.$basetexture as string).base);
                    setDiffuseStickerLabelStyle({color: '#009900'});
                } else {
                    setDiffuseStickerLabelText('Standard Diffuse Map');
                    setDiffuseStickerLabelStyle({color: '#888888'});
                }
                break;
            case "Holo":
                if (fs.existsSync(inputVmtFile?.$holomask)) {
                    setDiffuseStickerHoloLabelText('Holo Diffuse Map - using ' + path.parse(inputVmtFile?.$holomask as string).base);
                    setDiffuseStickerHoloLabelStyle({color: '#009900'});
                } else {
                    setDiffuseStickerHoloLabelText('Holo Diffuse Map');
                    setDiffuseStickerHoloLabelStyle({color: '#888888'});
                }
                break;
            case "Foil":
                if (fs.existsSync(inputVmtFile?.$normalmap)) {
                    setDiffuseStickerFoilLabelText('Foil Diffuse Map - using ' + path.parse(inputVmtFile?.$normalmap as string).base);
                    setDiffuseStickerFoilLabelStyle({color: '#009900'});
                } else {
                    setDiffuseStickerFoilLabelText('Foil Diffuse Map');
                    setDiffuseStickerFoilLabelStyle({color: '#888888'});
                }
                break;
            case "Gold":
                if (fs.existsSync(inputVmtFile?.$normalmap)) {
                    setDiffuseStickerGoldLabelText('Gold Diffuse Map - using ' + path.parse(inputVmtFile?.$normalmap as string).base);
                    setDiffuseStickerGoldLabelStyle({color: '#009900'});
                } else {
                    setDiffuseStickerGoldLabelText('Gold Diffuse Map');
                    setDiffuseStickerGoldLabelStyle({color: '#888888'});
                }
                break;
        }

        if (fs.existsSync(inputVmtFile?.$phongexponenttexture)) {
            setDiffuseStickerExponentLabelText('Exponent Map - using ' + path.parse(inputVmtFile?.$phongexponenttexture as string).base);
            setDiffuseStickerExponentLabelStyle({color: '#009900'});
        } else {
            setDiffuseStickerExponentLabelText('Exponent Map');
            setDiffuseStickerExponentLabelStyle({color: '#888888'});
        }
    }

    const onDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputDiffuseFile(undefined);
        } else {
            setInputDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onNormalFileUpload = (normalFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!normalFileUploadEvent.target.files || !normalFileUploadEvent.target.files.length) return;
        setInputNormalFile(normalFileUploadEvent.target.files[0].path);
    }

    const onStickerDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputStickerDiffuseFile(undefined);
        } else {
            setInputStickerDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onStickerExponentDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputStickerExponentDiffuseFile(undefined);
        } else {
            setInputStickerExponentDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onStickerHoloDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputStickerHoloDiffuseFile(undefined);
        } else {
            setInputStickerHoloDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onStickerFoilDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputStickerFoilDiffuseFile(undefined);
        } else {
            setInputStickerFoilDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onStickerGoldDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputStickerGoldDiffuseFile(undefined);
        } else {
            setInputStickerGoldDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const onSprayDiffuseFileUpload = (diffFileUploadEvent: ChangeEvent<HTMLInputElement>): void => {
        if (!diffFileUploadEvent.target.files || !diffFileUploadEvent.target.files.length) {
            setInputSprayDiffuseFile(undefined);
        } else {
            setInputSprayDiffuseFile(diffFileUploadEvent.target.files[0].path);
        }
    }

    const toggleNormalMap = () => setNormalMapToggle(!normalMapToggle)

    const toggleStickerSignatures = () => {
        setStickerSignaturesToggle(!stickerSignaturesToggle)
        if (!fileManager) return;
        fileManager.setStickerSignaturesToggleValue(!stickerSignaturesToggle);
        fileManager.buildCompleteStickerKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const toggleStickerTeamLogos = () => {
        setStickerTeamLogosToggle(!stickerTeamLogosToggle)
        if (!fileManager) return;
        fileManager.setStickerTeamLogosToggleValue(!stickerTeamLogosToggle);
        fileManager.buildCompleteStickerKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const stickerRarityChanged = (rarity: string) => {
        setStickerRarityRadio(rarity)

        const diffuseStickerHoloFileInput = document.getElementById('diffuseStickerHoloFileInput')
        const diffuseStickerFoilFileInput = document.getElementById('diffuseStickerFoilFileInput')
        const diffuseStickerGoldFileInput = document.getElementById('diffuseStickerGoldFileInput')
        const diffuseStickerHoloLabel = document.getElementById('diffuseStickerHoloLabel')
        const diffuseStickerFoilLabel = document.getElementById('diffuseStickerFoilLabel')
        const diffuseStickerGoldLabel = document.getElementById('diffuseStickerGoldLabel')
        switch (rarity)
        {
            case 'Standard':
                if (diffuseStickerHoloFileInput !== undefined && diffuseStickerHoloFileInput !== null)
                    diffuseStickerHoloFileInput.style.display = 'none';
                if (diffuseStickerFoilFileInput !== undefined && diffuseStickerFoilFileInput !== null)
                    diffuseStickerFoilFileInput.style.display = 'none';
                if (diffuseStickerGoldFileInput !== undefined && diffuseStickerGoldFileInput !== null)
                    diffuseStickerGoldFileInput.style.display = 'none';

                if (diffuseStickerHoloLabel !== undefined && diffuseStickerHoloLabel !== null)
                    diffuseStickerHoloLabel.style.display = 'none';
                if (diffuseStickerFoilLabel !== undefined && diffuseStickerFoilLabel !== null)
                    diffuseStickerFoilLabel.style.display = 'none';
                if (diffuseStickerGoldLabel !== undefined && diffuseStickerGoldLabel !== null)
                    diffuseStickerGoldLabel.style.display = 'none';
                break;
            case 'Holo':
                if (diffuseStickerHoloFileInput !== undefined && diffuseStickerHoloFileInput !== null)
                    diffuseStickerHoloFileInput.style.display = 'inline-block';
                if (diffuseStickerFoilFileInput !== undefined && diffuseStickerFoilFileInput !== null)
                    diffuseStickerFoilFileInput.style.display = 'none';
                if (diffuseStickerGoldFileInput !== undefined && diffuseStickerGoldFileInput !== null)
                    diffuseStickerGoldFileInput.style.display = 'none';

                if (diffuseStickerHoloLabel !== undefined && diffuseStickerHoloLabel !== null)
                    diffuseStickerHoloLabel.style.display = 'inline-block';
                if (diffuseStickerFoilLabel !== undefined && diffuseStickerFoilLabel !== null)
                    diffuseStickerFoilLabel.style.display = 'none';
                if (diffuseStickerGoldLabel !== undefined && diffuseStickerGoldLabel !== null)
                    diffuseStickerGoldLabel.style.display = 'none';
                break;
            case 'Foil':
                if (diffuseStickerHoloFileInput !== undefined && diffuseStickerHoloFileInput !== null)
                    diffuseStickerHoloFileInput.style.display = 'none';
                if (diffuseStickerFoilFileInput !== undefined && diffuseStickerFoilFileInput !== null)
                    diffuseStickerFoilFileInput.style.display = 'inline-block';
                if (diffuseStickerGoldFileInput !== undefined && diffuseStickerGoldFileInput !== null)
                    diffuseStickerGoldFileInput.style.display = 'none';

                if (diffuseStickerHoloLabel !== undefined && diffuseStickerHoloLabel !== null)
                    diffuseStickerHoloLabel.style.display = 'none';
                if (diffuseStickerFoilLabel !== undefined && diffuseStickerFoilLabel !== null)
                    diffuseStickerFoilLabel.style.display = 'inline-block';
                if (diffuseStickerGoldLabel !== undefined && diffuseStickerGoldLabel !== null)
                    diffuseStickerGoldLabel.style.display = 'none';
                break;
            case 'Gold':
                if (diffuseStickerHoloFileInput !== undefined && diffuseStickerHoloFileInput !== null)
                    diffuseStickerHoloFileInput.style.display = 'none';
                if (diffuseStickerFoilFileInput !== undefined && diffuseStickerFoilFileInput !== null)
                    diffuseStickerFoilFileInput.style.display = 'none';
                if (diffuseStickerGoldFileInput !== undefined && diffuseStickerGoldFileInput !== null)
                    diffuseStickerGoldFileInput.style.display = 'inline-block';

                if (diffuseStickerHoloLabel !== undefined && diffuseStickerHoloLabel !== null)
                    diffuseStickerHoloLabel.style.display = 'none';
                if (diffuseStickerFoilLabel !== undefined && diffuseStickerFoilLabel !== null)
                    diffuseStickerFoilLabel.style.display = 'none';
                if (diffuseStickerGoldLabel !== undefined && diffuseStickerGoldLabel !== null)
                    diffuseStickerGoldLabel.style.display = 'inline-block';
                break;
        }

        if (!fileManager) return;
        fileManager.setCurrentStickerRaritySet(rarity)
        fileManager.buildCompleteStickerKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const sprayRarityChanged = (rarity: string) => {
        setSprayRarityRadio(rarity)
        if (!fileManager) return;
        fileManager.setCurrentSprayRaritySet(rarity)
        fileManager.buildCompleteSprayKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const setCurrentSelectedDropdownWeaponSkin = (selectSkinEvent: ChangeEvent<HTMLSelectElement>): void => {
        setCurrentlySelectedWeaponSkin(completeWeaponSkinArray.find((skinWeapon: paintKit) => skinWeapon.fullItemDisplayName === selectSkinEvent.target.value))
    }

    const setCurrentSelectedDropdownGloveSkinToReplace = (selectSkinEvent: ChangeEvent<HTMLSelectElement>): void => {
        setCurrentlySelectedGloveToReplace(completeGloveSkinArray.find((gloveSkin: paintKit) => gloveSkin.fullItemDisplayName === selectSkinEvent.target.value))
    }

    const setCurrentSelectedDropdownGloveSkinToReplaceWith = (selectSkinEvent: ChangeEvent<HTMLSelectElement>): void => {
        setCurrentlySelectedGloveToReplaceWith(completeGloveSkinArray.find((gloveSkin: paintKit) => gloveSkin.fullItemDisplayName === selectSkinEvent.target.value))
    }

    const setCurrentSelectedDropdownSticker = (selectStickerEvent: ChangeEvent<HTMLSelectElement>): void => {
        setCurrentlySelectedSticker(completeStickerArray.find((sticker: stickerKit) => sticker.fullItemDisplayName === selectStickerEvent.target.value))
    }

    const setCurrentSelectedDropdownSpray = (selectSprayEvent: ChangeEvent<HTMLSelectElement>): void => {
        setCurrentlySelectedSpray(completeSprayArray.find((spray: sprayKit) => spray.fullItemDisplayName === selectSprayEvent.target.value))
    }

    const submitWeaponForm = (): void => {
        if (!fileManager) return;
        const selectedWeaponToReplace = currentlySelectedWeaponSkin;
        findAlternateMapsIfSelected(ItemType.WeaponSkin);
        let consoleMessage = saveAllVtfMapsAndVmtsToFolders(ItemType.WeaponSkin);
        if (jsonFromTextFile) {
            if (selectedWeaponToReplace) {
                if(fileManager.replaceSkinWithCustom(selectedWeaponToReplace, jsonFromTextFile, normalMapToggle)){
                    consoleMessage = consoleMessage + '\nSuccessfully added custom skin to text file!';
                } else {
                    consoleMessage = consoleMessage + '\nFailed to add custom skin to text file!';
                }
                if (customItemName !== '' || customItemDescription !== "") {
                    if(fileManager.addCustomNameAndDescription(csgoInstallDir, customItemName, customItemDescription, selectedWeaponToReplace)){
                        consoleMessage = consoleMessage + '\nSuccessfully added custom name and/or description to text file!';
                    } else {
                        consoleMessage = consoleMessage + '\nFailed to save custom skin name/description to text file!';
                    }
                } else {
                    consoleMessage = consoleMessage + '\nEither no custom skin name or description provided!';
                }
            } else {
                consoleMessage = consoleMessage + '\nPlease select a skin to replace with your custom skin!';
            }
        } else {
            consoleMessage = consoleMessage + '\nPlease upload text file for your custom skin!';
        }
        setConsoleLogText(consoleMessage);
        fileManager.buildCompletePaintKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const submitStickerForm = (): void => {
        if (!fileManager || !vmtFilepathSticker) return;
        const selectedStickerToReplace = currentlySelectedSticker;
        findAlternateMapsIfSelected(ItemType.Sticker);
        let consoleMessage = saveAllVtfMapsAndVmtsToFolders(ItemType.Sticker);
        if (jsonFromStickerVmtFile) {
            if (selectedStickerToReplace) {
                if(fileManager.replaceStickerWithCustom(selectedStickerToReplace, customItemName, customItemDescription, path.parse(vmtFilepathSticker).name)) {
                    consoleMessage = consoleMessage + '\nSuccessfully added custom sticker to txt file!';
                } else {
                    consoleMessage = consoleMessage + '\nFailed to add custom sticker to txt file!';
                }
                if (customItemName !== '' || customItemDescription !== "") {
                    if(fileManager.addCustomNameAndDescription(csgoInstallDir, customItemName, customItemDescription, selectedStickerToReplace)){
                        consoleMessage = consoleMessage + '\nSuccessfully added custom name and/or description to txt file!';
                    } else {
                        consoleMessage = consoleMessage + '\nFailed to save custom sticker name/description to txt file!';
                    }
                } else {
                    consoleMessage = consoleMessage + '\nEither no custom sticker name or description provided!';
                }
            } else {
                consoleMessage = consoleMessage + '\nPlease select a sticker to replace with your custom sticker!';
            }
        } else {
            consoleMessage = consoleMessage + '\nPlease upload vmt file for your custom sticker!';
        }
        setConsoleLogText(consoleMessage);
        fileManager.buildCompleteStickerKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const submitSprayForm = (): void => {
        if (!fileManager) return;
        const selectedSprayToReplace = currentlySelectedSpray;
        findAlternateMapsIfSelected(ItemType.Spray);
        let consoleMessage = saveAllVtfMapsAndVmtsToFolders(ItemType.Spray);
        if (inputSprayDiffuseFile) {
            if (selectedSprayToReplace) {
                if(fileManager.replaceSprayWithCustom(selectedSprayToReplace, customItemName, customItemDescription, path.parse(inputSprayDiffuseFile).name)) {
                    consoleMessage = consoleMessage + '\nSuccessfully added custom spray to txt file!';
                } else {
                    consoleMessage = consoleMessage + '\nFailed to add custom spray to txt file!';
                }
                if (customItemName !== '' || customItemDescription !== "") {
                    if(fileManager.addCustomNameAndDescription(csgoInstallDir, customItemName, customItemDescription, selectedSprayToReplace)){
                        consoleMessage = consoleMessage + '\nSuccessfully added custom name and/or description to txt file!';
                    } else {
                        consoleMessage = consoleMessage + '\nFailed to save custom spray name/description to txt file!';
                    }
                } else {
                    consoleMessage = consoleMessage + '\nEither no custom spray name or description provided!';
                }
            } else {
                consoleMessage = consoleMessage + '\nPlease select a spray to replace with your custom spray!';
            }
        } else {
            consoleMessage = consoleMessage + '\nPlease upload vtf file for your custom sticker!';
        }
        setConsoleLogText(consoleMessage);
        fileManager.buildCompleteSprayKitArrays()
        initializeDropDownArrays(fileManager);
    }

    const findAlternateMapsIfSelected = (itemType: ItemType): void => {
        switch (itemType) {
            case ItemType.WeaponSkin:
                if (!jsonFromTextFile) return;
                if (inputDiffuseFile) {
                    jsonFromTextFile.pattern = inputDiffuseFile;
                }
                if (inputNormalFile && normalMapToggle) {
                    jsonFromTextFile.normal = inputNormalFile;
                }
                break;
            case ItemType.Sticker:
                if (!jsonFromStickerVmtFile) return;
                if (inputStickerDiffuseFile) {
                    jsonFromStickerVmtFile.$basetexture = inputStickerDiffuseFile;
                }
                if (inputStickerExponentDiffuseFile) {
                    jsonFromStickerVmtFile.$phongexponenttexture = inputStickerExponentDiffuseFile;
                }
                if (inputStickerHoloDiffuseFile) {
                    jsonFromStickerVmtFile.$holomask = inputStickerHoloDiffuseFile;
                }
                if (inputStickerFoilDiffuseFile) {
                    jsonFromStickerVmtFile.$normalmap = inputStickerFoilDiffuseFile;
                }
                if (inputStickerGoldDiffuseFile) {
                    jsonFromStickerVmtFile.$normalmap = inputStickerGoldDiffuseFile;
                }
                break;
            case ItemType.Spray:
                break;
        }
    }

    const saveAllVtfMapsAndVmtsToFolders = (itemType: ItemType): string => {
        if (!fileManager) return 'File Manager not initialized';
        let consoleMessage = ''
        switch (itemType) {
            case ItemType.WeaponSkin:
                if (jsonFromTextFile && jsonFromTextFile.pattern && jsonFromTextFile.style) {
                    if (fileManager.saveWeaponSkinMapToFolder(jsonFromTextFile.pattern, jsonFromTextFile.style)) {
                        consoleMessage = "Successfully copied pattern vtf file to paints folder!";
                    } else {
                        consoleMessage = 'Failed to copy pattern vtf to csgo folder!';
                    }
                } else {
                    consoleMessage = 'Failed to copy pattern vtf to csgo folder!';
                }

                if (jsonFromTextFile && jsonFromTextFile.normal && jsonFromTextFile.style) {
                    if (fileManager.saveWeaponSkinMapToFolder(jsonFromTextFile.normal, jsonFromTextFile.style)) {
                        consoleMessage = consoleMessage + "\nSuccessfully copied normal vtf file to paints folder!";
                    } else {
                        consoleMessage = consoleMessage + '\nFailed to copy normal vtf to csgo folder!';
                    }
                } else {
                    consoleMessage = consoleMessage + '\nFailed to copy normal vtf to csgo folder!';
                }
                break;
            case ItemType.Sticker:
                if (!jsonFromStickerVmtFile || !jsonFromStickerVmtFile.$basetexture || jsonFromStickerVmtFile.$decalstyle === undefined || jsonFromStickerVmtFile.$decalstyle === null) {
                    consoleMessage = 'Failed to copy sticker files to csgo folder, the vmt is missing $basetexture or $decalstyle!'
                    return consoleMessage;
                }
                const raritySticker = jsonFromStickerVmtFile.$decalstyle === 4 ? (stickerRarityRadio === 'Gold' ? 'Gold' : 'Foil') : (jsonFromStickerVmtFile.$decalstyle === 3 ? 'Holo' : 'Standard')
                if (fileManager.saveStickerMapToFolder(jsonFromStickerVmtFile.$basetexture, raritySticker)) {
                    consoleMessage = "Successfully copied sticker base vtf file to stickers folder!";
                } else {
                    consoleMessage = 'Failed to copy sticker base vtf to csgo folder!';
                }

                if (vmtFilepathSticker && fileManager.saveStickerVmtToFolder(vmtFilepathSticker, raritySticker)) {
                    consoleMessage = "Successfully copied sticker vmt file to stickers folder!";
                } else {
                    consoleMessage = 'Failed to copy vmt to csgo folder!';
                }

                if (jsonFromStickerVmtFile.$phongexponenttexture) {
                    if (fileManager.saveStickerMapToFolder(jsonFromStickerVmtFile.$phongexponenttexture, raritySticker)) {
                        consoleMessage = "Successfully copied sticker exponent vtf file to stickers folder!";
                    } else {
                        consoleMessage = 'Failed to copy sticker exponent vtf to csgo folder!';
                    }
                } else {
                    consoleMessage = 'No sticker exponent vtf provided to copy to csgo folder!';
                }

                if (jsonFromStickerVmtFile.$decalstyle === 4) { // gold or foil
                    if (jsonFromStickerVmtFile.$normalmap && fileManager.saveStickerMapToFolder(jsonFromStickerVmtFile.$normalmap, raritySticker)) {
                        consoleMessage = "Successfully copied sticker normalmap vtf file to stickers folder!";
                    } else {
                        consoleMessage = 'Failed to copy sticker normalmap vtf to csgo folder!';
                    }
                }

                if (jsonFromStickerVmtFile.$decalstyle === 3) { // holo
                    if (jsonFromStickerVmtFile.$holomask && fileManager.saveStickerMapToFolder(jsonFromStickerVmtFile.$holomask, raritySticker)) {
                        consoleMessage = "Successfully copied sticker holomask vtf file to stickers folder!";
                    } else {
                        consoleMessage = 'Failed to copy sticker holomask vtf to csgo folder!';
                    }
                }
                break;
            case ItemType.Spray:
                const raritySpray = sprayRarityRadio;
                if (inputSprayDiffuseFile && fileManager.saveSprayMapToFolder(inputSprayDiffuseFile, raritySpray)) {
                    consoleMessage = "Successfully copied spray base vtf file to sprays folder!";
                } else {
                    consoleMessage = 'Failed to copy spray base vtf to csgo folder!';
                }
                break;
        }
        return consoleMessage
    }

    const submitGloveForm = (submitFormEvent: FormEvent<HTMLFormElement>) => {
        submitFormEvent.preventDefault();
        if (fileManager && currentlySelectedGloveToReplace && currentlySelectedGloveToReplaceWith) {
            if(fileManager.replaceGloves(currentlySelectedGloveToReplace, currentlySelectedGloveToReplaceWith)) {
                setConsoleLogText('Successfully swapped glove textures!');
            } else {
                setConsoleLogText('Failed to swap glove textures!');
            }
            fileManager.buildCompletePaintKitArrays()
            initializeDropDownArrays(fileManager);
        } else {
            setConsoleLogText('Glove swap failed, please make sure 2 gloves are selected and the csgo exe location has been set.');
        }
    }

    const openDiscordLink = (): void => {
        window.open('https://discordapp.com/users/194230435671179266')
    }

    const openTwitterLink = (): void => {
        window.open('https://twitter.com/frostbug')
    }

    const openGithubLink = (): void => {
        window.open('https://github.com/frostbug/frostbugs-skin-testing-tools')
    }

    const openSteamLink = (): void => {
        window.open('https://steamcommunity.com/id/frostbug//')
    }

    const copyScriptToClipboard = (): void => {
        navigator.clipboard.writeText(screenshotScript)
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
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#sticker">Sticker</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#spray">Spray</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#more">More</a>
                </li>
            </ul>
            <div id="windowTabs" className="tab-content">
                {/*<----------------------------------------------------Weapon Tab---------------------------------------------------->*/}
                <div className="tab-pane active" id="weapon">
                    <form>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="textFileInput" className="form-label mt-4">Text File</label>
                            <input className="form-control" type="file" id="textFileInput" accept=".txt" onChange={readTextFileOnInputWeaponSkin}/>
                        </div>
                        <div id="inputDiv">
                            <label id="diffuseWeaponLabel" htmlFor="diffuseFileInput" className="form-label mt-4" style={diffuseSkinLabelStyle}>{diffuseSkinLabelText}</label>
                            <input className="form-control" type="file" id="diffuseFileInput" accept=".vtf" onChange={onDiffuseFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="normalCheckBox" checked={normalMapToggle} onChange={toggleNormalMap}/>
                                <label id="normalWeaponLabel" className="form-check-label" htmlFor="normalCheckBox" style={normalLabelStyle}>{normalLabelText}</label>
                            </div>
                            <input className="form-control" type="file" id="normalFileInput" accept=".vtf" onChange={onNormalFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" htmlFor="weaponDropDownDiv" className="form-label mt-4">Skin To
                                Replace</label>
                            <div className="dropdown" id="weaponDropDownDiv">
                                <select name="weaponSkinDropDown" id="weaponSkinDropDown" className="form-select" onChange={setCurrentSelectedDropdownWeaponSkin}>
                                    {weaponArrayForDropdown.map(skinName => (<option key={skinName} value={skinName}>{skinName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinNameInput">New Skin
                                Name</label>
                            <input className="form-control" placeholder="Custom Skin Name" id="newSkinNameInput"
                                   onChange={event => setCustomItemName(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="newSkinDescription">New
                                Skin Description</label>
                            <textarea className="form-control" placeholder="Custom Skin Description"
                                      id="newSkinDescription" rows={3}
                                      onChange={event => setCustomItemDescription(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="outPutLogTextAreaWeapons">Output Log</label>
                            <textarea readOnly className="form-control" id="outPutLogTextAreaWeapons" value={consoleLogText} rows={4}/>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceWeaponTexturesBtn" type='button' onClick={submitWeaponForm} className="btn btn-primary">Replace Textures
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
                                        onChange={setCurrentSelectedDropdownGloveSkinToReplace}>
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
                                        onChange={setCurrentSelectedDropdownGloveSkinToReplaceWith}>
                                    {gloveArrayForDropdown.map(skinName => (
                                        <option key={skinName} value={skinName}>{skinName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="weaponLabel" className="col-form-label mt-4" htmlFor="outPutLogTextAreaGloves">Output Log</label>
                            <textarea readOnly className="form-control" id="outPutLogTextAreaGloves" value={consoleLogText} rows={4}/>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceGloveTexturesBtn" type="submit" className="btn btn-primary">Replace Textures</button>
                        </div>
                    </form>
                </div>
                {/*<----------------------------------------------------Sticker Tab---------------------------------------------------->*/}
                <div className="tab-pane" id="sticker">
                    <form>
                        <div id="inputDiv">
                            <label id="rarityStickerLabel" className="form-label mt-4" style={stickerRarityLabelStyle}>{stickerRarityLabelText}</label>
                            <div>
                                <input type="radio" id="stickerRarityStandardRadio" name="stickerRarity" value="Standard" defaultChecked={stickerRarityRadio === 'Standard'} onClick={() => stickerRarityChanged('Standard')}></input>
                                <label id="stickerRarityStandardRadioText">Standard</label>
                                <input type="radio" id="stickerRarityHoloRadio" name="stickerRarity" value="Holo" defaultChecked={stickerRarityRadio === 'Holo'} onClick={() => stickerRarityChanged('Holo')}></input>
                                <label id="stickerRarityHoloRadioText">Holo</label>
                                <input type="radio" id="stickerRarityFoilRadio" name="stickerRarity" value="Foil" defaultChecked={stickerRarityRadio === 'Foil'} onClick={() => stickerRarityChanged('Foil')}></input>
                                <label id="stickerRarityFoilRadioText">Foil</label>
                                <input type="radio" id="stickerRarityGoldRadio" name="stickerRarity" value="Gold" defaultChecked={stickerRarityRadio === 'Gold'} onClick={() => stickerRarityChanged('Gold')}></input>
                                <label id="stickerRarityGoldRadioText">Gold</label>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="stickerLabel" htmlFor="vmtFileInput" className="form-label mt-4">VMT File</label>
                            <input className="form-control" type="file" id="vmtFileInput" accept=".vmt" onChange={readVmtFileOnInputSticker}/>
                        </div>
                        <div id="inputDivStickerDiffuseStandard">
                            <label id="diffuseStickerLabel" htmlFor="diffuseStickerFileInput" className="form-label mt-4" style={diffuseStickerLabelStyle}>{diffuseStickerLabelText}</label>
                            <input className="form-control" type="file" id="diffuseStickerFileInput" accept=".vtf" onChange={onStickerDiffuseFileUpload}/>
                        </div>
                        <div id="inputDivStickerDiffuseExponent">
                            <label id="diffuseStickerExponentLabel" htmlFor="diffuseStickerExponentFileInput" className="form-label mt-4" style={diffuseStickerExponentLabelStyle}>{diffuseStickerExponentLabelText}</label>
                            <input className="form-control" type="file" id="diffuseStickerExponentFileInput" accept=".vtf" onChange={onStickerExponentDiffuseFileUpload}/>
                        </div>
                        <div id="inputDivStickerDiffuseHolo">
                            <label id="diffuseStickerHoloLabel" htmlFor="diffuseStickerHoloFileInput" className="form-label mt-4" style={diffuseStickerHoloLabelStyle}>{diffuseStickerHoloLabelText}</label>
                            <input className="form-control" type="file" id="diffuseStickerHoloFileInput" accept=".vtf" onChange={onStickerHoloDiffuseFileUpload}/>
                        </div>
                        <div id="inputDivStickerDiffuseFoil">
                            <label id="diffuseStickerFoilLabel" htmlFor="diffuseStickerFoilFileInput" className="form-label mt-4" style={diffuseStickerFoilLabelStyle}>{diffuseStickerFoilLabelText}</label>
                            <input className="form-control" type="file" id="diffuseStickerFoilFileInput" accept=".vtf" onChange={onStickerFoilDiffuseFileUpload}/>
                        </div>
                        <div id="inputDivStickerDiffuseGold">
                            <label id="diffuseStickerGoldLabel" htmlFor="diffuseStickerGoldFileInput" className="form-label mt-4" style={diffuseStickerGoldLabelStyle}>{diffuseStickerGoldLabelText}</label>
                            <input className="form-control" type="file" id="diffuseStickerGoldFileInput" accept=".vtf" onChange={onStickerGoldDiffuseFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <label id="stickerLabel" htmlFor="stickerDropDownDiv" className="form-label mt-4">Sticker To
                                Replace</label>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="stickerSignaturesCheckBox" checked={stickerSignaturesToggle} onChange={toggleStickerSignatures}/>
                                <label id="signaturesStickerLabel" className="form-check-label" htmlFor="stickerSignaturesCheckBox" style={stickerSignaturesLabelStyle}>{stickerSignaturesLabelText}</label>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="stickerTeamLogosCheckBox" checked={stickerTeamLogosToggle} onChange={toggleStickerTeamLogos}/>
                                <label id="teamLogosStickerLabel" className="form-check-label" htmlFor="stickerTeamLogosCheckBox" style={stickerTeamLogosLabelStyle}>{stickerTeamLogosLabelText}</label>
                            </div>
                            <div className="dropdown" id="stickerDropDownDiv">
                                <select name="stickerDropDown" id="stickerDropDown" className="form-select" onChange={setCurrentSelectedDropdownSticker}>
                                    {stickerArrayForDropdown.map(stickerName => (<option key={stickerName} value={stickerName}>{stickerName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="stickerLabel" className="col-form-label mt-4" htmlFor="newStickerNameInput">New Sticker
                                Name</label>
                            <input className="form-control" placeholder="Custom Sticker Name" id="newStickerNameInput"
                                   onChange={event => setCustomItemName(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="stickerLabel" className="col-form-label mt-4" htmlFor="newStickerDescription">New
                                Sticker Description</label>
                            <textarea className="form-control" placeholder="Custom Sticker Description"
                                      id="newStickerDescription" rows={3}
                                      onChange={event => setCustomItemDescription(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="stickerLabel" className="col-form-label mt-4" htmlFor="outPutLogTextAreaStickers">Output Log</label>
                            <textarea readOnly className="form-control" id="outPutLogTextAreaStickers" value={consoleLogText} rows={4}/>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceStickerTexturesBtn" type='button' onClick={submitStickerForm} className="btn btn-primary">Replace Textures
                            </button>
                        </div>
                    </form>
                </div>
                {/*<----------------------------------------------------Spray Tab---------------------------------------------------->*/}
                <div className="tab-pane" id="spray">
                    <form>
                        <div id="inputDiv">
                            <label id="raritySprayLabel" className="form-label mt-4" style={sprayRarityLabelStyle}>{sprayRarityLabelText}</label>
                            <div>
                                <input type="radio" id="sprayRarityCommonRadio" name="sprayRarity" value="Common" defaultChecked={sprayRarityRadio === 'Common'} onClick={() => sprayRarityChanged('Common')}></input>
                                <label id="sprayRarityCommonRadioText">Common</label>
                                <input type="radio" id="sprayRarityRareRadio" name="sprayRarity" value="Rare" defaultChecked={sprayRarityRadio === 'Rare'} onClick={() => sprayRarityChanged('Rare')}></input>
                                <label id="sprayRarityRareRadioText">Rare</label>
                                <input type="radio" id="sprayRarityMythicalRadio" name="sprayRarity" value="Mythical" defaultChecked={sprayRarityRadio === 'Mythical'} onClick={() => sprayRarityChanged('Mythical')}></input>
                                <label id="sprayRarityMythicalRadioText">Mythical</label>
                                <input type="radio" id="sprayRarityLegendaryRadio" name="sprayRarity" value="Legendary" defaultChecked={sprayRarityRadio === 'Legendary'} onClick={() => sprayRarityChanged('Legendary')}></input>
                                <label id="sprayRarityLegendaryRadioText">Legendary</label>
                            </div>
                        </div>
                        <div id="inputDivSprayDiffuse">
                            <label id="diffuseSprayLabel" htmlFor="diffuseSprayFileInput" className="form-label mt-4" style={diffuseSprayLabelStyle}>{diffuseSprayLabelText}</label>
                            <input className="form-control" type="file" id="diffuseSprayFileInput" accept=".vtf" onChange={onSprayDiffuseFileUpload}/>
                        </div>
                        <div id="inputDiv">
                            <label id="sprayLabel" htmlFor="sprayDropDownDiv" className="form-label mt-4">Spray To
                                Replace</label>
                            <div className="dropdown" id="sprayDropDownDiv">
                                <select name="sprayDropDown" id="sprayDropDown" className="form-select" onChange={setCurrentSelectedDropdownSpray}>
                                    {sprayArrayForDropdown.map(sprayName => (<option key={sprayName} value={sprayName}>{sprayName}</option>))}
                                </select>
                            </div>
                        </div>
                        <div id="inputDiv">
                            <label id="sprayLabel" className="col-form-label mt-4" htmlFor="newSprayNameInput">New Spray
                                Name</label>
                            <input className="form-control" placeholder="Custom Spray Name" id="newSprayNameInput"
                                   onChange={event => setCustomItemName(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="sprayLabel" className="col-form-label mt-4" htmlFor="newSprayDescription">New
                                Spray Description</label>
                            <textarea className="form-control" placeholder="Custom Spray Description"
                                      id="newSprayDescription" rows={3}
                                      onChange={event => setCustomItemDescription(event.target.value)}/>
                        </div>
                        <div id="inputDiv">
                            <label id="sprayLabel" className="col-form-label mt-4" htmlFor="outPutLogTextAreaSprays">Output Log</label>
                            <textarea readOnly className="form-control" id="outPutLogTextAreaSprays" value={consoleLogText} rows={4}/>
                        </div>
                        <div id="buttonDiv">
                            <button id="replaceSprayTexturesBtn" type='button' onClick={submitSprayForm} className="btn btn-primary">Replace Textures
                            </button>
                        </div>
                    </form>
                </div>
                {/*<----------------------------------------------------More Tab---------------------------------------------------->*/}
                <div className="tab-pane" id="more">
                    <div id="moreTabDiv">
                        <h4>Support Links</h4>
                        <p>If you need support or have any bugs to report, feel free to reach out to me with the following links.</p>
                        <button type="button" id="hyperlinkButton" className="btn btn-primary btn-sm" onClick={openDiscordLink} >Discord</button>
                        <button type="button" id="hyperlinkButton" className="btn btn-primary btn-sm" onClick={openTwitterLink}>Twitter</button>
                        <button type="button" id="hyperlinkButton" className="btn btn-primary btn-sm" onClick={openSteamLink}>Steam</button>
                        <button type="button" id="hyperlinkButton" className="btn btn-primary btn-sm" onClick={openGithubLink}>Github</button>
                        <hr/>
                        <h4>Screenshot Script</h4>
                        <p>Script for kicking bots and clearing UI. To be used in offline maps only.</p>
                        <textarea readOnly className="form-control" id="scriptTextBox" value={screenshotScript} rows={4}/>
                        <button type="button" id="hyperlinkButton" onClick={copyScriptToClipboard} className="btn btn-primary btn-sm">Copy To Clipboard</button>
                        <hr/>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default WeaponForm