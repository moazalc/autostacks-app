export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  stockId?: string | null;
  buyPrice: number;
  sellPrice?: number | null;
  status: "available" | "sold";
  imgUrl?: string | null;
  notes?: string | null;
  dateAdded: string;
};
