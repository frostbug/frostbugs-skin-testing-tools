# Frostbugs Skin Testing Tools
[
Download Latest Version](https://github.com/frostbug/frostbugs-skin-testing-tools/releases/download/0.1.0/Frostbugs-skin-testing-tools.setup.exe)

Tools for testing CSGO skins for development and presentation purposes. 

![fstt-screens](https://user-images.githubusercontent.com/9090669/154861055-f0eb8cbc-af2c-41a5-ac2f-19583466065c.jpg)

Please DO NOT attempt to play on multiplayer servers after using the glove or skin replacement features, and ALWAYS verify integrity of game cache before playing online after using the tool.

This tool is for OFFLINE testing ONLY.

If you want to support me or this tool I only ask that you check out my skin workshop:
[Frostbug's Workshop](https://steamcommunity.com/id/frostbug/)

Also special thanks to these workshoppers who offered support during development: [Conne](https://steamcommunity.com/id/NGREEN/) | [SIR](https://steamcommunity.com/id/_Sir/) | [Dabes](https://steamcommunity.com/id/blusod/)

### What does this tool do?
This tool automates the task of adding your custom skin to the CSGO game files for screenshot/testing purposes. 

After selecting your csgo exe file at the top of the tool, a list of skins is generated that you can swap out for your own custom designs. 

Please note that this tool does NOT touch or edit your csgo exe file, the file is only used for reference to find where the text and texture files that need to be edited/swapped.

Gloves can also be swapped out for screenshot purposes.

### How do I open/install the tool?
To install the tool, once downloaded, you can run frostbugs-skin-testing-tools Setup 0.1.0.exe, which will install the tool in a default location on your pc, the most likely place is under 'C:\Users\\<username\>\AppData\Local\Programs\frostbugs-skin-testing-tools'.

To uninstall the tool you can find it in the 'uninstall a program' section of your control panel.

You can also simply run the tool from the downloaded folder if you open the 'win-unpacked' folder and run 'frostbugs-skin-testing-tools.exe'.

### Can I play on multiplayer servers with custom/swapped skins?
NO, after using the skin testing tools you should only play on offline maps until you have verified integrity of game files for CSGO. 

Attemping to play on VAC-Secured servers with custom skins WILL result in you being kicked from the server.

### Can I get VAC banned for using this tool?
While I can never be 100% certain, I am confident that swapping out skins and previewing custom skins with this tool should not result in anything leading to a VAC ban. 

This tool automates processes that most of the workshoppers have been doing manually for years and there has been 0 VAC bans as a result of these processes. 

The processes involve editing plaintext files and adding texture files to the CSGO install folders. 

This tool does not use injection or anything that edits the game files at runtime that could lead to a vac ban.

### What do I need to add my skin to the game?
You will need a text file generated from the in game workbench that represents your skin. You will also need the diffuse and normal map files (if your skin uses one) saved in VTF format.

Selecting your text file will automatically locate the texture files used for the skin if the path is included in the text file. If no texture files are automatically loaded you can manually add them by using the file choosers for each texture. 

Please note that manually selected textures will override automatically detected ones if you choose them.

### Why is my skin just a black texture in game?
If you are inspecting your skin in your inventory from the main menu, it will initially be a solid black texture. You need to equip the skin in an offline game first for the texture to load in. 

You can use, for example "map de_dust2" to join an offline Dust 2 game with bots, then equip and buy your skin to have the texture load in.

The script included in the 'More' tab on the tool is very useful here as it will kick bots and give you unlimited time to play around with your custom texture.

### I want to run/compile this locally, what are the steps?
To run the tool locally you first need to go into Main.js and swap out the commented out lines of code so that the tool is looking at your locally run React code. These should be labelled with comments.

You will need to run an NPM install to pull in the dependencies. 

You will then need to run the "preelectron-pack" script from the package.json.

To get the tool running you need to run the 'start' script in the package.json, followed by the 'electron-start' script once a blank page loads in your web browser.

### Can I run this on MAC/Linux?
Currently only Windows is supported, however Electron was designed to allow for the development of cross OS apps. So while Linux and MAC are currently not supported there is potential they will be in the future.

### I have found a bug, need help, or have an idea for a feature!
Please feel free to reach out and contact me on my socials linked below for any support, cool ideas, or bugs you would like to report.

[Discord](https://discordapp.com/users/194230435671179266) | [Twitter](https://twitter.com/frostbug) | [Steam](https://steamcommunity.com/id/frostbug//)
