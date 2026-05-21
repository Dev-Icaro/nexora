type ApplyPasswordResetDto = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export default ApplyPasswordResetDto;
