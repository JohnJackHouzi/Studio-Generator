import pfg from './pfg';
import cdf from './cdf';
import skovr from './skovr';

// Registre des projets/clients. Pour ajouter un client : créer son fichier
// de config (copie de pfg.js), l'importer ici et l'ajouter à CLIENTS.
export const CLIENTS = { pfg, cdf, skovr };
export const CLIENT_LIST = Object.values(CLIENTS);
export const DEFAULT_CLIENT = 'pfg';

export function getClient(key) {
  return CLIENTS[key] || CLIENTS[DEFAULT_CLIENT];
}
