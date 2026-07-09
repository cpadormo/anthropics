import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  FolderKanban,
  FileText,
  Briefcase,
  Sparkle,
  Users2,
  BadgeCheck,
  Trophy,
  FileBadge,
  Sparkles,
  Clock,
  Target,
  ImageIcon,
  Mail,
  Home,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section?: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, section: "Overview" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { href: "/about", label: "About", icon: Sparkles, section: "Overview" },
  { href: "/timeline", label: "Timeline", icon: Clock, section: "Overview" },

  { href: "/coursework", label: "Coursework", icon: BookOpen, section: "Academics" },
  { href: "/research", label: "Research", icon: FlaskConical, section: "Academics" },
  { href: "/projects", label: "Projects", icon: FolderKanban, section: "Academics" },
  { href: "/writing", label: "Writing", icon: FileText, section: "Academics" },

  { href: "/work", label: "Work Experience", icon: Briefcase, section: "Professional" },
  { href: "/internships", label: "Internships / Professional Work", icon: Briefcase, section: "Professional" },
  { href: "/extracurriculars", label: "Extracurriculars", icon: Sparkle, section: "Professional" },
  { href: "/leadership", label: "Leadership", icon: Users2, section: "Professional" },

  { href: "/certifications", label: "Certifications", icon: BadgeCheck, section: "Credentials" },
  { href: "/awards", label: "Awards", icon: Trophy, section: "Credentials" },

  { href: "/skills", label: "Skills", icon: Sparkles, section: "Profile" },
  { href: "/goals", label: "Goals", icon: Target, section: "Profile" },
  { href: "/gallery", label: "Gallery", icon: ImageIcon, section: "Profile" },
  { href: "/resume", label: "Resume", icon: FileBadge, section: "Profile" },
  { href: "/contact", label: "Contact", icon: Mail, section: "Profile" },

  { href: "/admin", label: "Admin", icon: ShieldCheck, section: "Manage" },
];

export const groupedNav = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
  const section = item.section ?? "More";
  acc[section] = acc[section] ?? [];
  acc[section].push(item);
  return acc;
}, {});
