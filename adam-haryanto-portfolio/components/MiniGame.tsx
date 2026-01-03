import React, { useRef, useEffect, useState } from 'react';
import { X, ArrowRight, ArrowUp, ArrowDown, ArrowLeft, Gamepad2, MousePointer2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { PROJECTS, EXPERIENCES, SKILL_CATEGORIES } from '../constants';
import Button from './Button';

interface MiniGameProps {
  onClose: () => void;
}

// Physics Constants for Top-Down
const MOVEMENT_SPEED = 0.8; 
const MAX_SPEED = 6;
const FRICTION = 0.85; 
const PLAYER_SIZE = 40;

interface GameObject {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'wall' | 'decoration' | 'interactive' | 'floor-tile';
  color?: string;
  text?: string;
  subText?: string;
  data?: any;
  image?: HTMLImageElement;
  zIndex?: number; // Simple depth sorting
}

const MiniGame: React.FC<MiniGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [showInteractPrompt, setShowInteractPrompt] = useState(false);
  
  const player = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facingRight: true
  });
  
  const camera = useRef({ x: 0, y: 0 });
  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>(0);
  const worldRef = useRef<GameObject[]>([]);
  const interactableRef = useRef<GameObject | null>(null);

  // Initialize Level
  useEffect(() => {
    const world: GameObject[] = [];
    let currentX = 0;
    const VIEWPORT_HEIGHT = 800; // Conceptual height of the walkable world
    const CENTER_Y = VIEWPORT_HEIGHT / 2;

    // Helper to add floor sections
    const addSection = (width: number, color: string) => {
      world.push({ 
        x: currentX, 
        y: -200, // Extend way up
        w: width, 
        h: VIEWPORT_HEIGHT + 400, // Extend way down
        type: 'ground', 
        color: color,
        zIndex: 0
      });
    };

    // 1. Start Area
    const startWidth = 1000;
    addSection(startWidth, '#2D2D2D');
    world.push({ x: 200, y: CENTER_Y - 100, w: 0, h: 0, type: 'decoration', text: "WELCOME", subText: "Arrow Keys / WASD to Move", color: '#FFF8E7', zIndex: 10 });
    
    // Set Player Start
    player.current.x = 200;
    player.current.y = CENTER_Y;

    currentX += startWidth;

    // 2. About Area
    const aboutWidth = 1200;
    addSection(aboutWidth, '#F47D3F');
    world.push({ x: currentX + 100, y: CENTER_Y - 150, w: 0, h: 0, type: 'decoration', text: "ABOUT ME", color: '#2D2D2D', zIndex: 10 });
    world.push({ x: currentX + 100, y: CENTER_Y - 120, w: 0, h: 0, type: 'decoration', subText: "Game Developer & Technical Artist", color: '#2D2D2D', zIndex: 10 });
    
    // Decorative "Desk"
    world.push({ x: currentX + 100, y: CENTER_Y, w: 200, h: 100, type: 'wall', color: '#2D2D2D', zIndex: 5 });
    world.push({ x: currentX + 120, y: CENTER_Y + 20, w: 160, h: 60, type: 'decoration', color: '#FFF', zIndex: 6 }); // Paper

    currentX += aboutWidth;

    // 3. Projects Area
    const projectSpacing = 600;
    const projectSectionWidth = 400 + (PROJECTS.length * projectSpacing);
    addSection(projectSectionWidth, '#48A9C5');
    world.push({ x: currentX + 50, y: CENTER_Y - 250, w: 0, h: 0, type: 'decoration', text: "PROJECTS", subText: "Walk close & Press 'E'", color: '#2D2D2D', zIndex: 10 });

    PROJECTS.forEach((proj, idx) => {
        const projX = currentX + 300 + (idx * projectSpacing);
        // Stagger Y positions for visual interest
        const projY = CENTER_Y + (idx % 2 === 0 ? -50 : 50); 
        
        // Pedestal Shadow/Base
        world.push({ x: projX - 10, y: projY + 80, w: 140, h: 40, type: 'decoration', color: 'rgba(0,0,0,0.2)', zIndex: 1 });

        const img = new Image();
        img.src = proj.image;
        
        world.push({ 
          x: projX, 
          y: projY, 
          w: 120, 
          h: 120, 
          type: 'interactive', 
          color: '#FFFFFF',
          data: { type: 'project', content: proj },
          image: img,
          subText: proj.title,
          zIndex: projY // Sort by Y
        });
    });
    currentX += projectSectionWidth;

    // 4. Skills Area
    const skillsWidth = 1500;
    addSection(skillsWidth, '#F8D15C');
    world.push({ x: currentX + 50, y: CENTER_Y - 300, w: 0, h: 0, type: 'decoration', text: "SKILLS", color: '#2D2D2D', zIndex: 10 });

    let skillX = currentX + 200;
    SKILL_CATEGORIES.forEach((cat, idx) => {
        // Category Title
        world.push({ x: skillX, y: CENTER_Y - 200, w: 0, h: 0, type: 'decoration', text: cat.title, color: '#2D2D2D', zIndex: 10 });
        
        // Tiles on floor
        cat.skills.slice(0, 4).forEach((skill, sIdx) => {
             const tileX = skillX + (sIdx % 2) * 160;
             const tileY = CENTER_Y - 100 + (Math.floor(sIdx / 2) * 100);
             
             world.push({ x: tileX, y: tileY, w: 140, h: 80, type: 'floor-tile', color: 'rgba(255,255,255,0.3)', zIndex: 1 });
             world.push({ x: tileX + 70, y: tileY + 45, w: 0, h: 0, type: 'decoration', subText: skill, color: '#2D2D2D', zIndex: 2 });
        });
        skillX += 450;
    });
    currentX += skillsWidth;

    // 5. Experience Area
    const expWidth = 400 + (EXPERIENCES.length * 500);
    addSection(expWidth, '#58B896');
    world.push({ x: currentX + 50, y: CENTER_Y - 250, w: 0, h: 0, type: 'decoration', text: "EXPERIENCE", color: '#2D2D2D', zIndex: 10 });

    EXPERIENCES.forEach((exp, idx) => {
        const expX = currentX + 300 + (idx * 500);
        const expY = CENTER_Y;

        // Flag Pole
        world.push({ x: expX, y: expY - 150, w: 10, h: 150, type: 'wall', color: '#2D2D2D', zIndex: expY });
        // Flag
        world.push({ x: expX + 10, y: expY - 150, w: 180, h: 80, type: 'decoration', color: '#FFF', zIndex: expY + 1 });
        // Text
        world.push({ x: expX + 20, y: expY - 110, w: 0, h: 0, type: 'decoration', subText: exp.company, color: '#2D2D2D', zIndex: expY + 2 });
        
        // Base
        world.push({ x: expX - 20, y: expY - 10, w: 50, h: 20, type: 'decoration', color: 'rgba(0,0,0,0.2)', zIndex: 0 });
    });
    currentX += expWidth;

    // End Area
    addSection(800, '#2D2D2D');
    world.push({ x: currentX + 300, y: CENTER_Y, w: 0, h: 0, type: 'decoration', text: "THANKS FOR PLAYING", color: '#FFF8E7', zIndex: 10 });

    worldRef.current = world;
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, [activeItem]);

  const handleKeyDown = (e: KeyboardEvent) => {
    keys.current[e.code] = true;
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    if ((e.code === 'KeyE' || e.code === 'Enter') && interactableRef.current && !activeItem) {
       setActiveItem(interactableRef.current.data);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keys.current[e.code] = false;
  };

  const gameLoop = () => {
    if (activeItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.offsetWidth) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    const p = player.current;

    // --- PHYSICS (Top Down) ---
    // Acceleration
    if (keys.current['ArrowRight'] || keys.current['KeyD']) p.vx += MOVEMENT_SPEED;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) p.vx -= MOVEMENT_SPEED;
    if (keys.current['ArrowUp'] || keys.current['KeyW']) p.vy -= MOVEMENT_SPEED;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) p.vy += MOVEMENT_SPEED;

    // Friction
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // Max Speed Cap
    const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (currentSpeed > MAX_SPEED) {
       const scale = MAX_SPEED / currentSpeed;
       p.vx *= scale;
       p.vy *= scale;
    }

    // Direction
    if (p.vx > 0.1) p.facingRight = true;
    if (p.vx < -0.1) p.facingRight = false;

    // Apply Velocity
    p.x += p.vx;
    p.y += p.vy;

    // --- INTERACTION CHECK ---
    let nearest: GameObject | null = null;
    let minDist = 160; 

    worldRef.current.forEach(obj => {
      if (obj.type === 'interactive') {
        const cx = obj.x + obj.w / 2;
        const cy = obj.y + obj.h / 2;
        const px = p.x + PLAYER_SIZE / 2;
        const py = p.y + PLAYER_SIZE / 2;
        const dist = Math.sqrt(Math.pow(cx - px, 2) + Math.pow(cy - py, 2));
        
        if (dist < minDist) {
          nearest = obj;
        }
      }
    });

    interactableRef.current = nearest;
    setShowInteractPrompt(!!nearest);

    // --- CAMERA ---
    // Smooth follow
    const targetCamX = p.x - canvas.width / 2 + PLAYER_SIZE / 2;
    const targetCamY = p.y - canvas.height / 2 + PLAYER_SIZE / 2;
    camera.current.x += (targetCamX - camera.current.x) * 0.1;
    camera.current.y += (targetCamY - camera.current.y) * 0.1;

    // --- RENDER ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill Void
    ctx.fillStyle = '#222'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.floor(camera.current.x), -Math.floor(camera.current.y));

    // Sort objects by Z-Index (or Y position if zIndex not set) for proper overlap
    // Note: This simple sort might be heavy for many objects every frame, 
    // but for this portfolio size it's negligible.
    const sortedWorld = [...worldRef.current].sort((a, b) => {
        const az = a.zIndex ?? a.y;
        const bz = b.zIndex ?? b.y;
        return az - bz;
    });

    // Draw Ground First (optimization)
    sortedWorld.filter(o => o.type === 'ground').forEach(obj => {
        ctx.fillStyle = obj.color || '#2D2D2D';
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    });

    // Draw Player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x + PLAYER_SIZE/2, p.y + PLAYER_SIZE - 5, PLAYER_SIZE/2, PLAYER_SIZE/4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw Objects & Player
    // We insert player into draw order based on Y
    let playerDrawn = false;
    
    sortedWorld.filter(o => o.type !== 'ground').forEach(obj => {
       // Check if we should draw player now
       if (!playerDrawn && (obj.zIndex || obj.y) > p.y + PLAYER_SIZE) {
          drawPlayer(ctx, p);
          playerDrawn = true;
       }

       if (obj.type === 'interactive') {
         // Border
         ctx.fillStyle = '#2D2D2D';
         ctx.fillRect(obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8);
         
         // Image
         if (obj.image && obj.image.complete) {
            try { ctx.drawImage(obj.image, obj.x, obj.y, obj.w, obj.h); } 
            catch { ctx.fillStyle = '#FFF'; ctx.fillRect(obj.x, obj.y, obj.w, obj.h); }
         } else {
            ctx.fillStyle = '#CCC'; ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
         }

         // Interaction Highlight
         if (nearest === obj) {
            ctx.strokeStyle = '#F47D3F';
            ctx.lineWidth = 4;
            ctx.strokeRect(obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8);
            
            // "E" Prompt
            ctx.fillStyle = '#F47D3F';
            ctx.beginPath();
            ctx.arc(obj.x + obj.w/2, obj.y - 40 + (Math.sin(Date.now() / 200) * 5), 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("E", obj.x + obj.w/2, obj.y - 32 + (Math.sin(Date.now() / 200) * 5));
         }

         if (obj.subText) {
            ctx.fillStyle = '#2D2D2D';
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(obj.subText, obj.x + obj.w / 2, obj.y + obj.h + 30);
         }
       } 
       else if (obj.type === 'floor-tile') {
           ctx.fillStyle = obj.color || '#FFF';
           ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
       }
       else if (obj.type === 'wall') {
           ctx.fillStyle = obj.color || '#000';
           ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
       }
       else if (obj.type === 'decoration') {
           if (obj.text) {
             ctx.fillStyle = obj.color || '#000';
             ctx.textAlign = 'left';
             ctx.font = '900 48px "Outfit", sans-serif';
             ctx.fillText(obj.text, obj.x, obj.y);
           } else if (obj.subText) {
             ctx.fillStyle = obj.color || '#000';
             // Check if it's a floor tile text (center it)
             if (sortedWorld.find(o => o.type === 'floor-tile' && Math.abs(o.x + 70 - obj.x) < 5 && Math.abs(o.y + 45 - obj.y) < 5)) {
                ctx.textAlign = 'center';
             } else {
                ctx.textAlign = 'left';
             }
             ctx.font = 'bold 16px "Outfit", sans-serif';
             ctx.fillText(obj.subText, obj.x, obj.y);
           } else {
             ctx.fillStyle = obj.color || '#000';
             ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
           }
       }
    });

    if (!playerDrawn) {
       drawPlayer(ctx, p);
    }

    ctx.restore();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: any) => {
    ctx.fillStyle = '#2D2D2D';
    ctx.fillRect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE);
    
    // Eyes
    ctx.fillStyle = 'white';
    // Eyes shift based on facing direction
    const eyeOffsetX = p.facingRight ? 20 : 5;
    const eyeOffsetY = p.vy > 0.5 ? 20 : 10; // Look down if moving down
    
    ctx.fillRect(p.x + eyeOffsetX, p.y + eyeOffsetY, 8, 8);
    ctx.fillRect(p.x + eyeOffsetX + 12, p.y + eyeOffsetY, 8, 8);
  };

  const closeModal = () => {
    setActiveItem(null);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleInteract = () => {
    if (interactableRef.current) {
      setActiveItem(interactableRef.current.data);
    }
  };

  const handleTouchStart = (key: string) => { keys.current[key] = true; };
  const handleTouchEnd = (key: string) => { keys.current[key] = false; };

  return (
    <div className="fixed inset-0 z-[60] bg-brand-dark flex flex-col items-center justify-center">
      
      {/* Header / HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
         <div className="bg-brand-dark/50 p-2 rounded backdrop-blur-sm border-2 border-brand-bg text-brand-bg">
            <h2 className="font-black text-xl">EXPLORER MODE</h2>
            <p className="text-xs font-mono opacity-80 hidden md:block">WASD / ARROWS to Move • E to Interact</p>
         </div>
         <button onClick={onClose} className="pointer-events-auto bg-brand-red text-white p-2 rounded-full border-2 border-white hover:scale-110 transition-transform">
            <X size={24} />
         </button>
      </div>

      {/* Interact Prompt (Mobile) */}
      {showInteractPrompt && !activeItem && (
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-6 py-2 rounded-full font-bold border-2 border-white animate-bounce z-20 pointer-events-none md:hidden">
            Tap Hand to View
         </div>
      )}

      {/* Canvas */}
      <div className="w-full h-full bg-brand-bg relative cursor-none">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Detail Modal */}
      {activeItem && activeItem.type === 'project' && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-brand-bg p-6 rounded-xl border-4 border-brand-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-retro">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-3xl font-black">{activeItem.content.title}</h3>
                    <span className="bg-brand-blue text-brand-dark px-2 py-1 rounded text-xs font-bold">{activeItem.content.category}</span>
                 </div>
                 <button onClick={closeModal} className="p-2 hover:bg-black/10 rounded-full">
                    <X size={24} />
                 </button>
              </div>
              
              <img src={activeItem.content.image} alt={activeItem.content.title} className="w-full h-48 object-cover rounded-lg border-2 border-brand-dark mb-4" />
              <p className="font-medium mb-4">{activeItem.content.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <span className="block text-xs font-bold opacity-50 uppercase">Role</span>
                    <span className="font-bold">{activeItem.content.role}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-bold opacity-50 uppercase">Engine</span>
                    <span className="font-bold">{activeItem.content.engine}</span>
                 </div>
              </div>

              {activeItem.content.status === 'WIP' ? (
                <Button fullWidth disabled className="bg-gray-400 border-gray-600 text-gray-700 cursor-not-allowed shadow-none opacity-80">
                   Work In Progress
                </Button>
              ) : (
                <a href={activeItem.content.link} target="_blank" rel="noreferrer">
                   <Button fullWidth>View Project</Button>
                </a>
              )}
           </div>
        </div>
      )}

      {/* Mobile Controls (D-PAD) */}
      <div className="absolute bottom-8 left-8 flex flex-col items-center gap-2 md:hidden pointer-events-auto select-none touch-none">
         <button 
             className="w-14 h-14 bg-white/20 backdrop-blur-md border-2 border-white rounded-lg flex items-center justify-center active:bg-white/40"
             onTouchStart={() => handleTouchStart('ArrowUp')}
             onTouchEnd={() => handleTouchEnd('ArrowUp')}
         ><ChevronUp size={32} className="text-brand-dark"/></button>
         <div className="flex gap-2">
            <button 
                className="w-14 h-14 bg-white/20 backdrop-blur-md border-2 border-white rounded-lg flex items-center justify-center active:bg-white/40"
                onTouchStart={() => handleTouchStart('ArrowLeft')}
                onTouchEnd={() => handleTouchEnd('ArrowLeft')}
            ><ChevronLeft size={32} className="text-brand-dark"/></button>
            <button 
                className="w-14 h-14 bg-white/20 backdrop-blur-md border-2 border-white rounded-lg flex items-center justify-center active:bg-white/40"
                onTouchStart={() => handleTouchStart('ArrowDown')}
                onTouchEnd={() => handleTouchEnd('ArrowDown')}
            ><ChevronDown size={32} className="text-brand-dark"/></button>
            <button 
                className="w-14 h-14 bg-white/20 backdrop-blur-md border-2 border-white rounded-lg flex items-center justify-center active:bg-white/40"
                onTouchStart={() => handleTouchStart('ArrowRight')}
                onTouchEnd={() => handleTouchEnd('ArrowRight')}
            ><ChevronRight size={32} className="text-brand-dark"/></button>
         </div>
      </div>
      
      {/* Mobile Action Button */}
      {showInteractPrompt && (
        <div className="absolute bottom-16 right-8 md:hidden pointer-events-auto">
            <button 
                onClick={handleInteract}
                className="w-20 h-20 bg-brand-green/90 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg animate-pulse"
            >
                <MousePointer2 size={36} className="text-brand-dark" />
            </button>
        </div>
      )}

    </div>
  );
};

export default MiniGame;