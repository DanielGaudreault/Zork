// Game state
const gameState = {
    currentRoom: 'westOfHouse',
    inventory: [],
    score: 0,
    maxScore: 100,
    lampOn: false,
    trapDoorOpen: false,
    windowOpen: false,
    mailboxOpen: false,
    eggTaken: false,
    swordTaken: false,
    isDark: false
};

// Game map
const rooms = {
    westOfHouse: {
        name: "West of House",
        description: "You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.",
        exits: {
            north: "northOfHouse",
            east: "behindHouse",
            south: "southOfHouse",
            west: "forest"
        },
        items: []
    },
    northOfHouse: {
        name: "North of House",
        description: "You are facing the north side of a white house. There is no door here, and all the windows are barred.",
        exits: {
            south: "westOfHouse",
            east: "behindHouse"
        },
        items: []
    },
    behindHouse: {
        name: "Behind House",
        description: "You are behind the white house. In one corner of the house there is a small window which is slightly ajar.",
        exits: {
            west: "northOfHouse",
            south: "southOfHouse",
            north: "clearing"
        },
        items: []
    },
    southOfHouse: {
        name: "South of House",
        description: "You are facing the south side of a white house. There is a door here, but it appears to be locked.",
        exits: {
            north: "westOfHouse",
            east: "behindHouse"
        },
        items: []
    },
    forest: {
        name: "Forest",
        description: "This is a forest, with trees in all directions. To the east, there appears to be sunlight.",
        exits: {
            east: "westOfHouse"
        },
        items: [
            {
                name: "sword",
                description: "A rusty but still sharp sword lies on the ground.",
                takeable: true,
                points: 10
            }
        ]
    },
    clearing: {
        name: "Clearing",
        description: "You are in a small clearing in the forest. There's a trap door set into the ground.",
        exits: {
            south: "behindHouse"
        },
        items: []
    },
    cellar: {
        name: "Cellar",
        description: "You are in a dark and musty cellar. There are cobwebs in every corner.",
        exits: {
            up: "clearing"
        },
        items: [
            {
                name: "lamp",
                description: "An old brass lamp sits on a wooden table.",
                takeable: true,
                points: 5
            },
            {
                name: "egg",
                description: "A golden egg glitters in the dim light.",
                takeable: true,
                points: 20
            }
        ]
    },
    livingRoom: {
        name: "Living Room",
        description: "You're in the living room of the white house. The furniture is covered in dust and the air smells musty.",
        exits: {
            out: "behindHouse"
        },
        items: [
            {
                name: "book",
                description: "An old leather-bound book titled 'The History of Zork'.",
                takeable: true,
                points: 15
            }
        ]
    }
};

