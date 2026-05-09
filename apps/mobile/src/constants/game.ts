export const avatars = [
  { id: 'avatar_01', label: 'A1', name: 'Avatar 1', color: '#FF2D8D', roomArticle: 'do' },
  { id: 'avatar_02', label: 'A2', name: 'Avatar 2', color: '#33C759', roomArticle: 'da' },
  { id: 'avatar_03', label: 'A3', name: 'Avatar 3', color: '#FFCC00', roomArticle: 'do' },
  { id: 'avatar_04', label: 'A4', name: 'Avatar 4', color: '#0A84FF', roomArticle: 'da' },
];

export const players = [
  { id: 'p1', nickname: 'Dudu', avatarId: 'avatar_01', status: 'Líder' },
  { id: 'p2', nickname: 'Ana', avatarId: 'avatar_02', status: 'Preparada' },
  { id: 'p3', nickname: 'Rafa', avatarId: 'avatar_03', status: 'Aguardando' },
  { id: 'p4', nickname: 'Bia', avatarId: 'avatar_04', status: 'Preparada' },
];

export const gameRules = {
  roomCode: 'ABCD',
  maxPlayers: 8,
  hideSeconds: 60,
  seekSeconds: 180,
  captureRadiusMeters: 8,
  captureConfirmSeconds: 3,
};
