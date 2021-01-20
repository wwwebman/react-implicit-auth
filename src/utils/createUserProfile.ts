export interface UserProfile {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  name: string;
  avatarUrl: string;
}

const createUserProfile = (data: any): UserProfile => {
  return {
    avatarUrl: data?.avatarUrl ?? data?.picture?.data?.url,
    email: data?.email,
    firstName: data?.firstName ?? data?.first_name,
    id: data?.id,
    lastName: data?.last_name ?? data?.last_name,
    name: data?.name,
  };
};

export default createUserProfile;
