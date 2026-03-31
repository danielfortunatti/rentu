// UF value updates daily. This is an approximation.
const UF_VALUE = 38500 // CLP per UF (approximate March 2026)

export function clpToUf(clp) {
  return (clp / UF_VALUE).toFixed(2)
}

export function formatUf(clp) {
  return `${clpToUf(clp)} UF`
}
