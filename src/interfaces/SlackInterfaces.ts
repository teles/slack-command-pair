export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  [key: string]: any;
}

export interface SlackResponse {
  response_type: string;
  blocks?: SlackBlock[];
  text?: string;
  attachments?: Array<{
    color?: string;
    text?: string;
    footer?: string;
  }>;
}
