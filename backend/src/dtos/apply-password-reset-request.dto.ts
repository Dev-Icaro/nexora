export default interface ApplyPasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
