import * as migration_20260802_104829_initial from './20260802_104829_initial';
import * as migration_20260921_093804_api_keys from './20260921_093804_api_keys';

export const migrations = [
  {
    up: migration_20260802_104829_initial.up,
    down: migration_20260802_104829_initial.down,
    name: '20260802_104829_initial',
  },
  {
    up: migration_20260921_093804_api_keys.up,
    down: migration_20260921_093804_api_keys.down,
    name: '20260921_093804_api_keys'
  },
];
