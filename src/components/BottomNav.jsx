import { useNavigate, useLocation } from "react-router-dom";
import { Heart, MessageSquare, ShoppingBag } from "lucide-react";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Heart, label: "Matches" },
    { path: "/chats", icon: MessageSquare, label: "Chats" },
    { path: "/market", icon: ShoppingBag, label: "Market" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-primary/20 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? "text-primary shadow-neon-blue" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "animate-neon-pulse" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
