import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  interests: string[];
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
}

export const ProfileCard = ({ profile, onSwipe }: ProfileCardProps) => {
  return (
    <Card className="relative w-full aspect-[3/4] overflow-hidden shadow-card hover:shadow-intense transition-all duration-300 cursor-pointer group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${profile.image})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-3">
          <h3 className="text-2xl font-bold mb-1">
            {profile.name}, {profile.age}
          </h3>
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/20 text-white border-primary/30 hover:bg-primary/30 transition-colors"
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      {/* Swipe Indicators */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="w-12 h-12 rounded-full bg-destructive/20 backdrop-blur-sm border border-destructive/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-destructive font-bold">✕</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-primary font-bold">♥</span>
        </div>
      </div>
    </Card>
  );
};