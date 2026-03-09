// Platform-specific implementations:
//   FintocWidgetModal.native.tsx — iOS/Android (react-native-webview)
//   FintocWidgetModal.web.tsx   — Web (iframe + postMessage)
// Metro resolves the correct file automatically; this file satisfies TypeScript.
export { default } from "./FintocWidgetModal.web"
