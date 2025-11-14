// Mock profiles with Brazilian names and AI-generated images
import profileWoman1 from '@/assets/profile-woman-1.jpg';
import profileWoman2 from '@/assets/profile-woman-2.jpg';
import profileWoman3 from '@/assets/profile-woman-3.jpg';
import profileMan1 from '@/assets/profile-man-1.jpg';
import profileMan2 from '@/assets/profile-man-2.jpg';
import profileMan3 from '@/assets/profile-man-3.jpg';

export const MOCK_PROFILES = [
  {
    id: 1,
    name: "Beatriz Silva",
    age: 25,
    gender: "women",
    city: "São Paulo, SP",
    latitude: -23.5505,
    longitude: -46.6333,
    ageMin: 23,
    ageMax: 35,
    maxDistance: 30,
    image: profileWoman1,
    interests: ["#onepiece", "#naruto", "#gaming", "#cosplay", "#anime"]
  },
  {
    id: 2,
    name: "Rafael Costa",
    age: 28,
    gender: "men",
    city: "Rio de Janeiro, RJ",
    latitude: -22.9068,
    longitude: -43.1729,
    ageMin: 24,
    ageMax: 32,
    maxDistance: 50,
    image: profileMan1,
    interests: ["#dragonball", "#pokemon", "#manga", "#gaming", "#jrpg"]
  },
  {
    id: 3,
    name: "Camila Santos",
    age: 22,
    gender: "women",
    city: "Belo Horizonte, MG",
    latitude: -19.9167,
    longitude: -43.9345,
    ageMin: 20,
    ageMax: 28,
    maxDistance: 40,
    image: profileWoman2,
    interests: ["#sailormoon", "#studioghibli", "#jrpg", "#kawaii", "#manga"]
  },
  {
    id: 4,
    name: "Lucas Oliveira",
    age: 32,
    gender: "men",
    city: "Curitiba, PR",
    latitude: -25.4284,
    longitude: -49.2733,
    ageMin: 25,
    ageMax: 38,
    maxDistance: 60,
    image: profileMan2,
    interests: ["#finalfantasy", "#zelda", "#nintendo", "#rpg", "#gaming"]
  },
  {
    id: 5,
    name: "Juliana Ferreira",
    age: 27,
    gender: "women",
    city: "Porto Alegre, RS",
    latitude: -30.0346,
    longitude: -51.2177,
    ageMin: 24,
    ageMax: 34,
    maxDistance: 45,
    image: profileWoman3,
    interests: ["#pokemon", "#attackontitan", "#anime", "#cosplay", "#convention"]
  },
  {
    id: 6,
    name: "Thiago Souza",
    age: 26,
    gender: "men",
    city: "Brasília, DF",
    latitude: -15.8267,
    longitude: -47.9218,
    ageMin: 22,
    ageMax: 30,
    maxDistance: 35,
    image: profileMan3,
    interests: ["#demonslayer", "#naruto", "#manga", "#gaming", "#anime"]
  },
  {
    id: 7,
    name: "Amanda Rodrigues",
    age: 24,
    gender: "women",
    city: "Recife, PE",
    latitude: -8.0476,
    longitude: -34.8770,
    ageMin: 21,
    ageMax: 29,
    maxDistance: 50,
    image: profileWoman1,
    interests: ["#onepiece", "#gaming", "#cosplay", "#otaku", "#anime"]
  },
  {
    id: 8,
    name: "Felipe Almeida",
    age: 30,
    gender: "men",
    city: "Salvador, BA",
    latitude: -12.9714,
    longitude: -38.5014,
    ageMin: 26,
    ageMax: 35,
    maxDistance: 55,
    image: profileMan1,
    interests: ["#dragonball", "#naruto", "#gaming", "#manga", "#convention"]
  },
  {
    id: 9,
    name: "Larissa Pereira",
    age: 23,
    gender: "women",
    city: "Fortaleza, CE",
    latitude: -3.7172,
    longitude: -38.5433,
    ageMin: 20,
    ageMax: 27,
    maxDistance: 40,
    image: profileWoman2,
    interests: ["#sailormoon", "#kawaii", "#anime", "#manga", "#otaku"]
  },
  {
    id: 10,
    name: "Bruno Carvalho",
    age: 29,
    gender: "men",
    city: "Manaus, AM",
    latitude: -3.1190,
    longitude: -60.0217,
    ageMin: 25,
    ageMax: 33,
    maxDistance: 70,
    image: profileMan2,
    interests: ["#pokemon", "#zelda", "#gaming", "#nintendo", "#rpg"]
  }
];

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Filter profiles based on mutual matching preferences
export const filterProfilesByPreferences = (profiles, currentUser, userPreferences) => {
  if (!currentUser || !userPreferences) return profiles;

  return profiles.filter(profile => {
    // Check if user is interested in profile's gender
    const genderMatch = 
      userPreferences.genderPreference === 'everyone' ||
      userPreferences.genderPreference === profile.gender;
    
    if (!genderMatch) return false;

    // Check age intersection - both users must be in each other's age range
    const userAge = currentUser.age || 25; // default age if not set
    const userInProfileRange = userAge >= profile.ageMin && userAge <= profile.ageMax;
    const profileInUserRange = profile.age >= (userPreferences.ageMin || 18) && 
                                profile.age <= (userPreferences.ageMax || 75);
    
    if (!userInProfileRange || !profileInUserRange) return false;

    // Check distance intersection - both users must be within each other's max distance
    if (currentUser.latitude && currentUser.longitude && 
        profile.latitude && profile.longitude) {
      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        profile.latitude,
        profile.longitude
      );
      
      const userMaxDistance = userPreferences.maxDistance || 50;
      const withinUserDistance = distance <= userMaxDistance;
      const withinProfileDistance = distance <= profile.maxDistance;
      
      if (!withinUserDistance || !withinProfileDistance) return false;
    }

    return true;
  });
};