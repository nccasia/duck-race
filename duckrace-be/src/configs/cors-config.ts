const extendOrigin = process.env.EXTEND_CORS
  ? process.env.EXTEND_CORS.split(';')
  : [];
export const corsConfig = {
  origin: ['https://duckrace.ncc.studio', ...extendOrigin],
  credentials: true,
};
