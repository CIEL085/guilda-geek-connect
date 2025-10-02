import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";

export const ProfileCard = ({ profile, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const offset = currentX - startX;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      const direction = dragOffset > 0 ? "right" : "left";
      animateSwipe(direction);
    } else {
      // Animate back to center
      setDragOffset(0);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const animateSwipe = (direction) => {
    const targetX = direction === "right" ? 400 : -400;
    setDragOffset(targetX);
    
    setTimeout(() => {
      onSwipe(direction);
      setDragOffset(0);
    }, 300);
  };

  const getRotation = () => {
    const maxRotation = 15;
    const rotation = (dragOffset / 200) * maxRotation;
    return Math.max(-maxRotation, Math.min(maxRotation, rotation));
  };

  const getOpacity = (type) => {
    if (type === "like") {
      return Math.max(0, dragOffset / 100);
    } else {
      return Math.max(0, -dragOffset / 100);
    }
  };
  return (
    <Card 
      ref={cardRef}
      className="relative w-full aspect-[3/4] overflow-hidden shadow-card hover:shadow-intense transition-all duration-300 cursor-pointer group select-none"
      style={{
        transform: `translateX(${dragOffset}px) rotate(${getRotation()}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${profile.image})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Swipe Indicators */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div 
          className="w-20 h-20 rounded-full bg-destructive/20 backdrop-blur-sm border-4 border-destructive flex items-center justify-center transition-opacity"
          style={{ opacity: getOpacity("pass") }}
        >
          <span className="text-destructive font-bold text-2xl">✕</span>
        </div>
        <div 
          className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border-4 border-primary flex items-center justify-center transition-opacity"
          style={{ opacity: getOpacity("like") }}
        >
          <span className="text-primary font-bold text-2xl">♥</span>
        </div>
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

      {/* Hover Indicators (original) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-destructive/20 backdrop-blur-sm border border-destructive/30 flex items-center justify-center">
          <span className="text-destructive font-bold">✕</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
          <span className="text-primary font-bold">♥</span>
        </div>
      </div>
    </Card>
  );
};