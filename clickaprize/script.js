document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL STATE & PERSISTENCE ---
    let inventory = []; 
    let itemHistory = []; 
    let gameState = {
        winningItem: null, 
        gridData: [],
        revealedIndices: [], 
        matchConfirmed: false
    };

    checkSavedData();

    function saveData() {
        localStorage.setItem('for_inventory', JSON.stringify(inventory));
        localStorage.setItem('for_history', JSON.stringify(itemHistory));
        localStorage.setItem('for_active', 'true');
    }

    function clearData() {
        localStorage.removeItem('for_inventory');
        localStorage.removeItem('for_history');
        localStorage.removeItem('for_active');
    }

    function checkSavedData() {
        const isActive = localStorage.getItem('for_active');
        if (isActive === 'true') {
            document.getElementById('recovery-modal').classList.remove('hidden');
        }
    }

    // Recovery Modal Handlers
    document.getElementById('recover-download-btn').addEventListener('click', () => {
        const savedHist = JSON.parse(localStorage.getItem('for_history') || "[]");
        const savedInv = JSON.parse(localStorage.getItem('for_inventory') || "[]");
        exportReport(savedHist, savedInv, "Recovered_Session.csv");
        clearData();
        document.getElementById('recovery-modal').classList.add('hidden');
    });

    document.getElementById('recover-delete-btn').addEventListener('click', () => {
        clearData();
        document.getElementById('recovery-modal').classList.add('hidden');
    });

    // --- 2. SETUP & CSV HANDLING ---
    const csvInput = document.getElementById("csventer");
    if(csvInput) {
        csvInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').filter(l => l.trim() !== '');
                inventory = lines.slice(1).map(line => {
                    const cols = line.split(',');
                    return { 
                        name: cols[0] ? cols[0].trim() : "Unknown", 
                        qty: cols[1] ? parseInt(cols[1]) : 0, 
                        prob: cols[2] ? parseFloat(cols[2]) : 0
                    };
                });
                renderSetupTable();
            };
            reader.readAsText(file);
        });
    }

    function renderSetupTable() {
        const tbody = document.getElementById("inventory-body");
        tbody.innerHTML = inventory.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.prob}</td></tr>`).join('');
        document.getElementById("confirm-area").classList.remove("hidden");
    }

    document.getElementById("start-game-btn").addEventListener("click", () => {
        if(inventory.length === 0) { alert("Please load inventory first!"); return; }
        document.getElementById("setup-container").classList.add("nodisp");
        document.getElementById("maincontainer").classList.remove("nodisp");
        document.getElementById("admin-gear").classList.remove("hidden");
        saveData();
        initRound();
    });

    // --- 3. GAME LOGIC ---
    function initRound() {
        document.getElementById("loopthis").play()
        gameState.matchConfirmed = false;
        gameState.revealedIndices = [];
        
        document.getElementById("decision-area").classList.add("hidden");
        const canvas = document.getElementById("overlay-canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pick Item
        const available = inventory.filter(i => i.qty > 0);
        if (available.length === 0) {
            alert("No Stock Left! Please Export Results.");
            return;
        }

        const totalProb = available.reduce((sum, i) => sum + i.prob, 0);
        let random = Math.random() * totalProb;
        let selectedItem = null;
        for (let item of available) {
            if (random < item.prob) { selectedItem = item; break; }
            random -= item.prob;
        }
        if (!selectedItem) selectedItem = available[available.length - 1];

        selectedItem.qty--;
        gameState.winningItem = selectedItem;
        saveData();

        // 3. Build Grid (4 Winners + 12 Distractors)
        let grid = [selectedItem.name, selectedItem.name, selectedItem.name, selectedItem.name]; 

        // Filter inventory to only include items that have 1 or more in stock
        const itemsInStock = inventory.filter(i => i.qty > 0);

        while (grid.length < 16) {
        // Pick distractors ONLY from items that are currently in stock
            const randomDistractor = itemsInStock[Math.floor(Math.random() * itemsInStock.length)];
    
            // Fallback: If EVERYTHING is out of stock (shouldn't happen), use the winning item
            const distractorName = randomDistractor ? randomDistractor.name : selectedItem.name;
    
            grid.push(distractorName);
        }
        gameState.gridData = grid.sort(() => Math.random() - 0.5);

        // Render HTML
        const container = document.getElementById("grid-container");
        container.innerHTML = '';
        gameState.gridData.forEach((itemName, idx) => {
            const div = document.createElement("div");
            div.className = "grid-card";
            div.id = `card-${idx}`;
            div.innerText = itemName;
            div.classList.add("tile-colour-" + Math.floor(Math.random() * 3))
            container.appendChild(div);
        });

        initCanvas();
    }

    function initCanvas() {
        const canvas = document.getElementById("overlay-canvas");
        const ctx = canvas.getContext("2d");
        const wrapper = document.querySelector(".scratch-wrapper");
        
        // Match resolution to CSS size
        const rect = wrapper.getBoundingClientRect();
        canvas.width = rect.width; 
        canvas.height = rect.height;

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#b2bec3"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#636e72";
        ctx.font = `bold ${canvas.width / 16}px Arial`; 
        ctx.textAlign = "center";
        ctx.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2);

        let isDrawing = false;

        function getMousePos(evt) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            // Handle Touch vs Mouse
            let clientX, clientY;
            if (evt.touches && evt.touches.length > 0) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else if (evt.changedTouches && evt.changedTouches.length > 0) {
                 // Fallback for touchend
                clientX = evt.changedTouches[0].clientX;
                clientY = evt.changedTouches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }

            return { 
                x: (clientX - rect.left) * scaleX, 
                y: (clientY - rect.top) * scaleY 
            };
        }

        function scratch(x, y) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            const brushSize = canvas.width / 7;
            ctx.arc(x, y, brushSize, 0, Math.PI * 2); 
            ctx.fill();
            if(!gameState.matchConfirmed && Math.random() > 0.1) checkGridReveal(ctx);
        }

        // --- MOUSE EVENTS ---
        canvas.addEventListener("mousedown", (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        });
        window.addEventListener("mouseup", () => isDrawing = false);
        canvas.addEventListener("mousemove", (e) => {
            if(isDrawing) {
                const pos = getMousePos(e);
                scratch(pos.x, pos.y);
            }
        });

        // --- TOUCH EVENTS (The Fix) ---
        // { passive: false } is required to allow preventDefault()
        canvas.addEventListener("touchstart", (e) => {
            isDrawing = true;
            e.preventDefault(); // Stop scrolling
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        }, { passive: false });

        window.addEventListener("touchend", () => isDrawing = false);

        canvas.addEventListener("touchmove", (e) => {
            if(isDrawing) {
                e.preventDefault(); // Stop scrolling
                const pos = getMousePos(e);
                scratch(pos.x, pos.y);
            }
        }, { passive: false });
    }

    function checkGridReveal(ctx) {
        const canvasWidth = ctx.canvas.width;
        const cardSize = canvasWidth / 4; 
        const checkOffset = cardSize / 2;
        
        gameState.gridData.forEach((item, index) => {
            if (gameState.revealedIndices.includes(index)) return;
            
            const col = index % 4;
            const row = Math.floor(index / 4);
            
            const x = Math.floor((col * cardSize) + checkOffset);
            const y = Math.floor((row * cardSize) + checkOffset);
            
            if (x >= canvasWidth || y >= ctx.canvas.height) return;

            const pixel = ctx.getImageData(x, y, 1, 1).data;
            if (pixel[3] === 0) {
                gameState.revealedIndices.push(index);
                document.getElementById(`card-${index}`).classList.add("revealed");
                checkForWin();
            }
        });
    }

    function checkForWin() {
        let counts = {};
        gameState.revealedIndices.forEach(index => {
            const itemName = gameState.gridData[index];
            counts[itemName] = (counts[itemName] || 0) + 1;
            
            if (counts[itemName] === 3) {
                triggerMatchFound(itemName);
            }
        });
    }

    function triggerMatchFound(foundName) {
        document.getElementById("found").play();
        if (gameState.matchConfirmed) return;
        gameState.matchConfirmed = true;

        const intendedName = gameState.winningItem.name;

        if (foundName !== intendedName) {
            const intendedItemObj = inventory.find(i => i.name === intendedName);
            if(intendedItemObj) intendedItemObj.qty++;

            const foundItemObj = inventory.find(i => i.name === foundName);
            if(foundItemObj) {
                foundItemObj.qty--;
                gameState.winningItem = foundItemObj;
            } else {
                gameState.winningItem = { name: foundName, qty: 0 }; 
            }
            saveData();
        }

        gameState.gridData.forEach((name, idx) => {
            if(name === foundName) document.getElementById(`card-${idx}`).classList.add("winner-card");
        });

        itemHistory.push({ time: new Date().toLocaleTimeString(), name: foundName, qty: 1 });
        saveData();

        document.getElementById("found-item-name").innerText = foundName;
        
        const btn = document.getElementById("keep-btn");
        btn.classList.remove("btn-style-blue", "btn-style-yellow");
        btn.classList.add(Math.random() < 0.5 ? "btn-style-blue" : "btn-style-yellow");

        document.getElementById("decision-area").classList.remove("hidden");
    }

    document.getElementById("keep-btn").addEventListener("click", () => {
        initRound();
    });

    // --- 4. ADMIN & MENUS ---
    const gearBtn = document.getElementById("admin-gear");
    const adminMenu = document.getElementById("admin-menu");
    
    gearBtn.addEventListener("click", () => {
        adminMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!adminMenu.contains(e.target) && e.target !== gearBtn) {
            adminMenu.classList.add("hidden");
        }
    });

    const historyModal = document.getElementById("history-modal");
    document.getElementById("view-hist-btn").addEventListener("click", () => {
        const body = document.getElementById("live-history-body");
        body.innerHTML = itemHistory.map(h => `<tr><td>${h.time}</td><td>${h.name}</td></tr>`).join('');
        historyModal.classList.remove("hidden");
        adminMenu.classList.add("hidden");
    });

    document.querySelector(".close-modal").addEventListener("click", () => {
        historyModal.classList.add("hidden");
    });

    document.getElementById("exit-btn").addEventListener("click", () => {
        if(confirm("Download report and end session?")) {
            exportReport(itemHistory, inventory, "FunORama_Final.csv");
            //clearData();
            //setTimeout(() => location.reload(), 1000);
        }
    });

    document.getElementById("clear-data-btn").addEventListener("click", () => {
        if(confirm("Clear all local saved data? This cannot be undone.")) {
            clearData();
            alert("Data cleared.");
            location.reload();
        }
    });

    function exportReport(hist, inv, filename) {
        let csv = "--- SESSION LOG ---\nTime,Item Won,Quantity\n";
        hist.forEach(h => csv += `${h.time},${h.name},${h.qty}\n`);
        csv += "\n--- ENDING INVENTORY ---\nitem name,qty,probability\n";
        inv.forEach(i => csv += `${i.name},${i.qty},${i.prob}\n`);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
});
