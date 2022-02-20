# Frostbugs Skin Testing Tools
Tools for testing CSGO skins for development and presentation purposes. 

Please DO NOT attempt to play on multiplayer servers after using the glove or skin replacement features, and ALWAYS verify integrity of game cache before playing online after using the tool.

This tool is for OFFLINE testing ONLY.

### What does this tool do?
This tool automates the task of adding your custom skin to the CSGO game files for screenshot/testing purposes. 

After selecting your csgo exe file at the top of the tool, a list of skins is generated that you can swap out for your own custom designs. 

Please note that this tool does NOT touch or edit your csgo exe file, the file is only used for reference to find where the text and texture files that need to be edited/swapped.

Gloves can also be swapped out for screenshot purposes.

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

### Is this a virus/Bitcoin miner?
No, and to make it clear that this tool performs no malicious actions I have made it completely open source with the source code available to the public. 

The tool is coded in React with Typescript and is built in an Electron browser, which gives it the ability to read and write local files. 

Unfortunately as Electron is effectively a modified web browser, the program size is quite large at around 200MB.
