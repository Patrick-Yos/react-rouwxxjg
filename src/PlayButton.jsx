import { useGameEngine } from './useGameEngine';
import { Play, Lock, Skull } from 'lucide-react';
import { Anima } from './animation';

export const PlayButton = () => {
  const { user } = useAuth();
  const { characters, selectCharacter } = useGameEngine();
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => document.getElementById('login-overlay')?.classList.remove('hidden')}
          className="group px-8 py-4 bg-[#2a0f0f] border-4 border-[#5a2e2e] hover:bg-red-900 hover:border-red-500 
                     transition-all flex items-center gap-4 shadow-2xl"
        >
          <Lock className="w-6 h-6 text-red-500 group-hover:text-white" />
          <div>
            <div className="font-tech text-xs text-red-400">INQUISITORIAL CLEARANCE REQUIRED</div>
            <div className="font-gothic font-bold text-[#c5a059] group-hover:text-white">
              AUTHENTICATE IDENT
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (characters.length === 0) {
            // No characters: prompt creation
            Anima.notify('CREATE A CHARACTER TO PROCEED', 'warning');
          } else {
            setShowCharacterSelect(true);
          }
        }}
        className="group px-8 py-4 bg-[#0a0a0a] border-4 border-[#c5a059] hover:bg-[#c5a059] hover:text-black 
                   transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(197,160,89,0.3)]"
      >
        <Play className="w-6 h-6 text-[#c5a059] group-hover:text-black" />
        <div>
          <div className="font-tech text-xs text-[#c5a059] group-hover:text-black">
            INQUISITION PROTOCOL
          </div>
          <div className="font-gothic font-black text-xl group-hover:text-black">
            ENGAGE WAR ROOM
          </div>
        </div>
      </button>

      {/* Character Selection Modal */}
      {showCharacterSelect && (
        <div className="absolute top-full mt-4 w-96 bg-[#111] border-2 border-[#c5a059] p-4 shadow-2xl z-50">
          <div className="font-gothic font-bold text-[#c5a059] mb-3 flex items-center gap-2">
            <Skull className="w-4 h-4" /> SELECT OPERATIVE
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => {
                  selectCharacter(char);
                  setShowCharacterSelect(false);
                  Anima.notify(`CHARACTER LOADED: ${char.name}`, 'success');
                }}
                className="w-full p-3 text-left bg-[#222] border border-[#444] hover:border-[#c5a059] 
                           hover:bg-[#333] transition-all font-tech text-sm"
              >
                <div className="text-[#c5a059] font-bold">{char.name}</div>
                <div className="text-zinc-400 text-xs">{char.archetype} • {char.career}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

};

