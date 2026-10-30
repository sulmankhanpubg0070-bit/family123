// Sirf jaanch ke liye: koi raaz (password/URI) nahi dikhata, sirf haan/na. Kaam ke baad delete kar dein.
export default function handler(req, res) {
  const u = process.env.MONGODB_URI || '', p = process.env.ADMIN_PASSWORD || '';
  res.status(200).json({
    environment: process.env.VERCEL_ENV || 'unknown',
    mongoUriSet: !!u,
    mongoSchemeOk: /^mongodb(\+srv)?:\/\//.test(u),
    mongoUriStartsWithSpaceOrQuote: /^[\s"']/.test(u),
    mongoUriHasPlaceholder: /[<>]/.test(u),
    adminPasswordSet: !!p,
    adminPasswordHasEdgeSpace: p !== p.trim()
  });
}