// Game commands
const commands = {
    look: (args) => {
        if (args.length === 0) {
            printRoomDescription();
        } else {
            lookAt(args.join(' '));
        }
    },
    
    go: (args) => {
        if (args.length === 0) {
            output("Go where?");
            return;
        }
        
        const direction = args[0].toLowerCase();
        const currentRoom = rooms[gameState.currentRoom];
        
        if (currentRoom.exits[direction]) {
            gameState.currentRoom = currentRoom.exits[direction];
            printRoomDescription();
            
            // Special case for cellar (dark unless lamp is on)
            if (gameState.currentRoom === 'cellar' && !gameState.lampOn) {
                gameState.isDark = true;
                output("It's pitch black. You're likely to be eaten by a grue!");
            } else {
                gameState.isDark = false;
            }
        } else {
            output("You can't go that way.");
        }
    },
    
    take: (args) => {
        if (args.length === 0) {
            output("Take what?");
            return;
        }
        
        const itemName = args.join(' ').toLowerCase();
        const currentRoom = rooms[gameState.currentRoom];
        const itemIndex = currentRoom.items.findIndex(item => item.name.toLowerCase() === itemName);
        
        if (itemIndex !== -1) {
            const item = currentRoom.items[itemIndex];
            
            if (item.takeable) {
                gameState.inventory.push(item);
                currentRoom.items.splice(itemIndex, 1);
                gameState.score += item.points;
                output(`You take the ${item.name}.`);
                
                // Special case for sword
                if (item.name === "sword") {
                    gameState.swordTaken = true;
                }
                
                // Special case for egg
                if (item.name === "egg") {
                    gameState.eggTaken = true;
                }
            } else {
                output("You can't take that.");
            }
        } else {
            output("I don't see that here.");
        }
    },

    inventory: () => {
        if (gameState.inventory.length === 0) {
            output("You're not carrying anything.");
        } else {
            output("You are carrying:");
            gameState.inventory.forEach(item => {
                output(`- ${item.name}: ${item.description}`);
            });
        }
    },
    
    open: (args) => {
        if (args.length === 0) {
            output("Open what?");
            return;
        }
        
        const target = args.join(' ').toLowerCase();
        const currentRoom = rooms[gameState.currentRoom];
        
        if (target === "trap door" && gameState.currentRoom === 'clearing') {
            if (!gameState.trapDoorOpen) {
                gameState.trapDoorOpen = true;
                output("You open the trap door, revealing a ladder leading down into darkness.");
                
                // Add the cellar exit
                rooms.clearing.exits.down = "cellar";
            } else {
                output("The trap door is already open.");
            }
        } else if (target === "window" && gameState.currentRoom === 'behindHouse') {
            if (!gameState.windowOpen) {
                gameState.windowOpen = true;
                output("You manage to push the window open further. You might be able to climb through.");
                
                // Add the inside house exit
                rooms.behindHouse.exits.in = "livingRoom";
            } else {
                output("The window is already open.");
            }
        } else if (target === "mailbox" && gameState.currentRoom === 'westOfHouse') {
            if (!gameState.mailboxOpen) {
                gameState.mailboxOpen = true;
                output("You open the mailbox, revealing a small leaflet.");
                
                // Add leaflet to room items
                rooms.westOfHouse.items.push({
                    name: "leaflet",
                    description: "The leaflet reads: 'Welcome to Zork! This is an open field west of a white house.'",
                    takeable: true,
                    points: 1
                });
            } else {
                output("The mailbox is already open.");
            }
        } else {
            output("I don't see how to open that.");
        }
    },
    
    close: (args) => {
        if (args.length === 0) {
            output("Close what?");
            return;
        }
        
        const target = args.join(' ').toLowerCase();
        
        if (target === "trap door" && gameState.currentRoom === 'clearing' && gameState.trapDoorOpen) {
            gameState.trapDoorOpen = false;
            output("You close the trap door.");
            delete rooms.clearing.exits.down;
        } else if (target === "window" && gameState.currentRoom === 'behindHouse' && gameState.windowOpen) {
            gameState.windowOpen = false;
            output("You close the window.");
            delete rooms.behindHouse.exits.in;
        } else if (target === "mailbox" && gameState.currentRoom === 'westOfHouse' && gameState.mailboxOpen) {
            gameState.mailboxOpen = false;
            output("You close the mailbox.");
            
            // Remove leaflet if it's still there
            const leafletIndex = rooms.westOfHouse.items.findIndex(item => item.name === "leaflet");
            if (leafletIndex !== -1) {
                rooms.westOfHouse.items.splice(leafletIndex, 1);
            }
        } else {
            output("I don't see how to close that.");
        }
    },
    
    turn: (args) => {
        if (args.length === 0) {
            output("Turn what?");
            return;
        }
        
        if (args[0].toLowerCase() === "on") {
            const target = args.slice(1).join(' ').toLowerCase();
            
            if (target === "lamp") {
                const lamp = gameState.inventory.find(item => item.name === "lamp");
                if (lamp) {
                    gameState.lampOn = true;
                    output("The lamp turns on, illuminating your surroundings.");
                    
                    // If in cellar, no longer dark
                    if (gameState.currentRoom === 'cellar') {
                        gameState.isDark = false;
                        output("The cellar is now illuminated by the lamp's glow.");
                    }
                } else {
                    output("You don't have a lamp.");
                }
            } else {
                output("I don't know how to turn that on.");
            }
        } else if (args[0].toLowerCase() === "off") {
            const target = args.slice(1).join(' ').toLowerCase();
            
            if (target === "lamp") {
                if (gameState.lampOn) {
                    gameState.lampOn = false;
                    output("The lamp turns off.");
                    
                    // If in cellar, now dark
                    if (gameState.currentRoom === 'cellar') {
                        gameState.isDark = true;
                        output("It's now pitch black. You're likely to be eaten by a grue!");
                    }
                } else {
                    output("The lamp is already off.");
                }
            } else {
                output("I don't know how to turn that off.");
            }
        } else {
            output("I don't understand that turn command.");
        }
    },
    
    score: () => {
        output(`Your score is ${gameState.score} out of a possible ${gameState.maxScore}.`);
    },
    
    help: () => {
        output("Available commands:");
        output("- look/look at [object]: Examine your surroundings or an object");
        output("- go [direction]: Move in a direction (north, south, east, west, up, down, in, out)");
        output("- take [object]: Pick up an object");
        output("- inventory/i: List items you're carrying");
        output("- open [object]: Open something");
        output("- close [object]: Close something");
        output("- turn on/off [object]: Turn something on or off");
        output("- score: Check your current score");
        output("- help: Show this help message");
        output("- quit: End the game");
    },
    
    quit: () => {
        output("Thanks for playing!");
        output(`Final score: ${gameState.score} out of ${gameState.maxScore}`);
        document.getElementById('command').disabled = true;
    }
};

