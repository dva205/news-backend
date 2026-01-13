export const formatParentAuthResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    displayName: user.display_name,
    dob: user.dob || null,
    role: user.role,
    avatarUrl: user.avatar_url || null,
    createdAt: user.created_at,
  };
};
