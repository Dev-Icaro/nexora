export type ProfileUser = {
  id: string;
  username: string;
  bio?: string;
  position?: string;
};

export type GetProfileRequest = { userId: string };
export type GetProfileResponse = { getUserById: ProfileUser };
