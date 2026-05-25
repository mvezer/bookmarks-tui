export interface BookmarkEntry {
  date_added: string;
  date_last_used: string;
  guid: string;
  id: string;
  meta_info?: {
    Description?: string;
    Thumbnail?: string;
    power_bookmark_meta?: string;
  };
  type: string;
  name: string;
  description?: string;
  url: string;
}
