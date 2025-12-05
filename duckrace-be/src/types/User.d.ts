type MezonUser = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  mezon_id: string;
  avatar_url: string;
};

type User = {
  id: string;
  socketId: string;
  playerName: string;
  userName: string;
  wallet: number;
  mezonUserId: string;
  email: string;
  avatar?: string;
  wallet: number;
};

type HashData = {
  query_id: string;
  user: string;
  auth_date: number;
  signature: string;
  hash: string;
};
