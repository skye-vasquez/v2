import { init, tx, id } from '@instantdb/react';

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID;

export const db = init({ appId: APP_ID });
export { tx, id };
