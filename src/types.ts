export const CSGO_ENGLISH_FILE_PATH: string = "\\csgo\\resource\\csgo_english.txt";
export const ITEMS_GAME_FILE_PATH: string = "\\csgo\\scripts\\items\\items_game.txt";
export const WEAPON_SKIN_MATERIALS_FOLDERS_PATH: string = "\\csgo\\materials\\models\\weapons\\customization\\paints\\";
export const STICKER_MATERIALS_FOLDERS_PATH: string = "\\csgo\\materials\\models\\weapons\\customization\\stickers\\";
export const STICKER_MATERIALS_IN_VMT_FOLDERS_PATH: string = "models\\weapons\\customization\\stickers\\";
export const SPRAY_MATERIALS_FOLDERS_PATH: string = "\\csgo\\materials\\decals\\sprays\\";
export const CSGO_EXECUTABLE_NAME: string = "\\csgo.exe";

export const PAINTABLE_WEAPON_ARRAY: Array<paintableWeapon> = [
    {weaponShortName: "ak47", weaponId: "0", weaponDisplayName: "AK-47"},
    {weaponShortName: "aug", weaponId: "1", weaponDisplayName: "AUG"},
    {weaponShortName: "awp", weaponId: "2", weaponDisplayName: "AWP"},
    {weaponShortName: "deagle", weaponId: "3", weaponDisplayName: "Desert Eagle"},
    {weaponShortName: "elite", weaponId: "4", weaponDisplayName: "Dual Barettas"},
    {weaponShortName: "famas", weaponId: "5", weaponDisplayName: "FAMAS"},
    {weaponShortName: "fiveseven", weaponId: "6", weaponDisplayName: "Five-SeveN"},
    {weaponShortName: "g3sg1", weaponId: "7", weaponDisplayName: "G3SG1"},
    {weaponShortName: "galilar", weaponId: "8", weaponDisplayName: "Galil AR"},
    {weaponShortName: "glock", weaponId: "9", weaponDisplayName: "Glock-18"},
    {weaponShortName: "m249", weaponId: "10", weaponDisplayName: "M249"},
    {weaponShortName: "m4a1_silencer", weaponId: "11", weaponDisplayName: "M4A1-S"},
    {weaponShortName: "m4a1", weaponId: "12", weaponDisplayName: "M4A4"},
    {weaponShortName: "mac10", weaponId: "13", weaponDisplayName: "MAC-10"},
    {weaponShortName: "mag7", weaponId: "14", weaponDisplayName: "MAG-7"},
    {weaponShortName: "mp7", weaponId: "15", weaponDisplayName: "MP7"},
    {weaponShortName: "mp9", weaponId: "16", weaponDisplayName: "MP9"},
    {weaponShortName: "negev", weaponId: "17", weaponDisplayName: "Negev"},
    {weaponShortName: "nova", weaponId: "18", weaponDisplayName: "Nova"},
    {weaponShortName: "hkp2000", weaponId: "19", weaponDisplayName: "P2000"},
    {weaponShortName: "p250", weaponId: "20", weaponDisplayName: "P250"},
    {weaponShortName: "p90", weaponId: "21", weaponDisplayName: "P90"},
    {weaponShortName: "bizon", weaponId: "22", weaponDisplayName: "PP-Bizon"},
    {weaponShortName: "scar20", weaponId: "23", weaponDisplayName: "SCAR-20"},
    {weaponShortName: "sg556", weaponId: "24", weaponDisplayName: "SG553"},
    {weaponShortName: "ssg08", weaponId: "25", weaponDisplayName: "SSG08"},
    {weaponShortName: "sawedoff", weaponId: "26", weaponDisplayName: "Sawed-Off"},
    {weaponShortName: "tec9", weaponId: "27", weaponDisplayName: "Tec-9"},
    {weaponShortName: "ump45", weaponId: "28", weaponDisplayName: "UMP-45"},
    {weaponShortName: "usp_silencer", weaponId: "29", weaponDisplayName: "USP-S"},
    {weaponShortName: "xm1014", weaponId: "30", weaponDisplayName: "XM1014"},
    {weaponShortName: "cz75a", weaponId: "31", weaponDisplayName: "CZ75-Auto"},
    {weaponShortName: "revolver", weaponId: "32", weaponDisplayName: "R8 Revolver"},
    {weaponShortName: "mp5sd", weaponId: "33", weaponDisplayName: "MP5-SD"}
];


export const FINISH_STYLE_FOLDERS: finishStyle[] = [
    {finishStyleId: "2", finishStyleName: "hydrographic"},
    {finishStyleId: "3", finishStyleName: "spray"},
    {finishStyleId: "5", finishStyleName: "anodized_multi"},
    {finishStyleId: "6", finishStyleName: "anodized_air"},
    {finishStyleId: "7", finishStyleName: "custom"},
    {finishStyleId: "8", finishStyleName: "antiqued"},
    {finishStyleId: "9", finishStyleName: "gunsmith"}
]

export const STICKER_RARITY_FOLDERS: stickerRarity[] = [
    {stickerRarityId: 0, stickerRarityName: "Standard", stickerRarityDisplayName: "Rare"}, // does it only use 0 ??
    {stickerRarityId: 3, stickerRarityName: "Holo", stickerRarityDisplayName: "Mythical"},
    {stickerRarityId: 4, stickerRarityName: "Foil", stickerRarityDisplayName: "Legendary"},
    {stickerRarityId: 5, stickerRarityName: "Gold", stickerRarityDisplayName: "Ancient"}, // it should actually be 4, the same as foil, wtf
]

