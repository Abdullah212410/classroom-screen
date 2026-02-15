
import React, { useState, useEffect } from 'react';
import { WidgetType } from '../types';

interface EditWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolbar: WidgetType[], more: WidgetType[]) => void;
  initialToolbar: WidgetType[];
  initialMore: WidgetType[];
  icons: Record<string, React.ReactNode>;
  labels: Record<string, string>;
}

export const EditWidgetsModal: React.FC<EditWidgetsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialToolbar,
  initialMore,
  icons,
  labels
}) => {
  const [toolbarItems, setToolbarItems] = useState<WidgetType[]>([]);
  const [moreItems, setMoreItems] = useState<WidgetType[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ type: WidgetType, source: 'toolbar' | 'more' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToolbarItems([...initialToolbar]);
      setMoreItems([...initialMore]);
      setError(null);
    }
  }, [isOpen, initialToolbar, initialMore]);

  const handleSave = () => {
    onSave(toolbarItems, moreItems);
    onClose();
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, item: WidgetType, source: 'toolbar' | 'more') => {
    setDraggedItem({ type: item, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSource: 'toolbar' | 'more') => {
    e.preventDefault();
    if (!draggedItem) return;

    if (targetSource === 'toolbar' && toolbarItems.length >= 12 && draggedItem.source !== 'toolbar') {
      setError('Max 12 items allowed in toolbar');
      setTimeout(() => setError(null), 3000);
      return;
    }

    let newToolbar = [...toolbarItems];
    let newMore = [...moreItems];

    if (draggedItem.source === 'toolbar') {
      newToolbar = newToolbar.filter(i => i !== draggedItem.type);
    } else {
      newMore = newMore.filter(i => i !== draggedItem.type);
    }

    if (targetSource === 'toolbar') {
      newToolbar.push(draggedItem.type);
    } else {
      newMore.push(draggedItem.type);
    }

    setToolbarItems(newToolbar);
    setMoreItems(newMore);
    setDraggedItem(null);
  };

  const toggleLocation = (item: WidgetType, currentSource: 'toolbar' | 'more') => {
    if (currentSource === 'toolbar') {
      setToolbarItems(prev => prev.filter(i => i !== item));
      setMoreItems(prev => [...prev, item]);
    } else {
      if (toolbarItems.length >= 12) {
        setError('Max 12 items allowed in toolbar');
        setTimeout(() => setError(null), 3000);
        return;
      }
      setMoreItems(prev => prev.filter(i => i !== item));
      setToolbarItems(prev => [...prev, item]);
    }
  };

  const handleDropItem = (e: React.DragEvent, targetItem: WidgetType, targetSource: 'toolbar' | 'more') => {
    e.stopPropagation();
    e.preventDefault();
    if (!draggedItem) return;

    let newToolbar = [...toolbarItems];
    let newMore = [...moreItems];

    if (draggedItem.source === 'toolbar') {
      newToolbar = newToolbar.filter(i => i !== draggedItem.type);
    } else {
      newMore = newMore.filter(i => i !== draggedItem.type);
    }

    if (targetSource === 'toolbar' && draggedItem.source !== 'toolbar' && newToolbar.length >= 12) {
       setError('Max 12 items allowed in toolbar');
       setTimeout(() => setError(null), 3000);
       return;
    }

    const currentList = targetSource === 'toolbar' ? toolbarItems : moreItems;
    const targetIndex = currentList.indexOf(targetItem);
    
    if (draggedItem.source === targetSource) {
         const list = [...currentList];
         const oldIndex = list.indexOf(draggedItem.type);
         list.splice(oldIndex, 1);
         list.splice(targetIndex, 0, draggedItem.type);
         if (targetSource === 'toolbar') setToolbarItems(list);
         else setMoreItems(list);
    } else {
         if (targetSource === 'toolbar') {
             newToolbar.splice(targetIndex, 0, draggedItem.type);
             setToolbarItems(newToolbar);
             setMoreItems(newMore);
         } else {
             newMore.splice(targetIndex, 0, draggedItem.type);
             setToolbarItems(newToolbar);
             setMoreItems(newMore);
         }
    }
    setDraggedItem(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Edit Widget Bar</h2>
            <p className="text-sm text-gray-400 font-bold mt-1">Drag and drop to reorder. Click to move between lists.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-glow transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Error Toast */}
        {error && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold border border-red-100 shadow-lg animate-in fade-in slide-in-from-top-4">
                {error}
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
          
          {/* Toolbar Section */}
          <div className="flex-1 flex flex-col border-r border-gray-100 p-6 overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-black text-focus uppercase tracking-widest">Toolbar ({toolbarItems.length}/12)</h3>
             </div>
             
             <div 
               className="flex-1 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 overflow-y-auto"
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, 'toolbar')}
             >
                <div className="flex flex-wrap gap-3 content-start">
                    {/* Fixed Background Widget Placeholder */}
                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 opacity-50 cursor-not-allowed">
                       <div className="scale-75 grayscale">{icons['BACKGROUND']}</div>
                       <span className="text-[10px] font-bold text-gray-400 mt-2">background</span>
                    </div>

                    {toolbarItems.map((type) => (
                        <div
                            key={type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, type, 'toolbar')}
                            onDrop={(e) => handleDropItem(e, type, 'toolbar')}
                            onClick={() => toggleLocation(type, 'toolbar')}
                            className="w-24 h-24 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-focus hover:shadow-md transition-all group relative"
                        >
                            <div className="scale-75 group-hover:scale-90 transition-transform">{icons[type]}</div>
                            <span className="text-[10px] font-bold text-gray-500 mt-2 px-1 text-center truncate w-full">{labels[type]}</span>
                            <div className="absolute top-1 right-1 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500" title="Move to More">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </div>
                        </div>
                    ))}
                </div>
                {toolbarItems.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-300 font-bold">
                        Drag items here
                    </div>
                )}
             </div>
          </div>

          {/* More Section */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-100/50">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">More Menu</h3>
             </div>
             
             <div 
               className="flex-1 overflow-y-auto"
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, 'more')}
             >
                 <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {moreItems.map((type) => (
                        <div
                            key={type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, type, 'more')}
                            onDrop={(e) => handleDropItem(e, type, 'more')}
                            onClick={() => toggleLocation(type, 'more')}
                            className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-focus hover:shadow-md transition-all group relative"
                        >
                            <div className="scale-75 group-hover:scale-90 transition-transform">{icons[type]}</div>
                            <span className="text-[10px] font-bold text-gray-500 mt-2 px-1 text-center truncate w-full">{labels[type]}</span>
                            <div className="absolute top-1 right-1 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 hover:text-green-500" title="Move to Toolbar">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
