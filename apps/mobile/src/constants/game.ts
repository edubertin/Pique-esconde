export const avatars = [
  { id: 'avatar_01', label: 'A1', name: 'Dudu', color: '#FF2D8D' },
  { id: 'avatar_02', label: 'A2', name: 'Ana', color: '#33C759' },
  { id: 'avatar_03', label: 'A3', name: 'Rafa', color: '#FFCC00' },
  { id: 'avatar_04', label: 'A4', name: 'Bia', color: '#0A84FF' },
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