export const SPRAY_RARITY_FOLDERS: sprayRarity[] = [
    {sprayRarityId: -1, sprayRarityName: "Common", sprayRarityDisplayName: "Common"}, // what should sprayRarityId be ??
    {sprayRarityId: 0, sprayRarityName: "Rare", sprayRarityDisplayName: "Rare"},
    {sprayRarityId: 3, sprayRarityName: "Mythical", sprayRarityDisplayName: "Mythical"},
    {sprayRarityId: 4, sprayRarityName: "Legendary", sprayRarityDisplayName: "Legendary"},
]

export interface finishStyle {
    finishStyleId: string;
    finishStyleName: string;
}

export interface stickerRarity {
    stickerRarityId: number;
    stickerRarityName: string;
    stickerRarityDisplayName: string;
}

export interface sprayRarity {
    sprayRarityId: number;
    sprayRarityName: string;
    sprayRarityDisplayName: string;
}

export interface paintableWeapon {
    weaponShortName: string;
    weaponId: string;
    weaponDisplayName: string;
}

export interface paintKitItemPairing {
    itemShortName: string;
    paintKitName: string;
}

export interface stickerKitItemPairing {
    stickerKitName: string;
    stickerCollectionName: string;
    stickerRarity: stickerRarity;
}

export interface sprayKitItemPairing {
    sprayKitName: string;
    sprayCollectionName: string;
    sprayRarity: sprayRarity;
}

export interface referencedLanguageString {
    referenceString: string;
    displayedString: string;
}

export interface icon {
    icon_path: string;
}

export interface paintKit {
    name?: string;
    description_string?: string;
    description_tag?: string;
    style?: string;
    pattern?: string;
    normal?: string;
    use_normal?: string;
    color0?: string;
    color1?: string;
    color2?: string;
    color3?: string;
    pattern_scale?: string;
    phongexponent?: string;
    phongintensity?: string;
    phongalbedoboost?: string;
    view_model_exponent_override_size?: string;
    ignore_weapon_size_scale?: string;
    only_first_material?: string;
    pattern_offset_x_start?: string;
    pattern_offset_x_end?: string;
    pattern_offset_y_start?: string;
    pattern_offset_y_end?: string;
    pattern_rotate_start?: string;
    pattern_rotate_end?: string;
    wear_remap_min?: string;
    wear_remap_max?: string;
    itemShortName?: string;
    itemDisplayName?: string;
    weaponId?: string;
    skinDescription?: string;
    skinDisplayName?: string;
    fullItemDisplayName?: string;
    paintKitId?: string;
    dialog_config?: string;
    vmt_path?: string;
    vmt_overrides?: any;
}
//Gloves - possibility to be reused in generation of paintable weapons to replace hardcoded array
export interface textFileItem {
    name?: string;
    prefab?: string;
    model_player?: string;
    item_name?: string;
    item_description?: string;
    model_world?: string;
    model_dropped?: string;
    icon_default_image?: string;
    used_by_classes?: any;
    attributes?: any;
    paint_data?: any;
    PaintableMaterial1?: any;

    itemId?: string;
    itemDisplayName?: string;
}
export interface stickerKit {
    name?: string;
    item_name?: string;
    description_string?: string;
    sticker_material?: string;
    item_rarity?: string;
    tournament_event_id?: string;
    tournament_team_id?: string;
    tournament_player_id?: string;
    itemShortName?: string;
    itemDisplayName?: string;
    stickerDescription?: string;
    stickerDisplayName?: string;
    fullItemDisplayName?: string;
    stickerKitId?: string;
    vmt_path?: string;
}
export interface sprayKit {
    name?: string;
    item_name?: string;
    description_string?: string;
    sticker_material?: string; // sprays use sticker_material in items_game.txt
    item_rarity?: string;
    itemShortName?: string;
    itemDisplayName?: string;
    sprayDescription?: string;
    sprayDisplayName?: string;
    fullItemDisplayName?: string;
    sprayKitId?: string;
    vmt_path?: string;
}
// sticker VMTs
export interface weaponDecal {
    $decalstyle?: number;
    $basetexture?: string;
    $holomask?: string; // holo
    $holospectrum?: string; // holo
    $normalmap?: string; // gold/foil
    $wearbias?: number;
	$wearremapmin?: number;
	$wearremapmid?: number;
	$wearremapmax?: number;
    $unwearstrength?: number;
    $desatbasetint?: number; // gold
    $colortint?: string;
    $envmap?: string;
    $envmaptint?: string;
    $phong?: number;
    $phongexponent?: number;
    $phongfresnelranges?: string;
    $phongalbedotint?: number;
    $phongboost?: number;
    $phongalbedoboost?: number;
    $phongexponenttexture?: string; // is this correct for Exponent VTF ??
}

export const screenshotScript = "sv_cheats 1; bot_kick; mp_warmup_end; mp_freezetime 0; mp_roundtime 60; mp_roundtime_defuse 999; mp_roundtime_hostage 999; mp_buy_anywhere 1; mp_buytime 999; sv_infinite_ammo 2; mp_startmoney 16000; mp_restartgame 1; mp_ignore_round_win_conditions 1; cl_drawhud 0"