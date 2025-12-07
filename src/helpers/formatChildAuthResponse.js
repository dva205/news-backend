export const formatChildAuthResponse = (user) => {
    return {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        role: user.role,
        parentId: user.parent_id,
        avatarUrl: user.avatar_url || null,
    };
};