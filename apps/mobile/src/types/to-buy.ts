export type ToBuyItem = {
  id: number;
	title: string;
	price_amount: string;
};

export type ToBuyList = {
	id?: number;
	title: string;
	user_remaining: number;
	expense_remaining: number;
	total: number;
	items: ToBuyItem[];
	length: number;
};
