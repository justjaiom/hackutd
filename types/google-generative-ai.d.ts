declare module '@google/generative-ai' {
  // Minimal ambient declarations to satisfy TypeScript when package/types are not installed.
  // Expand these types if you intend to use the library with full typing.
  export const GoogleGenerativeAI: any
  export default GoogleGenerativeAI
}
