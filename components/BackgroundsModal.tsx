
import React, { useState, useEffect, useMemo } from 'react';
import { RoomBackground } from '../types';
import { BACKGROUND_CATEGORIES, BackgroundImage } from '../data/backgrounds';

interface BackgroundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetBackground: (bg: RoomBackground) => void;
  currentBackground?: RoomBackground;
}

export const BackgroundsModal: React.FC<BackgroundsModalProps> = ({ isOpen, onClose, onSetBackground, currentBackground }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userUploads, setUserUploads] = useState<BackgroundImage[]>([]);

  // Load uploads from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user_backgrounds');
      if (stored) {
        setUserUploads(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user backgrounds', e);
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const newUpload: BackgroundImage = {
          id: `upload_${Date.now()}`,
          url: result,
          thumbnail: result, // Use same for thumb
          title: file.name,
          tags: ['upload']
        };
        const updated = [newUpload, ...userUploads];
        setUserUploads(updated);
        localStorage.setItem('user_backgrounds', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDeleteUpload = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Delete this uploaded background?')) {
      const updated = userUploads.filter(u => u.id !== id);
      setUserUploads(updated);
      localStorage.setItem('user_backgrounds', JSON.stringify(updated));

      // If the deleted background is currently active, reset to default
      const deletedItem = userUploads.find(u => u.id === id);
      if (deletedItem && currentBackground?.value === deletedItem.url) {
        const defaultBg = BACKGROUND_CATEGORIES[0].images[0];
        onSetBackground({ 
            type: 'preset', 
            value: defaultBg.url, 
            fit: 'cover',
            mediaType: defaultBg.mediaType || 'image'
        });
      }
    }
  };

  const handleSelect = (img: BackgroundImage) => {
    onSetBackground({
        type: img.tags.includes('upload') ? 'upload' : 'preset',
        value: img.url,
        fit: 'cover',
        mediaType: img.mediaType || 'image'
    });
  };

  const handleRemoveBackground = () => {
    onSetBackground({
        type: 'none',
        value: '',
        fit: 'cover'
    });
  };

  // Filter logic
  const filteredImages = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const all = [
      ...userUploads,
      ...BACKGROUND_CATEGORIES.flatMap(c => c.images)
    ];
    return all.filter(img => 
      img.title.toLowerCase().includes(query) || 
      img.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [searchQuery, userUploads]);

  const isUserUpload = (img: BackgroundImage) => {
      return img.tags.includes('upload') || img.id.startsWith('upload_');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-bg-main w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border-default" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-default flex items-center justify-between bg-bg-main z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-focus-light flex items-center justify-center text-focus">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <h2 className="text-2xl font-black text-text-main">Backgrounds</h2>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative group">
               <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-focus transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 placeholder="Search backgrounds..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-bg-alt border border-border-default rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-focus-light focus:border-focus transition-all font-bold text-text-main placeholder-text-secondary"
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               )}
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-bg-alt rounded-full text-text-secondary hover:text-text-main transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-bg-alt p-8 scrollbar-hide">
          
          {/* SEARCH RESULTS */}
          {searchQuery ? (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-bold text-text-secondary uppercase tracking-widest text-xs mb-4">Search Results ({filteredImages.length})</h3>
                {filteredImages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <p className="font-bold">No backgrounds found for "{searchQuery}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredImages.map(img => (
                            <BackgroundCard 
                                key={img.id} 
                                image={img} 
                                isSelected={currentBackground?.value === img.url}
                                onSelect={() => handleSelect(img)}
                                onDelete={isUserUpload(img) ? (e) => handleDeleteUpload(e, img.id) : undefined}
                            />
                        ))}
                    </div>
                )}
             </div>
          ) : activeCategory ? (
             /* SINGLE CATEGORY VIEW */
             <div className="animate-in fade-in slide-in-from-right-4">
                 <button 
                   onClick={() => setActiveCategory(null)}
                   className="mb-6 flex items-center gap-2 text-text-secondary hover:text-text-main font-bold transition-colors group"
                 >
                    <div className="w-8 h-8 rounded-full bg-bg-main border border-border-default flex items-center justify-center group-hover:border-border-hover">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </div>
                    Back to categories
                 </button>
                 
                 <h3 className="text-2xl font-black text-text-main mb-6">{BACKGROUND_CATEGORIES.find(c => c.id === activeCategory)?.title}</h3>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BACKGROUND_CATEGORIES.find(c => c.id === activeCategory)?.images.map(img => (
                        <BackgroundCard 
                            key={img.id} 
                            image={img} 
                            isSelected={currentBackground?.value === img.url}
                            onSelect={() => handleSelect(img)}
                        />
                    ))}
                 </div>
             </div>
          ) : (
             /* MAIN CATEGORY LIST */
             <div className="space-y-10 animate-in fade-in">
                
                {/* My Uploads */}
                <section>
                    <h3 className="font-bold text-text-main text-lg mb-4 flex items-center gap-2">
                        My uploads
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Remove Background Button */}
                        <button
                            onClick={handleRemoveBackground}
                            role="button"
                            aria-label="Remove background"
                            className={`aspect-video bg-bg-main rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center group relative ${currentBackground?.type === 'none' ? 'border-focus ring-4 ring-focus shadow-lg' : 'border-dashed border-border-default hover:border-red-400 hover:bg-red-50'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${currentBackground?.type === 'none' ? 'bg-focus-light text-focus' : 'bg-red-100 text-red-500'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${currentBackground?.type === 'none' ? 'text-focus' : 'text-text-secondary group-hover:text-red-500'}`}>Remove</span>

                            {/* Selected Indicator */}
                            {currentBackground?.type === 'none' && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-focus rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white pointer-events-none">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </button>

                        {/* Upload Button */}
                        <label className="aspect-video bg-bg-main rounded-xl border-2 border-dashed border-border-default hover:border-focus hover:bg-focus-light transition-all cursor-pointer flex flex-col items-center justify-center group">
                            <div className="w-10 h-10 rounded-full bg-focus-light text-focus flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="text-xs font-bold text-text-secondary group-hover:text-focus uppercase tracking-wide">Upload</span>
                            <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleUpload} />
                        </label>
                        
                        {userUploads.map(img => (
                            <BackgroundCard 
                                key={img.id} 
                                image={img} 
                                isSelected={currentBackground?.value === img.url}
                                onSelect={() => handleSelect(img)}
                                onDelete={(e) => handleDeleteUpload(e, img.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* Categories */}
                {BACKGROUND_CATEGORIES.map(cat => (
                    <section key={cat.id}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-main text-lg">{cat.title}</h3>
                            <button 
                              onClick={() => setActiveCategory(cat.id)}
                              className="text-sm font-bold text-focus hover:text-primary flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                See all {cat.images.length} <span className="text-lg">→</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {cat.images.slice(0, 4).map(img => (
                                <BackgroundCard 
                                    key={img.id} 
                                    image={img} 
                                    isSelected={currentBackground?.value === img.url}
                                    onSelect={() => handleSelect(img)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for consistent cards
const BackgroundCard: React.FC<{ 
    image: BackgroundImage, 
    isSelected: boolean, 
    onSelect: () => void,
    onDelete?: (e: React.MouseEvent) => void 
}> = ({ image, isSelected, onSelect, onDelete }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
      className={`relative aspect-video rounded-xl overflow-hidden group w-full transition-all text-left cursor-pointer ${isSelected ? 'ring-4 ring-focus shadow-lg' : 'hover:shadow-lg hover:ring-4 ring-focus-light'}`}
    >
        {hasError ? (
           <div className="w-full h-full bg-bg-alt flex flex-col items-center justify-center p-2 text-center">
             <svg className="w-8 h-8 text-text-secondary mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <span className="text-[10px] text-text-secondary font-bold truncate w-full">{image.title}</span>
           </div>
        ) : (
          <img 
            src={image.thumbnail} 
            alt={image.title} 
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" 
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
             <span className="text-white text-xs font-bold truncate">{image.title}</span>
             {image.mediaType === 'video' && <span className="text-[10px] text-gray-200 uppercase tracking-wider font-bold">Video</span>}
        </div>

        {/* Selected Indicator */}
        {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-focus rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
        )}

        {/* Delete Button (for uploads) */}
        {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(e);
              }}
              className="absolute top-2 left-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20 cursor-pointer"
              title="Remove"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        )}
    </div>
  );
};
