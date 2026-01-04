export const getAdminHeaders = (email: string, password: string) => ({
  "x-admin-email": email,
  "x-admin-password": password,
});
