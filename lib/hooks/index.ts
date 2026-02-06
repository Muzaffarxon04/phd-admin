// Universal fetch hooks - use these directly in components/pages
// Example: useGet("/auth/me/"), usePost("/auth/login/", {...})
export {
  useGet,
  usePost,
  usePut,
  usePatch,
  useDelete,
  useUpload,
  useUploadPatch,
  API_BASE_URL,
  apiRequest,
  apiUpload,
  ApiError,
} from "./useUniversalFetch";
