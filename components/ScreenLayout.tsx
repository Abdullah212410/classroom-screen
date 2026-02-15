
import React from 'react';
import { RoomState, Widget } from '../types';
import WidgetContainer from './WidgetContainer';
import { TimerWidget } from './widgets/TimerWidget';
import { TrafficLightWidget } from './widgets/TrafficLightWidget';
import { RandomizerWidget } from './widgets/RandomizerWidget';
import { QRWidget } from './widgets/QRWidget';
import { EmbedWidget } from './widgets/EmbedWidget';
import { HyperlinkWidget } from './widgets/HyperlinkWidget';
import { DrawWidget } from './widgets/DrawWidget';
import { NoiseMeterWidget } from './widgets/NoiseMeterWidget';
import { PollWidget } from './widgets/PollWidget';
import { DiceWidget } from './widgets/DiceWidget';
import { ImageWidget } from './widgets/ImageWidget';
import { TextWidget } from './widgets/TextWidget';
import { WorkSymbolsWidget } from './widgets/WorkSymbolsWidget';
import { ClockWidget } from './widgets/ClockWidget';
import { TimetableWidget } from './widgets/TimetableWidget';
import { GroupMakerWidget } from './widgets/GroupMakerWidget';
import { VideoWidget } from './widgets/VideoWidget';
import { WebcamWidget } from './widgets/WebcamWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { EventCountWidget } from './widgets/EventCountWidget';
import { StopwatchWidget } from './widgets/StopwatchWidget';
import { StickerWidget } from './widgets/StickerWidget';
import { ScoreboardWidget } from './widgets/ScoreboardWidget';

interface ScreenLayoutProps {
  room: RoomState;
  isTeacher: boolean;
  onUpdateWidget?: (id: string, updates: Partial<Widget>) => void;
  onRemoveWidget?: (id: string) => void;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({ room, isTeacher, onUpdateWidget, onRemoveWidget }) => {
  const renderWidget = (widget: Widget) => {
    const commonProps = {
      widget,
      isTeacher,
      onUpdate: (updates: Partial<Widget>) => onUpdateWidget?.(widget.id, updates)
    };

    switch (widget.type) {
      case 'timer': return <TimerWidget {...commonProps} />;
      case 'traffic_light': return <TrafficLightWidget {...commonProps} />;
      case 'randomizer': return <RandomizerWidget {...commonProps} />;
      case 'qr': return <QRWidget {...commonProps} />;
      case 'embed': return <EmbedWidget {...commonProps} />;
      case 'hyperlink': return <HyperlinkWidget {...commonProps} />;
      case 'draw': return <DrawWidget {...commonProps} />;
      case 'noise_meter': return <NoiseMeterWidget {...commonProps} />;
      case 'poll': return <PollWidget {...commonProps} />;
      case 'dice': return <DiceWidget {...commonProps} />;
      case 'image': return <ImageWidget {...commonProps} />;
      case 'text': return <TextWidget {...commonProps} />;
      case 'work_symbols': return <WorkSymbolsWidget {...commonProps} />;
      case 'clock': return <ClockWidget {...commonProps} />;
      case 'timetable': return <TimetableWidget {...commonProps} />;
      case 'group_maker': return <GroupMakerWidget {...commonProps} />;
      case 'video': return <VideoWidget {...commonProps} />;
      case 'webcam': return <WebcamWidget {...commonProps} />;
      case 'calendar': return <CalendarWidget {...commonProps} />;
      case 'event_count': return <EventCountWidget {...commonProps} />;
      case 'stopwatch': return <StopwatchWidget {...commonProps} />;
      case 'stickers': return <StickerWidget {...commonProps} />;
      case 'scoreboard': return <ScoreboardWidget {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full relative pointer-events-auto md:pointer-events-none md:block flex flex-col items-center overflow-y-auto md:overflow-hidden p-4 md:p-0 gap-4 md:gap-0 pb-32 md:pb-0 scrollbar-hide">
        {room.widgets.map((widget) => (
            <WidgetContainer 
              key={widget.id}
              widget={widget} 
              isTeacher={isTeacher}
              onUpdate={onUpdateWidget ? (updates) => onUpdateWidget(widget.id, updates) : undefined}
              onRemove={onRemoveWidget ? () => onRemoveWidget(widget.id) : undefined}
            >
              {renderWidget(widget)}
            </WidgetContainer>
        ))}
    </div>
  );
};

export default ScreenLayout;
