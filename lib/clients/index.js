import pfg from './pfg';

// Registre des projets/clients. Pour ajouter un client : créer son fichier
// de config (copie de pfg.js), l'importer ici et l'ajouter à CLIENTS.
export const CLIENTS = { pfg };
export const CLIENT_LIST = Object.values(CLIENTS);
export const DEFAULT_CLIENT = 'pfg';

export function getClient(key) {
  return CLIENTS[key] || CLIENTS[DEFAULT_CLIENT];
}
