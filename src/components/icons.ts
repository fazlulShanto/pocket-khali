import { 
  Utensils, 
  Car, 
  Home, 
  Zap, 
  Gamepad2, 
  ShoppingCart, 
  HeartPulse, 
  BookOpen, 
  User, 
  Package,
  Coffee,
  Plane,
  Train,
  Smartphone,
  Wifi,
  Baby,
  Briefcase,
  Camera,
  Film,
  Music,
  Scissors,
  Shirt,
  Map,
  Dumbbell,
  Gift,
  MoreHorizontal,
  Circle,
  Bus,
  Bike
} from "lucide-react"

export const Icons = {
  Utensils,
  Car,
  Home,
  Zap,
  Gamepad2,
  ShoppingCart,
  HeartPulse,
  BookOpen,
  User,
  Package,
  Coffee,
  Plane,
  Train,
  Smartphone,
  Wifi,
  Baby,
  Briefcase,
  Camera,
  Film,
  Music,
  Scissors,
  Shirt,
  Map,
  Dumbbell,
  Gift,
  MoreHorizontal,
  Circle,
  Bus,
  Bike
}

export type IconName = keyof typeof Icons

export const getIcon = (iconName: string | undefined | null) => {
  if (!iconName) return Icons.Circle;
  
  if (Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons];
  }
  
  // Convert kebab-case to PascalCase (gamepad-2 -> Gamepad2)
  const pascalCaseName = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
    
  if (Icons[pascalCaseName as keyof typeof Icons]) {
    return Icons[pascalCaseName as keyof typeof Icons];
  }
  
  // Also try just uppercase first letter
  const capitalName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (Icons[capitalName as keyof typeof Icons]) {
    return Icons[capitalName as keyof typeof Icons];
  }

  return Icons.Circle;
}
