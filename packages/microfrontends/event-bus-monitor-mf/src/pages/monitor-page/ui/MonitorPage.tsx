import React from 'react';
import { EventLogPanel } from '../../../widgets/EventLogPanel/ui/EventLogPanel';
import { CurrentStatePanel } from '../../../widgets/CurrentStatePanel/ui/CurrentStatePanel';
import { StatisticsPanel } from '../../../widgets/StatisticsPanel/ui/StatisticsPanel';
import { ManualEventSender } from '../../../features/manual-event-sender/ui/ManualEventSender';

const MonitorPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Монитор EventBus</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <StatisticsPanel />
        </div>
        <div>
          <ManualEventSender />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <CurrentStatePanel />
      </div>

      <div>
        <EventLogPanel />
      </div>
    </div>
  );
};

export default MonitorPage;