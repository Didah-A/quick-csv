export interface Parse {
  data: any[];
  count: number;
}

export interface IParseRequest {
  content: string;
  delimiter?: string;
}

export interface IParseFileRequest {
  filePath: string;
}
