import { ClientBase } from 'pg';

export const rollbackWithLog = async (client: ClientBase): Promise<void> => {
  try {
    await client.query('ROLLBACK');
    console.log('[transaction] ROLLBACK successful.');
  } catch (e) {
    console.error('[transaction] Failed to ROLLBACK:', e);
  }
};
