import { create } from "zustand"

import { createTransactionSlice, TransactionSlice } from "./transaction.store"
import { createCategorySlice, CategorySlice } from "./category.store"
import { createAccountSlice, AccountSlice } from "./account.store"
import { createRouterSlice, RouterSlice } from "./router.store"
import { createConfigSlice, ConfigSlice } from "./config.store"
import { createUserSlice, UserSlice } from "./user.store"
import { createTagSlice, TagSlice } from "./tag.store"
import { createRecurringTransactionSlice, RecurringTransactionSlice } from "./recurring-transaction.store"
import { createOnboardingSlice, OnboardingSlice } from "./onboarding.store"

export const useStore = create<RouterSlice & UserSlice & AccountSlice & TransactionSlice & CategorySlice & ConfigSlice & TagSlice & RecurringTransactionSlice & OnboardingSlice>()((...a) => ({
  ...createRouterSlice(...a),
  ...createUserSlice(...a),
  ...createTransactionSlice(...a),
  ...createCategorySlice(...a),
  ...createAccountSlice(...a),
  ...createConfigSlice(...a),
  ...createTagSlice(...a),
  ...createRecurringTransactionSlice(...a),
  ...createOnboardingSlice(...a),
}))

