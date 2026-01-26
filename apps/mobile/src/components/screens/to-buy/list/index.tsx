import { View, StatusBar, FlatList, RefreshControl } from "react-native"
// import styled from 'styled-components/native';
import { useMutation } from "react-query"
import React, { useEffect } from "react"
import axios from "axios"

import { mockToBuyItem } from "@/utils/mock/to-buy.mock"
import { ToBuyItem, ToBuyList } from "@/types/to-buy"

import CreateForm from "./create-list-form"
import AddInput from "./add-input"
import TodoList from "./todo-list"
import Header from "./header"

// import { showMessage } from 'react-native-flash-message';
type ListProps = {
  list: ToBuyList,
  refetch?: () => void
}

export default function List({ list }: ListProps) {
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = async function () {
    setRefreshing(true)
    // await refetch()
    setRefreshing(false)
  }
  const createItem = async function (item: ToBuyItem) {
    // const { data: response } = await axios.post(`/api/v1/to_buy_lists/${list.id}/item`, {
    //   title: item.title,
    //   price_amount: item.price_amount,
    // })
    const response = mockToBuyItem
    return response
  }
  const destroyItem = async function (item_id: string | number) {
    // const { data: response } = await axios.delete(
    //   `/api/v1/to_buy_lists/${list.id}/item/${item_id}`,
    // )
    const response = mockToBuyItem as ToBuyItem
    return response
  }
  const mutation = useMutation(createItem)
  const destroy_mutation = useMutation(destroyItem)

  const { isSuccess, isError } = mutation
  const { isSuccess: isSuccessDestroy, isError: isErrorDestroy } = destroy_mutation

  const submitHandler = (item: ToBuyItem) => {
    mutation.mutate(item)
  }
  const deleteItem = (key: string | number) => {
    destroy_mutation.mutate(key)
  }
  useEffect(() => {
    if (isSuccess) {
      // refetch()
      // showMessage({
      //   message: 'Success!',
      //   type: 'success',
      // });
      mutation.reset()
    }
    if (isError) {
      mutation.reset()
    }
    if (isSuccessDestroy) {
      // refetch()
      // showMessage({
      //   message: 'Deleted!',
      //   type: 'success',
      // });
      destroy_mutation.reset()
    }
    if (isErrorDestroy) {
      destroy_mutation.reset()
    }
  })
  return (
    <View className="flex justify-content items-center">
      <View>
        <StatusBar barStyle="light-content" backgroundColor="midnightblue" />
      </View>

      <View>
        {list && list.items ? (
          <FlatList
            data={list.items}
            ListHeaderComponent={<Header list={list} />}
            keyExtractor={(item) => item.id ? item.id.toString() : item.title}
            renderItem={({ item }) => <TodoList item={item} deleteItem={deleteItem} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListFooterComponent={<AddInput submitHandler={submitHandler} />}
          />
        ) : (
          <CreateForm />
        )}
      </View>
    </View>
  )
}
