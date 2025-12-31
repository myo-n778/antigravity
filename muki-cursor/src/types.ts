export interface Compound {
  id: string;
  name: string;
  structure: StructureData;
}

export interface StructureData {
  atoms: Atom[];
  bonds: Bond[];
}

export interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
}

export interface Bond {
  from: string;
  to: string;
  type: 'single' | 'double' | 'triple';
}

