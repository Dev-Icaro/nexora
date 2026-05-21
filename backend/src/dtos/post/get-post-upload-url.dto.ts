type GetPostUploadUrlDto = {
  userId: string;
  filename: string;
  contentType: string;
  fileSizeBytes: number;
};

export default GetPostUploadUrlDto;
