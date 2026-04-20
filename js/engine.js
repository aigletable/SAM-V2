let currentSceneIndex = 0;
let isTyping = false;
let typeInterval;
let isInvestigating = false;

const dialogueText = document.getElementById('dialogue-text');
const speakerName = document.getElementById('speaker-name');
const sceneBackground = document.getElementById('scene-background');
const gameContainer = document.getElementById('game-container');
const characterSprite = document.getElementById('character-sprite');
const dialogueContainer = document.getElementById('dialogue-container');

// Elements Investigation
const investigationLayer = document.getElementById('investigation-layer');
const clueOverlay = document.getElementById('clue-overlay');
const clueImage = document.getElementById('clue-image');
const btnCloseClue = document.getElementById('btn-close-clue');
const finalChoicesContainer = document.getElementById('final-choices-container');
const answersGrid = document.getElementById('answers-grid');

// Affiche la scène actuelle
function showScene(index) {
    if (index >= storyData.length) return;
    const scene = storyData[index];
    
    // --- MODE INVESTIGATION ---
    if (scene.type === "investigation") {
        startInvestigation(scene);
        return;
    }
    
    // --- MODE DIALOGUE NORMAL ---
    dialogueContainer.classList.remove('hidden');
    isInvestigating = false;

    // Si la scène stipule un nouveau background
    if (scene.background) {
        sceneBackground.style.backgroundImage = `url('${scene.background}')`;
    }
    
    // Affiche ou masque le nom du personnage et son image
    if (scene.speaker) {
        speakerName.textContent = scene.speaker;
        speakerName.style.display = 'inline-block';
        
        if (scene.speaker === "SYSTÈME") {
            speakerName.style.background = "linear-gradient(90deg, #ff0055, #ffaa00)";
            characterSprite.classList.add('hidden');
        } else if (scene.speaker === "Sophie") {
            speakerName.style.background = "linear-gradient(90deg, #00ff88, #00b3ff)";
            characterSprite.style.backgroundImage = "url('img/char_sophie.png')";
            characterSprite.classList.remove('hidden');
        } else if (scene.speaker === "Alexandre") {
            speakerName.style.background = "linear-gradient(90deg, #00ff88, #00b3ff)";
            characterSprite.style.backgroundImage = "url('img/char_alexandre.png')";
            characterSprite.classList.remove('hidden');
        } else if (scene.speaker === "Lester") {
            speakerName.style.background = "linear-gradient(90deg, #ff8c00, #c40000)";
            characterSprite.style.backgroundImage = "url('img/char_lester.png')";
            characterSprite.classList.remove('hidden');
        } else if (scene.speaker === "Gérant") {
            speakerName.style.background = "linear-gradient(90deg, #d3c400, #8b6e00)";
            characterSprite.classList.add('hidden');
        } else {
            speakerName.style.background = "linear-gradient(90deg, #00ff88, #00b3ff)";
            characterSprite.classList.add('hidden');
        }
    } else {
        speakerName.style.display = 'none';
        characterSprite.classList.add('hidden');
    }
    
    // Lance l'effet machine à écrire
    typeWriter(scene.text);
}

// Fonction Démarrer Inspection Point&Click
function startInvestigation(scene) {
    isInvestigating = true;
    dialogueContainer.classList.add('hidden');
    
    if (scene.background) {
        sceneBackground.style.backgroundImage = `url('${scene.background}')`;
    }

    investigationLayer.innerHTML = '';
    investigationLayer.classList.remove('hidden');

    // Mappe les "Hotspots" (zones cliquables)
    scene.hotspots.forEach(hotspot => {
        const div = document.createElement('div');
        div.className = 'hotspot';
        div.style.left = hotspot.x;
        div.style.top = hotspot.y;
        div.style.width = hotspot.w;
        div.style.height = hotspot.h;
        
        div.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche l'évènement de propager au gameContainer
            if (hotspot.type === 'clue') {
                showClue(hotspot.image);
            } else if (hotspot.type === 'action') {
                showFinalChoices(hotspot.actionId);
            }
        });
        
        // C'est un indice visuel : les joueurs peuvent savoir que le Gérant est cliquable (l'action)
        if (hotspot.type === 'action') {
            div.title = "Faire face au gérant";
        }

        investigationLayer.appendChild(div);
    });
}

function showClue(imgSrc) {
    clueImage.src = imgSrc;
    clueOverlay.classList.remove('hidden');
}

btnCloseClue.addEventListener('click', (e) => {
    e.stopPropagation();
    clueOverlay.classList.add('hidden');
});

function showFinalChoices(actionId) {
    investigationLayer.classList.add('hidden');
    finalChoicesContainer.classList.remove('hidden');
    answersGrid.innerHTML = '';
    
    const choices = [
        { text: "A — 1 650 GTA$", result: "❌ GAME OVER\nVous aviez oublié la commission. Vous repartez avec 990 GTA$ en vrai. Le braquage est annulé." },
        { text: "B — 1 803,75 GTA$", result: "✅ BONNE RÉPONSE\nLe vrai taux est 1,3 et la commission de 7,5%. Vous récupérez 1803 GTA$ réels. Bien joué !" },
        { text: "C — 1 425 GTA$", result: "🔍 ERREUR\nVous avez utilisé le faux taux du vendeur ! Lester intervient et vous donne 2 min pour recalculer." },
        { text: "D — 1 950 GTA$", result: "⚠️ PRESQUE\nBon taux, mais vous n'avez pas retiré les 7.5% de frais de change. Résultat, il vous manque 146 GTA$." }
    ];
    
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert(choice.result); 
            // C'est ici que l'on déclenchera l'Acte 2 ou les répercussions budgétaires plus tard
        });
        answersGrid.appendChild(btn);
    });
}

// Effet d'écriture caractère par caractère
function typeWriter(text) {
    clearInterval(typeInterval);
    isTyping = true;
    dialogueText.textContent = '';
    let i = 0;
    
    typeInterval = setInterval(() => {
        if (i < text.length) {
            dialogueText.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            isTyping = false;
        }
    }, 25);
}

function completeTyping() {
    clearInterval(typeInterval);
    dialogueText.textContent = storyData[currentSceneIndex].text;
    isTyping = false;
}

// Clic pour passer au suivant
gameContainer.addEventListener('click', () => {
    // Bloqué si on est en enquête, ou si un popup est affiché
    if (isInvestigating) return;
    if (!clueOverlay.classList.contains('hidden')) return;

    if (isTyping) {
        completeTyping();
    } else {
        currentSceneIndex++;
        if (currentSceneIndex < storyData.length) {
            showScene(currentSceneIndex);
        } else {
            // S'il n'y a plus de scènes : 
        }
    }
});

// Éléments du menu
const mainMenu = document.getElementById('main-menu');
const btnStart = document.getElementById('btn-start');

// Lancement de la partie depuis le menu
btnStart.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    showScene(currentSceneIndex);
});
