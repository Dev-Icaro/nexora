type UpdateThemePreferenceDto = {
  userId: string;
  theme: 'light' | 'dark' | 'system';
};

export default UpdateThemePreferenceDto;
