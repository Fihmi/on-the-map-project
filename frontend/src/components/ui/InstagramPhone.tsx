import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Home, Search, Clapperboard, User } from 'lucide-react';

interface InstagramPhoneProps {
  username: string;
  location: string;
  imageUrl: string;
  likes: number;
  caption: string;
  avatarUrl?: string;
  delay?: string;
}

export const InstagramPhone = ({ 
  username, 
  location, 
  imageUrl, 
  likes, 
  caption,
  avatarUrl = "https://ui-avatars.com/api/?name=TN&background=0066cc&color=fff",
  delay = "0s"
}: InstagramPhoneProps) => {
  return (
    <div 
      className={`relative w-[300px] h-[600px] bg-white rounded-[40px] border-[14px] border-slate-900 shadow-2xl overflow-hidden animate-float`}
      style={{ animationDelay: delay }}
    >
      {/* Phone Notch */}
      <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-20"></div>

      {/* Instagram App UI */}
      <div className="h-full flex flex-col bg-white pt-6 text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">{username}</span>
              <span className="text-xs text-gray-500 leading-tight">{location}</span>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-800" />
        </div>

        {/* Post Image */}
        <div className="w-full h-[300px] bg-gray-100">
          <img src={imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>

        {/* Action Bar */}
        <div className="px-3 py-3 flex justify-between items-center">
          <div className="flex gap-4">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <MessageCircle className="w-6 h-6 text-gray-800" />
            <Send className="w-6 h-6 text-gray-800" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-800" />
        </div>

        {/* Likes & Caption */}
        <div className="px-3 pb-3 flex-1">
          <p className="text-sm font-bold mb-1">{likes.toLocaleString()} likes</p>
          <p className="text-sm">
            <span className="font-bold mr-2">{username}</span>
            {caption}
          </p>
          <p className="text-xs text-gray-400 mt-2">2 HOURS AGO</p>
        </div>

        {/* Bottom Nav */}
        <div className="flex justify-around items-center p-3 border-t border-gray-100 bg-white pb-6">
          <Home className="w-6 h-6 text-gray-900" />
          <Search className="w-6 h-6 text-gray-500" />
          <Clapperboard className="w-6 h-6 text-gray-500" />
          <User className="w-6 h-6 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
