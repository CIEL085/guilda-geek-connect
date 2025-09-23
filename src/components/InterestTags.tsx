import { Badge } from "@/components/ui/badge";

const popularInterests = [
  "#onepiece", "#naruto", "#dragonball", "#attackontitan", "#demonslayer",
  "#myheroacademia", "#jujutsukaisen", "#chainsawman", "#pokemon", "#digimon",
  "#sailormoon", "#cardcaptorsakura", "#fullmetalalchemist", "#deathnote",
  "#tokyoghoul", "#mobpsycho100", "#onepunchman", "#hunterxhunter",
  "#bleach", "#fairytail", "#sevendeadlysins", "#thepromisedneverland",
  "#gaming", "#cosplay", "#manga", "#anime", "#otaku", "#kawaii",
  "#jrpg", "#visualnovel", "#mmorpg", "#nintendo", "#playstation",
  "#studioghibli", "#kyotoanimation", "#mappa", "#toeianimation",
  "#shonen", "#shoujo", "#seinen", "#josei", "#isekai", "#mecha"
];

interface InterestTagsProps {
  selectedTags: string[];
  onTagToggle?: (tag: string) => void;
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
}

export const InterestTags = ({ selectedTags, onTagToggle, onTagsChange, maxTags = 10 }: InterestTagsProps) => {
  const isSelected = (tag: string) => selectedTags.includes(tag);
  const canSelect = selectedTags.length < maxTags;

  const handleTagClick = (tag: string) => {
    const selected = isSelected(tag);
    const canToggle = selected || canSelect;
    
    if (canToggle) {
      const newTags = selected 
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag];
      
      onTagToggle?.(tag);
      onTagsChange?.(newTags);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Escolha seus interesses</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Selecione até {maxTags} hashtags que representam você
        </p>
        <div className="text-sm text-primary font-medium">
          {selectedTags.length}/{maxTags} selecionados
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2">
        {popularInterests.map((tag) => {
          const selected = isSelected(tag);
          const disabled = !selected && !canSelect;
          
          return (
            <Badge
              key={tag}
              variant={selected ? "default" : "outline"}
              className={`
                cursor-pointer transition-all duration-200 text-xs px-3 py-1
                ${selected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow scale-105" 
                  : disabled 
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary hover:text-primary hover:scale-105"
                }
              `}
              onClick={() => {
                if (!disabled || selected) {
                  handleTagClick(tag);
                }
              }}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};