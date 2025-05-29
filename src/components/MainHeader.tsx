import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WasselLogo from "@/components/ui/logo";
import { Search, Globe, LogOut, ChevronDown } from "lucide-react";

interface MainHeaderProps {
  onLogout?: () => void;
}

export default function MainHeader({ onLogout }: MainHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Mock user data - in real app this would come from auth context
  const user = {
    name: "Dana Friani",
    company: "Mada Company",
    avatar: "", // Could be a real avatar URL
    initials: "DF",
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇵🇸" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality here
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // Implement language change logic here
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 h-[98px]">
        {/* Left Section - Logo */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex flex-col items-center gap-2.5">
            <WasselLogo height={27} width={172} />
            <div className="text-sm">
              <div className="readex-pro font-medium">
                Parcel Management Portal
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 flex-shrink-0 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <Button
                type="button"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-none border-0"
              >
                Track
              </Button>
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-l-none rounded-r-md border-0 bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </form>
        </div>

        {/* Right Section - User Info & Controls */}
        <div className="flex-1 flex items-center justify-between gap-20">
          {/* User Avatar and Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-[98px] w-[98px] border-2 border-white rounded-none">
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                className="rounded-none"
              />
              <AvatarFallback className="bg-white text-black font-medium rounded-none">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="font-medium text-xl whitespace-nowrap">
                {user.name}
              </div>
              <div className="text-xl text-blue-100 whitespace-nowrap">
                {user.company}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-1">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{selectedLanguage}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.name)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant="ghost"
              className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
