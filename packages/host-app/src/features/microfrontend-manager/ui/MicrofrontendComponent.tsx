import React, { Suspense, useMemo } from 'react';
import { MicrofrontendConfig } from '../../../features/microfrontend-manager/api/microfrontendApi.ts';
import { useRemote } from '../../../shared/lib/microfrontend-loader/loadRemoteModule.ts';

interface MicrofrontendComponentProps {
  name: MicrofrontendConfig['name'];
}
const MicrofrontendComponent = React.memo(({ name }: MicrofrontendComponentProps) => {
  const Component = useMemo(() => useRemote(name, 'App'), [name]);
  return (
    <Suspense fallback={<div>Загрузка МФ {name}...</div>}>
      <Component />
    </Suspense>
  );
});

export { MicrofrontendComponent };