// Aliases for commands
commands.l = commands.look;
commands.i = commands.inventory;
commands.n = () => commands.go(['north']);
commands.s = () => commands.go(['south']);
commands.e = () => commands.go(['east']);
commands.w = () => commands.go(['west']);
commands.u = () => commands.go(['up']);
commands.d = () => commands.go(['down']);
commands.in = () => commands.go(['in']);
commands.out = () => commands.go(['out']);

// DOM elements
const outputElement = document.getElementById('output');
const commandInput = document.getElementById('command');

// Helper functions
function output(text) {
    const p = document.createElement('p');
    p.textContent = text;
    outputElement.appendChild(p);
    outputElement.scrollTop = outputElement.scrollHeight;
}

function printRoomDescription() {
    const room = rooms[gameState.currentRoom];
    output(`\n${room.name}`);
    output(room.description);
    
    // List exits
    const exitList = Object.keys(room.exits).join(', ');
    output(`Exits: ${exitList}`);
    
    // List items if not dark
    if (!gameState.isDark && room.items.length > 0) {
        output("You see:");
        room.items.forEach(item => {
            output(`- ${item.name}`);
        });
    }
}

function lookAt(object) {
    const room = rooms[gameState.currentRoom];
    
    // Check room items
    const roomItem = room.items.find(item => item.name.toLowerCase() === object);
    if (roomItem) {
        output(roomItem.description);
        return;
    }
    
    // Check inventory
    const inventoryItem = gameState.inventory.find(item => item.name.toLowerCase() === object);
    if (inventoryItem) {
        output(inventoryItem.description);
        return;
    }
    
    // Special objects
    if (object === "mailbox" && gameState.currentRoom === 'westOfHouse') {
        output("The mailbox is a small metal container mounted on a post.");
        return;
    }
    
    if (object === "window" && gameState.currentRoom === 'behindHouse') {
        output("The window is small and dirty, but you can see through it.");
        return;
    }
    
    if (object === "trap door" && gameState.currentRoom === 'clearing') {
        output("The trap door is made of heavy wood with an iron ring for lifting it.");
        return;
    }
    
    if (object === "house") {
        output("It's a white two-story house with boarded up windows. It looks abandoned.");
        return;
    }
    
    output("I don't see that here.");
}

function processCommand(input) {
    if (!input.trim()) return;
    
    output(`> ${input}`);
    
    const parts = input.toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    
    if (commands[command]) {
        commands[command](args);
    } else {
        output("I don't understand that command. Type 'help' for a list of commands.");
    }
}

// Event listeners
commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value;
        commandInput.value = '';
        processCommand(command);
    }
});

// Initialize game
output("Welcome to Zork - Web Edition!");
output("Type 'help' for a list of commands.");
printRoomDescription();
commandInput.focus();
