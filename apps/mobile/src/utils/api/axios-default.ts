import { showMessage } from "react-native-flash-message"
import axios from "axios"

// import store from "../store"

const setAxiosDefaults = function() {
  axios.interceptors.request.use(async function(config) {
    // const state = store.getState().auth_reducer
    // const accessToken = state["access-token"]
    // const uid = state.uid
    // const client = state.client
    // // config.baseURL = state.baseUrl
    // config.headers["access-token"] = accessToken
    // config.headers.uid = uid
    // config.headers.client = client

    return config
  })
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      let msg
      if (err.response === undefined) {
        return Promise.reject(err.response)
      }
      if (err.response.data) {
        if (err.response.data.errors) {
          if (err.response.status === 401) {
            // store.dispatch(removeSession())
          }
          if (err.response.status === 400) {
            msg = JSON.stringify(err.response.data.errors)
          } else {
            msg = err.response.data.errors.full_messages || err.response.data.errors
          }
          showMessage({
            message: `Error: ${msg}`,
            type: "danger",
          })
        } else {
          if (err.response.status === 502) {
            msg = "Server is down"
            // store.dispatch(removeSession())
          } else {
            msg = err.response.data.errors.full_messages || err.response.data.errors
          }
          showMessage({
            message: msg,
            type: "danger",
          })
        }
      }
      return Promise.reject(err.response)
    },
  )
}

export { setAxiosDefaults }

