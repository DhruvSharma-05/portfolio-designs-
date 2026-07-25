export interface ServiceItem {
  number: string;
  name: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  number: string;
  name: string;
  category: 'Client' | 'Personal';
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
}
