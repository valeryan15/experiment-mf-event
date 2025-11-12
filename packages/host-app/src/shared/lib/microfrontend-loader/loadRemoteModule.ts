import React from 'react';
import { loadRemote } from '@module-federation/runtime';

export const useRemote = (scope: string, module: string) => {
  const id = `${scope}/${module}`;
  return React.lazy(async () => {
    return loadRemote(id, {
      from: 'runtime',
      loadFactory: true,
    }) as Promise<{ default: any }>;
  });
};