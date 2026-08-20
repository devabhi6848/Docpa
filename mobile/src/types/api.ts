export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
  errors?: string[] | Record<string, any>;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: string[] | Record<string, any>;
}
