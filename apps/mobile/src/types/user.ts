export type User = { 
	name: string;
	email: string;
	balances: {
		total: number | string;
		fintoc?: number | string;
		buda?: number | string;
		fintual?: number | string;
	};
	income: number | string;
	expense: number | string;
	investments_return: number | string;
	quota: number;
	remaining: number | string;
	created_at?: string;
	updated_at?: string;
} | null;


export type UserBalance = {
	currency: string;
	balance: string;
	income: string;
	expense: string;
	investments_return: string;
};
